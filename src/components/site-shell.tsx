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
import { cn } from "@/lib/cn";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ThemeToggleButton } from "@/components/theme-provider";
import { BRAND } from "@/config/brand";

type SiteHeaderProps = {
  tierLabel?: string;
  authHref: string;
  authLabel: string;
  learningCenterHref?: string;
  requireAuthForNavigation?: boolean;
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
  /** Optional. Prefer a <Callout> inside children when the text is a status. */
  description?: string;
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
const PUBLIC_NAV_HREFS = new Set(["/", "/home", "/subscriptions", "/about", "/login", "/signup"]);
const REVEAL_ROOT_MARGIN = "0px 0px -12% 0px";

function getWidthClass(maxWidth: "6xl" | "7xl") {
  return maxWidth === "6xl" ? "max-w-6xl" : "max-w-7xl";
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/*
 * The shared material for a control sitting on the nav bar.
 *
 * The bar is itself a raised surface, so these cannot read by fill alone -- what
 * separates a button from the bar underneath it is the lit top edge, the strong
 * border and the shadow it casts. Hover raises it toward the light, holding it
 * pushes it in. Same physics as the Button primitive, which these deliberately
 * mirror; they are not Buttons only because a 48px circle does not fit the
 * primitive's padding scale.
 */
const BAR_CONTROL = cn(
  "border border-[var(--border-strong)]",
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

/*
 * A nav item is a control on that same bar, so an unselected one is exactly the
 * bar material. A selected one is the same object already pushed in: it keeps
 * the pressed shading and stays down, which is what makes "you are here" read as
 * a state of the control rather than as a tint someone chose. It has nowhere
 * left to travel, so it does not respond to hover.
 */
function navItemClasses(isActive: boolean) {
  if (!isActive) return BAR_CONTROL;

  return cn(
    "border border-[var(--accent-border)] bg-[var(--accent-subtle)]",
    "text-[var(--accent-text)]",
    "shadow-[var(--pressed)] translate-y-[var(--press-travel)]",
    "transition-[background-color,border-color,box-shadow,color,transform]",
    "duration-[var(--duration-press)] ease-[var(--ease-spring)]",
    "motion-reduce:transform-none"
  );
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
        {/*
         * The heading's accessible name must not depend on an animation.
         *
         * visibleText is "" until the heading scrolls into view and only fills
         * in a character at a time after that, so exposing it directly gave
         * this element -- the <h1> on nearly every page, via PageHero and
         * AuthPanel -- an empty or half-typed name for as long as the effect
         * was running. A screen reader announcing "heading, N" (or "P... Pr...
         * Pri") is not a cosmetic problem: headings are the primary way
         * non-visual users navigate a page.
         *
         * So the real text is always in the tree, and the typed copy is
         * decorative. Sighted users see exactly what they saw before.
         */}
        <span className="sr-only">{text}</span>
        <span aria-hidden="true">{visibleText}</span>
        {/* The caret is the one place a heading is allowed the accent, and it
            gets the flat color with no glow: a halo around it would be a second
            light source, and the material system only has the one. */}
        <span
          className={cn(
            "ml-1 inline-block h-[0.88em] w-[2px] align-[-0.08em] bg-[var(--accent-solid)]",
            !showCursor
              ? "opacity-0"
              : cursorBlink
              // motion-reduce:animate-none, and not just a shorter duration:
              // when motion is reduced the typing effect is skipped, which put
              // the caret straight into its blink branch and left it flashing
              // once a second forever. An indefinite blink is the one piece of
              // motion on the page with no end state to settle into.
              ? "animate-[typedCursorBlink_1s_steps(1)_infinite] motion-reduce:animate-none"
              : "opacity-100"
          )}
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
  requireAuthForNavigation = false,
  showSignOut = false,
  maxWidth = "7xl",
  hideOnScroll = true,
  className,
  surfaceClassName,
}: SiteHeaderProps) {
  const pathname = usePathname();
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
  const getNavigationHref = (href: string) =>
    requireAuthForNavigation && !PUBLIC_NAV_HREFS.has(href) ? "/login" : href;

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
        "fixed inset-x-0 top-0 z-50 px-[var(--space-4)] py-[var(--space-4)]",
        "transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out)]",
        "md:px-[var(--space-6)] md:py-[var(--space-5)]",
        hideOnScroll &&
          isHidden &&
          !isMenuOpen &&
          "-translate-y-[calc(100%+var(--space-6))]",
        className
      )}
    >
      {/*
       * The bar takes the card rung rather than the base one because the page
       * scrolls underneath it -- it is lifted off the page, not resting on it.
       *
       * The old glass treatment (backdrop blur plus a 135deg gradient) is gone.
       * The blur cost a full-width compositing pass on every scroll frame, and
       * the diagonal gradient was a second light raking across from the left
       * while every other edge in the app is lit from above. The sheen replaces
       * both: one soft falloff, from the one light source.
       */}
      <div
        className={cn(
          "relative isolate mx-auto overflow-hidden",
          "px-[var(--space-4)] py-[var(--space-3)] md:px-[var(--space-5)]",
          "border border-[var(--border-subtle)]",
          "bg-[var(--surface-raised)] bg-[image:var(--material-sheen)]",
          "shadow-[var(--raised-lg)]",
          "transition-[border-radius] duration-[var(--duration-slow)] ease-[var(--ease-spring)]",
          getWidthClass(maxWidth),
          isMenuOpen ? "rounded-[var(--radius-xl)]" : "rounded-[var(--radius-full)]",
          surfaceClassName
        )}
      >
        <div className="relative flex items-center justify-between gap-[var(--space-4)]">
          <div className="flex min-w-0 items-center gap-[var(--space-3)]">
            <Link
              href="/home"
              className={cn(
                "flex h-12 shrink-0 items-center gap-[var(--space-2)]",
                "rounded-[var(--radius-full)] pl-[var(--space-3)] pr-[var(--space-4)]",
                BAR_CONTROL
              )}
              aria-label="Go to home"
            >
              <div className="relative h-7 w-7">
                <Image
                  src="/brand/logo-mark.png"
                  alt="T.R.A.C.E."
                  fill
                  sizes="28px"
                  className="object-contain"
                />
              </div>

              <span
                className={cn(
                  "text-lg font-semibold leading-none tracking-[-0.03em] md:text-[1.2rem]",
                  "text-[var(--text-primary)]"
                )}
              >
                {BRAND.name.toLowerCase()}
              </span>
            </Link>

            {/* The tier is a label, not a control -- inlaid, so it reads as set
                into the bar rather than as another thing to press. */}
            {tierLabel ? (
              <div
                className={cn(
                  "truncate rounded-[var(--radius-full)] border",
                  "border-[var(--accent-border)] bg-[var(--accent-subtle)]",
                  "px-[var(--space-4)] py-[var(--space-2)] shadow-[var(--inlaid)]",
                  "text-[length:var(--text-xs)] uppercase",
                  "tracking-[var(--tracking-label)] text-[var(--accent-text)]"
                )}
              >
                {tierLabel}
              </div>
            ) : null}
          </div>

          <div className="ml-auto flex items-center gap-[var(--space-2)]">
            <ThemeToggleButton />

            {showSignOut ? (
              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={isSigningOut}
                aria-label="Sign out"
                title="Sign out"
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-[var(--radius-full)]",
                  BAR_CONTROL,
                  // Disabled means "not a thing you can press", so the depth
                  // goes with the color rather than the color going alone --
                  // and the pointer response goes with both. A disabled button
                  // still matches :hover in CSS, so every hover rule BAR_CONTROL
                  // sets has to be cancelled here, not just the travel;
                  // otherwise the one control that cannot be pressed is also
                  // the one that lifts toward the light when you point at it.
                  "disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none",
                  "disabled:hover:bg-[var(--surface-raised)]",
                  "disabled:hover:text-[var(--text-muted)]",
                  "disabled:hover:shadow-none disabled:active:shadow-none",
                  "disabled:hover:translate-y-0 disabled:active:translate-y-0"
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
                "hidden min-w-0 items-center overflow-hidden transition-[max-width,opacity,transform,margin] duration-[var(--duration-slow)] ease-[var(--ease-out)] md:flex",
                isMenuOpen
                  ? "mr-[var(--space-1)] max-w-[46rem] translate-x-0 opacity-100"
                  : "pointer-events-none mr-0 max-w-0 translate-x-4 opacity-0"
              )}
              aria-hidden={!isMenuOpen}
            >
              <nav className="flex items-center justify-end gap-[var(--space-2)] pr-[var(--space-1)]">
                {navItems.map((item) => {
                  const isActive = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={`${item.label}-${item.href}`}
                      href={getNavigationHref(item.href)}
                      onClick={closeMenu}
                      tabIndex={isMenuOpen ? 0 : -1}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        // inline-block, not left to the parent: an inline <a>
                        // ignores transform, so the press travel would silently
                        // stop working if this nav ever stopped being a flex
                        // container. Blockified either way today, so this costs
                        // nothing and removes the dependency.
                        "inline-block whitespace-nowrap rounded-[var(--radius-full)]",
                        "px-[var(--space-4)] py-[var(--space-2)]",
                        "text-[length:var(--text-sm)] tracking-[0.08em]",
                        navItemClasses(isActive)
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
                "group flex h-12 w-12 items-center justify-center rounded-[var(--radius-full)]",
                BAR_CONTROL
              )}
            >
              <span className="relative h-5 w-5">
                <span
                  className={cn(
                    "absolute left-0 top-0.5 h-[1.5px] w-5 origin-center rounded-full bg-current transition-all duration-[var(--duration-slow)] ease-[var(--ease-spring)]",
                    isMenuOpen && "top-2.5 scale-x-0 opacity-0"
                  )}
                />
                <span className="absolute left-0 top-2.5 h-[1.5px] w-5 origin-center rounded-full bg-current transition-all duration-[var(--duration-slow)] ease-[var(--ease-spring)]" />
                <span
                  className={cn(
                    "absolute left-0 top-[1.125rem] h-[1.5px] w-5 origin-center rounded-full bg-current transition-all duration-[var(--duration-slow)] ease-[var(--ease-spring)]",
                    isMenuOpen && "top-2.5 scale-x-0 opacity-0"
                  )}
                />
              </span>
            </button>
          </div>
        </div>

        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity,margin] duration-[var(--duration-slow)] ease-[var(--ease-out)] md:hidden",
            isMenuOpen
              ? "mt-[var(--space-4)] grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          )}
          aria-hidden={!isMenuOpen}
        >
          <div className="overflow-hidden">
            <div className="border-t border-[var(--border-subtle)] pt-[var(--space-4)]">
              <nav className="flex flex-col gap-[var(--space-2)]">
                {navItems.map((item) => {
                  const isActive = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={`${item.label}-${item.href}`}
                      href={getNavigationHref(item.href)}
                      onClick={closeMenu}
                      tabIndex={isMenuOpen ? 0 : -1}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        // See the desktop nav: block so the transform applies
                        // without depending on the parent's display.
                        "block rounded-[var(--radius-lg)]",
                        "px-[var(--space-4)] py-[var(--space-3)]",
                        "text-[length:var(--text-sm)] tracking-[0.08em]",
                        navItemClasses(isActive)
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

/*
 * The ground everything else sits on.
 *
 * Static by design. The material system is lit by exactly ONE light source,
 * above and slightly forward -- every raised edge, every cast shadow, every
 * recess in the app refers to it. An animated background is a second, moving
 * light, and the moment there are two the page stops reading as physical and
 * starts reading as decorated.
 *
 * So the page gets what a real surface under that light gets: one soft pool at
 * the top, falling off downward, and nothing else. Same idea as the body
 * falloff in globals.css, wider because this covers the whole viewport. Both
 * stops are opaque colors mixed from --surface-page, so it inherits the theme
 * with no JS and no per-theme branch.
 */
const PAGE_BACKDROP_IMAGE = [
  "radial-gradient(140% 90% at 50% 0%,",
  "color-mix(in srgb, var(--surface-page) 96%, white),",
  "var(--surface-page) 62%)",
].join(" ");

function PageBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none bg-[var(--surface-page)]", className)}
      style={{ backgroundImage: PAGE_BACKDROP_IMAGE }}
    />
  );
}

export function AppPageBackground() {
  return <PageBackdrop className="fixed inset-0" />;
}

/*
 * The marketing equivalent of the Panel primitive: same card rung, same
 * material. It is not Panel itself only because Panel bakes in its padding, and
 * every caller here sets its own -- cn joins classes rather than merging them,
 * so a built-in p-8 would fight whatever the caller passed instead of losing to
 * it.
 */
export function SurfaceCard({ children, className }: SurfaceCardProps) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius-xl)] border border-[var(--border-subtle)]",
        "bg-[var(--surface-raised)] bg-[image:var(--material-sheen)]",
        "shadow-[var(--raised-lg)]",
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
  return (
    <SurfaceCard
      className={cn(
        "overflow-hidden p-[var(--space-5)] md:p-[var(--space-6)]",
        className
      )}
    >
      <div className="max-w-4xl">
        {/* Muted rather than soft: the card is a raised surface, and in the dark
            theme --text-soft only clears AA against the page behind it. */}
        <div
          className={cn(
            "mb-[var(--space-4)] text-[length:var(--text-xs)] uppercase",
            "tracking-[var(--tracking-label)] text-[var(--text-muted)]"
          )}
        >
          {eyebrow}
        </div>

        <div className="flex flex-wrap items-end gap-[var(--space-3)]">
          <TypingHeading
            text={title}
            as="h1"
            className="text-4xl text-[var(--text-primary)] md:text-5xl"
          />
          {badges}
        </div>

        <p
          className={cn(
            "mt-[var(--space-4)] max-w-4xl text-[length:var(--text-sm)]",
            "leading-[var(--leading-relaxed)] text-[var(--text-muted)]",
            "md:text-[length:var(--text-base)]",
            descriptionClassName
          )}
        >
          {description}
        </p>

        {footer ? <div className="mt-[var(--space-3)]">{footer}</div> : null}
      </div>
    </SurfaceCard>
  );
}

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <main
      className={cn(
        "relative flex min-h-screen items-center justify-center overflow-hidden px-[var(--space-6)]",
        "bg-[var(--surface-page)] text-[var(--text-primary)]"
      )}
    >
      <PageBackdrop className="absolute inset-0" />

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
  return (
    <SurfaceCard
      className={cn("relative w-full max-w-md p-[var(--space-8)]", className)}
    >
      <div className="mb-[var(--space-5)] flex items-center gap-[var(--space-3)]">
        {/* The mark sits in a shallow inlay, not a well -- nothing is typed or
            scrolled into it, it is just set flush into the panel. */}
        <div
          className={cn(
            "relative h-11 w-11 overflow-hidden rounded-[var(--radius-full)] border",
            "border-[var(--border-subtle)] bg-[var(--surface-sunken)]",
            "shadow-[var(--inlaid)]"
          )}
        >
          <Image
            src="/brand/logo.png"
            alt={`${BRAND.displayName} logo`}
            fill
            sizes="44px"
            className="object-contain p-[4px]"
            priority
          />
        </div>
        <div
          className={cn(
            "text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)]",
            // Not --text-soft: this label sits on a raised panel, where soft
            // falls under AA in the dark theme.
            "text-[var(--text-muted)]"
          )}
        >
          {BRAND.displayName}
        </div>
      </div>

      <TypingHeading
        text={title}
        as="h1"
        className="mb-[var(--space-2)] text-[length:var(--text-3xl)] text-[var(--text-primary)]"
      />

      {description ? (
        <p className="mb-[var(--space-6)] text-[length:var(--text-base)] leading-[var(--leading-relaxed)] text-[var(--text-muted)]">
          {description}
        </p>
      ) : (
        <div className="mb-[var(--space-6)]" />
      )}

      {children}

      {footer ? <div className="mt-[var(--space-6)]">{footer}</div> : null}
    </SurfaceCard>
  );
}
