/**
 * Product identity.
 *
 * Everything that encodes "what this product is called" lives here, so a rebrand
 * is a change to this file plus an asset swap -- not a sweep across the codebase.
 * That held: renaming to Rosetta Code was this file plus eighteen display
 * strings that had never been routed through it, and no asset change at all --
 * both marks are geometric and carry no lettering.
 *
 * See `restructure/phase-1-plan.md` for the identifiers deliberately NOT driven
 * from here (persisted storage keys and backend prompt text), and why.
 */

export const BRAND = {
  /** Full display name. Used in prose, headings, and metadata. */
  name: "Rosetta Code",

  /**
   * Stylized form, where a treatment distinct from `name` is wanted.
   *
   * "T.R.A.C.E." set this apart by letter-spacing an acronym. Rosetta Code is
   * not an acronym and has no such form, so the two are identical for now --
   * the field stays because call sites distinguish prose from chrome, and a
   * future name may want the distinction back.
   */
  displayName: "Rosetta Code",

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
