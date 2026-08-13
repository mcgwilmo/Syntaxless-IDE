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
 * Colors come from tokens, which swap with the theme automatically -- so there
 * is no isLight branching here and there should be none at the call site.
 */
const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent-solid)] text-[var(--text-inverted)] border border-transparent hover:bg-[var(--accent-hover)]",
  secondary:
    "bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-sunken)]",
  ghost:
    "bg-transparent text-[var(--text-muted)] border border-transparent hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]",
  danger:
    "bg-[var(--state-blocked)] text-[var(--text-inverted)] border border-transparent hover:opacity-90",
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
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-[var(--space-2)] font-medium",
        "transition-colors duration-[var(--duration-fast)]",
        "disabled:cursor-not-allowed disabled:opacity-55",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
