import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type CalloutTone = "neutral" | "success" | "warning" | "blocked";

type CalloutProps = {
  tone?: CalloutTone;
  title?: string;
  children: ReactNode;
  className?: string;
};

/*
 * A short piece of status or guidance.
 *
 * Tone carries meaning and nothing else: success = it ran, warning = worth a
 * look, blocked = it cannot run yet. Never pick a tone for visual variety.
 *
 * Tone is also conveyed by the title text, not by color alone -- roughly 1 in 12
 * people cannot reliably separate the green and the rose.
 */
const TONES: Record<CalloutTone, { box: string; text: string }> = {
  neutral: {
    box: "border-[var(--border-subtle)] bg-[var(--surface-sunken)]",
    text: "text-[var(--text-muted)]",
  },
  success: {
    box: "border-[color-mix(in_srgb,var(--state-success)_30%,transparent)] bg-[var(--state-success-subtle)]",
    text: "text-[var(--state-success)]",
  },
  warning: {
    box: "border-[color-mix(in_srgb,var(--state-warning)_30%,transparent)] bg-[var(--state-warning-subtle)]",
    text: "text-[var(--state-warning)]",
  },
  blocked: {
    box: "border-[color-mix(in_srgb,var(--state-blocked)_30%,transparent)] bg-[var(--state-blocked-subtle)]",
    text: "text-[var(--state-blocked)]",
  },
};

export function Callout({ tone = "neutral", title, children, className }: CalloutProps) {
  const styles = TONES[tone];

  return (
    <div
      role={tone === "blocked" ? "alert" : "status"}
      className={cn(
        "rounded-[var(--radius-lg)] border px-[var(--space-4)] py-[var(--space-3)]",
        // Set into the page, not sitting on it -- a callout is read, not pressed.
        "shadow-[var(--inlaid)]",
        "text-[length:var(--text-sm)] leading-[var(--leading-normal)]",
        styles.box,
        className
      )}
    >
      {title && <p className={cn("font-medium", styles.text)}>{title}</p>}
      <div className={cn("text-[var(--text-muted)]", title && "mt-[var(--space-1)]")}>
        {children}
      </div>
    </div>
  );
}
