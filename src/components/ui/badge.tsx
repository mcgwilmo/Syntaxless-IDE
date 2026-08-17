"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

/*
 * The legacy badge.
 *
 * Not a re-export of the Badge in @/design/primitives, even though it looks
 * like a duplicate: this one is a div that spreads arbitrary HTML attributes
 * (id, onClick, aria-*) and the primitive takes only children and className, so
 * re-exporting would quietly drop props at every existing call site.
 *
 * The variants below are the primitive's tones wearing their old names, so both
 * badges sit on the same rung and read as the same kind of object.
 */
type BadgeVariant = "default" | "secondary" | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const badgeVariantClasses: Record<BadgeVariant, string> = {
  default: "border-transparent bg-[var(--accent-subtle)] text-[var(--accent-text)]",
  secondary: "border-transparent bg-[var(--surface-sunken)] text-[var(--text-muted)]",
  // No fill here, so the border is the only thing holding the shape and has to
  // be the stronger of the two.
  outline: "border-[var(--border-strong)] bg-transparent text-[var(--text-muted)]",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-[var(--radius-full)] border",
        // Inlaid rather than raised: a badge is a label set into the surface,
        // so it gets no hover lift and no press travel.
        "shadow-[var(--inlaid)]",
        "px-[var(--space-2)] py-[var(--space-1)]",
        // Leading is set explicitly because `text-[length:...]` carries only a
        // font-size -- unlike the `text-xs` it replaced, which shipped a
        // line-height with it. Without this the badge inherits the leading of
        // whatever paragraph it sits in and grows taller inside body copy.
        "text-[length:var(--text-xs)] leading-[var(--leading-tight)] font-medium",
        // Only the color moves, and a fade has no momentum -- ease-out, not the
        // spring the pressable controls use.
        "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]",
        badgeVariantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
