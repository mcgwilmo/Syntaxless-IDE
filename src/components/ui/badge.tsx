"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "secondary" | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const badgeVariantClasses: Record<BadgeVariant, string> = {
  default: "border-transparent bg-slate-950 text-white",
  secondary: "border-transparent bg-slate-100 text-slate-900",
  outline: "border-white/20 bg-transparent text-white",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        badgeVariantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
