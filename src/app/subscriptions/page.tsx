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
import { useTheme } from "@/components/theme-provider";

const TIERS: SubscriptionTier[] = ["free", "student", "plus", "pro"];
const MOST_POPULAR_TIER: SubscriptionTier = "plus";
type BillingCycle = "monthly" | "yearly";

const CARD_META: Record<
  SubscriptionTier,
  {
    spotlight: string;
    badge: string;
    button: string;
    buttonSecondary: string;
    ring: string;
  }
> = {
  free: {
    spotlight: "from-blue-500/40 via-cyan-400/18 to-transparent",
    badge: "text-sky-300",
    button:
      "bg-cyan-400 text-slate-950 hover:bg-cyan-300",
    buttonSecondary:
      "border-white/14 bg-white/[0.06] text-white hover:border-white/20 hover:bg-white/[0.1]",
    ring: "ring-sky-400/20",
  },
  plus: {
    spotlight: "from-cyan-400/55 via-sky-400/20 to-transparent",
    badge: "text-cyan-300",
    button:
      "bg-cyan-400 text-slate-950 hover:bg-cyan-300",
    buttonSecondary:
      "border-cyan-300/30 bg-cyan-400/12 text-cyan-100 hover:border-cyan-200/40 hover:bg-cyan-400/18",
    ring: "ring-cyan-300/30",
  },
  student: {
    spotlight: "from-indigo-400/50 via-cyan-300/18 to-transparent",
    badge: "text-indigo-200",
    button:
      "bg-cyan-400 text-slate-950 hover:bg-cyan-300",
    buttonSecondary:
      "border-white/14 bg-white/[0.06] text-white hover:border-white/20 hover:bg-white/[0.1]",
    ring: "ring-indigo-300/25",
  },
  pro: {
    spotlight: "from-teal-300/50 via-cyan-300/18 to-transparent",
    badge: "text-teal-200",
    button:
      "bg-cyan-400 text-slate-950 hover:bg-cyan-300",
    buttonSecondary:
      "border-white/14 bg-white/[0.06] text-white hover:border-white/20 hover:bg-white/[0.1]",
    ring: "ring-teal-300/25",
  },
};

function getPrimaryButtonClass(isLight: boolean) {
  return isLight
    ? "border-blue-200 bg-white text-slate-700 hover:border-blue-300 hover:text-slate-900 hover:shadow-[0_16px_32px_rgba(59,130,246,0.12)]"
    : "border-blue-400/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.014))] text-neutral-300 hover:border-blue-300/28 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_22px_rgba(66,146,255,0.07)]";
}

function getAccentButtonClass(isLight: boolean) {
  return isLight
    ? "border-cyan-300 bg-cyan-400 text-slate-950 hover:border-cyan-300 hover:bg-cyan-300 hover:shadow-[0_16px_32px_rgba(34,211,238,0.18)]"
    : "border-cyan-300/30 bg-cyan-400/90 text-slate-950 hover:border-cyan-200/40 hover:bg-cyan-300";
}

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
  const { isLight } = useTheme();

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
    const secondaryClass = getPrimaryButtonClass(isLight);
    const primaryClass =
      tier === MOST_POPULAR_TIER || isCurrent
        ? getAccentButtonClass(isLight)
        : secondaryClass;

    if (!isAuthed) {
      return (
        <button
          onClick={() => router.push("/signup")}
          className={`group relative mt-auto w-full overflow-hidden rounded-full border px-4 py-3 text-sm uppercase tracking-[0.22em] transition-all duration-300 ${secondaryClass}`}
        >
          <span className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(110deg,transparent_18%,rgba(255,255,255,0.05)_38%,rgba(23,111,255,0.15)_50%,rgba(23,223,255,0.12)_60%,rgba(255,255,255,0.05)_68%,transparent_82%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-[metalSweep_1.15s_ease]" />
          <span className="pointer-events-none absolute inset-[1px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.015),rgba(255,255,255,0.004))]" />
          <span className="relative z-10">Create account to choose</span>
        </button>
      );
    }

    if (isCurrent) {
      return (
        <div
          className={`mt-auto w-full rounded-full border px-4 py-3 text-center text-sm uppercase tracking-[0.22em] ${isLight ? "border-blue-200 bg-blue-50 text-blue-700" : "border-blue-300/30 bg-blue-400/12 text-blue-200"}`}
        >
          Current Plan
        </div>
      );
    }

    return (
      <button
        onClick={() => handleSelectTier(tier)}
        disabled={isUpdating}
        className={`group relative mt-auto w-full overflow-hidden rounded-full border px-4 py-3 text-sm uppercase tracking-[0.22em] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${primaryClass}`}
      >
        <span className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(110deg,transparent_18%,rgba(255,255,255,0.05)_38%,rgba(23,111,255,0.15)_50%,rgba(23,223,255,0.12)_60%,rgba(255,255,255,0.05)_68%,transparent_82%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-[metalSweep_1.15s_ease]" />
        <span className="pointer-events-none absolute inset-[1px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.015),rgba(255,255,255,0.004))]" />
        <span className="relative z-10">
          {isUpdating ? "Updating..." : `Choose ${SUBSCRIPTION_META[tier].label}`}
        </span>
      </button>
    );
  }

  return (
    <main
      className={`relative min-h-screen overflow-hidden ${
        isLight ? "bg-[#eef4fb] text-slate-900" : "bg-[#050608] text-white"
      }`}
    >
      <AppPageBackground />

      <SiteHeader
        tierLabel={SUBSCRIPTION_META[currentTier].label}
        authHref={isAuthed ? "/dashboard" : "/login"}
        authLabel={isAuthed ? "Dashboard" : "Login"}
        learningCenterHref={isAuthed ? "/resources" : "/login"}
        showSignOut={isAuthed}
        className="page-enter-soft"
        surfaceClassName={
          isLight
            ? "border-slate-200/90 bg-white/80"
            : "border-white/[0.08] bg-black/55"
        }
      />

      <section className="relative z-10 px-4 pb-24 pt-32 md:px-6 md:pt-36">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <TypingHeading
              text="Pricing"
              as="h1"
              className={`mx-auto max-w-3xl text-[clamp(2.4rem,6vw,4.8rem)] font-bold leading-[0.95] tracking-[-0.045em] ${
                isLight ? "text-slate-950" : "text-white"
              }`}
            />

            <p className={`mx-auto mt-4 max-w-xl text-[0.88rem] leading-6 md:text-[0.95rem] md:leading-7 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
              Choose the plan that unlocks the workflow you want. This is still an alpha framework pass, so plan changes update immediately in the UI with no payment flow yet.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {isAuthed ? (
                <div className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${isLight ? "border-cyan-200 bg-cyan-50 text-cyan-700" : "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"}`}>
                  {SUBSCRIPTION_META[currentTier].label}
                </div>
              ) : null}

              <div className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${isLight ? "border-slate-200 bg-white/90 text-slate-500" : "border-white/10 bg-white/[0.04] text-neutral-400"}`}>
                {status}
              </div>
            </div>

            <div className={`mx-auto mt-7 inline-flex items-center gap-1 rounded-full border p-1 ${isLight ? "border-slate-200 bg-white/90 shadow-[0_14px_32px_rgba(15,23,42,0.08)]" : "border-white/10 bg-white/[0.04]"}`}>
              {(["monthly", "yearly"] as const).map((cycle) => {
                const isSelected = billingCycle === cycle;

                return (
                  <button
                    key={cycle}
                    type="button"
                    onClick={() => setBillingCycle(cycle)}
                    aria-pressed={isSelected}
                    className={`flex h-10 items-center gap-2 rounded-full px-4 text-xs uppercase tracking-[0.2em] transition-all duration-300 ${
                      isSelected
                        ? isLight
                          ? "bg-slate-950 text-white"
                          : "bg-cyan-300 text-slate-950"
                        : isLight
                        ? "text-slate-500 hover:text-slate-900"
                        : "text-neutral-400 hover:text-white"
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
            <div
              className={`mx-auto mt-10 max-w-4xl rounded-[1.6rem] border p-4 md:p-5 ${
                isLight
                  ? "border-emerald-300/60 bg-emerald-50/90"
                  : "border-emerald-400/20 bg-emerald-500/[0.06]"
              }`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className={`text-sm leading-7 ${isLight ? "text-emerald-900" : "text-emerald-100"}`}>
                  Partner-school email detected. Verify it to unlock free Student access.
                </div>
                <button
                  onClick={handleVerifyPartnerSchool}
                  disabled={isVerifying}
                  className={`group relative overflow-hidden rounded-full border px-5 py-3 text-sm uppercase tracking-[0.2em] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
                    isLight
                      ? "border-blue-200 bg-white text-slate-700 hover:border-blue-300 hover:text-slate-900 hover:shadow-[0_16px_32px_rgba(59,130,246,0.12)]"
                      : "border-blue-400/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.014))] text-neutral-300 hover:border-blue-300/28 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_22px_rgba(66,146,255,0.07)]"
                  }`}
                >
                  <span className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(110deg,transparent_18%,rgba(255,255,255,0.05)_38%,rgba(23,111,255,0.15)_50%,rgba(23,223,255,0.12)_60%,rgba(255,255,255,0.05)_68%,transparent_82%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-[metalSweep_1.15s_ease]" />
                  <span className="pointer-events-none absolute inset-[1px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.015),rgba(255,255,255,0.004))]" />
                  <span className="relative z-10">
                    {isVerifying ? "Verifying..." : "Verify school email"}
                  </span>
                </button>
              </div>
            </div>
          ) : null}

          <div className="relative mt-14">
            <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {TIERS.map((tier, index) => {
                const meta = SUBSCRIPTION_META[tier];
                const card = CARD_META[tier];
                const isCurrent = currentTier === tier;
                const price = getPriceContent(tier, email, subscription, billingCycle);
                const features = getFeatureList(tier, email, subscription);

                return (
                  <section
                    key={tier}
                    className={`group relative flex min-h-[38rem] flex-col overflow-hidden rounded-[2rem] border p-6 transition-all duration-500 hover:-translate-y-1 ${
                      isLight
                        ? "border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] text-slate-900 shadow-[0_18px_44px_rgba(15,23,42,0.08)] hover:border-slate-300 hover:bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(241,245,249,0.96))]"
                        : "border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.026),rgba(255,255,255,0.01))] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.01)] hover:border-white/[0.14] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.014))]"
                    } ${
                      isCurrent ? `scale-[1.015] ring-2 ${card.ring}` : ""
                    } page-enter-soft`}
                    style={{ animationDelay: `${index * 95}ms` }}
                  >
                    <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${card.spotlight} opacity-50`} />
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <div className="absolute -left-[30%] top-0 h-full w-[34%] -skew-x-[16deg] bg-[linear-gradient(90deg,transparent,rgba(76,212,255,0.16),transparent)] animate-[cardSweep_8s_ease-in-out_infinite]" />
                    </div>

                    <div className="relative z-10 flex h-full flex-col">
                      <div className="mb-6">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className={`text-[11px] uppercase tracking-[0.24em] ${isLight ? "text-slate-500" : "text-neutral-400"} ${card.badge}`}>
                            {meta.label}
                          </div>
                          <div
                            className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] ${
                              isCurrent
                                ? isLight
                                  ? "border-cyan-300 bg-cyan-50 text-cyan-700"
                                  : "border-cyan-300/25 bg-cyan-400/10 text-cyan-200"
                                : isLight
                                ? "border-slate-200 bg-white text-slate-500"
                                : "border-white/10 bg-white/[0.04] text-neutral-500"
                            }`}
                          >
                            {isCurrent ? "Active" : "Available"}
                          </div>
                        </div>

                        <h2 className={`text-[2.65rem] font-bold leading-[0.95] tracking-[-0.045em] ${isLight ? "text-slate-950" : "text-white"}`}>
                          {meta.label}
                        </h2>

                        <p className={`mt-4 min-h-[5.5rem] text-sm leading-7 ${isLight ? "text-slate-600" : "text-neutral-300"}`}>
                          {getDescription(tier)}
                        </p>
                      </div>

                      <div className="mb-6">
                        <div className="flex items-end gap-2">
                          <span className={`text-[3rem] font-semibold leading-none tracking-[-0.045em] ${isLight ? "text-slate-950" : "text-white"}`}>
                            {price.amount}
                          </span>
                          <span className={`pb-2 text-sm ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                            {price.suffix}
                          </span>
                        </div>
                        <div className={`mt-2 text-xs uppercase tracking-[0.18em] ${card.badge}`}>
                          {price.note}
                        </div>
                      </div>

                      <div className={`mb-6 h-px w-full ${isLight ? "bg-[linear-gradient(90deg,transparent,rgba(148,163,184,0.35),transparent)]" : "bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)]"}`} />

                      <ul className={`mb-7 flex flex-col gap-3 text-sm ${isLight ? "text-slate-700" : "text-neutral-200"}`}>
                        {features.map((feature) => (
                          <li key={`${tier}-${feature}`} className="flex items-start gap-3">
                            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
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

      <style jsx global>{`
        @keyframes cardSweep {
          0%,
          64%,
          100% {
            transform: translateX(0) skewX(-16deg);
            opacity: 0;
          }
          72% {
            opacity: 0.45;
          }
          88% {
            transform: translateX(320%) skewX(-16deg);
            opacity: 0.06;
          }
        }

        @keyframes metalSweep {
          0% {
            transform: translateX(-35%);
          }
          100% {
            transform: translateX(35%);
          }
        }
      `}</style>
    </main>
  );
}
