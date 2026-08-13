import { cn } from "@/lib/cn";
import type { InputHTMLAttributes } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  /** Hide the label visually but keep it for screen readers. */
  hideLabel?: boolean;
  hint?: string;
  error?: string;
};

/*
 * A labelled input.
 *
 * The label is always rendered, because a placeholder is not a label -- it
 * disappears the moment someone starts typing, which is exactly when a student
 * filling in an unfamiliar form needs it most. Use hideLabel only when adjacent
 * text already names the field.
 */
export function Field({
  label,
  hideLabel = false,
  hint,
  error,
  className,
  id,
  ...props
}: FieldProps) {
  const fieldId = id ?? `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const describedBy = error
    ? `${fieldId}-error`
    : hint
      ? `${fieldId}-hint`
      : undefined;

  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <label
        htmlFor={fieldId}
        className={cn(
          "text-[length:var(--text-sm)] font-medium text-[var(--text-muted)]",
          hideLabel && "sr-only"
        )}
      >
        {label}
      </label>

      <input
        id={fieldId}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={cn(
          "w-full rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-3)]",
          "text-[length:var(--text-base)] text-[var(--text-primary)]",
          "bg-[var(--surface-raised)] placeholder:text-[var(--text-soft)]",
          "transition-colors duration-[var(--duration-fast)] outline-none",
          error
            ? "border-[var(--state-blocked)]"
            : "border-[var(--border-subtle)] hover:border-[var(--border-strong)] focus:border-[var(--accent-solid)]",
          className
        )}
        {...props}
      />

      {hint && !error && (
        <p id={`${fieldId}-hint`} className="text-[length:var(--text-sm)] text-[var(--text-soft)]">
          {hint}
        </p>
      )}

      {error && (
        <p id={`${fieldId}-error`} className="text-[length:var(--text-sm)] text-[var(--state-blocked)]">
          {error}
        </p>
      )}
    </div>
  );
}
