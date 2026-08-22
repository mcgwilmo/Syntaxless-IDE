"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getSupabaseBrowserClient,
  getSupabaseSession,
} from "@/lib/supabase/client";
import {
  SUBSCRIPTION_META,
  SubscriptionRecord,
  SubscriptionTier,
  getOrCreateSubscription,
  getProjectLimitLabel,
  getSynthFileLimitLabel,
  isEduEmail,
  isPartneredSchoolEmail,
} from "@/lib/subscriptions";
import { SiteFooter } from "@/components/site-footer";
import { AppPageBackground, SiteHeader, TypingHeading } from "@/components/site-shell";
import { Badge, Button, Callout } from "@/design/primitives";

const TIERS: SubscriptionTier[] = ["free", "student", "plus", "pro"];
const MOST_POPULAR_TIER: SubscriptionTier = "plus";
type BillingCycle = "monthly" | "yearly";

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function SwitchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 3h5v5" />
      <path d="M21 3 14 10" />
      <path d="M8 21H3v-5" />
      <path d="M3 21l7-7" />
    </svg>
  );
}

function getAnnualPrice(monthlyPrice: number) {
  const annualPrice = monthlyPrice * 12;

  if (Number.isInteger(annualPrice)) {
    return annualPrice;
  }

  return Math.round(annualPrice - 0.99) + 0.99;
}

function getPriceContent(
  tier: SubscriptionTier,
  email: string,
  subscription: SubscriptionRecord | null,
  billingCycle: BillingCycle
) {
  if (tier === "free") {
    return {
      amount: "$0",
      suffix: billingCycle === "yearly" ? "/yr" : "/mo",
      note: "Starter access",
    };
  }

  if (tier === "student" && isPartneredSchoolEmail(email) && subscription?.partnered_school_verified) {
    return {
      amount: "$0",
      suffix: billingCycle === "yearly" ? "/yr" : "/mo",
      note: "Partner-school verified",
    };
  }

  const amount =
    billingCycle === "yearly"
      ? getAnnualPrice(SUBSCRIPTION_META[tier].monthlyPrice)
      : SUBSCRIPTION_META[tier].monthlyPrice;

  return {
    amount: `$${amount.toFixed(2)}`,
    suffix: billingCycle === "yearly" ? "/yr" : "/mo",
    note:
      billingCycle === "yearly"
        ? "Billed yearly"
        : tier === "student"
        ? "Discounted .edu pricing"
        : "Billed monthly",
  };
}

function getLayoutSummary(tier: SubscriptionTier) {
  if (tier === "free") return "Minimalist layout";
  if (tier === "pro") return "Minimalist, Normal, and Developer layouts";
  return "Minimalist and Normal layouts";
}

function getModeSummary(tier: SubscriptionTier) {
  if (tier === "free") return "Strict IDE mode";
  if (tier === "student") return "Problem Solving mode only";
  if (tier === "pro") return "All IDE modes, including Vibe";
  return "Strict, Standard, Abstraction, and Problem Solving modes";
}

function getFeatureList(
  tier: SubscriptionTier,
  email: string,
  subscription: SubscriptionRecord | null
) {
  const features = [
    getLayoutSummary(tier),
    getModeSummary(tier),
    SUBSCRIPTION_META[tier].generatedPython
      ? "Generated Python pane included"
      : "Generated Python pane locked",
    `${getProjectLimitLabel(tier)} project${getProjectLimitLabel(tier) === "1" ? "" : "s"} ${
      getProjectLimitLabel(tier) === "Unlimited" ? "available" : "included"
    }`,
    `${getSynthFileLimitLabel(tier)} synth file${
      getSynthFileLimitLabel(tier) === "1" ? "" : "s"
    } per project`,
  ];

  if (tier === "student") {
    if (!isEduEmail(email)) {
      features.push(".edu email required");
    } else if (isPartneredSchoolEmail(email) && subscription?.partnered_school_verified) {
      features.push("Free for verified partner schools");
    } else {
      features.push("Discounted for .edu users");
    }
  }

  return features;
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [isAuthed, setIsAuthed] = useState(false);
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
  const [status, setStatus] = useState("Loading pricing...");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  useEffect(() => {
    async function bootstrap() {
      const session = await getSupabaseSession(supabase);

      if (!session) {
        setIsAuthed(false);
        setStatus("Browse plans below. Sign in to choose one.");
        return;
      }

      setIsAuthed(true);
      setUserId(session.user.id);
      setEmail(session.user.email ?? "");

      try {
        const record = await getOrCreateSubscription(
          supabase,
          session.user.id,
          session.user.email ?? ""
        );
        setSubscription(record);
        setStatus("Choose your plan.");
      } catch (error) {
        console.error(error);
        setStatus("Could not load your subscription right now.");
      }
    }

    void bootstrap();
  }, [supabase]);

  const currentTier = subscription?.tier ?? "free";
  const eduEligible = isEduEmail(email);
  const partneredEligible = isPartneredSchoolEmail(email);
  const partneredVerified = !!subscription?.partnered_school_verified;

  function getStudentDescription() {
    if (!eduEligible) {
      return "Problem Solving mode for student workflows. Requires a .edu email.";
    }

    if (partneredEligible && partneredVerified) {
      return "Problem Solving mode, with free access for verified partner schools.";
    }

    if (partneredEligible) {
      return "Problem Solving mode with partner-school eligibility for free access.";
    }

    return "Problem Solving mode, discounted for .edu users.";
  }

  function getDescription(tier: SubscriptionTier) {
    if (tier === "student") return getStudentDescription();
    if (tier === "pro") {
      return "Every IDE mode, Developer layout, generated Python, and unlimited scale.";
    }
    return SUBSCRIPTION_META[tier].description;
  }

  async function handleSelectTier(nextTier: SubscriptionTier) {
    if (!isAuthed) {
      router.push("/signup");
      return;
    }

    if (!userId) {
      setStatus("Missing user session.");
      return;
    }

    setIsUpdating(true);
    setStatus(`Switching to ${SUBSCRIPTION_META[nextTier].label}...`);

    const { data, error } = await supabase
      .from("user_subscriptions")
      .update({
        tier: nextTier,
        billing_status: "active",
      })
      .eq("user_id", userId)
      .select("*")
      .single();

    setIsUpdating(false);

    if (error || !data) {
      setStatus(error?.message || "Could not update your subscription.");
      return;
    }

    setSubscription(data as SubscriptionRecord);

    if (nextTier === "student" && partneredEligible && partneredVerified) {
      setStatus("Student plan selected. Partner-school access verified as free.");
      return;
    }

    if (nextTier === "student") {
      setStatus("Student plan selected.");
      return;
    }

    setStatus(`${SUBSCRIPTION_META[nextTier].label} plan selected.`);
  }

  async function handleVerifyPartnerSchool() {
    if (!isAuthed) {
      router.push("/signup");
      return;
    }

    if (!partneredEligible) {
      setStatus("Your current email is not in the partnered-school list.");
      return;
    }

    if (!userId) {
      setStatus("Missing user session.");
      return;
    }

    setIsVerifying(true);
    setStatus("Verifying partnered school email...");

    const { data, error } = await supabase
      .from("user_subscriptions")
      .update({
        partnered_school_eligible: true,
        partnered_school_verified: true,
        is_edu_email: true,
        school_email: email,
        school_domain: email.split("@")[1]?.toLowerCase() ?? null,
      })
      .eq("user_id", userId)
      .select("*")
      .single();

    setIsVerifying(false);

    if (error || !data) {
      setStatus(error?.message || "Verification failed.");
      return;
    }

    setSubscription(data as SubscriptionRecord);
    setStatus("Partnered school verified. Student is now free on this account.");
  }

  function renderAction(tier: SubscriptionTier) {
    const isCurrent = currentTier === tier;

    if (!isAuthed) {
      return (
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => router.push("/signup")}
          className="mt-auto uppercase tracking-[var(--tracking-label)]"
        >
          Create account to choose
        </Button>
      );
    }

    if (isCurrent) {
      /*
       * The plan you are already on is a statement, not an offer, so it is
       * inlaid into the card instead of sitting proud of it like the other
       * cards' buttons. Nothing here is pressable, so nothing here moves --
       * that absence is most of what tells the two apart at a glance.
       */
      return (
        <div
          className="mt-auto w-full rounded-[var(--radius-md)] border border-[var(--accent-border)] bg-[var(--accent-subtle)] px-[var(--space-5)] py-[var(--space-3)] text-center text-[length:var(--text-base)] font-medium uppercase tracking-[var(--tracking-label)] text-[var(--accent-text)] shadow-[var(--inlaid)]"
        >
          Current Plan
        </div>
      );
    }

    /* The most popular tier is the one recommendation the page makes, so it is
       the only accent-filled CTA in the row. */
    return (
      <Button
        variant={tier === MOST_POPULAR_TIER ? "primary" : "secondary"}
        size="lg"
        fullWidth
        onClick={() => handleSelectTier(tier)}
        disabled={isUpdating}
        className="mt-auto uppercase tracking-[var(--tracking-label)]"
      >
        {isUpdating ? "Updating..." : `Choose ${SUBSCRIPTION_META[tier].label}`}
      </Button>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--surface-page)] text-[var(--text-primary)]">
      <AppPageBackground />

      <SiteHeader
        tierLabel={SUBSCRIPTION_META[currentTier].label}
        authHref={isAuthed ? "/dashboard" : "/login"}
        authLabel={isAuthed ? "Dashboard" : "Login"}
        learningCenterHref={isAuthed ? "/resources" : "/login"}
        showSignOut={isAuthed}
        surfaceClassName="border-[var(--border-subtle)] bg-[var(--surface-raised)]"
      />

      <section className="relative z-10 px-4 pb-24 pt-32 md:px-6 md:pt-36">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <TypingHeading
              text="Pricing"
              as="h1"
              className="mx-auto max-w-3xl text-[clamp(2.4rem,6vw,4.8rem)] font-bold leading-[1.05] tracking-[-0.045em] text-[var(--text-primary)]"
            />

            <p className="mx-auto mt-4 max-w-xl text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--text-muted)] md:text-[length:var(--text-base)]">
              Choose the plan that unlocks the workflow you want. This is still an alpha framework pass, so plan changes update immediately in the UI with no payment flow yet.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {isAuthed ? (
                <Badge tone="accent" className="uppercase tracking-[var(--tracking-label)]">
                  {SUBSCRIPTION_META[currentTier].label}
                </Badge>
              ) : null}

              <Badge tone="neutral" className="uppercase tracking-[var(--tracking-label)]">
                {status}
              </Badge>
            </div>

            {/*
              A segmented control is a groove with a thumb in it: the track is
              recessed, and only the selected cycle is raised out of it. Colour
              alone would leave both options looking equally selected.

              The transition lists `translate`, not `transform`: Tailwind v4
              compiles translate-y-* to the standalone `translate` property, so
              naming `transform` here transitions nothing and the lift snaps.
              Same reason the card below lists `scale`. See globals.css, which
              documents the same trap for motion-reduce:transform-none.
            */}
            <div className="mx-auto mt-7 inline-flex items-center gap-1 rounded-[var(--radius-full)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-1 shadow-[var(--recessed)]">
              {(["monthly", "yearly"] as const).map((cycle) => {
                const isSelected = billingCycle === cycle;

                return (
                  <button
                    key={cycle}
                    type="button"
                    onClick={() => setBillingCycle(cycle)}
                    aria-pressed={isSelected}
                    className={`flex h-10 items-center gap-2 rounded-[var(--radius-full)] px-4 text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] transition-[background-color,box-shadow,translate,color] duration-[var(--duration-press)] ease-[var(--ease-spring)] active:translate-y-[var(--press-travel)] active:shadow-[var(--pressed)] motion-reduce:transform-none motion-reduce:hover:transform-none motion-reduce:active:transform-none ${
                      isSelected
                        // The thumb is the only thing in the groove with any
                        // depth, so it is the only thing that can rise: raised
                        // at rest, --lifted and a travel on hover.
                        ? "bg-[var(--accent-solid)] bg-[image:var(--material-sheen)] text-[var(--text-inverted)] shadow-[var(--raised)] hover:-translate-y-[var(--lift-travel)] hover:bg-[var(--accent-hover)] hover:shadow-[var(--lifted)]"
                        // The unselected cycle is flat in the track. It used to
                        // answer hover with --lifted and a travel, jumping from
                        // no shadow at all straight to the hover of a rung it
                        // was never on -- so an unselected segment read as more
                        // raised than the selected one under the cursor. Flat
                        // things in this app answer with colour and press in;
                        // same rule as the menu rows and the syllabus rows.
                        : "text-[var(--text-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {cycle === "yearly" ? <SwitchIcon className="h-4 w-4" /> : null}
                    {cycle}
                  </button>
                );
              })}
            </div>
          </div>

          {partneredEligible && !partneredVerified && isAuthed ? (
            <Callout
              tone="success"
              title="Partner-school email detected"
              className="mx-auto mt-10 max-w-4xl md:px-[var(--space-5)] md:py-[var(--space-4)]"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p>Verify it to unlock free Student access.</p>
                <Button
                  variant="secondary"
                  onClick={handleVerifyPartnerSchool}
                  disabled={isVerifying}
                  className="uppercase tracking-[var(--tracking-label)]"
                >
                  {isVerifying ? "Verifying..." : "Verify school email"}
                </Button>
              </div>
            </Callout>
          ) : null}

          <div className="relative mt-14">
            <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {TIERS.map((tier) => {
                const meta = SUBSCRIPTION_META[tier];
                const isCurrent = currentTier === tier;
                const price = getPriceContent(tier, email, subscription, billingCycle);
                const features = getFeatureList(tier, email, subscription);

                return (
                  /*
                   * Every tier is a card lifted off the page. The plan you are
                   * on goes one rung further, up to the detached shadow: losing
                   * the contact shadow is what makes it read as pulled out of
                   * the row rather than merely tinted differently, which is the
                   * whole point of a selected state you can see from across a
                   * classroom. The accent border only confirms it.
                   *
                   * The card itself is not pressable, so it does not travel on
                   * hover -- the button inside it is the thing you press. It
                   * does not answer hover at all now: the only thing that used
                   * to was a skewed band of accent light sweeping across it on
                   * a loop, which is a second and moving light source on a card
                   * lit from above like everything else. Gone, along with the
                   * `group` that existed only to trigger it.
                   */
                  <section
                    key={tier}
                    className={`relative flex min-h-[38rem] flex-col overflow-hidden rounded-[var(--radius-xl)] border bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] p-6 transition-[box-shadow,scale] duration-[var(--duration-slow)] ease-[var(--ease-spring)] motion-reduce:transition-[box-shadow] ${
                      isCurrent
                        ? "scale-[1.015] border-[var(--accent-border)] shadow-[var(--floating)]"
                        : "border-[var(--border-subtle)] shadow-[var(--raised-lg)]"
                    }`}
                  >
                    <div className="relative z-10 flex h-full flex-col">
                      <div className="mb-6">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] text-[var(--text-muted)]">
                            {meta.label}
                          </div>
                          <Badge
                            tone={isCurrent ? "accent" : "neutral"}
                            className="uppercase tracking-[var(--tracking-label)]"
                          >
                            {isCurrent ? "Active" : "Available"}
                          </Badge>
                        </div>

                        <h2 className="text-[length:var(--text-3xl)] font-bold leading-[1.05] tracking-[-0.045em] text-[var(--text-primary)]">
                          {meta.label}
                        </h2>

                        <p className="mt-4 min-h-[5.5rem] text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--text-muted)]">
                          {getDescription(tier)}
                        </p>
                      </div>

                      <div className="mb-6">
                        <div className="flex items-end gap-2">
                          <span className="text-[length:var(--text-3xl)] font-semibold leading-none tracking-[-0.045em] text-[var(--text-primary)]">
                            {price.amount}
                          </span>
                          <span className="pb-2 text-[length:var(--text-sm)] text-[var(--text-muted)]">
                            {price.suffix}
                          </span>
                        </div>
                        <div className="mt-2 text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] text-[var(--accent-text)]">
                          {price.note}
                        </div>
                      </div>

                      <div className="mb-6 h-px w-full bg-[var(--border-subtle)]" />

                      <ul className="mb-7 flex flex-col gap-3 text-[length:var(--text-sm)] text-[var(--text-muted)]">
                        {features.map((feature) => (
                          <li key={`${tier}-${feature}`} className="flex items-start gap-3">
                            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-text)]" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {renderAction(tier)}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
