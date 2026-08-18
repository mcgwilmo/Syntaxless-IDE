"use client";

import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";
import {
  AppPageBackground,
  PageFrame,
  SiteHeader,
  SurfaceCard,
  TypingHeading,
} from "@/components/site-shell";
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

/*
 * The small label above each heading. Muted rather than soft: two of the three
 * sit on a raised card, and --text-soft only clears AA against the page.
 */
const EYEBROW = cn(
  "text-[length:var(--text-xs)] uppercase",
  "tracking-[var(--tracking-label)] text-[var(--text-muted)]"
);

/*
 * The founder links are anchors -- they leave the site and carry target/rel --
 * so they cannot be the Button primitive. They mirror its material instead:
 * raised at rest, rising toward the light on hover, pushed in and shaded from
 * the top when held. They are only not Buttons because a 48px pill does not fit
 * the primitive's padding scale.
 */
const LINK_BUTTON = cn(
  "border border-[var(--border-strong)]",
  "bg-[var(--surface-raised)] bg-[image:var(--material-sheen)]",
  "text-[var(--text-primary)] shadow-[var(--raised)]",
  "transition-[background-color,border-color,box-shadow,color,transform]",
  "duration-[var(--duration-press)] ease-[var(--ease-spring)]",
  "hover:bg-[var(--surface-sunken)] hover:shadow-[var(--lifted)]",
  "hover:-translate-y-[var(--lift-travel)]",
  "active:shadow-[var(--pressed)] active:translate-y-[var(--press-travel)]",
  "motion-reduce:transform-none motion-reduce:hover:transform-none",
  "motion-reduce:active:transform-none"
);

/*
 * The arrow's nudge on hover.
 *
 * The travel comes from --lift-travel, which goes to 0px under
 * prefers-reduced-motion. That token is what actually stops the movement: a
 * motion-reduce:transform-none class does NOT, because Tailwind v4 compiles
 * translate-* to the `translate` property and `transform: none` does not touch
 * it. Same reasoning as the disclosure chevron in docs/page.tsx.
 */
const LINK_ARROW = cn(
  "h-4 w-4 transition-transform",
  "duration-[var(--duration-base)] ease-[var(--ease-spring)]",
  "group-hover:translate-x-[var(--lift-travel)]",
  "group-hover:-translate-y-[var(--lift-travel)]"
);

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
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--surface-page)] text-[var(--text-primary)]">
      <AppPageBackground />

      <SiteHeader
        authHref="/login"
        authLabel="Login"
        learningCenterHref="/resources"
      />

      <PageFrame className="space-y-[var(--space-8)] md:space-y-[var(--space-10)]">
        <section>
          <div className="mx-auto max-w-4xl text-center">
            <div className={cn("mb-[var(--space-4)]", EYEBROW)}>
              Mission Statement
            </div>

            <TypingHeading
              text="Learn by thinking, build by reasoning"
              as="h1"
              className="mx-auto max-w-4xl text-[clamp(2.4rem,6vw,4.8rem)] font-bold leading-[0.95] text-[var(--text-primary)]"
            />

            <p
              className={cn(
                "mx-auto mt-[var(--space-5)] max-w-3xl text-center",
                "text-[length:var(--text-base)] leading-[var(--leading-relaxed)]",
                "text-[var(--text-muted)] md:text-[length:var(--text-lg)]"
              )}
            >
              T.R.A.C.E. helps people use computer science concepts without
              first having to learn them through a specific programming
              language. It turns English pseudocode into executable programs
              while keeping the focus on logic, structure, and reasoning.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-4xl text-center">
            <div className={cn("mb-[var(--space-3)]", EYEBROW)}>
              Our Goal And Mission
            </div>
            <h2
              className={cn(
                "text-[length:var(--text-2xl)] font-bold leading-[var(--leading-tight)]",
                "text-[var(--text-primary)] md:text-[length:var(--text-3xl)]"
              )}
            >
              Make programming more understandable without removing rigor.
            </h2>
            <p
              className={cn(
                "mx-auto mt-[var(--space-5)] max-w-3xl",
                "text-[length:var(--text-sm)] leading-[var(--leading-relaxed)]",
                "text-[var(--text-muted)] md:text-[length:var(--text-base)]"
              )}
            >
              T.R.A.C.E. is designed to combine the accessibility of natural
              language with the discipline of structured programming. Users can
              specify behavior in English, run it in a browser-based IDE, and
              learn from the logic behind the result.
            </p>
          </div>
        </section>

        <SurfaceCard className="overflow-hidden p-[var(--space-6)] md:p-[var(--space-8)]">
          <div className="mx-auto max-w-5xl">
            <div className={cn("mb-[var(--space-3)]", EYEBROW)}>
              Long-Term Impact
            </div>
            <h2
              className={cn(
                "max-w-3xl text-[length:var(--text-2xl)] font-bold",
                "leading-[var(--leading-tight)] text-[var(--text-primary)]",
                "md:text-[length:var(--text-3xl)]"
              )}
            >
              Build practical AI capacity through tools people can actually use.
            </h2>
            <p
              className={cn(
                "mt-[var(--space-5)] max-w-3xl",
                "text-[length:var(--text-sm)] leading-[var(--leading-relaxed)]",
                "text-[var(--text-muted)] md:text-[length:var(--text-base)]"
              )}
            >
              The Caribbean opportunity is not just access to AI tools. It is
              the development of students, teachers, institutions, and workers
              who can apply AI with clarity and confidence. T.R.A.C.E. is built
              around that application-first strategy.
            </p>

            <div className="mt-[var(--space-8)] grid gap-[var(--space-4)] md:grid-cols-3">
              {IMPACT_POINTS.map((point) => (
                /*
                 * Inlaid, not raised: these sit inside a card that is already
                 * lifted off the page, and they are read rather than pressed.
                 * Stacking a second raised rung on the first would make the
                 * section read as a pile of stickers instead of one object with
                 * three panels set into it.
                 */
                <div
                  key={point.label}
                  className={cn(
                    "flex min-h-[13rem] flex-col rounded-[var(--radius-lg)] border",
                    "border-[var(--border-subtle)] bg-[var(--surface-sunken)]",
                    "p-[var(--space-5)] shadow-[var(--inlaid)]"
                  )}
                >
                  {/*
                   * Set at --text-xl/bold, not --text-sm/semibold. --accent-text
                   * on --accent-subtle measures 4.9:1 over a raised card, which
                   * is where the rest of the app uses this pair, but only 4.33:1
                   * over --surface-sunken -- under the 4.5:1 AA floor for body
                   * sizes. 20px bold clears the large-text floor of 3:1 instead,
                   * so the pairing stays identical to Badge and every other
                   * accent chip in the app rather than this one page inventing
                   * its own colour.
                   *
                   * The letter repeats the heading directly beneath it, so it is
                   * hidden from assistive tech rather than read out twice.
                   */}
                  <div
                    aria-hidden="true"
                    className={cn(
                      "mb-[var(--space-4)] flex h-10 w-10 items-center justify-center",
                      "rounded-[var(--radius-full)] border border-[var(--accent-border)]",
                      "bg-[var(--accent-subtle)] shadow-[var(--inlaid)]",
                      "text-[length:var(--text-xl)] font-bold text-[var(--accent-text)]"
                    )}
                  >
                    {point.label.slice(0, 1)}
                  </div>
                  <h3 className="text-[length:var(--text-base)] font-semibold text-[var(--text-primary)]">
                    {point.label}
                  </h3>
                  <p
                    className={cn(
                      "mt-[var(--space-3)] text-[length:var(--text-sm)]",
                      "leading-[var(--leading-relaxed)] text-[var(--text-muted)]"
                    )}
                  >
                    {point.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="overflow-hidden p-[var(--space-6)] md:p-[var(--space-8)]">
          <div className="grid gap-[var(--space-8)] lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="flex justify-center lg:justify-center">
              {/*
               * The portrait frame rests on the section it sits in -- the base
               * rung -- rather than lifting off it. It is a physical object
               * among the text, but nothing happens when you click it, so it
               * never travels.
               */}
              <div
                className={cn(
                  "relative h-56 w-56 overflow-hidden rounded-[var(--radius-full)]",
                  "border border-[var(--border-subtle)] bg-[var(--surface-raised)]",
                  "bg-[image:var(--material-sheen)] p-2 shadow-[var(--raised)]",
                  "md:h-72 md:w-72"
                )}
              >
                <div className="relative h-full w-full overflow-hidden rounded-[var(--radius-full)]">
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
              <div className={cn("mb-[var(--space-3)]", EYEBROW)}>
                About The Founder
              </div>
              <h2
                className={cn(
                  "text-[length:var(--text-2xl)] font-bold",
                  "leading-[var(--leading-tight)] text-[var(--text-primary)]",
                  "md:text-[length:var(--text-3xl)]"
                )}
              >
                Matthew Wilmot
              </h2>
              <p
                className={cn(
                  "mt-[var(--space-5)] text-[length:var(--text-sm)]",
                  "leading-[var(--leading-relaxed)] text-[var(--text-muted)]",
                  "md:text-[length:var(--text-base)]"
                )}
              >
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
              <p
                className={cn(
                  "mt-[var(--space-4)] text-[length:var(--text-sm)]",
                  "leading-[var(--leading-relaxed)] text-[var(--text-muted)]",
                  "md:text-[length:var(--text-base)]"
                )}
              >
                He has also contributed to MIT&apos;s Research Lab of Electronics,
                processing over 1,000 speech files and improving NLP
                preprocessing workflows. Beyond MIT, Matthew consults on
                scientific machine learning for agricultural monitoring in
                Jamaica and leads AI/chatbot development for El Sol Vida Fun
                Tours. He is especially motivated by AI applications in global
                development, environmental monitoring, and human-centered
                innovation.
              </p>

              <div className="mt-[var(--space-8)] flex flex-col gap-[var(--space-3)] sm:flex-row">
                <a
                  href="https://github.com/mcgwilmo"
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "group relative inline-flex h-12 items-center justify-center",
                    "gap-[var(--space-2)] overflow-hidden rounded-[var(--radius-full)]",
                    "px-[var(--space-5)] text-[length:var(--text-sm)] uppercase",
                    LINK_BUTTON
                  )}
                >
                  <GitHubIcon className="h-5 w-5" />
                  GitHub
                  <ArrowIcon className={LINK_ARROW} />
                </a>
                <a
                  href="https://www.linkedin.com/in/matthew-wilmot-6938a9292"
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "group relative inline-flex h-12 items-center justify-center",
                    "gap-[var(--space-2)] overflow-hidden rounded-[var(--radius-full)]",
                    "px-[var(--space-5)] text-[length:var(--text-sm)] uppercase",
                    LINK_BUTTON
                  )}
                >
                  <LinkedInIcon className="h-5 w-5" />
                  LinkedIn
                  <ArrowIcon className={LINK_ARROW} />
                </a>
              </div>
            </div>
          </div>
        </SurfaceCard>
      </PageFrame>

      <SiteFooter />
    </main>
  );
}
