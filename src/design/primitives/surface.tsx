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
        "bg-[var(--surface-raised)] p-[var(--space-5)] shadow-[var(--shadow-sm)]",
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
        "bg-[var(--surface-raised)] p-[var(--space-8)] shadow-[var(--shadow-lg)]",
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
