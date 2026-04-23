"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppPageBackground } from "@/components/site-shell";
import { ThemeToggleButton, useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/cn";

const COUNTDOWN_DAYS = 50;

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const targetDate = new Date();
targetDate.setDate(targetDate.getDate() + COUNTDOWN_DAYS);
targetDate.setHours(0, 0, 0, 0);

function getTimeLeft(): TimeLeft {
  const diff = Math.max(targetDate.getTime() - Date.now(), 0);
  const day = 1000 * 60 * 60 * 24;
  const hour = 1000 * 60 * 60;
  const minute = 1000 * 60;

  return {
    days: Math.floor(diff / day),
    hours: Math.floor((diff % day) / hour),
    minutes: Math.floor((diff % hour) / minute),
    seconds: Math.floor((diff % minute) / 1000),
  };
}

function AnimatedDigit({ value }: { value: number }) {
  return (
    <span className="relative inline-flex h-[1.05em] min-w-[2ch] items-center justify-center overflow-hidden">
      <span
        key={value}
        className="animate-[countDigit_420ms_cubic-bezier(0.22,1,0.36,1)_both]"
      >
        {String(value).padStart(2, "0")}
      </span>
    </span>
  );
}

function TimeUnit({
  value,
  label,
  isLight,
}: {
  value: number;
  label: string;
  isLight: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2">
      <div
        className={cn(
          "group relative flex h-24 w-full min-w-[7.2rem] items-center justify-center overflow-hidden rounded-[1.25rem] border px-4 backdrop-blur-xl transition-all duration-300 md:h-28 md:min-w-[8.2rem]",
          isLight
            ? "border-slate-200/90 bg-white/78 shadow-[0_18px_48px_rgba(15,23,42,0.08)]"
            : "border-white/[0.08] bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        )}
      >
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
            isLight
              ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(125,211,252,0.1))]"
              : "bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(34,211,238,0.035))]"
          )}
        />
        <span
          className={cn(
            "relative z-10 font-mono text-4xl font-medium tracking-normal md:text-5xl",
            isLight ? "text-slate-950" : "text-white"
          )}
        >
          <AnimatedDigit value={value} />
        </span>
      </div>
      <span
        className={cn(
          "text-[10px] font-medium uppercase tracking-[0.22em] md:text-xs",
          isLight ? "text-slate-500" : "text-neutral-500"
        )}
      >
        {label}
      </span>
    </div>
  );
}

export default function CountdownLandingPage() {
  const { isLight } = useTheme();
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setTimeLeft(getTimeLeft());
    }, 0);

    const interval = window.setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  const time = timeLeft ?? {
    days: COUNTDOWN_DAYS,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  return (
    <main
      className={cn(
        "relative flex min-h-screen overflow-hidden px-4 py-6 font-sans",
        isLight ? "bg-[#eef3f9] text-slate-900" : "bg-black text-white"
      )}
    >
      <AppPageBackground />

      <div className="relative z-10 flex min-h-[calc(100vh-3rem)] w-full flex-col">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
          <div
            aria-label="T.R.A.C.E."
            className={cn(
              "flex h-12 shrink-0 items-center gap-2 pl-1 pr-3",
              isLight ? "text-slate-800" : "text-neutral-100"
            )}
          >
            <div className="relative h-7 w-7">
              <Image
                src="/brand/trace%20logo%20graphic.png"
                alt="T.R.A.C.E."
                fill
                priority
                sizes="28px"
                className="object-contain"
              />
            </div>
            <span
              className={cn(
                "text-lg font-semibold leading-none tracking-normal md:text-[1.2rem]",
                isLight ? "text-slate-800" : "text-neutral-100"
              )}
            >
              trace
            </span>
          </div>

          <ThemeToggleButton />
        </header>

        <section className="flex flex-1 items-center justify-center pb-8 pt-10 md:pb-12 md:pt-14">
          <div className="mx-auto w-full max-w-5xl">
            <div
              className="page-enter-soft relative px-2 py-6 text-center md:px-6 lg:px-10"
              data-scroll-reveal
            >
              <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center">
                <div
                  className={cn(
                    "mb-5 text-[11px] font-medium uppercase tracking-[0.28em]",
                    isLight ? "text-sky-700" : "text-cyan-200"
                  )}
                >
                  Open Alpha Access
                </div>

                <h1
                  className={cn(
                    "max-w-3xl text-balance text-4xl font-bold leading-[0.96] tracking-normal md:text-6xl lg:text-7xl",
                    isLight ? "text-slate-950" : "text-white"
                  )}
                >
                  Launching Soon
                </h1>

                <p
                  className={cn(
                    "mt-5 max-w-2xl text-sm leading-7 md:text-base",
                    isLight ? "text-slate-600" : "text-neutral-400"
                  )}
                >
                  The future of computer science learning, experimentation and
                  creation is about to arrive.
                </p>
              </div>

              <div
                className="relative z-10 mx-auto mt-9 grid max-w-3xl grid-cols-2 gap-3 md:mt-11 md:grid-cols-4 md:gap-4"
                role="timer"
                aria-live="polite"
                aria-label={`${time.days} days, ${time.hours} hours, ${time.minutes} minutes, and ${time.seconds} seconds until open access`}
              >
                <TimeUnit value={time.days} label="Days" isLight={isLight} />
                <TimeUnit value={time.hours} label="Hours" isLight={isLight} />
                <TimeUnit
                  value={time.minutes}
                  label="Minutes"
                  isLight={isLight}
                />
                <TimeUnit
                  value={time.seconds}
                  label="Seconds"
                  isLight={isLight}
                />
              </div>

              <div aria-hidden="true" className="mt-10 h-12" />
            </div>
          </div>
        </section>

        <Link
          href="/login"
          className={cn(
            "fixed bottom-4 left-4 z-20 text-[11px] font-medium lowercase tracking-[0.08em] opacity-35 transition-opacity duration-300 hover:opacity-70 focus-visible:opacity-100",
            isLight ? "text-slate-600" : "text-neutral-400"
          )}
        >
          closed pre-alpha
        </Link>
      </div>

      <style jsx global>{`
        @keyframes countDigit {
          0% {
            opacity: 0;
            transform: translateY(70%);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
