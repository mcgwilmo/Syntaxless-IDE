"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { STORAGE_KEYS } from "@/config/brand";
import { cn } from "@/lib/cn";

export type Theme = "dark" | "light";

const THEME_STORAGE_KEY = STORAGE_KEYS.theme;

type ThemeContextValue = {
  theme: Theme;
  isLight: boolean;
  mounted: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeScript() {
  const script = `
    (function() {
      try {
        var storedTheme = window.localStorage.getItem("${THEME_STORAGE_KEY}");
        var theme = storedTheme === "dark" ? "dark" : "light";
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
      } catch (error) {
        document.documentElement.dataset.theme = "light";
        document.documentElement.style.colorScheme = "light";
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Light is the default: classrooms are bright and often projected.
  // Anyone who already chose dark keeps it -- their choice is in localStorage.
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      const nextTheme = storedTheme === "dark" ? "dark" : "light";
      setThemeState(nextTheme);
      applyTheme(nextTheme);
    } catch {
      applyTheme("light");
    } finally {
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    applyTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [mounted, theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      isLight: theme === "light",
      mounted,
      setTheme: setThemeState,
      toggleTheme: () =>
        setThemeState((current) => (current === "dark" ? "light" : "dark")),
    }),
    [mounted, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }

  return context;
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.25" />
      <path d="M12 19.25v2.25" />
      <path d="m4.93 4.93 1.6 1.6" />
      <path d="m17.47 17.47 1.6 1.6" />
      <path d="M2.5 12h2.25" />
      <path d="M19.25 12h2.25" />
      <path d="m4.93 19.07 1.6-1.6" />
      <path d="m17.47 6.53 1.6-1.6" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path d="M20.5 14.2A8.8 8.8 0 1 1 9.8 3.5a7.2 7.2 0 0 0 10.7 10.7Z" />
    </svg>
  );
}

/*
 * The toggle always sits on a bar next to other controls, so it is made of the
 * same material they are: proud at rest, rising toward the light on hover, then
 * pushed in and inverted when held. Motion-reduce keeps the depth and drops
 * only the travel, so the press is never signalled by movement alone.
 *
 * Nothing here branches on the theme. The button used to pick its own greys for
 * each theme, which is why it was the one control that had to be re-tuned every
 * time the palette moved; the tokens swap underneath it now.
 */
const TOGGLE_MATERIAL = cn(
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

export function ThemeToggleButton({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "ide";
}) {
  const { theme, toggleTheme } = useTheme();
  // Still needed: which icon to show and what the label promises are behaviour,
  // not colour, so they stay on the theme rather than on a token.
  const isLight = theme === "light";
  const nextThemeLabel = isLight ? "dark" : "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextThemeLabel} mode`}
      title={`Switch to ${nextThemeLabel} mode`}
      className={cn(
        "flex items-center justify-center",
        TOGGLE_MATERIAL,
        // Only the footprint differs between variants: the IDE bar packs its
        // controls tighter, the site header runs round ones.
        variant === "ide"
          ? "h-10 w-10 rounded-[var(--radius-lg)]"
          : "h-12 w-12 rounded-[var(--radius-full)]",
        className
      )}
    >
      {isLight ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
