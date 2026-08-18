"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

/*
 * The legacy compound card, kept for its Header/Title/Content parts and its ref
 * forwarding -- neither of which the Card primitive in @/design/primitives has.
 * New code should reach for that primitive; this exists for call sites that need
 * to hang a ref or spread DOM props onto the shell.
 *
 * Visually the two are the same object, so they sit on the same rung and pick up
 * the same tokens. If one of them ever moves, move both.
 */

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-[var(--radius-lg)] border border-[var(--border-subtle)]",
      "bg-[var(--surface-raised)] bg-[image:var(--material-sheen)]",
      "text-[var(--text-primary)]",
      // Raised, not raised-lg: this is the everyday grouping container resting
      // on the page, not a panel lifted above it. And it is a container rather
      // than a control, so it never travels on hover or press.
      "shadow-[var(--raised)]",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

/*
 * Padding lives on Header and Content rather than on the shell, so a card can
 * hold a full-bleed child (an image, a table) without fighting its own inset.
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col gap-[var(--space-2)] p-[var(--space-6)]",
      className
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-[length:var(--text-2xl)] font-semibold",
      "leading-[var(--leading-tight)] tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-[var(--space-6)] pt-0", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

export { Card, CardContent, CardHeader, CardTitle };
