"use client";

/**
 * What changed between two runs, as steps rather than as text.
 *
 * The whole point of this panel is a distinction a text diff cannot draw:
 * rewording "print the total" as "show the total" is a large textual change and
 * no behavioural one. So the layout leads with the backend's one-sentence
 * verdict, and every row says what kind of change it is before it shows the
 * words that changed.
 *
 * **No sentence in here is written by this file.** `headline`, `notice`, every
 * row's `description` and `detail`, the line labels, and even the names of the
 * counts arrive from the backend already in the requested language. The IDE has
 * no locale catalog, so anything composed here would be English no matter what
 * locale was asked for. What this file owns is arrangement and colour, which
 * carry no language. The two exceptions are the close button's accessible label
 * and the empty state, and both are marked below -- they are chrome, and chrome
 * is English everywhere in this app until the UI itself is localized.
 */

import { useEffect, useRef } from "react";

import { useIde } from "@/features/ide/state/ide-context";
import {
  CHANGE_DISPLAY_ORDER,
  changeTone,
  shortRunLabel,
} from "@/features/ide/lib/run-compare";
import type { RunDiffEntry } from "@/lib/api/types";

function ChangeRow({ entry }: { entry: RunDiffEntry }) {
  const tone = changeTone(entry.change);
  const location = entry.compare_location ?? entry.base_location;

  // A removed step has no "after", and an added one has no "before". Rendering
  // an empty box for the missing side reads as data that failed to load, so the
  // side that does not exist is simply absent.
  const showBefore = entry.base_text !== null;
  const showAfter = entry.compare_text !== null && entry.compare_text !== entry.base_text;

  // Strikethrough means "this text is gone". It is only true when the sentence
  // was replaced by a different one, or when the step left the program.
  //
  // A `moved` step is matched on an identical behaviour key, so its wording is
  // the same on both sides and there is no "after" to show -- striking the one
  // copy rendered it exactly like a deletion, under a sentence saying the step
  // still runs. Same for a `changed` step whose words stayed put while the
  // interpretation moved underneath them.
  const beforeWasReplaced = showAfter || entry.change === "removed";

  return (
    <li
      className={`rounded-[var(--radius-md)] border ${tone.border} ${tone.surface} px-3 py-2.5`}
    >
      <div className="flex items-baseline gap-2">
        <span
          aria-hidden="true"
          className={`w-3 shrink-0 text-center font-mono text-[13px] font-semibold ${tone.text}`}
        >
          {tone.glyph}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            {location && (
              <span
                className={`text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] ${tone.text}`}
              >
                {location}
              </span>
            )}
            <span className="text-[12px] text-[var(--text-primary)]">
              {entry.description}
            </span>
          </div>

          {entry.detail && (
            <p className="mt-1 text-[12px] leading-5 text-[var(--text-muted)]">
              {entry.detail}
            </p>
          )}

          {(showBefore || showAfter) && (
            <div className="mt-1.5 space-y-1">
              {showBefore && (
                <p
                  className={
                    beforeWasReplaced
                      ? "text-[12px] leading-5 text-[var(--text-muted)] line-through decoration-[var(--border-strong)]"
                      : "text-[12px] leading-5 text-[var(--text-primary)]"
                  }
                >
                  {entry.base_text}
                </p>
              )}
              {showAfter && (
                <p className="text-[12px] leading-5 text-[var(--text-primary)]">
                  {entry.compare_text}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export function RunComparePanel() {
  const {
    runDiff,
    runDiffError,
    isComparingRuns,
    showRunCompare,
    closeRunComparison,
  } = useIde();

  const closeRef = useRef<HTMLButtonElement | null>(null);
  // Whether the press that started this click began on the backdrop. A click is
  // delivered to the nearest common ancestor of mousedown and mouseup, so
  // selecting text inside the panel and releasing over the scrim dispatched the
  // backdrop's click and dismissed the panel mid-selection.
  const pressStartedOnBackdrop = useRef(false);

  useEffect(() => {
    if (!showRunCompare) return;

    // Focus moves into the dialog so a keyboard user is not left behind it, on
    // the run list, where Enter re-fires the fetch or triggers the destructive
    // restore. This is not a full focus trap -- that belongs with the other
    // overlays rather than in this one panel -- but it is the difference
    // between reachable and unreachable.
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeRunComparison();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showRunCompare, closeRunComparison]);

  if (!showRunCompare) return null;

  return (
    <div
      // z-[180], matching BugReportModal. At z-50 the workspace header
      // (z-[120]) and every menu above it floated over this panel and stayed
      // clickable through the scrim.
      className="fixed inset-0 z-[180] flex items-center justify-center bg-[var(--surface-overlay)] p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Run comparison"
      onMouseDown={(event) => {
        pressStartedOnBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && pressStartedOnBackdrop.current) {
          closeRunComparison();
        }
      }}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] shadow-[var(--lifted)]"
        // The backdrop closes the panel; clicks inside it must not bubble up
        // and close it out from under the reader.
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] text-[var(--text-soft)]">
              <span>{shortRunLabel(runDiff?.base.run_id)}</span>
              <span aria-hidden="true">→</span>
              <span>{shortRunLabel(runDiff?.compare.run_id)}</span>
            </div>
            {runDiff && (
              <h2 className="mt-1 text-[15px] font-semibold text-[var(--text-primary)]">
                {runDiff.headline}
              </h2>
            )}
          </div>
          <button
            onClick={closeRunComparison}
            /* Chrome, not content -- English here regardless of locale, like
               every other label in the IDE until the UI itself is localized. */
            ref={closeRef}
            aria-label="Close comparison"
            className="shrink-0 rounded-[var(--radius-sm)] px-2 py-1 text-[13px] text-[var(--text-muted)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--text-primary)]"
          >
            ✕
          </button>
        </header>

        {runDiff && (
          <div className="flex flex-wrap gap-1.5 border-b border-[var(--border-subtle)] px-4 py-2">
            {CHANGE_DISPLAY_ORDER.filter((kind) => runDiff.summary[kind] > 0).map(
              (kind) => {
                const tone = changeTone(kind);
                return (
                  <span
                    key={kind}
                    className={`rounded-[var(--radius-sm)] border ${tone.border} ${tone.surface} px-1.5 py-0.5 text-[10px] font-semibold ${tone.text}`}
                  >
                    {runDiff.summary[kind]} {runDiff.summary_labels[kind]}
                  </span>
                );
              },
            )}
          </div>
        )}

        {runDiff?.notice && (
          <p className="border-b border-[var(--state-warning)] bg-[var(--state-warning-subtle)] px-4 py-2 text-[12px] leading-5 text-[var(--text-primary)]">
            {runDiff.notice}
          </p>
        )}

        <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
          {isComparingRuns && (
            <p className="text-[12px] text-[var(--text-muted)]">Comparing…</p>
          )}

          {runDiffError && (
            <p className="rounded-[var(--radius-md)] border border-[var(--state-blocked)] bg-[var(--state-blocked-subtle)] px-3 py-2 text-[12px] text-[var(--text-primary)]">
              {runDiffError}
            </p>
          )}

          {!isComparingRuns && !runDiffError && runDiff && (
            runDiff.entries.length === 0 ? (
              // The headline above already says what happened -- in the
              // student's language -- so repeating it here in English would be
              // both redundant and a leak.
              <p className="text-[12px] text-[var(--text-muted)]">—</p>
            ) : (
              <ul className="space-y-1.5">
                {runDiff.entries.map((entry, index) => (
                  <ChangeRow
                    // Entries have no id and are not unique by line: a removal
                    // and an addition can share a line number. Index is stable
                    // here because the list is replaced wholesale, never
                    // reordered in place.
                    key={`${entry.change}-${entry.base_line_number}-${entry.compare_line_number}-${index}`}
                    entry={entry}
                  />
                ))}
              </ul>
            )
          )}
        </div>
      </div>
    </div>
  );
}
