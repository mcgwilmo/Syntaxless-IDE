import type { SupabaseClient } from "@supabase/supabase-js";

export type SubscriptionTier = "free" | "plus" | "student" | "pro";
export type IdeModeName = "strict" | "standard" | "abstraction" | "problem_solving" | "vibe";
export type LayoutName = "minimalist" | "normal" | "developer";

export type SubscriptionRecord = {
  user_id: string;
  tier: SubscriptionTier;
  billing_status: "active" | "inactive" | "canceled";
  school_email: string | null;
  school_domain: string | null;
  is_edu_email: boolean;
  partnered_school_eligible: boolean;
  partnered_school_verified: boolean;
  created_at?: string;
  updated_at?: string;
};

export const PARTNERED_SCHOOL_DOMAINS = ["mit.edu"] as const;

export const SUBSCRIPTION_META: Record<
  SubscriptionTier,
  {
    label: string;
    description: string;
    monthlyPrice: number;
    projectLimit: number | null;
    synthFileLimit: number | null;
    allowedModes: IdeModeName[];
    allowedLayouts: LayoutName[];
    generatedPython: boolean;
  }
> = {
  free: {
    label: "Free",
    description:
      "Strict only, Minimalist only, and a lightweight starter experience.",
    monthlyPrice: 0,
    projectLimit: 10,
    synthFileLimit: 1,
    allowedModes: ["strict"],
    allowedLayouts: ["minimalist"],
    generatedPython: false,
  },
  plus: {
    label: "Plus",
    description:
      "More room for projects, more IDE modes, including Problem Solving, and access to the normal layout.",
    monthlyPrice: 17.99,
    projectLimit: 50,
    synthFileLimit: 10,
    allowedModes: ["strict", "standard", "abstraction", "problem_solving"],
    allowedLayouts: ["minimalist", "normal"],
    generatedPython: true,
  },
  student: {
    label: "Student",
    description:
      "Problem Solving mode for student workflows, discounted for .edu users, and free for verified partner schools.",
    monthlyPrice: 8.99,
    projectLimit: 50,
    synthFileLimit: 10,
    allowedModes: ["problem_solving"],
    allowedLayouts: ["minimalist", "normal"],
    generatedPython: true,
  },
  pro: {
    label: "Pro",
    description:
      "Everything unlocked, including Problem Solving, Vibe mode, Developer layout, and unlimited scale.",
    monthlyPrice: 34.99,
    projectLimit: null,
    synthFileLimit: null,
    allowedModes: ["strict", "standard", "abstraction", "problem_solving", "vibe"],
    allowedLayouts: ["minimalist", "normal", "developer"],
    generatedPython: true,
  },
};

export function normalizeTier(value: unknown): SubscriptionTier {
  if (value === "plus" || value === "student" || value === "pro") return value;
  return "free";
}

export function getEmailDomain(email?: string | null): string {
  if (!email || !email.includes("@")) return "";
  return email.split("@")[1].trim().toLowerCase();
}

export function isEduEmail(email?: string | null): boolean {
  const domain = getEmailDomain(email);
  return domain.endsWith(".edu");
}

export function isPartneredSchoolEmail(email?: string | null): boolean {
  const domain = getEmailDomain(email);
  return PARTNERED_SCHOOL_DOMAINS.includes(
    domain as (typeof PARTNERED_SCHOOL_DOMAINS)[number]
  );
}

export function buildDefaultSubscriptionSeed(userId: string, email?: string | null) {
  const domain = getEmailDomain(email);

  return {
    user_id: userId,
    tier: "free" as const,
    billing_status: "active" as const,
    school_email: email ?? null,
    school_domain: domain || null,
    is_edu_email: isEduEmail(email),
    partnered_school_eligible: isPartneredSchoolEmail(email),
    partnered_school_verified: false,
  };
}

export function normalizeSubscriptionRecord(
  row: Partial<SubscriptionRecord> | null | undefined,
  fallbackEmail?: string | null
): SubscriptionRecord {
  const email = row?.school_email ?? fallbackEmail ?? null;
  const domain = row?.school_domain ?? (getEmailDomain(email) || null);

  return {
    user_id: typeof row?.user_id === "string" ? row.user_id : "",
    tier: normalizeTier(row?.tier),
    billing_status:
      row?.billing_status === "inactive" || row?.billing_status === "canceled"
        ? row.billing_status
        : "active",
    school_email: email,
    school_domain: domain,
    is_edu_email:
      typeof row?.is_edu_email === "boolean" ? row.is_edu_email : isEduEmail(email),
    partnered_school_eligible:
      typeof row?.partnered_school_eligible === "boolean"
        ? row.partnered_school_eligible
        : isPartneredSchoolEmail(email),
    partnered_school_verified:
      typeof row?.partnered_school_verified === "boolean"
        ? row.partnered_school_verified
        : false,
    created_at: typeof row?.created_at === "string" ? row.created_at : undefined,
    updated_at: typeof row?.updated_at === "string" ? row.updated_at : undefined,
  };
}

export async function getOrCreateSubscription(
  supabase: SupabaseClient,
  userId: string,
  email?: string | null
): Promise<SubscriptionRecord> {
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    const seed = buildDefaultSubscriptionSeed(userId, email);
    const { data: inserted, error: insertError } = await supabase
      .from("user_subscriptions")
      .insert(seed)
      .select("*")
      .single();

    if (insertError) {
      throw insertError;
    }

    return normalizeSubscriptionRecord(inserted, email);
  }

  const normalized = normalizeSubscriptionRecord(data, email);
  const nextDomain = getEmailDomain(email);

  const needsSync =
    normalized.school_email !== (email ?? null) ||
    normalized.school_domain !== (nextDomain || null) ||
    normalized.is_edu_email !== isEduEmail(email) ||
    normalized.partnered_school_eligible !== isPartneredSchoolEmail(email);

  if (!needsSync) {
    return normalized;
  }

  const { data: updated, error: updateError } = await supabase
    .from("user_subscriptions")
    .update({
      school_email: email ?? null,
      school_domain: nextDomain || null,
      is_edu_email: isEduEmail(email),
      partnered_school_eligible: isPartneredSchoolEmail(email),
    })
    .eq("user_id", userId)
    .select("*")
    .single();

  if (updateError) {
    throw updateError;
  }

  return normalizeSubscriptionRecord(updated, email);
}

export function getProjectLimit(tier: SubscriptionTier): number | null {
  return SUBSCRIPTION_META[tier].projectLimit;
}

export function getSynthFileLimit(tier: SubscriptionTier): number | null {
  return SUBSCRIPTION_META[tier].synthFileLimit;
}

export function getProjectLimitLabel(tier: SubscriptionTier): string {
  const limit = getProjectLimit(tier);
  return limit === null ? "Unlimited" : `${limit}`;
}

export function getSynthFileLimitLabel(tier: SubscriptionTier): string {
  const limit = getSynthFileLimit(tier);
  return limit === null ? "Unlimited" : `${limit}`;
}

export function canCreateProject(tier: SubscriptionTier, currentProjectCount: number): boolean {
  const limit = getProjectLimit(tier);
  return limit === null || currentProjectCount < limit;
}

export function tierAllowsMode(tier: SubscriptionTier, mode: IdeModeName): boolean {
  return SUBSCRIPTION_META[tier].allowedModes.includes(mode);
}

export function tierAllowsLayout(tier: SubscriptionTier, layout: LayoutName): boolean {
  return SUBSCRIPTION_META[tier].allowedLayouts.includes(layout);
}

export function getTierPriceLabel(
  tier: SubscriptionTier,
  email?: string | null,
  subscription?: Partial<SubscriptionRecord> | null
): string {
  if (tier === "free") return "Free";
  if (tier === "plus") return "$17.99 / month";
  if (tier === "pro") return "$34.99 / month";

  const partnered = isPartneredSchoolEmail(email);
  const verified = !!subscription?.partnered_school_verified;

  if (partnered && verified) {
    return "Free after verification";
  }

  return "$8.99 / month";
}
