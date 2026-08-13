"use client";

import {
  AppPageBackground,
  PageFrame,
  SiteHeader,
  TypingHeading,
} from "@/components/site-shell";
import { SiteFooter } from "@/components/site-footer";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/cn";
import { SUBSCRIPTION_META } from "@/lib/subscriptions";
import { LEARNING_CENTER_TAB_ROUTES } from "./resource-routes";
import RadialOrbitalTimeline from "./radial-orbital-timeline";
import { useLearningCenterAccess } from "./use-learning-center-access";
import { BRAND } from "@/config/brand";

function OperatorsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 6h5" />
      <path d="M12 6h5" />
      <path d="M10 4v4" />
      <path d="M3 14h14" />
      <path d="m14 12 2 2-2 2" />
    </svg>
  );
}

function StructuresIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2.5" y="3" width="4.5" height="4.5" rx="1" />
      <rect x="13" y="3" width="4.5" height="4.5" rx="1" />
      <rect x="4" y="12.5" width="4.5" height="4.5" rx="1" />
      <circle cx="15.2" cy="14.8" r="2.2" />
      <path d="M7 5.2h6" />
      <path d="M5.2 12 7 7.5" />
      <path d="M13.8 12.8 15 7.5" />
      <path d="M8.5 14.8H13" />
    </svg>
  );
}

function SparkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m10 2 1.8 4.7L16.5 8l-4.7 1.3L10 14l-1.8-4.7L3.5 8l4.7-1.3L10 2Z" />
    </svg>
  );
}

export default function ResourcesPage() {
  const { isLight } = useTheme();
  const { authResolved, currentTier, isAuthed } = useLearningCenterAccess();

  if (!authResolved || !isAuthed) {
    return (
      <main
        className={cn(
          "relative min-h-screen overflow-hidden",
          isLight ? "bg-[#f4f7fb] text-slate-900" : "bg-[#0f0f10] text-white"
        )}
      >
        <AppPageBackground />
      </main>
    );
  }

  const timelineData = [
    {
      id: 1,
      title: "Operators, Primitives and Logic Structures",
      description:
        "Build your foundation with values, operators, logic, collections, and core program structure.",
      difficulty: "Beginner",
      href: LEARNING_CENTER_TAB_ROUTES.operators,
      relatedIds: [2, 3],
      energy: 88,
      kind: "lesson" as const,
      icon: OperatorsIcon,
    },
    {
      id: 2,
      title: "Data Structures and Algorithms",
      description:
        "Study core data structures and reusable algorithms across Strict, Standard, Abstraction, and pseudocode views.",
      difficulty: "Intermediate",
      href: LEARNING_CENTER_TAB_ROUTES["data-structures-algorithms"],
      relatedIds: [1, 4],
      energy: 82,
      kind: "lesson" as const,
      icon: StructuresIcon,
    },
    {
      id: 3,
      title: "Coming Soon",
      description: "Coming soon.",
      relatedIds: [1],
      energy: 60,
      kind: "coming-soon" as const,
      icon: SparkIcon,
    },
    {
      id: 4,
      title: "Coming Soon",
      description: "Coming soon.",
      relatedIds: [2],
      energy: 58,
      kind: "coming-soon" as const,
      icon: SparkIcon,
    },
    {
      id: 5,
      title: "Coming Soon",
      description: "Coming soon.",
      relatedIds: [],
      energy: 56,
      kind: "coming-soon" as const,
      icon: SparkIcon,
    },
    {
      id: 6,
      title: "Coming Soon",
      description: "Coming soon.",
      relatedIds: [],
      energy: 54,
      kind: "coming-soon" as const,
      icon: SparkIcon,
    },
    {
      id: 7,
      title: "Coming Soon",
      description: "Coming soon.",
      relatedIds: [],
      energy: 52,
      kind: "coming-soon" as const,
      icon: SparkIcon,
    },
  ];

  return (
    <main
      className={cn(
        "relative min-h-screen overflow-hidden",
        isLight ? "bg-[#f4f7fb] text-slate-900" : "bg-[#0f0f10] text-white"
      )}
    >
      <AppPageBackground />

      <SiteHeader
        tierLabel={SUBSCRIPTION_META[currentTier].label}
        authHref="/dashboard"
        authLabel="Dashboard"
        learningCenterHref="/resources"
        showSignOut
        className="page-enter-soft"
      />

      <PageFrame className="page-enter transition-all duration-700 ease-out">
        <section className="page-enter mb-10">
          <div className="mx-auto max-w-4xl text-center">
            <TypingHeading
              text="Learning Center"
              as="h1"
              className={`mx-auto max-w-3xl text-[clamp(2.4rem,6vw,4.8rem)] font-bold leading-[0.95] tracking-[-0.045em] ${
                isLight ? "text-slate-950" : "text-white"
              }`}
            />

            <p
              className={`mx-auto mt-4 max-w-2xl text-[0.88rem] leading-6 md:text-[0.95rem] md:leading-7 ${
                isLight ? "text-slate-600" : "text-neutral-400"
              }`}
            >
              Foundations first, deeper structures next, and more {BRAND.name}
              lessons on deck.
            </p>
          </div>
        </section>

        <section className="page-enter-soft" style={{ animationDelay: "140ms" }}>
          <div className="-mx-4 md:-mx-6">
            <RadialOrbitalTimeline timelineData={timelineData} />
          </div>
        </section>
      </PageFrame>

      <SiteFooter />
    </main>
  );
}
