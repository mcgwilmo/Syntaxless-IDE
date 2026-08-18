import type { RunDiffChange, RunSummary } from "@/lib/api/types";

/*
 * Choosing two runs to compare, and how the result is laid out.
 *
 * Pure, for the same reason `run-events.ts` is: this module decides, and
 * `use-ide-state` performs. Selection has real rules -- how a third click
 * behaves, which of the two runs is the "before" -- and each of them is a
 * decision that should be readable and testable without rendering the IDE or
 * reaching a backend.
 *
 * No prose lives here. Every user-facing sentence in a comparison arrives from
 * the backend already written in the requested language, so anything this file
 * added would be English regardless of locale. What it does own is *visual*
 * vocabulary -- which colour a change reads as -- which carries no language.
 */

/** How many runs a comparison takes. Two. Named because it appears in the rules. */
export const COMPARISON_SIZE = 2;

/**
 * Add or remove a run from the current selection.
 *
 * Clicking a selected run deselects it. Clicking a third run drops the *oldest*
 * choice and keeps the newest, so a student exploring history keeps sliding the
 * comparison forward instead of hitting a wall and having to clear it. Rejecting
 * the third click is the obvious alternative and it is worse: it does nothing
 * visible, which reads as a broken button.
 */
export function toggleRunSelection(
  selected: readonly string[],
  runId: string,
): string[] {
  if (selected.includes(runId)) {
    return selected.filter((id) => id !== runId);
  }
  return [...selected, runId].slice(-COMPARISON_SIZE);
}

/**
 * Which selected run is the "before" and which is the "after".
 *
 * Every sentence the backend returns describes a change *from* base *to*
 * compare, so getting this backwards produces a fluent, coherent, exactly wrong
 * story -- additions reported as deletions. Order by timestamp, oldest first.
 *
 * Falls back to selection order when timestamps are missing or equal, which
 * happens: run history is written with second precision, so two runs a moment
 * apart can share one. Returns null unless exactly two runs are selected AND
 * both were found in the list -- a run can vanish from the list underneath a
 * selection, because `reload_runs` replaces the array whenever any run finishes.
 */
export function orderForComparison(
  selected: readonly string[],
  runs: readonly RunSummary[],
): { baseId: string; compareId: string } | null {
  if (selected.length !== COMPARISON_SIZE) return null;

  const found = selected
    .map((id) => runs.find((run) => run.id === id))
    .filter((run): run is RunSummary => Boolean(run));
  if (found.length !== COMPARISON_SIZE) return null;

  const [first, second] = found;
  const firstTime = Date.parse(first.timestamp ?? "");
  const secondTime = Date.parse(second.timestamp ?? "");

  const bothParsed = !Number.isNaN(firstTime) && !Number.isNaN(secondTime);
  const olderIsSecond = bothParsed && secondTime < firstTime;

  return olderIsSecond
    ? { baseId: second.id, compareId: first.id }
    : { baseId: first.id, compareId: second.id };
}

/**
 * Which changes are worth showing by default.
 *
 * `unchanged` is excluded by the backend already; `reworded` is included because
 * "you changed these words and it made no difference" is the single most
 * instructive thing this feature says -- it is the evidence that meaning, not
 * spelling, is what the program is made of.
 */
export const DEFAULT_VISIBLE_CHANGES: readonly RunDiffChange[] = [
  "changed",
  "added",
  "removed",
  "moved",
  "reworded",
];

/**
 * The order changes are listed in a summary.
 *
 * Behavioural changes first, because they are what a reader is looking for;
 * `reworded` and `unchanged` last, because they are reassurance rather than
 * news.
 */
export const CHANGE_DISPLAY_ORDER: readonly RunDiffChange[] = [
  "changed",
  "added",
  "removed",
  "moved",
  "reworded",
  "unchanged",
];

/**
 * Visual treatment per change kind.
 *
 * Semantic colour, deliberately not the accent: `added` is the success green and
 * `removed` the blocked rose that the rest of the IDE already uses for those
 * meanings, so a student reads them without a legend. `reworded` is neutral on
 * purpose -- it is the "nothing actually happened" case and colouring it would
 * make a non-event look like news.
 */
export type ChangeTone = {
  border: string;
  surface: string;
  text: string;
  /** A single character, so the classification survives greyscale and colour blindness. */
  glyph: string;
};

const CHANGE_TONES: Record<RunDiffChange, ChangeTone> = {
  changed: {
    border: "border-[var(--state-warning)]",
    surface: "bg-[var(--state-warning-subtle)]",
    text: "text-[var(--state-warning)]",
    glyph: "~",
  },
  added: {
    border: "border-[var(--state-success)]",
    surface: "bg-[var(--state-success-subtle)]",
    text: "text-[var(--state-success)]",
    glyph: "+",
  },
  removed: {
    border: "border-[var(--state-blocked)]",
    surface: "bg-[var(--state-blocked-subtle)]",
    text: "text-[var(--state-blocked)]",
    glyph: "−",
  },
  moved: {
    border: "border-[var(--accent-border)]",
    surface: "bg-[var(--accent-subtle)]",
    text: "text-[var(--accent-text)]",
    glyph: "↕",
  },
  reworded: {
    border: "border-[var(--border-subtle)]",
    surface: "bg-[var(--surface-sunken)]",
    text: "text-[var(--text-muted)]",
    glyph: "≈",
  },
  unchanged: {
    border: "border-[var(--border-subtle)]",
    surface: "bg-[var(--surface-sunken)]",
    text: "text-[var(--text-soft)]",
    glyph: "=",
  },
};

/**
 * Tone for a change kind.
 *
 * Falls back to the neutral treatment rather than throwing: `change` arrives
 * from the backend as unvalidated JSON, and a classification this build has
 * never heard of should render plainly, not crash the panel.
 */
export function changeTone(change: string): ChangeTone {
  return CHANGE_TONES[change as RunDiffChange] ?? CHANGE_TONES.unchanged;
}

/** Short, language-free label for a run: `Run #4af86760`. */
export function shortRunLabel(runId: string | null | undefined): string {
  if (!runId) return "—";
  return `#${runId.slice(0, 8)}`;
}
