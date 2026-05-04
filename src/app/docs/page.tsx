"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AppPageBackground,
  PageFrame,
  SiteHeader,
  TypingHeading,
} from "@/components/site-shell";
import { SiteFooter } from "@/components/site-footer";
import { useTheme } from "@/components/theme-provider";
import {
  getSupabaseBrowserClient,
  getSupabaseSession,
} from "@/lib/supabase/client";
import {
  type SubscriptionTier,
  getOrCreateSubscription,
  SUBSCRIPTION_META,
} from "@/lib/subscriptions";

type ChangelogSection = {
  title: string;
  items: Array<{
    title: string;
    description: string;
  }>;
};

type VersionEntry = {
  version: string;
  badge: string;
  summary: string;
  isCurrent?: boolean;
  sections: ChangelogSection[];
};

const VERSION_HISTORY: VersionEntry[] = [
  {
    version: "Pre-Alpha 1.4",
    badge: "Current",
    summary:
      "Problem Solving Mode, light mode, the T.R.A.C.E. rename, and a more polished navigation and IDE experience.",
    isCurrent: true,
    sections: [
      {
        title: "What's New",
        items: [
          {
            title: "Introduced Problem Solving Mode.",
            description:
              "The IDE now supports a more guided workflow for breaking down problems before execution.",
          },
          {
            title: "Added light mode.",
            description:
              "The product experience now has a full light theme option instead of being locked to a single dark presentation.",
          },
          {
            title: "Renamed the product from ID8 to T.R.A.C.E.",
            description:
              "Branding across the experience now reflects the updated product identity.",
          },
        ],
      },
      {
        title: "New Features",
        items: [
          {
            title: "Redesigned the navigation bar.",
            description:
              "Navigation feels cleaner, more intentional, and more consistent with the rest of the product.",
          },
          {
            title: "Improved the IDE interface.",
            description:
              "The editor experience now feels more polished and easier to use day to day.",
          },
          {
            title: "Continued product-wide refinement.",
            description:
              "Core screens now feel more cohesive as the product identity and interaction patterns mature.",
          },
        ],
      },
      {
        title: "UI Updates",
        items: [
          {
            title: "Rolled out a full light theme pass.",
            description:
              "Surfaces now maintain stronger contrast, readability, and visual hierarchy in both themes.",
          },
          {
            title: "Refreshed navigation and product framing.",
            description:
              "The top-level product shell now better matches the direction of T.R.A.C.E.",
          },
          {
            title: "Cleaned up IDE presentation.",
            description:
              "Spacing, hierarchy, and clarity in the IDE feel more intentional and less prototype-like.",
          },
        ],
      },
      {
        title: "Optimizations",
        items: [
          {
            title: "Improved workflow clarity.",
            description:
              "Moving through navigation, setup, and IDE actions now feels easier to follow.",
          },
          {
            title: "Strengthened theme consistency.",
            description:
              "Light and dark mode now feel like one product system instead of separate styling passes.",
          },
          {
            title: "Reduced surface-level friction.",
            description:
              "Branding, navigation, and interface polish now feel more aligned throughout the experience.",
          },
        ],
      },
      {
        title: "Bug Fixes",
        items: [
          {
            title: "Fixed inconsistent branding references.",
            description:
              "The transition from ID8 to T.R.A.C.E. is now reflected more consistently across the product.",
          },
          {
            title: "Fixed smaller navigation and layout inconsistencies.",
            description:
              "Shared interface elements now have more consistent spacing, alignment, and presentation.",
          },
          {
            title: "Reduced rough edges in the IDE experience.",
            description:
              "The product now feels more polished during normal use, especially around the IDE surface.",
          },
        ],
      },
    ],
  },
  {
    version: "Pre-Alpha 1.3",
    badge: "Product Polish",
    summary:
      "Expanded the public product surface, added bug reporting, and made the public-facing experience feel far more cohesive.",
    sections: [
      {
        title: "What's New",
        items: [
          {
            title: "Expanded the public product surface.",
            description:
              "Docs, resources, login, signup, dashboard, and pricing now feel like one connected product experience rather than separate prototype pages.",
          },
          {
            title: "Added bug reporting.",
            description:
              "Users can now report issues through the product experience instead of relying on external feedback paths.",
          },
          {
            title: "Refined the T.R.A.C.E. presentation.",
            description:
              "The public-facing interface now feels cleaner, more cohesive, and more aligned with the product's premium direction.",
          },
        ],
      },
      {
        title: "New Features",
        items: [
          {
            title: "Added a bug report flow.",
            description:
              "Issue reporting is now part of the app experience and no longer just conceptual.",
          },
          {
            title: "Expanded support content.",
            description:
              "Documentation and resources coverage are more complete and easier to use as product-facing references.",
          },
          {
            title: "Improved dashboard guidance.",
            description:
              "Projects, plan limits, subscriptions, and creation flows are now surfaced more clearly.",
          },
        ],
      },
      {
        title: "UI Updates",
        items: [
          {
            title: "Updated login and signup pages.",
            description:
              "Authentication screens now feel visually aligned with the rest of the product.",
          },
          {
            title: "Refined public page layouts.",
            description:
              "Navigation language, card structure, spacing, and hierarchy are more consistent across the site.",
          },
          {
            title: "Improved cross-page cohesion.",
            description:
              "Pricing, docs, resources, dashboard, and auth pages now feel like part of the same design system.",
          },
        ],
      },
      {
        title: "Optimizations",
        items: [
          {
            title: "Made code generation more reliable.",
            description:
              "Syntaxless instructions now run more consistently across common input styles.",
          },
          {
            title: "Improved execution predictability.",
            description:
              "The IDE now handles structured instructions more smoothly and with fewer confusing run outcomes.",
          },
          {
            title: "Reduced friction across the product.",
            description:
              "Navigation and page-to-page flow now feel faster, clearer, and more intentional.",
          },
        ],
      },
      {
        title: "Bug Fixes",
        items: [
          {
            title: "Fixed rough routing behavior.",
            description:
              "Transitions across home, pricing, auth, dashboard, docs, and resources are more stable.",
          },
          {
            title: "Fixed smaller UI inconsistencies.",
            description:
              "Public-facing pages now have cleaner alignment, spacing, and visual hierarchy.",
          },
          {
            title: "Improved frontend/backend handoff behavior.",
            description:
              "Responses are handled more smoothly so product flows feel cleaner in day-to-day use.",
          },
        ],
      },
    ],
  },
  {
    version: "Pre-Alpha 1.2",
    badge: "Engine Update",
    summary:
      "Reworked code generation behavior, broadened supported instruction types, and tightened execution reliability.",
    sections: [
      {
        title: "New Features",
        items: [
          {
            title: "Revised IDE code generation behavior.",
            description:
              "Syntaxless instructions are now handled in a more structured and dependable way.",
          },
          {
            title: "Expanded supported instruction types.",
            description:
              "The IDE now handles more multi-step logic, including loops, conditionals, assignments, tables, and richer outputs.",
          },
          {
            title: "Improved line-by-line understanding.",
            description:
              "The IDE now interprets user intent more clearly before attempting to run it.",
          },
        ],
      },
      {
        title: "Optimizations",
        items: [
          {
            title: "Made code generation more consistent.",
            description:
              "Multi-step instructions now behave more predictably and with less variation between runs.",
          },
          {
            title: "Improved pre-run checks.",
            description:
              "Unclear or unsupported instructions are now caught more reliably before execution.",
          },
          {
            title: "Strengthened overall IDE reliability.",
            description:
              "Runs now feel less placeholder-driven and more grounded in what the user actually wrote.",
          },
        ],
      },
      {
        title: "Bug Fixes",
        items: [
          {
            title: "Reduced execution mismatches.",
            description:
              "The IDE now more closely matches what it appears to support with what it can actually run.",
          },
          {
            title: "Fixed inconsistent behavior across modes.",
            description:
              "Interpretation and execution feel more stable depending on how the IDE is being used.",
          },
          {
            title: "Reduced under-specified run behavior.",
            description:
              "Runs now feel less fragile when instructions are more structured or sequential.",
          },
        ],
      },
    ],
  },
  {
    version: "Pre-Alpha 1.1",
    badge: "Foundation",
    summary:
      "The first full pre-alpha release introduced the core app surface, saved projects, and the first end-to-end run flow.",
    sections: [
      {
        title: "New Features",
        items: [
          {
            title: "Launched the first full Syntaxless IDE pre-alpha.",
            description:
              "The first release included homepage, dashboard, pricing, docs, resources, login, and signup.",
          },
          {
            title: "Added saved project workflow.",
            description:
              "Users could create and manage synth-file projects through a dashboard-based experience.",
          },
          {
            title: "Added the first end-to-end run flow.",
            description:
              "Syntaxless input could generate Python, execute, and return outputs through the IDE experience.",
          },
        ],
      },
      {
        title: "Optimizations",
        items: [
          {
            title: "Established the initial product identity.",
            description:
              "The app moved beyond a simple editor concept into a more complete software product.",
          },
          {
            title: "Added plan-aware product behavior.",
            description:
              "Different layouts, limits, and access patterns were surfaced through the product experience.",
          },
          {
            title: "Improved result handling.",
            description:
              "Generated outputs and artifacts became easier to inspect after runs.",
          },
        ],
      },
      {
        title: "Bug Fixes",
        items: [
          {
            title: "Improved shared app structure.",
            description:
              "Routing and product organization became more unified across the site.",
          },
          {
            title: "Improved run persistence.",
            description:
              "Saved run outputs and generated artifacts became more dependable.",
          },
          {
            title: "Reduced response mismatches.",
            description:
              "Frontend expectations and backend response formats were brought into better alignment.",
          },
        ],
      },
    ],
  },
];

function ReleaseNotesBackground() {
  return <AppPageBackground />;
}

function PlusMinusIcon({
  open,
  isLight,
}: {
  open: boolean;
  isLight: boolean;
}) {
  return (
    <span
      className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-300 ${
        isLight
          ? "border-slate-200 bg-white text-slate-500"
          : "border-white/10 bg-white/[0.03] text-neutral-300"
      }`}
      aria-hidden="true"
    >
      <span className="absolute h-[1.5px] w-4 rounded-full bg-current" />
      <span
        className={`absolute h-4 w-[1.5px] rounded-full bg-current transition-all duration-200 ${
          open ? "scale-y-0 opacity-0" : "scale-y-100 opacity-100"
        }`}
      />
    </span>
  );
}

function ChangelogEntry({
  entry,
  open,
  onToggle,
  delay = 0,
}: {
  entry: VersionEntry;
  open: boolean;
  onToggle: () => void;
  delay?: number;
}) {
  const { isLight } = useTheme();

  return (
    <section
      className={`page-enter-soft overflow-hidden border-b last:border-b-0 ${
        isLight
          ? "border-slate-200/90"
          : "border-white/[0.08]"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <button
        onClick={onToggle}
        className={`flex w-full items-start justify-between gap-5 py-6 text-left transition-colors duration-200 md:gap-6 md:py-7 ${
          isLight ? "hover:bg-slate-50/50" : "hover:bg-white/[0.02]"
        }`}
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-blue-300">
              {entry.version}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${
                isLight
                  ? "border-slate-200 bg-white text-slate-500"
                  : "border-white/10 bg-white/[0.04] text-neutral-400"
              }`}
            >
              {entry.badge}
            </span>
          </div>

          <h2
            className={
              isLight
                ? "text-[1.55rem] font-bold leading-tight tracking-[-0.035em] text-slate-900 md:text-[1.75rem]"
                : "text-[1.55rem] font-bold leading-tight tracking-[-0.035em] text-white md:text-[1.75rem]"
            }
          >
            {entry.version}
          </h2>

          <p
            className={`mt-2 max-w-3xl text-sm leading-7 md:text-[0.95rem] ${
              isLight ? "text-slate-600" : "text-neutral-400"
            }`}
          >
            {entry.summary}
          </p>
        </div>

        <PlusMinusIcon open={open} isLight={isLight} />
      </button>

      <div
        className={`grid transition-all duration-300 ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`pb-6 pr-2 md:pb-7 ${
              isLight ? "border-t border-slate-200/90" : "border-t border-white/[0.08]"
            }`}
          >
            <div className="grid gap-4 pt-6 md:grid-cols-2 md:gap-5 md:pt-7">
              {entry.sections.map((section) => (
                <section
                  key={section.title}
                  className={`rounded-[1.65rem] border p-5 md:p-6 ${
                    isLight
                      ? "border-sky-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(240,249,255,0.96)_44%,rgba(248,250,252,0.94))] shadow-[0_14px_34px_rgba(14,165,233,0.08)]"
                      : "border-cyan-400/10 bg-[linear-gradient(180deg,rgba(18,31,48,0.52),rgba(10,24,36,0.42)_44%,rgba(255,255,255,0.018))] shadow-[0_18px_40px_rgba(5,20,40,0.22)]"
                  }`}
                >
                  <h3
                    className={`mb-4 text-[11px] font-bold uppercase tracking-[0.24em] ${
                      isLight ? "text-slate-500" : "text-neutral-500"
                    }`}
                  >
                    {section.title}
                  </h3>

                  <div className="space-y-3">
                    {section.items.map((item) => (
                      <div
                        key={item.title}
                        className={`rounded-2xl border px-4 py-3 ${
                          isLight
                            ? "border-sky-100 bg-[linear-gradient(180deg,rgba(239,246,255,0.86),rgba(255,255,255,0.92))]"
                            : "border-white/[0.06] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(6,182,212,0.035))]"
                        }`}
                      >
                        <p className={`text-sm leading-7 ${isLight ? "text-slate-700" : "text-neutral-200"}`}>
                          <span className={`font-medium ${isLight ? "text-slate-900" : "text-white"}`}>
                            {item.title}
                          </span>{" "}
                          <span className={isLight ? "text-slate-600" : "text-neutral-400"}>
                            {item.description}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function DocsPage() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const { isLight } = useTheme();
  const [isAuthed, setIsAuthed] = useState(false);
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>("free");
  const [openVersion, setOpenVersion] = useState("");

  useEffect(() => {
    async function bootstrap() {
      const session = await getSupabaseSession(supabase);

      if (!session) {
        setIsAuthed(false);
        setCurrentTier("free");
        return;
      }

      setIsAuthed(true);

      try {
        const record = await getOrCreateSubscription(
          supabase,
          session.user.id,
          session.user.email ?? ""
        );
        setCurrentTier(record.tier);
      } catch (error) {
        console.error(error);
        setCurrentTier("free");
      }
    }

    void bootstrap();
  }, [supabase]);

  return (
    <main
      className={`relative min-h-screen overflow-hidden ${
        isLight ? "bg-[#f4f7fb] text-slate-900" : "bg-[#0f0f10] text-white"
      }`}
    >
      <ReleaseNotesBackground />

      <SiteHeader
        tierLabel={isAuthed ? SUBSCRIPTION_META[currentTier].label : undefined}
        authHref={isAuthed ? "/dashboard" : "/login"}
        authLabel={isAuthed ? "Dashboard" : "Login"}
        learningCenterHref={isAuthed ? "/resources" : "/login"}
        showSignOut={isAuthed}
        className="page-enter-soft"
      />

      <PageFrame className="space-y-10 md:space-y-12">
        <section className="page-enter">
          <div className="mx-auto max-w-4xl text-center">
            <TypingHeading
              text="Release Notes"
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
              Track the latest updates, new features, and bug fixes as T.R.A.C.E.
              evolves through pre-alpha, with the newest release at the top.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <div className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-blue-300">
                {VERSION_HISTORY[0]?.version}
              </div>
              <div
                className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${
                  isLight
                    ? "border-slate-200 bg-white/90 text-slate-500"
                    : "border-white/10 bg-white/[0.04] text-neutral-400"
                }`}
              >
                Current Release
              </div>
            </div>
          </div>
        </section>

        <section
          className={`relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border px-6 md:px-8 ${
            isLight
              ? "border-sky-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(240,249,255,0.88)_36%,rgba(248,250,252,0.92))] shadow-[0_24px_56px_rgba(14,165,233,0.1)]"
              : "border-cyan-400/10 bg-[linear-gradient(180deg,rgba(12,18,28,0.72),rgba(10,22,32,0.66)_34%,rgba(255,255,255,0.012))] shadow-[0_0_0_1px_rgba(255,255,255,0.01),0_26px_60px_rgba(0,0,0,0.28)]"
          }`}
        >
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-x-[18%] top-16 h-32 rounded-full blur-3xl ${
              isLight
                ? "bg-[radial-gradient(circle,rgba(56,189,248,0.16),transparent_68%)]"
                : "bg-[radial-gradient(circle,rgba(34,211,238,0.12),transparent_68%)]"
            }`}
          />
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute bottom-10 right-[-8%] h-44 w-44 rounded-full blur-3xl ${
              isLight
                ? "bg-[radial-gradient(circle,rgba(59,130,246,0.12),transparent_70%)]"
                : "bg-[radial-gradient(circle,rgba(59,130,246,0.09),transparent_70%)]"
            }`}
          />
          {VERSION_HISTORY.map((entry, index) => (
            <ChangelogEntry
              key={entry.version}
              entry={entry}
              open={openVersion === entry.version}
              onToggle={() =>
                setOpenVersion((current) =>
                  current === entry.version ? "" : entry.version
                )
              }
              delay={120 + index * 70}
            />
          ))}
        </section>
      </PageFrame>

      <SiteFooter />
    </main>
  );
}
