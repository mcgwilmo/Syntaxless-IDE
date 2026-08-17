/**
 * Small icon components for the IDE's minimalist layout.
 *
 * These render JSX, so they are components rather than helpers -- they were
 * sitting in the middle of the helper block purely because of where they landed
 * in the original file.
 */

import { joinClasses } from "@/features/ide/lib";
import type { MinimalControlIconName } from "@/features/ide/types";


export function MinimalControlIcon({
  name,
  className = "",
}: {
  name: MinimalControlIconName;
  className?: string;
}) {
  const baseClassName = joinClasses("h-[1.05rem] w-[1.05rem]", className);

  switch (name) {
    case "run":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className={baseClassName}
        >
          <path d="M6 4.8a1 1 0 0 1 1.52-.85l8.2 5.2a1 1 0 0 1 0 1.7l-8.2 5.2A1 1 0 0 1 6 15.2V4.8Z" />
        </svg>
      );
    case "check":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <path d="m4.5 10.5 3.5 3.5 7.5-8" />
        </svg>
      );
    case "stop":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className={baseClassName}
        >
          <rect x="5.25" y="5.25" width="9.5" height="9.5" rx="1.75" />
        </svg>
      );
    case "vision":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <path d="M1.8 10s3.1-5 8.2-5 8.2 5 8.2 5-3.1 5-8.2 5-8.2-5-8.2-5Z" />
          <circle cx="10" cy="10" r="2.6" />
        </svg>
      );
    case "mode":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <path d="M4 5.5h12" />
          <path d="M4 10h12" />
          <path d="M4 14.5h12" />
          <circle cx="7" cy="5.5" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="12.5" cy="10" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="9.5" cy="14.5" r="1.6" fill="currentColor" stroke="none" />
        </svg>
      );
    case "layout":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <rect x="3.5" y="4" width="5.5" height="5.5" rx="1.2" />
          <rect x="11" y="4" width="5.5" height="5.5" rx="1.2" />
          <rect x="3.5" y="11" width="5.5" height="5.5" rx="1.2" />
          <rect x="11" y="11" width="5.5" height="5.5" rx="1.2" />
        </svg>
      );
    case "tutorial":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <path d="M5.2 4.5h7.1a2.2 2.2 0 0 1 2.2 2.2v8.8H7.4a2.2 2.2 0 0 0-2.2 2.2V4.5Z" />
          <path d="M5.2 4.5h-.4A2.3 2.3 0 0 0 2.5 6.8v8.7A2.3 2.3 0 0 0 4.8 17.8h9.7" />
          <path d="m9 8.2 2.8 1.8L9 11.8V8.2Z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "python":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <path d="M7.2 5 4.5 10l2.7 5" />
          <path d="M12.8 5 15.5 10l-2.7 5" />
          <path d="M9 15h2" />
          <path d="M9 5h2" />
        </svg>
      );
    case "results":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <rect x="3.5" y="4" width="13" height="4" rx="1.2" />
          <rect x="3.5" y="12" width="13" height="4" rx="1.2" />
        </svg>
      );
    case "bug":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <path d="M7 7.2A3.1 3.1 0 0 1 10 5a3.1 3.1 0 0 1 3 2.2" />
          <path d="M6.4 8.2h7.2v4.1A3.6 3.6 0 0 1 10 15.9a3.6 3.6 0 0 1-3.6-3.6V8.2Z" />
          <path d="M3.8 8.5h2.1" />
          <path d="M14.1 8.5h2.1" />
          <path d="M4.7 13.1 6.3 12" />
          <path d="m15.3 13.1-1.6-1.1" />
          <path d="M7.6 4.1 6.4 2.9" />
          <path d="m12.4 4.1 1.2-1.2" />
        </svg>
      );
    case "subscriptions":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <rect x="3.5" y="5" width="13" height="10" rx="1.8" />
          <path d="M3.5 8.5h13" />
          <path d="M7 12h2.5" />
        </svg>
      );
    case "signout":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <path d="M8 4.5H5.8A1.8 1.8 0 0 0 4 6.3v7.4a1.8 1.8 0 0 0 1.8 1.8H8" />
          <path d="M11 6.5 16 10l-5 3.5" />
          <path d="M15.5 10H8" />
        </svg>
      );
    case "manage":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <circle cx="10" cy="10" r="2.2" />
          <path d="M10 3.7v1.5" />
          <path d="M10 14.8v1.5" />
          <path d="m5.5 5.5 1.1 1.1" />
          <path d="m13.4 13.4 1.1 1.1" />
          <path d="M3.7 10h1.5" />
          <path d="M14.8 10h1.5" />
          <path d="m5.5 14.5 1.1-1.1" />
          <path d="m13.4 6.6 1.1-1.1" />
        </svg>
      );
    case "terminal":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <rect x="3.5" y="4.5" width="13" height="11" rx="1.6" />
          <path d="m6.5 8 2 2-2 2" />
          <path d="M10.7 12h2.8" />
        </svg>
      );
    case "visual":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <rect x="3.5" y="4.5" width="13" height="11" rx="1.6" />
          <circle cx="8" cy="8.2" r="1.4" />
          <path d="m6.5 13 2.7-2.8 2.1 2 2.2-2.3 1.9 3.1" />
        </svg>
      );
    case "send":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <path d="M4 10h10.5" />
          <path d="m10.5 5 5 5-5 5" />
        </svg>
      );
  }
}

export function MinimalIconLabel({
  icon,
  label,
  count,
}: {
  icon: MinimalControlIconName;
  label: string;
  count?: number;
}) {
  return (
    <span className="inline-flex items-center justify-center gap-1.5">
      <MinimalControlIcon name={icon} />
      {typeof count === "number" && count > 0 ? (
        // Inlaid, not raised: the count is a chip set flush into the face of
        // the button that owns it, and the button is the only thing here that
        // presses. Its own opaque surface is what keeps it legible -- the tab
        // underneath swaps fill and text colour when it goes active, and a
        // translucent chip inherited that and lost contrast with it.
        <span className="rounded-[var(--radius-full)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] px-1.5 py-[1px] text-[9px] leading-none text-[var(--text-muted)] shadow-[var(--inlaid)]">
          {count}
        </span>
      ) : null}
      <span className="sr-only">{label}</span>
    </span>
  );
}
