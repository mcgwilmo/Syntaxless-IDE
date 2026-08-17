import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type SurfaceProps = {
  children: ReactNode;
  className?: string;
};

/*
 * Card -- a grouped block of content. The everyday container.
 */
export function Card({ children, className }: SurfaceProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--border-subtle)]",
        "bg-[var(--surface-raised)] bg-[image:var(--material-sheen)]",
        "p-[var(--space-5)] shadow-[var(--raised)]",
        className
      )}
    >
      {children}
    </div>
  );
}

/*
 * Panel -- a larger, more prominent container: modals, auth panels, sidebars.
 * Rounder and more elevated than a Card.
 */
export function Panel({ children, className }: SurfaceProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border border-[var(--border-subtle)]",
        "bg-[var(--surface-raised)] bg-[image:var(--material-sheen)]",
        "p-[var(--space-8)] shadow-[var(--raised-lg)]",
        className
      )}
    >
      {children}
    </div>
  );
}

type BadgeTone = "neutral" | "accent" | "success" | "warning" | "blocked";

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "bg-[var(--surface-sunken)] text-[var(--text-muted)]",
  accent: "bg-[var(--accent-subtle)] text-[var(--accent-text)]",
  success: "bg-[var(--state-success-subtle)] text-[var(--state-success)]",
  warning: "bg-[var(--state-warning-subtle)] text-[var(--state-warning)]",
  blocked: "bg-[var(--state-blocked-subtle)] text-[var(--state-blocked)]",
};

/*
 * Badge -- a small status marker. Tone carries meaning, same rule as Callout.
 */
export function Badge({
  tone = "neutral",
  children,
  className,
}: SurfaceProps & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-sm)]",
        // Inlaid rather than raised: a badge is a label set into the surface,
        // not something you can press.
        "shadow-[var(--inlaid)]",
        "px-[var(--space-2)] py-[var(--space-1)]",
        "text-[length:var(--text-xs)] font-medium",
        BADGE_TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/*
 * Floating -- detached from the page: menus, popovers, dropdowns, toasts.
 *
 * No contact shadow, because nothing is touching. That absence is what
 * separates a menu hovering over the page from a card lying on it, and it is
 * doing more work than the larger blur is.
 */
export function Floating({ children, className }: SurfaceProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--border-subtle)]",
        "bg-[var(--surface-raised)] bg-[image:var(--material-sheen)]",
        "p-[var(--space-2)] shadow-[var(--floating)]",
        className
      )}
    >
      {children}
    </div>
  );
}

/*
 * Modal -- the top of the stack, over a scrim.
 *
 * Pair it with Scrim. The long shadow falloff only reads as distance when
 * there is something dimmed behind it to be distant from.
 */
export function Modal({ children, className }: SurfaceProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border border-[var(--border-subtle)]",
        "bg-[var(--surface-raised)] bg-[image:var(--material-sheen)]",
        "p-[var(--space-8)] shadow-[var(--modal)]",
        className
      )}
    >
      {children}
    </div>
  );
}

/*
 * Scrim -- the dimmed page behind a modal.
 *
 * Dim rather than blur. A blur costs a full-viewport compositing pass on every
 * frame it animates, and on a classroom laptop that is the difference between
 * a modal that opens and one that stutters. The material system does not need
 * it: the modal's shadow already says "in front".
 */
export function Scrim({ children, className }: SurfaceProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-[var(--space-4)]",
        "bg-[var(--surface-overlay)]",
        className
      )}
    >
      {children}
    </div>
  );
}
