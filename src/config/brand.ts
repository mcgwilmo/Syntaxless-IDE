/**
 * Product identity.
 *
 * Everything that encodes "what this product is called" lives here, so a rebrand
 * is a change to this file plus an asset swap -- not a sweep across the codebase.
 *
 * A rebrand is in progress and the final name is undecided. See
 * `restructure/phase-1-plan.md` for the identifiers that are deliberately NOT
 * driven from here (persisted storage keys and backend prompt text), and why.
 */

export const BRAND = {
  /** Full display name. Used in prose, headings, and metadata. */
  name: "TRACE",

  /** Stylized form, where the letter-spaced treatment is wanted. */
  displayName: "T.R.A.C.E.",

  /** Expansion of the acronym. Drop this if the next name is not an acronym. */
  tagline: "Thinking and Reasoning Assisted Coding Environment",

  /** One-line description used for page metadata and social cards. */
  description:
    "A browser-based IDE for building programs from ideas, logic, and natural language.",

  /** Asset paths, named by role rather than by product name. */
  logo: {
    wordmark: "/brand/logo.png",
    mark: "/brand/logo-mark.png",
  },
} as const;

/**
 * Storage keys.
 *
 * NOT display strings -- these are persisted in the user's browser. Changing a
 * value silently discards whatever is already stored under the old key: the
 * theme key resets everyone's light/dark preference, and the problem key
 * orphans saved problem state.
 *
 * A rename needs migration code that reads the old key, writes the new one, and
 * removes the old -- kept for a release or two before dropping it. Do not fold
 * these into BRAND.
 */
export const STORAGE_KEYS = {
  theme: "trace-ui-theme",
  problem: (projectId: string) => `codeless:problem:${projectId}`,
} as const;
