import { describe, expect, it } from "vitest";
import {
  SUBSCRIPTION_META,
  canCreateProject,
  getEmailDomain,
  getProjectLimit,
  getProjectLimitLabel,
  getSynthFileLimit,
  getSynthFileLimitLabel,
  getTierPriceLabel,
  isEduEmail,
  isPartneredSchoolEmail,
  normalizeTier,
  tierAllowsLayout,
  tierAllowsMode,
  type IdeModeName,
  type LayoutName,
  type SubscriptionTier,
} from "./subscriptions";

/*
 * Tier gating.
 *
 * The interesting failure here is failing *open* -- letting a tier reach
 * something it did not pay for. `normalizeTier` takes `unknown`, straight off
 * a Supabase row, so it is the point where a null, a typo, or a stale value
 * becomes a tier.
 *
 * The mode matrix is also implemented a second time in the backend, at
 * app/platform/subscription_gate.py. Two copies of one policy drift unless
 * something notices, so both repos assert the same literal table -- change one
 * without the other and a test fails on the side that was forgotten.
 */

const ALL_TIERS: SubscriptionTier[] = ["free", "plus", "student", "pro"];
const ALL_MODES: IdeModeName[] = [
  "strict",
  "standard",
  "abstraction",
  "problem_solving",
  "vibe",
];
const ALL_LAYOUTS: LayoutName[] = ["minimalist", "normal", "developer"];

// Transcribed from the product's tier table, not read back out of
// SUBSCRIPTION_META -- deriving it would make the test agree with any change.
const EXPECTED_MODES: Record<SubscriptionTier, IdeModeName[]> = {
  free: ["strict"],
  plus: ["strict", "standard", "abstraction", "problem_solving"],
  student: ["problem_solving"],
  pro: ["strict", "standard", "abstraction", "problem_solving", "vibe"],
};

const EXPECTED_LAYOUTS: Record<SubscriptionTier, LayoutName[]> = {
  free: ["minimalist"],
  plus: ["minimalist", "normal"],
  student: ["minimalist", "normal"],
  pro: ["minimalist", "normal", "developer"],
};

describe("the tier matrix", () => {
  it.each(ALL_TIERS)("%s allows exactly the modes it should", (tier) => {
    expect(SUBSCRIPTION_META[tier].allowedModes).toEqual(EXPECTED_MODES[tier]);
  });

  it.each(ALL_TIERS)("%s allows exactly the layouts it should", (tier) => {
    expect(SUBSCRIPTION_META[tier].allowedLayouts).toEqual(EXPECTED_LAYOUTS[tier]);
  });

  it("only Pro reaches vibe", () => {
    // Vibe skips governance on the backend. This is the paywall that is also
    // a safety boundary.
    const withVibe = ALL_TIERS.filter((tier) => tierAllowsMode(tier, "vibe"));
    expect(withVibe).toEqual(["pro"]);
  });

  it("only Pro reaches the developer layout", () => {
    expect(ALL_TIERS.filter((tier) => tierAllowsLayout(tier, "developer"))).toEqual(["pro"]);
  });

  it("every tier can reach at least one mode and one layout", () => {
    for (const tier of ALL_TIERS) {
      expect(SUBSCRIPTION_META[tier].allowedModes.length).toBeGreaterThan(0);
      expect(SUBSCRIPTION_META[tier].allowedLayouts.length).toBeGreaterThan(0);
    }
  });

  it("free does not get generated Python", () => {
    expect(SUBSCRIPTION_META.free.generatedPython).toBe(false);
  });
});

describe("tierAllowsMode / tierAllowsLayout", () => {
  it.each(ALL_TIERS.flatMap((tier) => ALL_MODES.map((mode) => [tier, mode] as const)))(
    "%s + %s matches the matrix",
    (tier, mode) => {
      expect(tierAllowsMode(tier, mode)).toBe(EXPECTED_MODES[tier].includes(mode));
    }
  );

  it.each(ALL_TIERS.flatMap((tier) => ALL_LAYOUTS.map((l) => [tier, l] as const)))(
    "%s + %s matches the matrix",
    (tier, layout) => {
      expect(tierAllowsLayout(tier, layout)).toBe(EXPECTED_LAYOUTS[tier].includes(layout));
    }
  );

  it("denies a mode that is not in the table at all", () => {
    expect(tierAllowsMode("pro", "root" as IdeModeName)).toBe(false);
  });
});

describe("normalizeTier", () => {
  it.each(["plus", "student", "pro"] as const)("passes %s through", (tier) => {
    expect(normalizeTier(tier)).toBe(tier);
  });

  it.each([
    null,
    undefined,
    "",
    "Pro",
    "PRO",
    " pro ",
    "enterprise",
    0,
    1,
    true,
    {},
    [],
    { tier: "pro" },
  ])("falls back to free for %p", (value) => {
    // Everything unrecognized lands on the most restrictive plan. A tier that
    // failed open would hand out vibe for free.
    expect(normalizeTier(value)).toBe("free");
  });

  it("is case-sensitive on purpose, and the fallback catches the rest", () => {
    expect(normalizeTier("Pro")).toBe("free");
    expect(tierAllowsMode(normalizeTier("Pro"), "vibe")).toBe(false);
  });
});

describe("project limits", () => {
  it("reports the per-tier caps", () => {
    expect(getProjectLimit("free")).toBe(10);
    expect(getProjectLimit("plus")).toBe(50);
    expect(getProjectLimit("student")).toBe(50);
    expect(getProjectLimit("pro")).toBeNull();
  });

  it("reports the per-tier synth file caps", () => {
    expect(getSynthFileLimit("free")).toBe(1);
    expect(getSynthFileLimit("plus")).toBe(10);
    expect(getSynthFileLimit("student")).toBe(10);
    expect(getSynthFileLimit("pro")).toBeNull();
  });

  it("allows creating up to but not past the cap", () => {
    expect(canCreateProject("free", 9)).toBe(true);
    expect(canCreateProject("free", 10)).toBe(false);
    expect(canCreateProject("free", 11)).toBe(false);
  });

  it("treats null as unlimited rather than as zero", () => {
    // `limit === null` short-circuits. If it ever became a falsy check,
    // Pro would be capped at nothing.
    expect(canCreateProject("pro", 0)).toBe(true);
    expect(canCreateProject("pro", 100_000)).toBe(true);
  });

  it("labels an absent cap as Unlimited", () => {
    expect(getProjectLimitLabel("pro")).toBe("Unlimited");
    expect(getSynthFileLimitLabel("pro")).toBe("Unlimited");
    expect(getProjectLimitLabel("free")).toBe("10");
    expect(getSynthFileLimitLabel("free")).toBe("1");
  });
});

describe("email classification", () => {
  it.each([
    ["student@mit.edu", "mit.edu"],
    ["Student@MIT.EDU", "mit.edu"],
    ["a@b.co.uk", "b.co.uk"],
    ["  spaced@example.com", "example.com"],
  ])("reads the domain of %s", (email, domain) => {
    expect(getEmailDomain(email)).toBe(domain);
  });

  it.each([null, undefined, "", "no-at-sign", "@"])(
    "returns an empty domain for %p",
    (email) => {
      expect(getEmailDomain(email)).toBe("");
    }
  );

  it("recognises .edu addresses", () => {
    expect(isEduEmail("s@mit.edu")).toBe(true);
    expect(isEduEmail("s@sub.school.edu")).toBe(true);
  });

  it("does not treat .edu inside a domain as a .edu address", () => {
    // edu.example.com is not a school, and neither is notedu.com.
    expect(isEduEmail("s@edu.example.com")).toBe(false);
    expect(isEduEmail("s@example.com")).toBe(false);
  });

  it("recognises a partnered school only by exact domain", () => {
    expect(isPartneredSchoolEmail("s@mit.edu")).toBe(true);
    expect(isPartneredSchoolEmail("s@MIT.edu")).toBe(true);
    // Anyone can register mit.edu.attacker.com.
    expect(isPartneredSchoolEmail("s@mit.edu.attacker.com")).toBe(false);
    expect(isPartneredSchoolEmail("s@notmit.edu")).toBe(false);
  });

  it.each([null, undefined, ""])("classifies %p as neither", (email) => {
    expect(isEduEmail(email)).toBe(false);
    expect(isPartneredSchoolEmail(email)).toBe(false);
  });
});

describe("getTierPriceLabel", () => {
  it("names the flat prices", () => {
    expect(getTierPriceLabel("free")).toBe("Free");
    expect(getTierPriceLabel("plus")).toBe("$17.99 / month");
    expect(getTierPriceLabel("pro")).toBe("$34.99 / month");
  });

  it("quotes the student price by default", () => {
    expect(getTierPriceLabel("student", "s@example.com")).toBe("$8.99 / month");
  });

  it("only promises free after verification once verification happened", () => {
    // A partnered domain alone is a claim, not a verification.
    expect(getTierPriceLabel("student", "s@mit.edu")).toBe("$8.99 / month");
    expect(
      getTierPriceLabel("student", "s@mit.edu", { partnered_school_verified: true })
    ).toBe("Free after verification");
  });

  it("does not give a non-partnered address the partnered price", () => {
    expect(
      getTierPriceLabel("student", "s@example.com", { partnered_school_verified: true })
    ).toBe("$8.99 / month");
  });

  it("matches the price in the tier table", () => {
    expect(getTierPriceLabel("plus")).toContain(String(SUBSCRIPTION_META.plus.monthlyPrice));
    expect(getTierPriceLabel("pro")).toContain(String(SUBSCRIPTION_META.pro.monthlyPrice));
  });
});
