/**
 * The shape of a lesson.
 *
 * Lessons are authored as YAML in this directory and compiled into
 * `generated.ts` before every dev run and build. This file is the type side of
 * that contract; the checking side lives in `scripts/build-lessons.mjs`, which
 * must run in plain Node and therefore cannot import these types.
 *
 * The split is deliberate rather than duplicated: types here, rules there. If
 * you add a field, add it in both places -- the build will reject content the
 * types would have accepted, which is the safe direction for the mistake.
 *
 * See README.md in this directory for how to write one.
 */

/** The same program expressed four ways. This contrast is the teaching idea. */
export const EXAMPLE_MODES = [
  "strict",
  "standard",
  "abstraction",
  "pseudocode",
] as const;

export type ExampleMode = (typeof EXAMPLE_MODES)[number];

export type Example = {
  id: string;
} & Record<ExampleMode, string[]>;

export type Topic = {
  id: string;
  title: string;
  /** What the concept is. */
  definition: string;
  /** When to reach for it, and why. */
  howAndWhy: string;
  examples: Example[];
};

export type Lesson = {
  id: string;
  /** Position within its tab. Ordering comes from here, not from filenames. */
  number: number;
  title: string;
  overview: string;
  topics: Topic[];
};

export type TabId = "operators" | "data-structures-algorithms";

export const TAB_IDS: readonly TabId[] = [
  "operators",
  "data-structures-algorithms",
];

export function isTabId(value: string): value is TabId {
  return (TAB_IDS as readonly string[]).includes(value);
}
