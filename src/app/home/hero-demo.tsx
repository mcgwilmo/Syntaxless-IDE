"use client";

/*
 * The hero demo: plain English on the left, the Python it compiles to on the
 * right, and a Run that prints what that Python really prints.
 *
 * This replaced a pair of 360KB screenshots of a theme the product no longer
 * has. A screenshot goes stale silently; this cannot, because the strings it
 * shows come from hero-demo-data.ts, which is generated from the real pipeline
 * and carries the rule for regenerating it. Read that file's header before
 * touching any text that appears in these panes.
 *
 * Deterministic and entirely client-side: no fetch, no interpreter, no
 * dependency. Run replays a verified transcript. The staggering exists so that
 * output arrives the way output arrives -- a line at a time -- rather than as a
 * paragraph that was clearly always there; it is not pretending to compute
 * anything, and under prefers-reduced-motion it is dropped outright.
 *
 * The English pane is honest about being a preview. It has the shape and the
 * type of the real editor, and none of its affordances: no caret, no focusable
 * text box, no placeholder inviting a sentence that would go nowhere. Its
 * material says so too -- --inlaid, the rung this app already reserves for
 * things you read, against the --recessed wells beside it, which are the rung
 * for things you type into. A dead input would be a worse lie than a screenshot.
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { Button } from "@/design/primitives";

import { HERO_DEMOS, type HeroDemoProgram } from "./hero-demo-data";

/*
 * Execution is over in well under a second. Long enough that the first line
 * lands after the press rather than with it, short enough that nobody waits:
 * the slowest program here is three lines, so 240 + 2*150 + 140 = 680ms from
 * click to "Verified output".
 */
const FIRST_LINE_DELAY_MS = 240;
const LINE_STEP_MS = 150;
const SETTLE_MS = 140;

type RunPhase = "idle" | "running" | "done";

/**
 * Whether the reader has asked the OS for less motion.
 *
 * Read at runtime rather than left to the `motion-reduce:` variants because the
 * stagger is scheduling, not styling -- there is no CSS to switch off. False
 * until the effect runs, which is the same first-paint assumption TypingHeading
 * makes in site-shell.tsx.
 */
function usePrefersReducedMotion() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function syncPreference() {
      setReduceMotion(mediaQuery.matches);
    }

    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);
    return () => mediaQuery.removeEventListener("change", syncPreference);
  }, []);

  return reduceMotion;
}

function PlayIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className="h-3 w-3"
      fill="currentColor"
    >
      <path d="M3 1.6 10 6l-7 4.4z" />
    </svg>
  );
}

function CompilesToIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      // currentColor throughout, so the arrow follows the text token it
      // inherits and needs no theme branch of its own.
      className="h-4 w-4 rotate-90 md:rotate-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 8h11" />
      <path d="M9 4.5 12.5 8 9 11.5" />
    </svg>
  );
}

/**
 * One pane: a labelled well of numbered lines.
 *
 * `well` decides the rung. The English pane is inlaid (read this); the code and
 * output panes are recessed (this is where text goes in the real editor).
 */
function Pane({
  label,
  note,
  well,
  ariaLabel,
  children,
}: {
  label: string;
  note?: string;
  well: "inlaid" | "recessed";
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={ariaLabel} className="flex min-w-0 flex-col">
      <div className="mb-[var(--space-2)] flex items-baseline justify-between gap-[var(--space-2)]">
        <div className="text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] text-[var(--text-muted)]">
          {label}
        </div>
        {note ? (
          <div className="text-[length:var(--text-xs)] text-[var(--text-soft)]">
            {note}
          </div>
        ) : null}
      </div>
      <div
        className={`flex-1 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-[var(--space-4)] ${
          well === "inlaid" ? "shadow-[var(--inlaid)]" : "shadow-[var(--recessed)]"
        }`}
      >
        {children}
      </div>
    </section>
  );
}

/**
 * Numbered lines. `whitespace-pre-wrap` rather than `pre`: it keeps the leading
 * spaces that the loop demo's indent depends on, and still wraps on a phone
 * instead of pushing a horizontal scrollbar through the page.
 */
function ProgramLines({
  lines,
  mono,
}: {
  lines: readonly string[];
  mono: boolean;
}) {
  return (
    <ol className="space-y-[var(--space-1)]">
      {lines.map((line, index) => (
        <li key={index} className="flex gap-[var(--space-3)]">
          <span
            aria-hidden="true"
            className="w-3 shrink-0 select-none text-right font-mono text-[length:var(--text-xs)] leading-[var(--leading-relaxed)] text-[var(--text-soft)]"
          >
            {index + 1}
          </span>
          <span
            className={`min-w-0 whitespace-pre-wrap text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--text-primary)] ${
              mono ? "font-mono" : ""
            }`}
          >
            {line}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function HeroDemo({
  onGetStarted,
  getStartedLabel,
}: {
  onGetStarted: () => void;
  getStartedLabel: string;
}) {
  const baseId = useId();
  const reduceMotion = usePrefersReducedMotion();

  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<RunPhase>("idle");
  const [visibleLines, setVisibleLines] = useState(0);

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const timers = useRef<number[]>([]);

  const demo: HeroDemoProgram = HERO_DEMOS[activeIndex];

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  // Nothing here outlives the component: a run scheduled and then navigated
  // away from would call setState on an unmounted tree.
  useEffect(() => clearTimers, [clearTimers]);

  const selectDemo = useCallback(
    (index: number) => {
      clearTimers();
      setActiveIndex(index);
      // Output belongs to the program that produced it. Carrying it across a
      // switch would put one demo's answer under the other demo's code.
      setPhase("idle");
      setVisibleLines(0);
    },
    [clearTimers]
  );

  const handleRun = useCallback(() => {
    clearTimers();
    setVisibleLines(0);
    setPhase("running");

    if (reduceMotion) {
      // Asked for less motion: the whole point of the stagger is movement, so
      // the output simply is there.
      setVisibleLines(demo.stdout.length);
      setPhase("done");
      return;
    }

    demo.stdout.forEach((_, index) => {
      timers.current.push(
        window.setTimeout(() => {
          setVisibleLines(index + 1);
        }, FIRST_LINE_DELAY_MS + index * LINE_STEP_MS)
      );
    });

    timers.current.push(
      window.setTimeout(
        () => setPhase("done"),
        FIRST_LINE_DELAY_MS + (demo.stdout.length - 1) * LINE_STEP_MS + SETTLE_MS
      )
    );
  }, [clearTimers, demo, reduceMotion]);

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const last = HERO_DEMOS.length - 1;
    let next: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = activeIndex === last ? 0 : activeIndex + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = activeIndex === 0 ? last : activeIndex - 1;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = last;
    }

    if (next === null) return;

    event.preventDefault();
    selectDemo(next);
    tabRefs.current[next]?.focus();
  }

  const panelId = `${baseId}-panel`;
  const runLabel =
    phase === "running" ? "Replaying" : phase === "done" ? "Run again" : "Run";

  return (
    <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] text-left shadow-[var(--raised-lg)]">
      {/* justify-end plus mr-auto on the tablist, rather than
          justify-between: on a phone this row wraps, and justify-between drops
          the wrapped run control against the left edge, under the tabs, where
          it reads as a third tab. This keeps it on the right on both rows. */}
      <div className="flex flex-wrap items-center justify-end gap-[var(--space-3)] border-b border-[var(--border-subtle)] px-[var(--space-4)] py-[var(--space-3)]">
        {/* A segmented control is a groove with a thumb in it -- same object as
            the billing switch on /subscriptions, same reason: colour alone
            would leave both examples looking equally chosen. */}
        <div
          role="tablist"
          aria-label="Example programs"
          className="mr-auto inline-flex items-center gap-[var(--space-1)] rounded-[var(--radius-full)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-[var(--space-1)] shadow-[var(--recessed)]"
        >
          {HERO_DEMOS.map((entry, index) => {
            const isSelected = index === activeIndex;

            return (
              <button
                key={entry.id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${entry.id}`}
                aria-selected={isSelected}
                aria-controls={panelId}
                // Roving tabindex: one stop for the group, arrows move within
                // it, which is what a tablist is expected to do.
                tabIndex={isSelected ? 0 : -1}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                onClick={() => selectDemo(index)}
                onKeyDown={handleTabKeyDown}
                className={`rounded-[var(--radius-full)] px-[var(--space-3)] py-[var(--space-1)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] transition-[background-color,box-shadow,translate,color] duration-[var(--duration-press)] ease-[var(--ease-spring)] active:translate-y-[var(--press-travel)] active:shadow-[var(--pressed)] motion-reduce:transform-none motion-reduce:hover:transform-none motion-reduce:active:transform-none ${
                  isSelected
                    ? "bg-[var(--accent-solid)] bg-[image:var(--material-sheen)] text-[var(--text-inverted)] shadow-[var(--raised)] hover:-translate-y-[var(--lift-travel)] hover:bg-[var(--accent-hover)] hover:shadow-[var(--lifted)]"
                    : // Flat in the track, so it answers hover with colour
                      // rather than with a rung it was never on.
                      "text-[var(--text-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]"
                }`}
              >
                {entry.label}
              </button>
            );
          })}
        </div>

        {/* shrink-0: the tablist is the flexible half of this row. Without it
            the run control gets squeezed at narrow widths and the button wraps
            its own icon onto a second line. */}
        <div className="flex shrink-0 items-center gap-[var(--space-3)]">
          <div
            aria-hidden="true"
            className="flex items-center gap-[var(--space-2)] text-[length:var(--text-xs)] text-[var(--text-muted)]"
          >
            {phase === "running" && (
              <>
                <span className="h-3 w-3 animate-spin rounded-[var(--radius-full)] border border-[var(--border-strong)] border-t-[var(--accent-solid)] motion-reduce:animate-none" />
                <span>Replaying</span>
              </>
            )}
            {phase === "done" && (
              // Green means the transcript matched the real compiler -- not that
                // this page executed anything. A spinner plus "Finished" claims
                // computation the page does not perform, so the words say replay.
              <>
                <span className="h-2 w-2 rounded-[var(--radius-full)] bg-[var(--state-success)]" />
                <span className="text-[var(--state-success)]">Verified output</span>
              </>
            )}
          </div>

          <Button
            onClick={handleRun}
            disabled={phase === "running"}
            className="whitespace-nowrap"
          >
            {/* One inline-flex child rather than two loose ones. Tailwind's
                preflight gives every svg `display: block`, and Button wraps its
                children in an inline span -- so a bare icon beside a bare label
                puts the glyph on its own line above the word. */}
            <span className="inline-flex items-center gap-[var(--space-2)]">
              <PlayIcon />
              {runLabel}
            </span>
          </Button>
        </div>
      </div>

      {/* tabIndex 0 because the panel holds no controls of its own. Everything
          in here -- the English, the Python, the output -- is read-only text,
          so without a stop of its own the tab order runs tablist -> Run ->
          footer and never enters the demo at all: a keyboard reader can switch
          between two examples they are never given a way to reach, and the
          panel's link back to its tab is never voiced. This is the one case
          where the ARIA practices ask for a focusable container. */}
      <div
        role="tabpanel"
        tabIndex={0}
        id={panelId}
        aria-labelledby={`${baseId}-tab-${demo.id}`}
        // The ring has to be drawn inside. This panel runs the full width of a
        // card that clips its overflow, so the global focus ring -- 2px at 2px
        // outside -- lands beyond the left and right edges and gets cut,
        // leaving a horizontal line that reads as a border. `focus-ring-inset`
        // is defined next to that global rule in globals.css and moves the
        // whole rectangle onto the panel's own padding.
        className="focus-ring-inset p-[var(--space-4)]"
      >
        <div className="grid gap-[var(--space-4)] md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <Pane
            label="Plain English"
            note="Preview, read-only"
            well="inlaid"
            ariaLabel="Plain English program, read-only preview"
          >
            <ProgramLines lines={demo.english} mono={false} />
          </Pane>

          <div className="flex items-center justify-center text-[var(--text-soft)]">
            <CompilesToIcon />
          </div>

          <Pane
            label="Python"
            note="Generated"
            well="recessed"
            ariaLabel="Generated Python"
          >
            <ProgramLines lines={demo.python} mono />
          </Pane>
        </div>

        <div className="mt-[var(--space-4)]">
          <div className="mb-[var(--space-2)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] text-[var(--text-muted)]">
            Output
          </div>
          <div className="min-h-[5.5rem] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-[var(--space-4)] shadow-[var(--recessed)]">
            {phase === "idle" ? (
              <p className="font-mono text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--text-soft)]">
                Press Run to see what this program prints.
              </p>
            ) : (
              /*
               * Every line is rendered from the first frame and revealed by
               * opacity, so the well does not grow under the reader's eye as
               * output arrives. Hidden from assistive tech as a whole: a
               * partially revealed transcript is not something worth
               * announcing three times, so the status line below announces the
               * finished output once instead.
               */
              <div aria-hidden="true" className="space-y-[var(--space-1)]">
                {demo.stdout.map((line, index) => (
                  <p
                    key={index}
                    className="font-mono text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] whitespace-pre-wrap text-[var(--text-primary)] transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-out)] motion-reduce:transition-none"
                    style={{ opacity: index < visibleLines ? 1 : 0 }}
                  >
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>
          <p role="status" className="sr-only">
            {phase === "done"
              ? `Verified output: ${demo.stdout.join(", ")}`
              : phase === "running"
                ? "Replaying"
                : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)] border-t border-[var(--border-subtle)] px-[var(--space-4)] py-[var(--space-3)]">
        <p className="max-w-md text-[length:var(--text-xs)] leading-[var(--leading-snug)] text-[var(--text-muted)]">
          A verified transcript: this English really compiles to this Python,
          and this Python really prints this. Editing happens in the app.
        </p>
        <Button variant="secondary" size="sm" onClick={onGetStarted}>
          {getStartedLabel}
        </Button>
      </div>
    </div>
  );
}
