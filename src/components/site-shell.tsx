"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { BeamsBackground } from "@/components/beams-background";
import { cn } from "@/lib/cn";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ThemeToggleButton, useTheme } from "@/components/theme-provider";

type SiteHeaderProps = {
  tierLabel?: string;
  authHref: string;
  authLabel: string;
  learningCenterHref?: string;
  showSignOut?: boolean;
  maxWidth?: "6xl" | "7xl";
  hideOnScroll?: boolean;
  className?: string;
  surfaceClassName?: string;
};

type PageFrameProps = {
  children: ReactNode;
  maxWidth?: "6xl" | "7xl";
  className?: string;
};

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
};

type AuthPanelProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

type PageHeroProps = {
  title: string;
  description: string;
  eyebrow?: string;
  badges?: ReactNode;
  footer?: ReactNode;
  className?: string;
  descriptionClassName?: string;
};

type TypingHeadingProps = {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  style?: CSSProperties;
  speed?: number;
  threshold?: number;
};

const PRIMARY_NAV_ITEMS = [
  { href: "/subscriptions", label: "Pricing" },
  { href: "/docs", label: "Release Notes" },
  { href: "/about", label: "About" },
  { href: "/resources", label: "Learning Center" },
] as const;
const REVEAL_ROOT_MARGIN = "0px 0px -12% 0px";

function getWidthClass(maxWidth: "6xl" | "7xl") {
  return maxWidth === "6xl" ? "max-w-6xl" : "max-w-7xl";
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TypingHeading({
  text,
  as = "h1",
  className,
  style,
  speed = 42,
  threshold = 0.2,
}: TypingHeadingProps) {
  const ref = useRef<HTMLHeadingElement | null>(null);
  const [inView, setInView] = useState(false);
  const [count, setCount] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function syncPreference() {
      setReduceMotion(mediaQuery.matches);
    }

    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);
    return () => mediaQuery.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node || reduceMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        setCount(0);
      },
      {
        rootMargin: REVEAL_ROOT_MARGIN,
        threshold,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reduceMotion, threshold, text]);

  useEffect(() => {
    if (reduceMotion || !inView) return;

    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setCount(index);

      if (index >= text.length) {
        window.clearInterval(interval);
      }
    }, speed);

    return () => {
      window.clearInterval(interval);
    };
  }, [inView, reduceMotion, speed, text]);

  const Tag = as;
  const visibleText = reduceMotion ? text : inView ? text.slice(0, count) : "";
  const showCursor = (inView || reduceMotion) && text.length > 0;
  const cursorBlink = reduceMotion || count >= text.length;

  return (
    <>
      <Tag ref={ref} className={cn("font-bold", className)} style={style}>
        {visibleText}
        <span
          className={cn(
            "ml-1 inline-block h-[0.88em] w-[2px] align-[-0.08em]",
            !showCursor
              ? "opacity-0"
              : cursorBlink
              ? "animate-[typedCursorBlink_1s_steps(1)_infinite]"
              : "opacity-100"
          )}
          style={{
            backgroundColor: "rgba(115, 207, 255, 0.9)",
            boxShadow: "0 0 10px rgba(82,183,255,0.28)",
          }}
          aria-hidden="true"
        />
      </Tag>

      <style jsx global>{`
        @keyframes typedCursorBlink {
          0%,
          49% {
            opacity: 1;
          }
          50%,
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}

export function SiteHeader({
  tierLabel,
  authHref,
  authLabel,
  learningCenterHref = "/resources",
  showSignOut = false,
  maxWidth = "7xl",
  hideOnScroll = true,
  className,
  surfaceClassName,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const { isLight } = useTheme();
  const [isHidden, setIsHidden] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const navItems = [
    ...PRIMARY_NAV_ITEMS.map((item) =>
      item.href === "/resources"
        ? { ...item, href: learningCenterHref }
        : item
    ),
    { href: authHref, label: authLabel },
  ];

  function toggleMenu() {
    setIsMenuOpen((current) => !current);
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  async function handleSignOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);

    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      closeMenu();
      window.location.replace("/");
    } finally {
      setIsSigningOut(false);
    }
  }

  useEffect(() => {
    if (!hideOnScroll) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateVisibility() {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;

      if (currentScrollY <= 64) {
        setIsHidden(false);
      } else if (delta > 6 && currentScrollY > 140) {
        setIsHidden(true);
      } else if (delta < -6) {
        setIsHidden(false);
      }

      lastScrollY = currentScrollY;
      ticking = false;
    }

    function handleScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateVisibility);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hideOnScroll]);

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 px-4 py-4 transition-all duration-300 md:px-6 md:py-5",
        hideOnScroll && isHidden && !isMenuOpen && "-translate-y-[calc(100%+1.5rem)]",
        className
      )}
    >
      <div
        className={cn(
          "relative isolate mx-auto overflow-hidden px-4 py-3 backdrop-blur-2xl backdrop-saturate-150 transition-all duration-500 md:px-5",
          isLight
            ? "border border-white/70 bg-white/72 shadow-[0_18px_48px_rgba(15,23,42,0.1)]"
            : "border border-white/8 bg-black/18 shadow-[0_20px_60px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.08)]",
          getWidthClass(maxWidth),
          isMenuOpen ? "rounded-[2rem]" : "rounded-full",
          surfaceClassName
        )}
      >
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0",
            isLight
              ? "bg-[linear-gradient(135deg,rgba(255,255,255,0.52),rgba(255,255,255,0.16)_42%,rgba(255,255,255,0.24)_100%)]"
              : "bg-[linear-gradient(135deg,rgba(255,255,255,0.1),rgba(255,255,255,0.015)_42%,rgba(255,255,255,0.05)_100%)]"
          )}
        />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/home"
              className={cn(
                "flex h-12 shrink-0 items-center gap-2 rounded-full border pl-3 pr-4",
                isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/[0.03]"
              )}
              aria-label="Go to home"
            >
              <div className="relative h-7 w-7">
                <Image
                  src="/brand/trace%20logo%20graphic.png"
                  alt="T.R.A.C.E."
                  fill
                  sizes="28px"
                  className="object-contain"
                />
              </div>

              <span
                className={cn(
                  "text-lg font-semibold leading-none tracking-[-0.03em] md:text-[1.2rem]",
                  isLight ? "text-slate-800" : "text-neutral-100"
                )}
              >
                trace
              </span>
            </Link>

            {tierLabel ? (
              <div
                className={cn(
                  "truncate rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-blue-300",
                  isLight
                    ? "border-blue-200 bg-blue-50 text-blue-600"
                    : "border-blue-400/20 bg-blue-500/10"
                )}
              >
                {tierLabel}
              </div>
            ) : null}
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggleButton />

            {showSignOut ? (
              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={isSigningOut}
                aria-label="Sign out"
                title="Sign out"
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50",
                  isLight
                    ? "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                    : "border-white/10 bg-white/[0.03] text-neutral-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                )}
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-5 w-5"
                >
                  <path d="M8 4.5H5.8A1.8 1.8 0 0 0 4 6.3v7.4a1.8 1.8 0 0 0 1.8 1.8H8" />
                  <path d="M11 6.5 16 10l-5 3.5" />
                  <path d="M15.5 10H8" />
                </svg>
              </button>
            ) : null}

            <div
              className={cn(
                "hidden min-w-0 items-center overflow-hidden transition-[max-width,opacity,transform,margin] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:flex",
                isMenuOpen
                  ? "mr-1 max-w-[46rem] translate-x-0 opacity-100"
                  : "pointer-events-none mr-0 max-w-0 translate-x-4 opacity-0"
              )}
              aria-hidden={!isMenuOpen}
            >
              <nav className="flex items-center justify-end gap-2 pr-1">
                {navItems.map((item) => {
                  const isActive = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={`${item.label}-${item.href}`}
                      href={item.href}
                      onClick={closeMenu}
                      tabIndex={isMenuOpen ? 0 : -1}
                      className={cn(
                        "whitespace-nowrap rounded-full border px-4 py-2 text-sm tracking-[0.08em] transition-all duration-300",
                        isActive
                          ? isLight
                            ? "border-blue-200 bg-blue-50 text-slate-900 shadow-[0_10px_28px_rgba(59,130,246,0.08)]"
                            : "border-blue-300/30 bg-blue-400/12 text-white shadow-[0_0_24px_rgba(115,207,255,0.14)]"
                          : isLight
                          ? "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                          : "border-white/8 bg-white/[0.03] text-neutral-300 hover:border-white/16 hover:bg-white/[0.06] hover:text-white"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <button
              type="button"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              onClick={toggleMenu}
              className={cn(
                "group flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-300",
                isLight
                  ? "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  : "border-white/10 bg-white/[0.03] text-neutral-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              )}
            >
              <span className="relative h-5 w-5">
                <span
                  className={cn(
                    "absolute left-0 top-0.5 h-[1.5px] w-5 origin-center rounded-full bg-current transition-all duration-300",
                    isMenuOpen && "top-2.5 scale-x-0 opacity-0"
                  )}
                />
                <span className="absolute left-0 top-2.5 h-[1.5px] w-5 origin-center rounded-full bg-current transition-all duration-300" />
                <span
                  className={cn(
                    "absolute left-0 top-[1.125rem] h-[1.5px] w-5 origin-center rounded-full bg-current transition-all duration-300",
                    isMenuOpen && "top-2.5 scale-x-0 opacity-0"
                  )}
                />
              </span>
            </button>
          </div>
        </div>

        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity,margin] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden",
            isMenuOpen ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
          aria-hidden={!isMenuOpen}
        >
          <div className="overflow-hidden">
            <div
              className={cn(
                "pt-4",
                isLight ? "border-t border-slate-200/90" : "border-t border-white/[0.08]"
              )}
            >
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const isActive = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={`${item.label}-${item.href}`}
                      href={item.href}
                      onClick={closeMenu}
                      tabIndex={isMenuOpen ? 0 : -1}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-sm tracking-[0.08em] transition-all duration-300",
                        isActive
                          ? isLight
                            ? "border-blue-200 bg-blue-50 text-slate-900 shadow-[0_10px_28px_rgba(59,130,246,0.08)]"
                            : "border-blue-300/30 bg-blue-400/12 text-white shadow-[0_0_24px_rgba(115,207,255,0.14)]"
                          : isLight
                          ? "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                          : "border-white/8 bg-white/[0.03] text-neutral-300 hover:border-white/16 hover:bg-white/[0.06] hover:text-white"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export function PageFrame({
  children,
  maxWidth = "7xl",
  className,
}: PageFrameProps) {
  return (
    <div
      className={cn(
        "relative z-10 mx-auto w-full px-4 pb-20 pt-32 md:px-6 md:pt-36",
        getWidthClass(maxWidth),
        className
      )}
    >
      {children}
    </div>
  );
}

export function AppPageBackground() {
  const { isLight } = useTheme();

  return (
    <BeamsBackground
      className="fixed inset-0"
      intensity={isLight ? "medium" : "strong"}
      theme={isLight ? "light" : "dark"}
    />
  );
}

export function SurfaceCard({ children, className }: SurfaceCardProps) {
  const { isLight } = useTheme();

  return (
    <section
      className={cn(
        "rounded-[2rem] border",
        isLight
          ? "border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] shadow-[0_20px_48px_rgba(15,23,42,0.08)]"
          : "border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.022),rgba(255,255,255,0.008))] shadow-[0_0_0_1px_rgba(255,255,255,0.01)]",
        className
      )}
    >
      {children}
    </section>
  );
}

export function PageHero({
  title,
  description,
  eyebrow = "T.R.A.C.E.",
  badges,
  footer,
  className,
  descriptionClassName,
}: PageHeroProps) {
  const { isLight } = useTheme();

  return (
    <SurfaceCard
      className={cn(
        "overflow-hidden p-5 backdrop-blur-xl md:p-6",
        isLight ? "bg-white/72" : "bg-black/35",
        className
      )}
    >
      <div className="max-w-4xl">
        <div
          className={cn(
            "mb-4 text-[11px] uppercase tracking-[0.28em]",
            isLight ? "text-slate-500" : "text-neutral-500"
          )}
        >
          {eyebrow}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <TypingHeading
            text={title}
            as="h1"
            className={cn(
              "text-4xl md:text-5xl",
              isLight ? "text-slate-900" : "text-white"
            )}
          />
          {badges}
        </div>

        <p
          className={cn(
            "mt-4 max-w-4xl text-sm leading-7 md:text-base",
            isLight ? "text-slate-600" : "text-neutral-400",
            descriptionClassName
          )}
        >
          {description}
        </p>

        {footer ? <div className="mt-3">{footer}</div> : null}
      </div>
    </SurfaceCard>
  );
}

export function AuthPageShell({ children }: { children: ReactNode }) {
  const { isLight } = useTheme();

  return (
    <main
      className={cn(
        "relative flex min-h-screen items-center justify-center overflow-hidden px-6",
        isLight ? "bg-[#eef3f9] text-slate-900" : "bg-black text-white"
      )}
    >
      <BeamsBackground
        className="absolute inset-0"
        intensity={isLight ? "medium" : "strong"}
        theme={isLight ? "light" : "dark"}
      />

      {children}
    </main>
  );
}

export function AuthPanel({
  title,
  description,
  children,
  footer,
  className,
}: AuthPanelProps) {
  const { isLight } = useTheme();

  return (
    <SurfaceCard
      className={cn(
        "relative w-full max-w-md p-8 backdrop-blur-xl",
        isLight
          ? "bg-white/88 shadow-[0_24px_70px_rgba(15,23,42,0.1)]"
          : "bg-black/45 shadow-[0_20px_80px_rgba(0,0,0,0.45)]",
        className
      )}
    >
      <div className="mb-5 flex items-center gap-3">
        <div
          className={cn(
            "relative h-11 w-11 overflow-hidden rounded-full border",
            isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/[0.03]"
          )}
        >
          <Image
            src="/brand/trace%20logo.png"
            alt="T.R.A.C.E. logo"
            fill
            sizes="44px"
            className="object-contain p-[4px]"
            priority
          />
        </div>
        <div
          className={cn(
            "text-[11px] uppercase tracking-[0.24em]",
            isLight ? "text-slate-500" : "text-neutral-500"
          )}
        >
          T.R.A.C.E.
        </div>
      </div>

      <TypingHeading
        text={title}
        as="h1"
        className={cn("mb-2 text-3xl", isLight ? "text-slate-900" : "text-white")}
      />

      <p className={cn("mb-6 text-sm leading-7", isLight ? "text-slate-600" : "text-neutral-400")}>
        {description}
      </p>

      {children}

      {footer ? <div className="mt-6">{footer}</div> : null}
    </SurfaceCard>
  );
}
