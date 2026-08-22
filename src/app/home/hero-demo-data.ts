/**
 * The two programs the landing page runs, and the output they really produce.
 *
 * GENERATED FROM THE REAL PIPELINE ON 2026-08-21. NOT HAND-WRITTEN.
 *
 * Every string below came out of the product: the English was compiled by the
 * real compiler into the Python shown, and that Python was executed to produce
 * the stdout shown. Nothing here was composed by hand, prettified, re-indented,
 * or "cleaned up" afterwards -- including the four-space indent on the third
 * English line of `foreach`, which is what the compiler actually accepts.
 *
 * Why that is a rule and not a preference: the hero demo's whole claim is
 * "this is what the compiler does with your sentences". A string edited here to
 * look better is the landing page advertising behaviour the product does not
 * have, to exactly the people deciding whether to trust it. It is a
 * truthfulness bug, not a copy tweak.
 *
 * SO: if the compiler changes and this goes stale, REGENERATE it -- recompile
 * the English, re-execute the Python, paste the results, and move the date on
 * this comment. Do not reconcile it by editing strings until they look right.
 *
 * The demo is deliberately self-contained: no fetch, no backend, no
 * interpreter in the browser. It replays a verified transcript, which is the
 * only honest way to be instant and offline at the same time.
 */

export type HeroDemoProgram = {
  /** Stable id, used for the tab wiring. */
  readonly id: string;
  /** What the visitor picks between. */
  readonly label: string;
  /** One line per line, so the panes can render gutters without splitting. */
  readonly english: readonly string[];
  readonly python: readonly string[];
  readonly stdout: readonly string[];
};

export const HERO_DEMOS: readonly HeroDemoProgram[] = [
  {
    id: "sort",
    label: "Sort a list",
    english: [
      "create a list of numbers 5, 3, 8, 1",
      "sort the list",
      "print the list",
    ],
    python: ["numbers = [5, 3, 8, 1]", "numbers.sort()", "print(numbers)"],
    stdout: ["[1, 3, 5, 8]"],
  },
  {
    id: "foreach",
    label: "Loop over a list",
    english: [
      "create a list of numbers 1, 2, 3",
      "for each number in the list",
      "    print the number",
    ],
    python: ["numbers = [1, 2, 3]", "for number in numbers:", "    print(number)"],
    stdout: ["1", "2", "3"],
  },
] as const;
