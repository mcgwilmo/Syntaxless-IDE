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
        var theme = storedTheme === "light" ? "light" : "dark";
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
      } catch (error) {
        document.documentElement.dataset.theme = "dark";
        document.documentElement.style.colorScheme = "dark";
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      const nextTheme = storedTheme === "light" ? "light" : "dark";
      setThemeState(nextTheme);
      applyTheme(nextTheme);
    } catch {
      applyTheme("dark");
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

export function ThemeToggleButton({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "ide";
}) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";
  const nextThemeLabel = isLight ? "dark" : "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextThemeLabel} mode`}
      title={`Switch to ${nextThemeLabel} mode`}
      className={cn(
        "flex items-center justify-center transition-all duration-300",
        variant === "ide"
          ? cn(
              "h-10 w-10 rounded-[0.95rem] border",
              isLight
                ? "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                : "border-neutral-900 bg-[#0b0b0b] text-neutral-300 hover:border-neutral-700 hover:bg-[#111111] hover:text-white"
            )
          : cn(
              "h-12 w-12 rounded-full border",
              isLight
                ? "border-slate-200 bg-white text-slate-600 shadow-[0_10px_26px_rgba(15,23,42,0.06)] hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                : "border-white/10 bg-white/[0.03] text-neutral-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
            ),
        className
      )}
    >
      {isLight ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
