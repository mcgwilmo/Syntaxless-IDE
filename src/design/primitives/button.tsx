import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
};

/*
 * A button that behaves like a physical one: it sits proud of the page, catches
 * light on its top edge, and travels down when pressed.
 *
 * The press is the point. A student who is unsure whether they clicked Run gets
 * an answer from the button itself, before any output arrives -- which matters
 * most on the slow path, where generation takes a moment and nothing else on
 * screen has changed yet.
 *
 * Colors still come from tokens, so there is no isLight branching here and none
 * at the call site.
 */
const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent-solid)] text-[var(--text-inverted)] border border-[color-mix(in_srgb,var(--accent-solid)_70%,black)] hover:bg-[var(--accent-hover)]",
  secondary:
    "bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-strong)] hover:bg-[var(--surface-sunken)]",
  ghost:
    "bg-transparent text-[var(--text-muted)] border border-transparent hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)] shadow-none",
  danger:
    "bg-[var(--state-blocked)] text-[var(--text-inverted)] border border-[color-mix(in_srgb,var(--state-blocked)_70%,black)] hover:opacity-95",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-[var(--space-3)] py-[var(--space-1)] text-[length:var(--text-sm)] rounded-[var(--radius-sm)]",
  md: "px-[var(--space-4)] py-[var(--space-2)] text-[length:var(--text-base)] rounded-[var(--radius-md)]",
  lg: "px-[var(--space-5)] py-[var(--space-3)] text-[length:var(--text-base)] rounded-[var(--radius-md)]",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const isGhost = variant === "ghost";

  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center gap-[var(--space-2)] font-medium",
        "transition-[background-color,box-shadow,transform] duration-[var(--duration-fast)]",
        // The material: raised at rest, travelling down and inverting its
        // shading when held. Ghost buttons stay flat -- they are not objects,
        // they are text that responds.
        !isGhost && "shadow-[var(--raised)]",
        !isGhost && "active:shadow-[var(--pressed)]",
        !isGhost && "active:translate-y-[var(--press-travel)]",
        // Disabled means "not a thing you can press", so the depth goes away
        // rather than just the color.
        "disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none",
        "disabled:active:translate-y-0 disabled:active:shadow-none",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {/* The sheen. A separate layer so it can sit over the background colour
          without every variant needing its own gradient definition. */}
      {!isGhost && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[image:var(--material-sheen)]"
        />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}
