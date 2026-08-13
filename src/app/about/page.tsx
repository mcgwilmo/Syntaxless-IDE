"use client";

import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";
import {
  AppPageBackground,
  PageFrame,
  SiteHeader,
  TypingHeading,
} from "@/components/site-shell";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/cn";

const IMPACT_POINTS = [
  {
    label: "Capability",
    text:
      "Support AI capability building by helping students, teachers, institutions, and workers use AI productively, creatively, and economically.",
  },
  {
    label: "Education",
    text:
      "Strengthen computer science learning by making reasoning, debugging, and problem solving easier to practice inside a browser-based coding environment.",
  },
  {
    label: "Region",
    text:
      "Contribute to Caribbean human capital by building useful AI tools and exportable intellectual property rooted in education, software, training, and support.",
  },
] as const;

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 19c-4.3 1.4-4.3-2.1-6-2.5" />
      <path d="M15 22v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.3 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.4 11.4 0 0 0-6.2 0C6.6 3.8 5.6 4.1 5.6 4.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4.2 10.5c0 4.7 2.7 5.7 5.5 6-.6.6-.6 1.2-.6 2V22" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <rect x="4" y="4" width="16" height="16" rx="2.8" />
      <path d="M8.3 10.3v5.5" />
      <path d="M8.3 7.9h.01" />
      <path d="M12 15.8v-3.1a1.9 1.9 0 0 1 3.8 0v3.1" />
      <path d="M12 10.3v5.5" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

export default function AboutPage() {
  const { isLight } = useTheme();

  const pageClass = isLight
    ? "bg-[#eef3f9] text-slate-900"
    : "bg-[#050608] text-white";
  const eyebrowClass = isLight ? "text-slate-500" : "text-neutral-500";
  const headingClass = isLight ? "text-slate-950" : "text-white";
  const bodyClass = isLight ? "text-slate-600" : "text-neutral-400";
  const surfaceClass = isLight
    ? "border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] shadow-[0_22px_54px_rgba(15,23,42,0.08)]"
    : "border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.032),rgba(255,255,255,0.012))] shadow-[0_0_0_1px_rgba(255,255,255,0.01)]";
  const insetClass = isLight
    ? "border-sky-100 bg-[linear-gradient(180deg,rgba(240,249,255,0.9),rgba(255,255,255,0.92))]"
    : "border-white/[0.06] bg-[linear-gradient(180deg,rgba(6,182,212,0.04),rgba(255,255,255,0.014))]";
  const buttonClass = isLight
    ? "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-slate-950 hover:shadow-[0_16px_32px_rgba(59,130,246,0.12)]"
    : "border-blue-400/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.014))] text-neutral-300 hover:border-blue-300/28 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_22px_rgba(66,146,255,0.07)]";

  return (
    <main className={cn("relative min-h-screen overflow-hidden", pageClass)}>
      <AppPageBackground />

      <SiteHeader
        authHref="/login"
        authLabel="Login"
        learningCenterHref="/resources"
        className="page-enter-soft"
        surfaceClassName={isLight ? "border-slate-200 bg-white/80" : "border-white/[0.08] bg-black/55"}
      />

      <PageFrame className="space-y-8 md:space-y-10">
        <section className="page-enter">
          <div className="mx-auto max-w-4xl text-center">
            <div className={cn("mb-4 text-[11px] uppercase", eyebrowClass)}>
              Mission Statement
            </div>

            <TypingHeading
              text="Learn by thinking, build by reasoning"
              as="h1"
              className={cn(
                "mx-auto max-w-4xl text-[clamp(2.4rem,6vw,4.8rem)] font-bold leading-[0.95]",
                headingClass
              )}
            />

            <p
              className={cn(
                "mx-auto mt-5 max-w-3xl text-center text-base leading-8 md:text-lg md:leading-9",
                bodyClass
              )}
            >
              T.R.A.C.E. helps people use computer science concepts without
              first having to learn them through a specific programming
              language. It turns English pseudocode into executable programs
              while keeping the focus on logic, structure, and reasoning.
            </p>
          </div>
        </section>

        <section className="page-enter-soft">
          <div className="mx-auto max-w-4xl text-center">
            <div className={cn("mb-3 text-[11px] uppercase", eyebrowClass)}>
              Our Goal And Mission
            </div>
            <h2
              className={cn(
                "text-3xl font-bold leading-tight md:text-4xl",
                headingClass
              )}
            >
              Make programming more understandable without removing rigor.
            </h2>
            <p className={cn("mx-auto mt-5 max-w-3xl text-sm leading-8 md:text-base", bodyClass)}>
              T.R.A.C.E. is designed to combine the accessibility of natural
              language with the discipline of structured programming. Users can
              specify behavior in English, run it in a browser-based IDE, and
              learn from the logic behind the result.
            </p>
          </div>
        </section>

        <section
          className={cn(
            "page-enter-soft overflow-hidden rounded-[2rem] border p-6 md:p-9",
            surfaceClass
          )}
        >
          <div className="mx-auto max-w-5xl">
            <div className={cn("mb-3 text-[11px] uppercase", eyebrowClass)}>
              Long-Term Impact
            </div>
            <h2
              className={cn(
                "max-w-3xl text-3xl font-bold leading-tight md:text-4xl",
                headingClass
              )}
            >
              Build practical AI capacity through tools people can actually use.
            </h2>
            <p className={cn("mt-5 max-w-3xl text-sm leading-8 md:text-base", bodyClass)}>
              The Caribbean opportunity is not just access to AI tools. It is
              the development of students, teachers, institutions, and workers
              who can apply AI with clarity and confidence. T.R.A.C.E. is built
              around that application-first strategy.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {IMPACT_POINTS.map((point) => (
                <div
                  key={point.label}
                  className={cn(
                    "flex min-h-[13rem] flex-col rounded-[1.4rem] border p-5",
                    insetClass
                  )}
                >
                  <div
                    className={cn(
                      "mb-4 flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold",
                      isLight
                        ? "border-cyan-200 bg-cyan-50 text-cyan-700"
                        : "border-cyan-300/20 bg-cyan-400/10 text-cyan-200"
                    )}
                  >
                    {point.label.slice(0, 1)}
                  </div>
                  <h3
                    className={cn(
                      "text-base font-semibold",
                      isLight ? "text-slate-900" : "text-white"
                    )}
                  >
                    {point.label}
                  </h3>
                  <p className={cn("mt-3 text-sm leading-7", bodyClass)}>
                    {point.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className={cn(
            "page-enter-soft overflow-hidden rounded-[2rem] border p-6 md:p-9",
            surfaceClass
          )}
        >
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="flex justify-center lg:justify-center">
              <div
                className={cn(
                  "relative h-56 w-56 overflow-hidden rounded-full border p-2 md:h-72 md:w-72",
                  isLight
                    ? "border-slate-200 bg-white shadow-[0_22px_48px_rgba(15,23,42,0.1)]"
                    : "border-white/[0.1] bg-white/[0.035] shadow-[0_24px_70px_rgba(0,0,0,0.32)]"
                )}
              >
                <div className="relative h-full w-full overflow-hidden rounded-full">
                  <Image
                    src="/brand/profile-photo.png"
                    alt="Matthew Wilmot"
                    fill
                    sizes="(min-width: 768px) 288px, 224px"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>

            <div>
              <div className={cn("mb-3 text-[11px] uppercase", eyebrowClass)}>
                About The Founder
              </div>
              <h2
                className={cn(
                  "text-3xl font-bold leading-tight md:text-4xl",
                  headingClass
                )}
              >
                Matthew Wilmot
              </h2>
              <p className={cn("mt-5 text-sm leading-8 md:text-base", bodyClass)}>
                Matthew Wilmot is an undergraduate student at MIT pursuing a
                B.S. in Artificial Intelligence and Decision-Making, with
                interests spanning machine learning, computer vision, data
                science, and socially impactful AI. His research experience
                includes work with MIT&apos;s Department of Architecture, Design and
                Computation, where he designs open-source geospatial computer
                vision pipelines for object detection and segmentation to
                support real-time deforestation mapping through the DEFORA
                project.
              </p>
              <p className={cn("mt-4 text-sm leading-8 md:text-base", bodyClass)}>
                He has also contributed to MIT&apos;s Research Lab of Electronics,
                processing over 1,000 speech files and improving NLP
                preprocessing workflows. Beyond MIT, Matthew consults on
                scientific machine learning for agricultural monitoring in
                Jamaica and leads AI/chatbot development for El Sol Vida Fun
                Tours. He is especially motivated by AI applications in global
                development, environmental monitoring, and human-centered
                innovation.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href="https://github.com/mcgwilmo"
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full border px-5 text-sm uppercase transition-all duration-300",
                    buttonClass
                  )}
                >
                  <GitHubIcon className="h-5 w-5" />
                  GitHub
                  <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/matthew-wilmot-6938a9292"
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full border px-5 text-sm uppercase transition-all duration-300",
                    buttonClass
                  )}
                >
                  <LinkedInIcon className="h-5 w-5" />
                  LinkedIn
                  <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </PageFrame>

      <SiteFooter />
    </main>
  );
}
