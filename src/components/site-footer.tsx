"use client";

import { useTheme } from "@/components/theme-provider";
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
}: {
  className?: string;
  socialLinks?: FooterSocialLink[];
}) {
  const { isLight } = useTheme();

  return (
    <footer className={cn("relative z-10 mt-8", className)}>
      <div className="mx-auto w-full max-w-7xl px-4 pb-8 md:px-6 md:pb-10">
        <div className="px-1 py-2 md:px-0">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-end">
            <div
              className={cn(
                "flex flex-wrap items-center gap-3 md:gap-4",
                isLight ? "text-slate-500" : "text-neutral-400"
              )}
            >
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300",
                    isLight
                      ? "border-slate-200/90 bg-white/72 text-slate-500 hover:border-slate-300 hover:bg-white hover:text-slate-900"
                      : "border-white/[0.08] bg-white/[0.03] text-neutral-400 hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white"
                  )}
                  aria-label={link.label}
                >
                  <PlaceholderSocialIcon kind={link.icon} />
                </a>
              ))}
            </div>
          </div>

          <div
            className={cn(
              "mt-5 h-px w-full",
              isLight
                ? "bg-[linear-gradient(90deg,transparent,rgba(148,163,184,0.35),transparent)]"
                : "bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)]"
            )}
          />

          <div
            className={cn(
              "mt-4 flex flex-col gap-2 text-sm md:flex-row md:items-end md:justify-between",
              isLight ? "text-slate-500" : "text-neutral-400"
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
