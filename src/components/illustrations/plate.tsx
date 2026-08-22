import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * The shared frame every editorial drawing sits in.
 *
 * Two rules hold across all of them:
 *
 * 1. No colour is written here. The ink is `currentColor`, inherited from the
 *    class the caller sets, and the single accent is `var(--accent-text)`. That
 *    is the whole reason these are inline SVG rather than files in `public/` --
 *    a `.svg` asset in an `<img>` is its own document and cannot see the page's
 *    tokens, so it would need a baked hex and would break one of the themes.
 * 2. The drawing scales with its box. `viewBox` and no width/height attribute,
 *    so the caller sizes it with CSS and nothing is pinned to a pixel.
 */
export type InkIllustrationProps = {
  className?: string;
  /** `slice` to fill a well, `meet` to letterbox inside one. */
  preserveAspectRatio?: string;
  /**
   * Drop the drawing out of the accessibility tree entirely.
   *
   * A drawing is only worth describing when it is carrying information nothing
   * else on the page carries. Set this wherever the caption beside it already
   * says what the picture says -- otherwise the description is read out first
   * and the reader hears the drawing before they hear the heading, which is
   * exactly backwards. Titled by default: silence has to be chosen, so that a
   * drawing nobody thought about stays describable rather than invisible.
   */
  decorative?: boolean;
};

export type PlateProps = InkIllustrationProps & {
  title: string;
  viewBox: string;
  children: ReactNode;
};

/** Stroke weights. One confident line, one lighter register, one for texture. */
export const INK = 2.1;
export const INK_LIGHT = 1.35;
export const INK_HAIR = 0.95;

export function Plate({
  title,
  viewBox,
  className,
  preserveAspectRatio = "xMidYMid meet",
  decorative = false,
  children,
}: PlateProps) {
  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio={preserveAspectRatio}
      // aria-hidden AND no title, not one or the other: a hidden element with
      // a title still lets some tree walkers name it, and a titled element
      // that is not hidden is announced. Decorative means neither.
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      // The ink. Full-strength primary is right for pen on paper: in Academy
      // that is near-black on a pale sheet, in Ink it is warm bone on charcoal.
      // Both are the same statement, which is what a two-theme drawing needs.
      className={cn("text-[var(--text-primary)]", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={INK}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {decorative ? null : <title>{title}</title>}
      {children}
    </svg>
  );
}

type StrokeGroupProps = {
  paths: readonly string[];
  strokeWidth?: number;
  opacity?: number;
  stroke?: string;
  strokeDasharray?: string;
};

/**
 * Line work that carries meaning -- it is inside a `role="img"`, so it is
 * already covered by the plate's `<title>`, but the group is left describable
 * rather than hidden so nothing about it lies to a tree walker.
 */
export function Ink({ paths, strokeWidth = INK, opacity, stroke, strokeDasharray }: StrokeGroupProps) {
  return (
    <g strokeWidth={strokeWidth} opacity={opacity} stroke={stroke} strokeDasharray={strokeDasharray}>
      {paths.map((d, index) => (
        <path key={index} d={d} />
      ))}
    </g>
  );
}

/**
 * Hatching and other marks that are shading rather than subject.
 * Hidden outright: there is nothing here for anyone to read.
 */
export function Texture({ paths, strokeWidth = INK_HAIR, opacity = 0.4, stroke }: StrokeGroupProps) {
  return (
    <g aria-hidden="true" strokeWidth={strokeWidth} opacity={opacity} stroke={stroke}>
      {paths.map((d, index) => (
        <path key={index} d={d} />
      ))}
    </g>
  );
}

/** The one accent the house style allows, drawn at the confident weight. */
export function Accent({ paths, strokeWidth = INK, opacity }: StrokeGroupProps) {
  return (
    <g stroke="var(--accent-text)" strokeWidth={strokeWidth} opacity={opacity}>
      {paths.map((d, index) => (
        <path key={index} d={d} />
      ))}
    </g>
  );
}
