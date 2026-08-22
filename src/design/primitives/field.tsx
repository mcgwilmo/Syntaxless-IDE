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
          // Placeholder uses muted, not soft: the recessed well is darker than a
          // card, and soft text measures only 4.60:1 against it in light (6.09
          // in dark). That clears AA by a tenth of a point, which is not enough
          // margin to spend on the lowest-priority text in the component.
          "bg-[var(--surface-sunken)] placeholder:text-[var(--text-muted)]",
          // Recessed, not raised. An input is a well you put something into, so
          // it takes the opposite lighting to a button -- shadow at the top,
          // catch of light along the bottom. Getting this backwards is what
          // makes a form look like a row of unpressed buttons.
          "shadow-[var(--recessed)]",
          "transition-[border-color,box-shadow] duration-[var(--duration-fast)] outline-none",
          error
            ? "border-[var(--state-blocked)]"
            : "border-[var(--border-strong)] hover:border-[color-mix(in_srgb,var(--border-strong)_140%,transparent)] focus:border-[var(--accent-solid)]",
          className
        )}
        {...props}
      />

      {/* Muted, not soft, for the same reason as the placeholder above: a Field
          is almost always sitting on a raised card, and soft is only measured
          against --surface-page. On a sheened card in the dark theme soft drops
          to 4.63:1 -- nominally AA, but with no margin left. */}
      {hint && !error && (
        <p id={`${fieldId}-hint`} className="text-[length:var(--text-sm)] text-[var(--text-muted)]">
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
