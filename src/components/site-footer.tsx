"use client";

import { cn } from "@/lib/cn";

type PlaceholderIconKind =
  | "x"
  | "linkedin"
  | "facebook"
  | "instagram"
  | "tiktok";

export type FooterSocialLink = {
  label: string;
  href: string;
  icon: PlaceholderIconKind;
};

const DEFAULT_SOCIAL_LINKS: FooterSocialLink[] = [
  { label: "Placeholder X", href: "#", icon: "x" },
  { label: "Placeholder LinkedIn", href: "#", icon: "linkedin" },
  { label: "Placeholder Facebook", href: "#", icon: "facebook" },
  { label: "Placeholder Instagram", href: "#", icon: "instagram" },
  { label: "Placeholder TikTok", href: "#", icon: "tiktok" },
];

/*
 * A social link is a control resting directly on the page, so it takes the base
 * rung rather than the card one -- the bar controls in site-shell sit on a
 * raised surface and need the stronger border to separate from it; here the page
 * behind is flat, and the lit top edge alone is enough.
 *
 * It is a link, but it is shaped like a button, so it has to behave like one:
 * up toward the light on hover, down and inverted when held. Same physics as the
 * Button primitive, which it deliberately mirrors.
 */
const SOCIAL_CONTROL = cn(
  "flex h-10 w-10 items-center justify-center rounded-[var(--radius-full)]",
  "border border-[var(--border-subtle)]",
  "bg-[var(--surface-raised)] bg-[image:var(--material-sheen)]",
  "text-[var(--text-muted)] shadow-[var(--raised)]",
  "transition-[background-color,border-color,box-shadow,color,transform]",
  "duration-[var(--duration-press)] ease-[var(--ease-spring)]",
  "hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]",
  "hover:shadow-[var(--lifted)] hover:-translate-y-[var(--lift-travel)]",
  "active:shadow-[var(--pressed)] active:translate-y-[var(--press-travel)]",
  "motion-reduce:transform-none motion-reduce:hover:transform-none",
  "motion-reduce:active:transform-none"
);

function PlaceholderSocialIcon({ kind }: { kind: PlaceholderIconKind }) {
  if (kind === "x") {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[1.05rem] w-[1.05rem]"
        aria-hidden="true"
      >
        <path d="M4.5 4.5 15.5 15.5" />
        <path d="M15.5 4.5 4.5 15.5" />
      </svg>
    );
  }

  if (kind === "linkedin") {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[1.05rem] w-[1.05rem]"
        aria-hidden="true"
      >
        <rect x="3.75" y="3.75" width="12.5" height="12.5" rx="2.2" />
        <path d="M7.1 8.6v5" />
        <path d="M7.1 6.5h.01" />
        <path d="M10.2 13.6v-2.85a1.6 1.6 0 0 1 3.2 0v2.85" />
        <path d="M10.2 8.6v5" />
      </svg>
    );
  }

  if (kind === "facebook") {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[1.05rem] w-[1.05rem]"
        aria-hidden="true"
      >
        <circle cx="10" cy="10" r="6.25" />
        <path d="M11.2 8.2H9.7c-.55 0-1 .45-1 1v1" />
        <path d="M8.7 10.2h2.4" />
        <path d="M10 10.2v4" />
      </svg>
    );
  }

  if (kind === "instagram") {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[1.05rem] w-[1.05rem]"
        aria-hidden="true"
      >
        <rect x="4" y="4" width="12" height="12" rx="3" />
        <circle cx="10" cy="10" r="2.8" />
        <path d="M13.5 6.5h.01" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[1.05rem] w-[1.05rem]"
      aria-hidden="true"
    >
      <path d="M11.9 5.1a3.2 3.2 0 0 0 2.2 1.05" />
      <path d="M9.3 7.15v4.05a2.1 2.1 0 1 1-2.1-2.1" />
      <path d="M11.9 5v5.15" />
      <path d="M11.9 7.2a5.2 5.2 0 0 0 2.35.55" />
    </svg>
  );
}

export function SiteFooter({
  className,
  socialLinks = DEFAULT_SOCIAL_LINKS,
  requireAuthForLinks = false,
}: {
  className?: string;
  socialLinks?: FooterSocialLink[];
  requireAuthForLinks?: boolean;
}) {
  return (
    <footer className={cn("relative z-10 mt-[var(--space-8)]", className)}>
      <div
        className={cn(
          "mx-auto w-full max-w-7xl",
          // Matches PageFrame's gutters so the footer rules line up with the
          // content above them.
          "px-[var(--space-4)] pb-[var(--space-8)]",
          "md:px-[var(--space-6)] md:pb-[var(--space-10)]"
        )}
      >
        <div className="px-[var(--space-1)] py-[var(--space-2)] md:px-0">
          <div className="flex flex-col gap-[var(--space-5)] md:flex-row md:items-center md:justify-end">
            <div className="flex flex-wrap items-center gap-[var(--space-3)] md:gap-[var(--space-4)]">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={requireAuthForLinks ? "/login" : link.href}
                  className={SOCIAL_CONTROL}
                  aria-label={link.label}
                >
                  <PlaceholderSocialIcon kind={link.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* A hairline that fades out at both ends, so only its midpoint is ever
              at full strength -- it takes --border-strong to still read as a
              line there, where --border-subtle would disappear. */}
          <div
            className={cn(
              "mt-[var(--space-5)] h-px w-full",
              "bg-[linear-gradient(90deg,transparent,var(--border-strong),transparent)]"
            )}
          />

          {/* Muted rather than soft, to hold the same weight as the icon row
              above -- those sit on a raised surface, where soft falls under AA
              in the dark theme. */}
          <div
            className={cn(
              "mt-[var(--space-4)] flex flex-col gap-[var(--space-2)]",
              "text-[length:var(--text-sm)] text-[var(--text-muted)]",
              "md:flex-row md:items-end md:justify-between"
            )}
          >
            <p>© 2026 All rights reserved.</p>
            <p>Powered by El Sol Vida Inc.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
