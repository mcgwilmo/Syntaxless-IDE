"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppPageBackground,
  PageFrame,
  SiteHeader,
  TypingHeading,
} from "@/components/site-shell";
import { SiteFooter } from "@/components/site-footer";
import { Badge, Card } from "@/design/primitives";
import { cn } from "@/lib/cn";
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

/*
 * The disclosure affordance for a changelog entry.
 *
 * The whole header row is the button, but travelling the row on press would
 * make a 24px heading jump, which reads as a glitch rather than a click. So the
 * material lives on the one element that already looks like a control, and it
 * moves off the row's hover/active via `group-`.
 */
function PlusMinusIcon({ open }: { open: boolean }) {
  return (
    <span
      className={cn(
        "relative flex h-10 w-10 items-center justify-center",
        "rounded-[var(--radius-full)] border border-[var(--border-subtle)]",
        "bg-[var(--surface-raised)] bg-[image:var(--material-sheen)]",
        "text-[var(--text-muted)] shadow-[var(--raised)]",
        "transition-[box-shadow,transform,color]",
        "duration-[var(--duration-press)] ease-[var(--ease-spring)]",
        "group-hover:-translate-y-[var(--lift-travel)] group-hover:shadow-[var(--lifted)]",
        "group-hover:text-[var(--text-primary)]",
        "group-active:translate-y-[var(--press-travel)] group-active:shadow-[var(--pressed)]"
        // Depth still reads with motion off; only the travel is dropped. That
        // is handled by --lift-travel/--press-travel going to 0px under
        // prefers-reduced-motion, NOT by a motion-reduce:transform-none class:
        // Tailwind v4 compiles translate-y-* to the `translate` property, which
        // `transform: none` does not touch.
      )}
      aria-hidden="true"
    >
      <span className="absolute h-[1.5px] w-4 rounded-[var(--radius-full)] bg-current" />
      <span
        className={cn(
          "absolute h-4 w-[1.5px] rounded-[var(--radius-full)] bg-current",
          "transition-[transform,opacity]",
          "duration-[var(--duration-base)] ease-[var(--ease-spring)]",
          open ? "scale-y-0 opacity-0" : "scale-y-100 opacity-100"
        )}
      />
    </span>
  );
}

function ChangelogEntry({
  entry,
  open,
  onToggle,
}: {
  entry: VersionEntry;
  open: boolean;
  onToggle: () => void;
}) {
  const slug = entry.version.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const panelId = `changelog-panel-${slug}`;
  const buttonId = `changelog-trigger-${slug}`;

  return (
    <section className="overflow-hidden border-b border-[var(--border-subtle)] last:border-b-0">
      <button
        type="button"
        id={buttonId}
        onClick={onToggle}
        className={cn(
          "group flex w-full items-start justify-between gap-[var(--space-5)] text-left",
          "py-[var(--space-6)] md:gap-[var(--space-6)] md:py-[var(--space-8)]",
          "transition-colors duration-[var(--duration-base)] ease-[var(--ease-out)]",
          // The row itself sinks toward the panel rather than lifting off it;
          // the lift belongs to PlusMinusIcon.
          "hover:bg-[var(--surface-sunken)]"
        )}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <div className="min-w-0 flex-1">
          <div className="mb-[var(--space-3)] flex flex-wrap items-center gap-[var(--space-2)]">
            <Badge tone="accent" className="uppercase tracking-[var(--tracking-label)]">
              {entry.version}
            </Badge>
            <Badge tone="neutral" className="uppercase tracking-[var(--tracking-label)]">
              {entry.badge}
            </Badge>
          </div>

          <h2 className="text-[length:var(--text-2xl)] font-bold leading-[var(--leading-tight)] tracking-[-0.035em] text-[var(--text-primary)] md:text-[length:var(--text-3xl)]">
            {entry.version}
          </h2>

          <p className="mt-[var(--space-2)] max-w-3xl text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--text-muted)] md:text-[length:var(--text-base)]">
            {entry.summary}
          </p>
        </div>

        <PlusMinusIcon open={open} />
      </button>

      {/*
       * The collapsed panel stays in the DOM so the row can animate open, so
       * aria-hidden has to do what the clipping does visually. Without it
       * aria-expanded={false} is a lie: a screen reader would read every
       * collapsed release in full.
       */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        aria-hidden={!open}
        className={cn(
          "grid transition-all duration-[var(--duration-slow)] ease-[var(--ease-out)]",
          "motion-reduce:transition-none",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-[var(--border-subtle)] pb-[var(--space-6)] pr-[var(--space-2)] md:pb-[var(--space-8)]">
            <div className="grid gap-[var(--space-4)] pt-[var(--space-6)] md:grid-cols-2 md:gap-[var(--space-5)] md:pt-[var(--space-8)]">
              {entry.sections.map((section) => (
                // A Card, not a Panel: these are grouped content resting on the
                // changelog panel, not a second panel floating above it.
                <Card key={section.title} className="md:p-[var(--space-6)]">
                  <h3 className="mb-[var(--space-4)] text-[length:var(--text-xs)] font-bold uppercase tracking-[var(--tracking-label)] text-[var(--text-muted)]">
                    {section.title}
                  </h3>

                  <div className="space-y-[var(--space-3)]">
                    {section.items.map((item) => (
                      // Inlaid: each note is set into the card it sits in. It is
                      // read, never pressed, so it must not look raised.
                      <div
                        key={item.title}
                        className={cn(
                          "rounded-[var(--radius-lg)] border border-[var(--border-subtle)]",
                          "bg-[var(--surface-sunken)] shadow-[var(--inlaid)]",
                          "px-[var(--space-4)] py-[var(--space-3)]"
                        )}
                      >
                        <p className="text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--text-muted)]">
                          <span className="font-medium text-[var(--text-primary)]">
                            {item.title}
                          </span>{" "}
                          <span>{item.description}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function DocsPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [isAuthed, setIsAuthed] = useState(false);
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>("free");
  const [openVersion, setOpenVersion] = useState("");

  useEffect(() => {
    async function bootstrap() {
      const session = await getSupabaseSession(supabase);

      if (!session) {
        setIsAuthed(false);
        setCurrentTier("free");
        router.replace("/login");
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
  }, [router, supabase]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--surface-page)] text-[var(--text-primary)]">
      <ReleaseNotesBackground />

      <SiteHeader
        tierLabel={isAuthed ? SUBSCRIPTION_META[currentTier].label : undefined}
        authHref={isAuthed ? "/dashboard" : "/login"}
        authLabel={isAuthed ? "Dashboard" : "Login"}
        learningCenterHref={isAuthed ? "/resources" : "/login"}
        showSignOut={isAuthed}
      />

      <PageFrame className="space-y-[var(--space-10)] md:space-y-[var(--space-12)]">
        <section>
          <div className="mx-auto max-w-4xl text-center">
            <TypingHeading
              text="Release Notes"
              as="h1"
              className="mx-auto max-w-3xl text-[clamp(2.4rem,6vw,4.8rem)] font-bold leading-[1.05] tracking-[-0.045em] text-[var(--text-primary)]"
            />

            <p className="mx-auto mt-[var(--space-4)] max-w-2xl text-[length:var(--text-sm)] leading-[var(--leading-normal)] text-[var(--text-muted)] md:text-[length:var(--text-base)] md:leading-[var(--leading-relaxed)]">
              Track the latest updates, new features, and bug fixes as T.R.A.C.E.
              evolves through pre-alpha, with the newest release at the top.
            </p>

            <div className="mt-[var(--space-5)] flex flex-wrap items-center justify-center gap-[var(--space-3)]">
              <Badge tone="accent" className="uppercase tracking-[var(--tracking-label)]">
                {VERSION_HISTORY[0]?.version}
              </Badge>
              <Badge tone="neutral" className="uppercase tracking-[var(--tracking-label)]">
                Current Release
              </Badge>
            </div>
          </div>
        </section>

        {/* The changelog is one object lifted off the page -- the panel rung --
            with every entry sharing its surface, rather than a stack of
            separately floating cards.

            The two blurred sky/blue glows that used to sit inside this panel
            are gone rather than re-tinted. tokens.css reserves the accent for
            interactive emphasis and says explicitly it is never for
            decoration, and the panel's depth is the --raised-lg shadow's job,
            not a coloured haze behind it. */}
        <section
          className={cn(
            "relative mx-auto max-w-5xl overflow-hidden",
            "rounded-[var(--radius-xl)] border border-[var(--border-subtle)]",
            "bg-[var(--surface-raised)] bg-[image:var(--material-sheen)]",
            "px-[var(--space-6)] shadow-[var(--raised-lg)] md:px-[var(--space-8)]"
          )}
        >
          {VERSION_HISTORY.map((entry) => (
            <ChangelogEntry
              key={entry.version}
              entry={entry}
              open={openVersion === entry.version}
              onToggle={() =>
                setOpenVersion((current) =>
                  current === entry.version ? "" : entry.version
                )
              }
            />
          ))}
        </section>
      </PageFrame>

      <SiteFooter />
    </main>
  );
}
