"use client";

import Image from "next/image";
import { Suspense, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Editor, { type Monaco } from "@monaco-editor/react";
import type { editor as MonacoEditor } from "monaco-editor";
import { createPortal } from "react-dom";
import {
  getSupabaseBrowserClient,
  getSupabaseSession,
} from "@/lib/supabase/client";
import { ThemeToggleButton, type Theme, useTheme } from "@/components/theme-provider";
import {
  SubscriptionRecord,
  SubscriptionTier,
  SUBSCRIPTION_META,
  getOrCreateSubscription,
  getSynthFileLimit,
  getSynthFileLimitLabel,
  tierAllowsLayout,
  tierAllowsMode,
} from "@/lib/subscriptions";

type InterpretationLine = {
  line_number?: number | null;
  raw: string;
  type: string;
  valid: boolean;
  message: string;
  kind?: string | null;
  intent?: {
    action?: string;
    target?: string;
    value_or_source?: string;
    context?: string;
    confidence_in_intent?: number | null;
  } | null;
  confidence?: number | null;
  specificity_score?: number | null;
  specificity_reasoning?: string | null;
  raw_specificity_score?: number | null;
  raw_specificity_reasoning?: string | null;
  structure_specificity_score?: number | null;
  structure_reasoning?: string | null;
  structure_penalty?: number | null;
  strict_specificity_score?: number | null;
  strict_specificity_reasoning?: string | null;
  strict_specificity_status?: string | null;
  strict_structure_penalty?: number | null;
  ai_message?: string | null;
  logic_risk?: string | null;
  suggested_fix?: string | null;
  generated_code_excerpt?: string | null;
};

type ResolvedInterpretationLine = InterpretationLine & {
  resolvedLineNumber: number | null;
};

type DevMetricStep = {
  key: string;
  label: string;
  status: string;
  duration_ms?: number | null;
};

type DevMetrics = {
  generator_path?: string | null;
  execution_allowed?: boolean | null;
  line_count?: number | null;
  blocked_lines?: number | null;
  warning_lines?: number | null;
  aggregate_specificity?: number | null;
  average_specificity?: number | null;
  raw_aggregate_specificity?: number | null;
  raw_average_specificity?: number | null;
  average_structure_specificity?: number | null;
  average_structure_penalty?: number | null;
  strict_aggregate_specificity?: number | null;
  strict_average_specificity?: number | null;
  strict_average_structure_penalty?: number | null;
  mode_gate_status?: string | null;
  strict_mode_gate_status?: string | null;
  pre_execution_duration_ms?: number | null;
  execution_duration_ms?: number | null;
  total_duration_ms?: number | null;
  runtime_status?: string | null;
  artifact_count?: number | null;
  policy_status?: string | null;
  steps?: DevMetricStep[];
};

type ProblemAlignmentStatus =
  | "on_track"
  | "partial"
  | "logic_mismatch"
  | "missing_constraint"
  | "output_issue"
  | "edge_case_risk";

type ProblemAlignmentIssue = {
  kind: ProblemAlignmentStatus | "partial";
  message: string;
  line_number?: number | null;
  severity?: "warning" | "blocked";
};

type ProblemAlignmentLineNotice = {
  kind: ProblemAlignmentStatus | "partial";
  message: string;
  line_number?: number | null;
  severity?: "warning" | "blocked";
};

type ProblemAlignment = {
  goal_summary: string;
  status: ProblemAlignmentStatus;
  issues: ProblemAlignmentIssue[];
  line_notices: ProblemAlignmentLineNotice[];
  problem_model?: {
    core_goal: string;
    expected_operation: string;
    expected_output_shape: string;
    explicit_constraints: string[];
    implied_edge_cases: string[];
    important_entities: string[];
  } | null;
  active_file_path?: string | null;
};

type IdeMode = "strict" | "standard" | "abstraction" | "problem_solving" | "vibe";
type BottomTab = "terminal" | "validation" | "visual";
type LayoutMode = "minimalist" | "normal" | "developer";

type RunHistoryItem = {
  id: string;
  timestamp: string;
  status: string;
  mode?: IdeMode;
  active_file_path?: string;
  artifact_count?: number;
};

type BackendArtifact = {
  name: string;
  artifact_type: string;
  label: string;
};

type VisualArtifact = {
  name: string;
  artifact_type: string;
  label: string;
  url: string;
  source: "live" | "persisted";
};

type FileNode = {
  id: string;
  type: "file";
  name: string;
  content: string;
};

type FolderNode = {
  id: string;
  type: "folder";
  name: string;
  isOpen: boolean;
  children: ExplorerNode[];
};

type ExplorerNode = FileNode | FolderNode;

type ContextMenuState = {
  x: number;
  y: number;
  nodeId: string;
  nodeType: "file" | "folder";
} | null;

type ToastState = {
  text: string;
  visible: boolean;
};

type UpgradeModalState = {
  open: boolean;
  title: string;
  message: string;
};

type BugReportTargetKind = "ui" | "run";

type BugReportCategory =
  | "incorrect_validation"
  | "wrong_generated_code"
  | "runtime_execution_failure"
  | "visual_artifact_issue"
  | "ide_ui_issue"
  | "performance_timeout"
  | "other";

type BugReportFormValues = {
  category: BugReportCategory;
  title: string;
  description: string;
  expectedBehavior: string;
  reproducible: boolean;
};

const MODE_META: Record<
  IdeMode,
  {
    label: string;
    short: string;
    description: string;
    icon: string;
    border: string;
    glow: string;
    hover: string;
    active: string;
    badge: string;
    accentText: string;
    accentBorder: string;
    accentBg: string;
    accentSoftBg: string;
    accentHoverText: string;
    accentHoverBorder: string;
    accentHoverBg: string;
    accentEditorBar: string;
    accentRing: string;
    accentGlow: string;
    accentSurface: string;
    accentLine: string;
    terminalText: string;
    terminalBorder: string;
  }
> = {
  strict: {
    label: "Strict",
    short: "Free English, but explicit logic/control structure when it matters.",
    description:
      "Strict mode allows natural English, but expects you to be explicit about logic, functions, loops, and control flow when those are important.",
    icon: "◇",
    border: "border-rose-500/25",
    glow: "shadow-[0_0_50px_rgba(244,63,94,0.12)]",
    hover: "hover:border-rose-400/40 hover:bg-rose-500/[0.08]",
    active: "border-rose-400/50 bg-rose-500/[0.14]",
    badge: "text-rose-300",
    accentText: "text-rose-300",
    accentBorder: "border-rose-400/40",
    accentBg: "bg-rose-500/[0.14]",
    accentSoftBg: "bg-rose-500/[0.08]",
    accentHoverText: "hover:text-rose-300",
    accentHoverBorder: "hover:border-rose-400/40",
    accentHoverBg: "hover:bg-rose-500/[0.1]",
    accentEditorBar: "bg-rose-400/80",
    accentRing: "ring-rose-400/30",
    accentGlow: "shadow-[0_0_60px_rgba(244,63,94,0.12)]",
    accentSurface: "from-rose-500/[0.12] to-transparent",
    accentLine: "bg-rose-400/60",
    terminalText: "text-rose-200",
    terminalBorder: "border-t-rose-400",
  },
  standard: {
    label: "Standard",
    short: "Executable English with ordinary inference and no fuss.",
    description:
      "Standard mode allows ordinary English statements and resolves obvious intended meaning without treating routine inference as a problem.",
    icon: "◫",
    border: "border-sky-500/25",
    glow: "shadow-[0_0_50px_rgba(56,189,248,0.12)]",
    hover: "hover:border-sky-400/40 hover:bg-sky-500/[0.08]",
    active: "border-sky-400/50 bg-sky-500/[0.14]",
    badge: "text-sky-300",
    accentText: "text-sky-300",
    accentBorder: "border-sky-400/40",
    accentBg: "bg-sky-500/[0.14]",
    accentSoftBg: "bg-sky-500/[0.08]",
    accentHoverText: "hover:text-sky-300",
    accentHoverBorder: "hover:border-sky-400/40",
    accentHoverBg: "hover:bg-sky-500/[0.1]",
    accentEditorBar: "bg-sky-400/80",
    accentRing: "ring-sky-400/30",
    accentGlow: "shadow-[0_0_60px_rgba(56,189,248,0.14)]",
    accentSurface: "from-sky-500/[0.13] to-transparent",
    accentLine: "bg-sky-400/60",
    terminalText: "text-sky-300",
    terminalBorder: "border-t-sky-400",
  },
  abstraction: {
    label: "Abstraction",
    short: "Executable intent first; implementation detail may be omitted.",
    description:
      "Abstraction mode allows non-specific executable requests and infers methodology/details freely. It mainly blocks non-functional or qualitative requests.",
    icon: "◎",
    border: "border-violet-500/25",
    glow: "shadow-[0_0_50px_rgba(168,85,247,0.12)]",
    hover: "hover:border-violet-400/40 hover:bg-violet-500/[0.08]",
    active: "border-violet-400/50 bg-violet-500/[0.14]",
    badge: "text-violet-300",
    accentText: "text-violet-300",
    accentBorder: "border-violet-400/40",
    accentBg: "bg-violet-500/[0.14]",
    accentSoftBg: "bg-violet-500/[0.08]",
    accentHoverText: "hover:text-violet-300",
    accentHoverBorder: "hover:border-violet-400/40",
    accentHoverBg: "hover:bg-violet-500/[0.1]",
    accentEditorBar: "bg-violet-400/80",
    accentRing: "ring-violet-400/30",
    accentGlow: "shadow-[0_0_60px_rgba(168,85,247,0.14)]",
    accentSurface: "from-violet-500/[0.13] to-transparent",
    accentLine: "bg-violet-400/60",
    terminalText: "text-violet-200",
    terminalBorder: "border-t-violet-400",
  },
  problem_solving: {
    label: "Problem Solving",
    short: "Strict execution rules with live problem-solution alignment.",
    description:
      "Problem Solving mode keeps the governed strict pipeline, but also compares your evolving solution against an attached prompt to catch likely logic and format mismatches.",
    icon: "PS",
    border: "border-amber-500/25",
    glow: "shadow-[0_0_50px_rgba(245,158,11,0.14)]",
    hover: "hover:border-amber-400/40 hover:bg-amber-500/[0.08]",
    active: "border-amber-400/50 bg-amber-500/[0.14]",
    badge: "text-amber-300",
    accentText: "text-amber-300",
    accentBorder: "border-amber-400/40",
    accentBg: "bg-amber-500/[0.14]",
    accentSoftBg: "bg-amber-500/[0.08]",
    accentHoverText: "hover:text-amber-300",
    accentHoverBorder: "hover:border-amber-400/40",
    accentHoverBg: "hover:bg-amber-500/[0.1]",
    accentEditorBar: "bg-amber-400/80",
    accentRing: "ring-amber-400/30",
    accentGlow: "shadow-[0_0_60px_rgba(245,158,11,0.15)]",
    accentSurface: "from-amber-500/[0.13] to-transparent",
    accentLine: "bg-amber-400/60",
    terminalText: "text-amber-200",
    terminalBorder: "border-t-amber-400",
  },
  vibe: {
    label: "Vibe",
    short: "Full high-level prompt-style generation.",
    description:
      "Vibe mode is the loosest mode. High-level requests are allowed and the system may infer substantial structure and implementation details.",
    icon: "✦",
    border: "border-emerald-500/25",
    glow: "shadow-[0_0_50px_rgba(16,185,129,0.12)]",
    hover: "hover:border-emerald-400/40 hover:bg-emerald-500/[0.08]",
    active: "border-emerald-400/50 bg-emerald-500/[0.14]",
    badge: "text-emerald-300",
    accentText: "text-emerald-300",
    accentBorder: "border-emerald-400/40",
    accentBg: "bg-emerald-500/[0.14]",
    accentSoftBg: "bg-emerald-500/[0.08]",
    accentHoverText: "hover:text-emerald-300",
    accentHoverBorder: "hover:border-emerald-400/40",
    accentHoverBg: "hover:bg-emerald-500/[0.1]",
    accentEditorBar: "bg-emerald-400/80",
    accentRing: "ring-emerald-400/30",
    accentGlow: "shadow-[0_0_60px_rgba(16,185,129,0.14)]",
    accentSurface: "from-emerald-500/[0.13] to-transparent",
    accentLine: "bg-emerald-400/60",
    terminalText: "text-emerald-200",
    terminalBorder: "border-t-emerald-400",
  },
};

type TerminalEntry = {
  id: string;
  stream: "stdout" | "stderr" | "system" | "input" | "runtime";
  text: string;
  symbol?: string;
};

const LAYOUT_META: Record<
  LayoutMode,
  {
    label: string;
    short: string;
    detail: string;
    icon: string;
    accentText: string;
    accentBorder: string;
    accentBg: string;
    hover: string;
    glow: string;
    halo: string;
  }
> = {
  minimalist: {
    label: "Minimalist",
    short: "Beginner-friendly. Advanced panes hidden by default.",
    detail: "Core controls first, advanced panes tucked away.",
    icon: "MIN",
    accentText: "text-amber-300",
    accentBorder: "border-amber-400/35",
    accentBg: "bg-amber-500/[0.12]",
    hover: "hover:border-amber-400/40 hover:bg-amber-500/[0.08]",
    glow: "shadow-[0_0_65px_rgba(251,191,36,0.14)]",
    halo: "bg-amber-400/20",
  },
  normal: {
    label: "Normal",
    short: "Balanced full layout.",
    detail: "Balanced visibility for everyday use.",
    icon: "NRM",
    accentText: "text-sky-300",
    accentBorder: "border-sky-400/35",
    accentBg: "bg-sky-500/[0.12]",
    hover: "hover:border-sky-400/40 hover:bg-sky-500/[0.08]",
    glow: "shadow-[0_0_65px_rgba(56,189,248,0.14)]",
    halo: "bg-sky-400/20",
  },
  developer: {
    label: "Developer",
    short: "Everything expanded and visible.",
    detail: "Everything expanded for full control and visibility.",
    icon: "DEV",
    accentText: "text-violet-300",
    accentBorder: "border-violet-400/35",
    accentBg: "bg-violet-500/[0.12]",
    hover: "hover:border-violet-400/40 hover:bg-violet-500/[0.08]",
    glow: "shadow-[0_0_65px_rgba(168,85,247,0.14)]",
    halo: "bg-violet-400/20",
  },
};

const DEV_VISION_PASSWORD = "MatWil.05";
const PAGE_HEADING_CLASS = "font-bold leading-[0.95] tracking-[-0.045em]";

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getProtectedDarkTextStyle(theme: Theme, color: string): CSSProperties | undefined {
  if (theme === "light") return undefined;

  return {
    color,
    WebkitTextFillColor: color,
    opacity: 1,
    forcedColorAdjust: "none",
    colorScheme: "dark",
  };
}

function getProtectedDarkSurfaceStyle(theme: Theme): CSSProperties | undefined {
  if (theme === "light") return undefined;

  return {
    forcedColorAdjust: "none",
    colorScheme: "dark",
  };
}

function getModeAccentRgb(mode: IdeMode) {
  switch (mode) {
    case "strict":
      return "244,63,94";
    case "standard":
      return "56,189,248";
    case "abstraction":
      return "168,85,247";
    case "problem_solving":
      return "245,158,11";
    case "vibe":
      return "16,185,129";
  }
}

function getModeBarGlowStyle(
  theme: Theme,
  mode: IdeMode,
  strength: "soft" | "medium" = "soft",
): CSSProperties {
  const rgb = getModeAccentRgb(mode);
  const isLight = theme === "light";
  const alpha = strength === "medium" ? (isLight ? 0.13 : 0.16) : isLight ? 0.09 : 0.12;
  const depth = strength === "medium" ? 42 : 36;

  return {
    backgroundImage: isLight
      ? `radial-gradient(circle at 12% 50%, rgba(${rgb}, ${alpha}), transparent ${depth}%), linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.92))`
      : `radial-gradient(circle at 12% 50%, rgba(${rgb}, ${alpha}), transparent ${depth}%),
         linear-gradient(180deg, rgba(11,11,11,0.96), rgba(7,7,7,0.94))`,
    backgroundRepeat: "no-repeat",
  };
}

function getModeButtonClass(
  modeMeta: {
    accentBorder: string;
    accentBg: string;
    accentHoverText: string;
    accentHoverBorder: string;
    accentHoverBg: string;
  },
  options?: {
    active?: boolean;
    disabled?: boolean;
    compact?: boolean;
    pill?: boolean;
    danger?: boolean;
  },
  theme: Theme = "dark"
) {
  const { active, disabled, compact, pill, danger } = options ?? {};
  const radiusClass = pill ? "rounded-full" : compact ? "rounded-[1rem]" : "rounded-[1.05rem]";
  const spacingClass = compact ? "px-3 py-1.5 text-[11px]" : "px-3.5 py-2.5 text-[13px]";
  const isLight = theme === "light";

  if (disabled) {
    return joinClasses(
      radiusClass,
      spacingClass,
      "border font-medium tracking-[0.01em] backdrop-blur-md transition-all duration-200",
      isLight
        ? "cursor-not-allowed border-slate-200 bg-white/65 text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
        : "cursor-not-allowed border-white/[0.06] bg-white/[0.03] text-neutral-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
    );
  }

  if (danger) {
    return joinClasses(
      radiusClass,
      spacingClass,
      "border font-medium tracking-[0.01em] backdrop-blur-md transition-all duration-200 hover:-translate-y-[1px]",
      isLight
        ? "border-slate-200 bg-white/90 text-slate-600 shadow-[0_12px_28px_rgba(15,23,42,0.06)] hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 hover:shadow-[0_18px_34px_rgba(244,63,94,0.08)]"
        : "border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.018))] text-neutral-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_12px_28px_rgba(0,0,0,0.22)] hover:border-rose-400/35 hover:bg-rose-500/[0.1] hover:text-rose-100"
    );
  }

  return joinClasses(
    radiusClass,
    spacingClass,
    "border font-medium tracking-[0.01em] backdrop-blur-md transition-all duration-200 hover:-translate-y-[1px]",
    active
      ? isLight
        ? `${modeMeta.accentBorder} ${modeMeta.accentBg} text-slate-900 shadow-[0_16px_36px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.75)]`
        : `${modeMeta.accentBorder} ${modeMeta.accentBg} text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_14px_32px_rgba(0,0,0,0.24)]`
      : isLight
      ? `border-slate-200/90 bg-white/88 text-slate-600 shadow-[0_12px_28px_rgba(15,23,42,0.05)] hover:border-slate-300 hover:bg-white hover:text-slate-900 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)] ${modeMeta.accentHoverBorder} ${modeMeta.accentHoverBg} ${modeMeta.accentHoverText}`
      : `border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.016))] text-neutral-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_12px_28px_rgba(0,0,0,0.22)] hover:border-white/[0.14] hover:text-white ${modeMeta.accentHoverBorder} ${modeMeta.accentHoverBg} ${modeMeta.accentHoverText}`
  );
}

function ensureMonacoThemes(monaco: Monaco) {
  monaco.editor.defineTheme("trace-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#060606",
      "editor.foreground": "#f8fafc",
      "editorLineNumber.foreground": "#6b7280",
      "editorLineNumber.activeForeground": "#f8fafc",
      "editorCursor.foreground": "#7dd3fc",
      "editor.lineHighlightBackground": "#111111",
      "editor.selectionBackground": "#1f2937",
      "editor.inactiveSelectionBackground": "#161b22",
    },
  });

  monaco.editor.defineTheme("trace-light", {
    base: "vs",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#fbfcfe",
      "editor.foreground": "#0f172a",
      "editorLineNumber.foreground": "#94a3b8",
      "editorLineNumber.activeForeground": "#0f172a",
      "editorCursor.foreground": "#2563eb",
      "editor.lineHighlightBackground": "#f1f5f9",
      "editor.selectionBackground": "#dbeafe",
      "editor.inactiveSelectionBackground": "#e2e8f0",
    },
  });
}

type MinimalControlIconName =
  | "run"
  | "check"
  | "stop"
  | "vision"
  | "mode"
  | "layout"
  | "tutorial"
  | "python"
  | "results"
  | "bug"
  | "subscriptions"
  | "signout"
  | "manage"
  | "terminal"
  | "visual"
  | "send";

function MinimalControlIcon({
  name,
  className = "",
}: {
  name: MinimalControlIconName;
  className?: string;
}) {
  const baseClassName = joinClasses("h-[1.05rem] w-[1.05rem]", className);

  switch (name) {
    case "run":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className={baseClassName}
        >
          <path d="M6 4.8a1 1 0 0 1 1.52-.85l8.2 5.2a1 1 0 0 1 0 1.7l-8.2 5.2A1 1 0 0 1 6 15.2V4.8Z" />
        </svg>
      );
    case "check":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <path d="m4.5 10.5 3.5 3.5 7.5-8" />
        </svg>
      );
    case "stop":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className={baseClassName}
        >
          <rect x="5.25" y="5.25" width="9.5" height="9.5" rx="1.75" />
        </svg>
      );
    case "vision":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <path d="M1.8 10s3.1-5 8.2-5 8.2 5 8.2 5-3.1 5-8.2 5-8.2-5-8.2-5Z" />
          <circle cx="10" cy="10" r="2.6" />
        </svg>
      );
    case "mode":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <path d="M4 5.5h12" />
          <path d="M4 10h12" />
          <path d="M4 14.5h12" />
          <circle cx="7" cy="5.5" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="12.5" cy="10" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="9.5" cy="14.5" r="1.6" fill="currentColor" stroke="none" />
        </svg>
      );
    case "layout":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <rect x="3.5" y="4" width="5.5" height="5.5" rx="1.2" />
          <rect x="11" y="4" width="5.5" height="5.5" rx="1.2" />
          <rect x="3.5" y="11" width="5.5" height="5.5" rx="1.2" />
          <rect x="11" y="11" width="5.5" height="5.5" rx="1.2" />
        </svg>
      );
    case "tutorial":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <path d="M5.2 4.5h7.1a2.2 2.2 0 0 1 2.2 2.2v8.8H7.4a2.2 2.2 0 0 0-2.2 2.2V4.5Z" />
          <path d="M5.2 4.5h-.4A2.3 2.3 0 0 0 2.5 6.8v8.7A2.3 2.3 0 0 0 4.8 17.8h9.7" />
          <path d="m9 8.2 2.8 1.8L9 11.8V8.2Z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "python":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <path d="M7.2 5 4.5 10l2.7 5" />
          <path d="M12.8 5 15.5 10l-2.7 5" />
          <path d="M9 15h2" />
          <path d="M9 5h2" />
        </svg>
      );
    case "results":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <rect x="3.5" y="4" width="13" height="4" rx="1.2" />
          <rect x="3.5" y="12" width="13" height="4" rx="1.2" />
        </svg>
      );
    case "bug":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <path d="M7 7.2A3.1 3.1 0 0 1 10 5a3.1 3.1 0 0 1 3 2.2" />
          <path d="M6.4 8.2h7.2v4.1A3.6 3.6 0 0 1 10 15.9a3.6 3.6 0 0 1-3.6-3.6V8.2Z" />
          <path d="M3.8 8.5h2.1" />
          <path d="M14.1 8.5h2.1" />
          <path d="M4.7 13.1 6.3 12" />
          <path d="m15.3 13.1-1.6-1.1" />
          <path d="M7.6 4.1 6.4 2.9" />
          <path d="m12.4 4.1 1.2-1.2" />
        </svg>
      );
    case "subscriptions":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <rect x="3.5" y="5" width="13" height="10" rx="1.8" />
          <path d="M3.5 8.5h13" />
          <path d="M7 12h2.5" />
        </svg>
      );
    case "signout":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <path d="M8 4.5H5.8A1.8 1.8 0 0 0 4 6.3v7.4a1.8 1.8 0 0 0 1.8 1.8H8" />
          <path d="M11 6.5 16 10l-5 3.5" />
          <path d="M15.5 10H8" />
        </svg>
      );
    case "manage":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <circle cx="10" cy="10" r="2.2" />
          <path d="M10 3.7v1.5" />
          <path d="M10 14.8v1.5" />
          <path d="m5.5 5.5 1.1 1.1" />
          <path d="m13.4 13.4 1.1 1.1" />
          <path d="M3.7 10h1.5" />
          <path d="M14.8 10h1.5" />
          <path d="m5.5 14.5 1.1-1.1" />
          <path d="m13.4 6.6 1.1-1.1" />
        </svg>
      );
    case "terminal":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <rect x="3.5" y="4.5" width="13" height="11" rx="1.6" />
          <path d="m6.5 8 2 2-2 2" />
          <path d="M10.7 12h2.8" />
        </svg>
      );
    case "visual":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <rect x="3.5" y="4.5" width="13" height="11" rx="1.6" />
          <circle cx="8" cy="8.2" r="1.4" />
          <path d="m6.5 13 2.7-2.8 2.1 2 2.2-2.3 1.9 3.1" />
        </svg>
      );
    case "send":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={baseClassName}
        >
          <path d="M4 10h10.5" />
          <path d="m10.5 5 5 5-5 5" />
        </svg>
      );
  }
}

function MinimalIconLabel({
  icon,
  label,
  count,
}: {
  icon: MinimalControlIconName;
  label: string;
  count?: number;
}) {
  return (
    <span className="inline-flex items-center justify-center gap-1.5">
      <MinimalControlIcon name={icon} />
      {typeof count === "number" && count > 0 ? (
        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-1.5 py-[1px] text-[9px] leading-none text-neutral-300">
          {count}
        </span>
      ) : null}
      <span className="sr-only">{label}</span>
    </span>
  );
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function createStarterTree(): ExplorerNode[] {
  return [
    {
      id: uid("folder"),
      type: "folder",
      name: "root",
      isOpen: true,
      children: [
        {
          id: uid("file"),
          type: "file",
          name: "main.synth",
          content: `here is a list of numbers 9, 3, 12, 1, 5
sort the numbers
print the numbers`,
        },
      ],
    },
  ];
}

function toWsUrl(url: string) {
  if (url.startsWith("https://")) return url.replace("https://", "wss://");
  if (url.startsWith("http://")) return url.replace("http://", "ws://");
  return url;
}

function describeBackendConnectionError(error: unknown, backendUrl: string) {
  if (error instanceof TypeError) {
    return `Could not reach the backend at ${backendUrl}.\nMake sure the backend server is running and that CORS allows this frontend origin.\n`;
  }

  if (error instanceof Error) {
    return `${error.message}\n`;
  }

  return "Error talking to backend.\n";
}

function formatRunTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDurationMs(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Pending";
  if (value < 1000) return `${value.toFixed(value >= 100 ? 0 : 1)} ms`;
  return `${(value / 1000).toFixed(value >= 10000 ? 0 : 2)} s`;
}

function formatScore(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "n/a";
  return `${Math.round(value * 100)}%`;
}

function formatIntentLabel(line: InterpretationLine) {
  const intent = line.intent;
  if (!intent && !line.kind) return "Intent unavailable";
  if (!intent) return humanizeType(line.kind || "unknown");

  const action = intent.action ? humanizeType(intent.action) : humanizeType(line.kind || "unknown");
  const target = intent.target?.trim();
  const source = intent.value_or_source?.trim();

  if (target && source) return `${action} ${target} <- ${source}`;
  if (target) return `${action} ${target}`;
  if (source) return `${action} ${source}`;
  return action;
}

function terminalStreamLabel(stream: TerminalEntry["stream"]) {
  if (stream === "stdout") return "Output";
  if (stream === "stderr") return "Error";
  if (stream === "input") return "Input";
  if (stream === "runtime") return "Runtime";
  return "System";
}

function getDevStepStatusClass(status: string, theme: Theme = "dark") {
  const isLight = theme === "light";
  if (status === "completed" || status === "success") {
    return isLight
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  }
  if (status === "running") {
    return isLight
      ? "border-sky-200 bg-sky-50 text-sky-700"
      : "border-sky-500/30 bg-sky-500/10 text-sky-200";
  }
  if (status === "blocked" || status === "error" || status === "timeout" || status === "stopped") {
    return isLight
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-rose-500/30 bg-rose-500/10 text-rose-200";
  }
  if (status === "skipped") {
    return isLight
      ? "border-slate-200 bg-slate-50 text-slate-600"
      : "border-neutral-700 bg-white/[0.03] text-neutral-400";
  }
  return isLight
    ? "border-amber-200 bg-amber-50 text-amber-700"
    : "border-amber-500/30 bg-amber-500/10 text-amber-200";
}

function getCompatibilityClass(status: string | null | undefined, theme: Theme = "dark") {
  const isLight = theme === "light";
  if (status === "valid" || status === "compatible") {
    return isLight
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  }
  if (status === "warning") {
    return isLight
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-amber-500/30 bg-amber-500/10 text-amber-200";
  }
  if (status === "blocked" || status === "incompatible") {
    return isLight
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-rose-500/30 bg-rose-500/10 text-rose-200";
  }
  return isLight
    ? "border-slate-200 bg-slate-50 text-slate-600"
    : "border-neutral-700 bg-white/[0.03] text-neutral-400";
}

function getSeverity(line: InterpretationLine): "ok" | "warning" | "blocked" {
  if (!line.valid) return "blocked";
  if (line.type === "warning") return "warning";
  return "ok";
}

function normalizeLineNumber(value: number | null | undefined, maxLineNumber: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const normalized = Math.trunc(value);
  if (normalized < 1 || normalized > maxLineNumber) return null;
  return normalized;
}

function resolveInterpretationLines(
  document: string,
  lines: InterpretationLine[]
): ResolvedInterpretationLine[] {
  const sourceLines = document.split(/\r?\n/);
  let searchStart = 0;

  return lines.map((line) => {
    const explicitLineNumber = normalizeLineNumber(line.line_number, sourceLines.length);
    if (explicitLineNumber) {
      searchStart = Math.max(searchStart, explicitLineNumber);
      return {
        ...line,
        resolvedLineNumber: explicitLineNumber,
      };
    }

    const target = line.raw.trim();
    if (!target) {
      return {
        ...line,
        resolvedLineNumber: null,
      };
    }

    for (let index = searchStart; index < sourceLines.length; index += 1) {
      if (sourceLines[index]?.trim() === target) {
        searchStart = index + 1;
        return {
          ...line,
          resolvedLineNumber: index + 1,
        };
      }
    }

    for (let index = 0; index < searchStart; index += 1) {
      if (sourceLines[index]?.trim() === target) {
        return {
          ...line,
          resolvedLineNumber: index + 1,
        };
      }
    }

    return {
      ...line,
      resolvedLineNumber: null,
    };
  });
}

function humanizeType(type: string) {
  return type.replaceAll("_", " ");
}

function normalizeProblemStatement(value: string) {
  return value.replace(/\r\n?/g, "\n").trim();
}

function deriveProblemPreview(problemStatement: string) {
  const normalized = normalizeProblemStatement(problemStatement);
  if (!normalized) return "Attach a prompt to let the IDE track problem-solution alignment.";

  const lowered = normalized.toLowerCase();

  if (/\b(maximum|max|largest|highest)\b/.test(lowered)) {
    return "Find the maximum value and output one final result.";
  }
  if (/\b(minimum|min|smallest|lowest)\b/.test(lowered)) {
    return "Find the minimum value and output one final result.";
  }
  if (/\b(sum|total)\b/.test(lowered)) {
    return "Compute the total and output the final value.";
  }
  if (/\b(count|how many|number of)\b/.test(lowered)) {
    return "Count the requested matches and output the count.";
  }
  if (/\b(sort|ascending|descending|order)\b/.test(lowered)) {
    return "Order the input correctly and output the ordered result.";
  }
  if (/\b(find|search|index|locate)\b/.test(lowered)) {
    return "Locate the requested target and output the answer in the required format.";
  }

  const firstLine = normalized.split("\n").find((line) => line.trim()) || normalized;
  return firstLine.length > 88 ? `${firstLine.slice(0, 85)}...` : firstLine;
}

function getProblemStatusLabel(status: ProblemAlignmentStatus | "awaiting_check") {
  if (status === "on_track") return "On Track";
  if (status === "partial") return "Partial";
  if (status === "logic_mismatch") return "Logic Mismatch";
  if (status === "missing_constraint") return "Missing Constraint";
  if (status === "output_issue") return "Output Issue";
  if (status === "edge_case_risk") return "Edge Case Risk";
  return "Awaiting Check";
}

function getProblemStatusClass(
  status: ProblemAlignmentStatus | "awaiting_check",
  theme: Theme = "dark"
) {
  const isLight = theme === "light";

  if (status === "on_track") {
    return isLight
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-amber-400/30 bg-amber-500/10 text-amber-200";
  }
  if (status === "logic_mismatch") {
    return isLight
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-rose-500/30 bg-rose-500/10 text-rose-200";
  }
  if (status === "missing_constraint") {
    return isLight
      ? "border-orange-200 bg-orange-50 text-orange-700"
      : "border-orange-500/30 bg-orange-500/10 text-orange-200";
  }
  if (status === "output_issue") {
    return isLight
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-amber-500/30 bg-amber-500/10 text-amber-200";
  }
  if (status === "edge_case_risk") {
    return isLight
      ? "border-yellow-200 bg-yellow-50 text-yellow-700"
      : "border-yellow-500/30 bg-yellow-500/10 text-yellow-200";
  }
  if (status === "partial") {
    return isLight
      ? "border-slate-200 bg-white text-slate-700"
      : "border-neutral-700 bg-white/[0.03] text-neutral-200";
  }
  return isLight
    ? "border-slate-200 bg-white text-slate-500"
    : "border-neutral-800 bg-white/[0.03] text-neutral-400";
}

function getProblemNoticeSeverity(
  notice: Pick<ProblemAlignmentLineNotice, "severity" | "kind">
): "warning" | "blocked" {
  if (notice.severity === "blocked") return "blocked";
  if (notice.kind === "logic_mismatch" || notice.kind === "missing_constraint") return "blocked";
  return "warning";
}

function buildArtifactUrl(
  baseUrl: string,
  projectId: string,
  runId: string,
  artifactName: string,
  cacheKey?: string
) {
  const params = new URLSearchParams({
    project_id: projectId,
  });

  if (cacheKey) {
    params.set("v", cacheKey);
  }

  return `${baseUrl}/run/${encodeURIComponent(runId)}/artifacts/${encodeURIComponent(
    artifactName
  )}?${params.toString()}`;
}

function convertArtifactsToVisuals(
  baseUrl: string,
  projectId: string,
  runId: string,
  artifacts: BackendArtifact[] | undefined,
  source: "live" | "persisted",
  cacheKey?: string
): VisualArtifact[] {
  return (artifacts || []).map((artifact) => ({
    name: artifact.name,
    artifact_type: artifact.artifact_type,
    label: artifact.label,
    url: buildArtifactUrl(baseUrl, projectId, runId, artifact.name, cacheKey),
    source,
  }));
}

function isSynthFileName(name: string) {
  return name.toLowerCase().endsWith(".synth");
}

function countSynthFiles(nodes: ExplorerNode[]): number {
  let count = 0;

  for (const node of nodes) {
    if (node.type === "file") {
      if (isSynthFileName(node.name)) count += 1;
    } else {
      count += countSynthFiles(node.children);
    }
  }

  return count;
}

function countSynthFilesInNode(node: ExplorerNode): number {
  if (node.type === "file") {
    return isSynthFileName(node.name) ? 1 : 0;
  }

  return countSynthFiles(node.children);
}

function getDefaultModeForTier(tier: SubscriptionTier): IdeMode {
  return SUBSCRIPTION_META[tier].allowedModes[0] as IdeMode;
}

function resolveModeForTier(tier: SubscriptionTier, requestedMode?: IdeMode | null): IdeMode {
  if (requestedMode && tierAllowsMode(tier, requestedMode)) return requestedMode;
  return getDefaultModeForTier(tier);
}

function parseRequestedMode(value: string | null): IdeMode | null {
  if (
    value === "strict" ||
    value === "standard" ||
    value === "abstraction" ||
    value === "problem_solving" ||
    value === "vibe"
  ) {
    return value;
  }

  return null;
}

function getDefaultLayoutForTier(tier: SubscriptionTier): LayoutMode {
  if (tier === "free") return "minimalist";
  if (tier === "plus" || tier === "student") return "normal";
  return "developer";
}

function getLockedModeReason(tier: SubscriptionTier, mode: IdeMode) {
  if (tier === "free") {
    return `${MODE_META[mode].label} mode is locked on the Free plan. Upgrade your subscription to access more IDE modes.`;
  }

  if (tier === "student") {
    return "Student accounts are limited to Problem Solving mode.";
  }

  if (tier === "plus" && mode === "vibe") {
    return "Vibe mode is only available on the Pro plan. Upgrade your subscription to unlock it.";
  }

  return `${MODE_META[mode].label} mode is not available on your current subscription plan.`;
}

function getLockedLayoutReason(tier: SubscriptionTier, layout: LayoutMode) {
  if (tier === "free") {
    return `${LAYOUT_META[layout].label} layout is locked on the Free plan. Upgrade your subscription to access more workspace layouts.`;
  }

  if ((tier === "plus" || tier === "student") && layout === "developer") {
    return "Developer layout is only available on the Pro plan. Upgrade your subscription to unlock it.";
  }

  return `${LAYOUT_META[layout].label} layout is not available on your current subscription plan.`;
}

function InfoTooltip({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  const { isLight } = useTheme();
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  function updatePosition() {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = 288;
    const margin = 12;
    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));
    const top = rect.bottom + 10;
    setPos({ top, left });
  }

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-flex"
        onMouseEnter={() => {
          updatePosition();
          setOpen(true);
        }}
        onMouseLeave={() => setOpen(false)}
      >
        <div
          className={`flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-medium transition-colors duration-200 ${
            isLight
              ? "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900"
              : "border-neutral-700 bg-[#101010] text-neutral-400 hover:border-neutral-500 hover:text-white"
          }`}
        >
          i
        </div>
      </div>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={`pointer-events-none fixed z-[300] w-72 rounded-2xl border px-3 py-2 text-xs leading-5 shadow-[0_12px_50px_rgba(0,0,0,0.18)] backdrop-blur-md ${
              isLight
                ? "border-slate-200 bg-white/95 text-slate-600"
                : "border-neutral-800 bg-[#0a0a0a]/95 text-neutral-300 shadow-[0_12px_50px_rgba(0,0,0,0.45)]"
            }`}
            style={{ top: pos.top, left: pos.left }}
          >
            <div
              className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                isLight ? "text-slate-400" : "text-neutral-500"
              }`}
            >
              {label}
            </div>
            <div>{description}</div>
          </div>,
          document.body
        )}
    </>
  );
}

function findNodeById(nodes: ExplorerNode[], targetId: string): ExplorerNode | null {
  for (const node of nodes) {
    if (node.id === targetId) return node;
    if (node.type === "folder") {
      const found = findNodeById(node.children, targetId);
      if (found) return found;
    }
  }
  return null;
}

function findFirstFileId(nodes: ExplorerNode[]): string | null {
  for (const node of nodes) {
    if (node.type === "file") return node.id;
    if (node.type === "folder") {
      const nested = findFirstFileId(node.children);
      if (nested) return nested;
    }
  }
  return null;
}

function updateNodeById(
  nodes: ExplorerNode[],
  targetId: string,
  updater: (node: ExplorerNode) => ExplorerNode
): ExplorerNode[] {
  return nodes.map((node) => {
    if (node.id === targetId) return updater(node);
    if (node.type === "folder") {
      return {
        ...node,
        children: updateNodeById(node.children, targetId, updater),
      };
    }
    return node;
  });
}

function removeNodeById(nodes: ExplorerNode[], targetId: string): ExplorerNode[] {
  const result: ExplorerNode[] = [];
  for (const node of nodes) {
    if (node.id === targetId) continue;
    if (node.type === "folder") {
      result.push({
        ...node,
        children: removeNodeById(node.children, targetId),
      });
    } else {
      result.push(node);
    }
  }
  return result;
}

function duplicateNode(node: ExplorerNode): ExplorerNode {
  if (node.type === "file") {
    const parts = node.name.split(".");
    const extension = parts.length > 1 ? `.${parts.pop()}` : "";
    const base = parts.join(".") || node.name;
    return {
      ...node,
      id: uid("file"),
      name: `${base}_copy${extension}`,
    };
  }
  return {
    ...node,
    id: uid("folder"),
    name: `${node.name}_copy`,
    children: node.children.map((child) => duplicateNode(child)),
  };
}

function insertSiblingAfterId(
  nodes: ExplorerNode[],
  targetId: string,
  newNode: ExplorerNode
): ExplorerNode[] {
  const output: ExplorerNode[] = [];
  for (const node of nodes) {
    output.push(
      node.type === "folder"
        ? { ...node, children: insertSiblingAfterId(node.children, targetId, newNode) }
        : node
    );
    if (node.id === targetId) output.push(newNode);
  }
  return output;
}

function addChildToFolder(
  nodes: ExplorerNode[],
  folderId: string,
  child: ExplorerNode
): ExplorerNode[] {
  return nodes.map((node) => {
    if (node.id === folderId && node.type === "folder") {
      return {
        ...node,
        isOpen: true,
        children: [...node.children, child],
      };
    }
    if (node.type === "folder") {
      return {
        ...node,
        children: addChildToFolder(node.children, folderId, child),
      };
    }
    return node;
  });
}

function setAllFoldersOpen(nodes: ExplorerNode[], isOpen: boolean): ExplorerNode[] {
  return nodes.map((node) => {
    if (node.type === "folder") {
      return {
        ...node,
        isOpen,
        children: setAllFoldersOpen(node.children, isOpen),
      };
    }
    return node;
  });
}

function collectReferenceFiles(
  nodes: ExplorerNode[],
  activeFileId: string | null,
  parentPath = ""
): Array<{ path: string; content: string }> {
  const files: Array<{ path: string; content: string }> = [];
  for (const node of nodes) {
    const nextPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    if (node.type === "file") {
      if (node.id !== activeFileId) {
        files.push({ path: nextPath, content: node.content });
      }
    } else {
      files.push(...collectReferenceFiles(node.children, activeFileId, nextPath));
    }
  }
  return files;
}

function findFilePathById(
  nodes: ExplorerNode[],
  targetId: string,
  parentPath = ""
): string | null {
  for (const node of nodes) {
    const nextPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    if (node.id === targetId && node.type === "file") return nextPath;
    if (node.type === "folder") {
      const found = findFilePathById(node.children, targetId, nextPath);
      if (found) return found;
    }
  }
  return null;
}

function ExplorerTree({
  nodes,
  activeFileId,
  onSelectFile,
  onToggleFolder,
  onContextMenu,
  depth = 0,
  modeAccentClass,
}: {
  nodes: ExplorerNode[];
  activeFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onToggleFolder: (folderId: string) => void;
  onContextMenu: (
    e: React.MouseEvent<HTMLDivElement>,
    nodeId: string,
    nodeType: "file" | "folder"
  ) => void;
  depth?: number;
  modeAccentClass: string;
}) {
  const { isLight } = useTheme();

  return (
    <div className="space-y-1">
      {nodes.map((node) => {
        const paddingLeft = 8 + depth * 14;

        if (node.type === "folder") {
          return (
            <div key={node.id}>
              <div
                onClick={() => onToggleFolder(node.id)}
                onContextMenu={(e) => onContextMenu(e, node.id, "folder")}
                className={`group flex cursor-pointer items-center px-2 py-1.5 text-[13px] transition-all duration-200 ${
                  isLight
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-neutral-200 hover:text-white"
                }`}
                style={{ paddingLeft }}
              >
                <span className="mr-2 text-xs text-neutral-500">{node.isOpen ? "▾" : "▸"}</span>
                <span className="mr-2 text-neutral-500">⊟</span>
                <span className="truncate">{node.name}</span>
              </div>

              <div
                className={`grid overflow-hidden transition-all duration-300 ${
                  node.isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-60"
                }`}
              >
                <div className="overflow-hidden">
                  <ExplorerTree
                    nodes={node.children}
                    activeFileId={activeFileId}
                    onSelectFile={onSelectFile}
                    onToggleFolder={onToggleFolder}
                    onContextMenu={onContextMenu}
                    depth={depth + 1}
                    modeAccentClass={modeAccentClass}
                  />
                </div>
              </div>
            </div>
          );
        }

        const isActive = activeFileId === node.id;

        return (
          <div
            key={node.id}
            onClick={() => onSelectFile(node.id)}
            onContextMenu={(e) => onContextMenu(e, node.id, "file")}
            className={`group flex cursor-pointer items-center border-l px-2 py-1.5 text-[13px] transition-all duration-200 ${
              isActive
                ? isLight
                  ? "border-slate-400 text-slate-950"
                  : `${modeAccentClass} border-white/[0.16] text-white`
                : isLight
                ? "border-slate-200/70 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                : "border-white/[0.08] text-neutral-300 hover:border-white/[0.16] hover:text-white"
            }`}
            style={{ paddingLeft }}
          >
            <span className={`mr-2 ${isActive ? "text-white/80" : "text-neutral-500"}`}>•</span>
            <span className="truncate">{node.name}</span>
          </div>
        );
      })}
    </div>
  );
}

function BugReportModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  targetKind,
  context,
  modeMeta,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: BugReportFormValues) => Promise<void>;
  isSubmitting: boolean;
  targetKind: BugReportTargetKind;
  context: {
    projectName: string;
    projectId: string;
    currentFilePath: string;
    mode: string;
    runId: string | null;
  };
  modeMeta: (typeof MODE_META)[IdeMode];
}) {
  const { isLight, theme } = useTheme();

  const defaultCategory: BugReportCategory =
    targetKind === "run" ? "runtime_execution_failure" : "ide_ui_issue";

  const [category, setCategory] = useState<BugReportCategory>(defaultCategory);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expectedBehavior, setExpectedBehavior] = useState("");
  const [reproducible, setReproducible] = useState(false);

  useEffect(() => {
    if (!open) return;

    const timeoutId = window.setTimeout(() => {
      setCategory(defaultCategory);
      setTitle(
        targetKind === "run" && context.runId
          ? `Issue with run ${context.runId.slice(0, 8)}`
          : ""
      );
      setDescription("");
      setExpectedBehavior("");
      setReproducible(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [open, defaultCategory, targetKind, context.runId]);

  if (!open) return null;

  const categoryOptions: Array<{ value: BugReportCategory; label: string }> = [
    { value: "incorrect_validation", label: "Incorrect validation" },
    { value: "wrong_generated_code", label: "Wrong generated code" },
    { value: "runtime_execution_failure", label: "Runtime / execution failure" },
    { value: "visual_artifact_issue", label: "Visual / artifact issue" },
    { value: "ide_ui_issue", label: "IDE / UI issue" },
    { value: "performance_timeout", label: "Performance / timeout" },
    { value: "other", label: "Other" },
  ];

  async function submit() {
    if (!title.trim() || !description.trim()) return;

    await onSubmit({
      category,
      title: title.trim(),
      description: description.trim(),
      expectedBehavior: expectedBehavior.trim(),
      reproducible,
    });
  }

  return (
    <div className="fixed inset-0 z-[180] overflow-y-auto">
      <div
        className={`absolute inset-0 backdrop-blur-sm ${isLight ? "bg-slate-200/70" : "bg-black/75"}`}
        onClick={onClose}
      />
      <div className="relative z-10 flex min-h-full items-start justify-center px-6 py-6 md:py-8">
        <div
          className={`w-full max-w-2xl max-h-[calc(100vh-3rem)] overflow-y-auto rounded-[2rem] border p-6 ${
            isLight
              ? "border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]"
              : "border-white/[0.08] bg-[linear-gradient(180deg,rgba(12,12,12,0.98),rgba(8,8,8,0.96))] shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
          }`}
        >
        <div className={`mb-2 text-[11px] uppercase tracking-[0.26em] ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
          Report Bug
        </div>

        <h2
          className={`${PAGE_HEADING_CLASS} ${isLight ? "text-3xl text-slate-900" : "text-3xl text-white"}`}
        >
          {targetKind === "run" ? "Report this run" : "Report IDE issue"}
        </h2>

        <p className={`mt-3 text-sm leading-7 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
          {targetKind === "run"
            ? "This report will include the selected run diagnostics automatically."
            : "This report will include the current IDE state automatically."}
        </p>

        <div className="mt-6 grid gap-4">
          <div>
            <label className={`mb-2 block text-[11px] uppercase tracking-[0.22em] ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BugReportCategory)}
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all focus:ring-1 ${modeMeta.accentRing} ${
                isLight
                  ? "border-slate-200 bg-white text-slate-900 focus:border-blue-400/60"
                  : "border-neutral-800 bg-[#080808] text-white focus:border-white/10"
              }`}
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`mb-2 block text-[11px] uppercase tracking-[0.22em] ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary of the issue"
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-600 focus:ring-1 ${modeMeta.accentRing} ${
                isLight
                  ? "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-400/60"
                  : "border-neutral-800 bg-[#080808] text-white focus:border-white/10"
              }`}
            />
          </div>

          <div>
            <label className={`mb-2 block text-[11px] uppercase tracking-[0.22em] ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
              What went wrong
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Describe what happened."
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-600 focus:ring-1 ${modeMeta.accentRing} ${
                isLight
                  ? "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-400/60"
                  : "border-neutral-800 bg-[#080808] text-white focus:border-white/10"
              }`}
            />
          </div>

          <div>
            <label className={`mb-2 block text-[11px] uppercase tracking-[0.22em] ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
              Expected behavior
            </label>
            <textarea
              value={expectedBehavior}
              onChange={(e) => setExpectedBehavior(e.target.value)}
              rows={3}
              placeholder="What should have happened instead?"
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-600 focus:ring-1 ${modeMeta.accentRing} ${
                isLight
                  ? "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-400/60"
                  : "border-neutral-800 bg-[#080808] text-white focus:border-white/10"
              }`}
            />
          </div>

          <label className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${isLight ? "border-slate-200 bg-slate-50 text-slate-700" : "border-neutral-900 bg-[#0b0b0b] text-neutral-300"}`}>
            <input
              type="checkbox"
              checked={reproducible}
              onChange={(e) => setReproducible(e.target.checked)}
              className="h-4 w-4"
            />
            I can reproduce this issue consistently
          </label>

          <div className={`rounded-2xl border p-4 ${isLight ? "border-slate-200 bg-slate-50" : "border-neutral-900 bg-[#0b0b0b]"}`}>
            <div className={`mb-2 text-[11px] uppercase tracking-[0.22em] ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
              Attached context
            </div>
            <div className={`space-y-1 text-sm ${isLight ? "text-slate-700" : "text-neutral-300"}`}>
              <div>Project: {context.projectName || "Untitled Project"}</div>
              <div>Project ID: {context.projectId}</div>
              <div>File: {context.currentFilePath}</div>
              <div>Mode: {context.mode}</div>
              <div>Run ID: {context.runId || "None"}</div>
            </div>
          </div>
        </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className={`${getModeButtonClass(modeMeta, undefined, theme)} rounded-2xl px-4 py-2 disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              onClick={() => void submit()}
              disabled={isSubmitting || !title.trim() || !description.trim()}
              className={`${getModeButtonClass(modeMeta, {
                disabled: isSubmitting || !title.trim() || !description.trim(),
              }, theme)} rounded-2xl px-4 py-2 disabled:opacity-50`}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArtifactPreview({
  artifact,
  onError,
}: {
  artifact: VisualArtifact;
  onError: (name: string) => void;
}) {
  const { isLight } = useTheme();

  if (artifact.artifact_type === "image") {
    return (
      <img
        src={artifact.url}
        alt={artifact.label}
        className={`max-h-[340px] w-full object-contain ${isLight ? "bg-slate-50" : "bg-[#080808]"}`}
        onError={() => onError(artifact.name)}
      />
    );
  }

  if (
    artifact.artifact_type === "html" ||
    artifact.artifact_type === "table" ||
    artifact.artifact_type === "json"
  ) {
    return (
      <iframe
        src={artifact.url}
        title={artifact.label}
        className="h-[340px] w-full bg-white"
        onError={() => onError(artifact.name)}
      />
    );
  }

  return <div className={`p-4 text-sm ${isLight ? "text-slate-600" : "text-neutral-400"}`}>Artifact available.</div>;
}

function IdePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const { isLight, theme } = useTheme();
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
  const wsBaseUrl = useMemo(() => toWsUrl(backendUrl), [backendUrl]);

  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const terminalScrollRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const addMenuRef = useRef<HTMLDivElement | null>(null);
  const treeMenuRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const editorDecorationIdsRef = useRef<string[]>([]);

  const projectId = searchParams.get("project") || "local-project";

  const [showPython, setShowPython] = useState(false);
  const [showBottomPanel, setShowBottomPanel] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModeOverlay, setShowModeOverlay] = useState(false);
  const [showLayoutOverlay, setShowLayoutOverlay] = useState(false);
  const [showDevVisionPrompt, setShowDevVisionPrompt] = useState(false);
  const [showRunsSection, setShowRunsSection] = useState(true);

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showTreeMenu, setShowTreeMenu] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(true);

  const [mode, setMode] = useState<IdeMode>("standard");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("normal");
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTab>("terminal");
  const [problemStatement, setProblemStatement] = useState("");
  const [problemPanelOpen, setProblemPanelOpen] = useState(true);
  const [problemAlignment, setProblemAlignment] = useState<ProblemAlignment | null>(null);

  const [projectName, setProjectName] = useState("Untitled Project");
  const [projectLoaded, setProjectLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Loading project...");

  const [explorerTree, setExplorerTree] = useState<ExplorerNode[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  const [generatedPython, setGeneratedPython] = useState("");
  const [terminalOutput, setTerminalOutput] = useState("Terminal output will appear here.\n");
  const [terminalEntries, setTerminalEntries] = useState<TerminalEntry[]>([
    {
      id: "initial",
      stream: "system",
      text: "Terminal output will appear here.",
    },
  ]);
  const [terminalInput, setTerminalInput] = useState("");
  const [inputPrompt, setInputPrompt] = useState<string | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Ready.");

  const [interpretationLines, setInterpretationLines] = useState<InterpretationLine[]>([]);
  const [interpretationSourceFilePath, setInterpretationSourceFilePath] = useState<string | null>(
    null
  );
  const [interpretationSourceDocument, setInterpretationSourceDocument] = useState("");
  const [visualArtifacts, setVisualArtifacts] = useState<VisualArtifact[]>([]);
  const [artifactErrors, setArtifactErrors] = useState<Record<string, boolean>>({});
  const [runs, setRuns] = useState<RunHistoryItem[]>([]);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [devVisionEnabled, setDevVisionEnabled] = useState(false);
  const [devVisionPassword, setDevVisionPassword] = useState("");
  const [devVisionError, setDevVisionError] = useState("");
  const [devMetrics, setDevMetrics] = useState<DevMetrics | null>(null);

  const [showBugModal, setShowBugModal] = useState(false);
  const [bugSubmitting, setBugSubmitting] = useState(false);
  const [bugTargetKind, setBugTargetKind] = useState<BugReportTargetKind>("ui");
  const [bugTargetRunId, setBugTargetRunId] = useState<string | null>(null);

  const [terminalHeight, setTerminalHeight] = useState(236);
  const [isResizingTerminal, setIsResizingTerminal] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [toast, setToast] = useState<ToastState>({ text: "", visible: false });

  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
  const [sessionEmail, setSessionEmail] = useState("");
  const [upgradeModal, setUpgradeModal] = useState<UpgradeModalState>({
    open: false,
    title: "",
    message: "",
  });

  const activeTier: SubscriptionTier = subscription?.tier ?? "free";
  const studentModeLocked = activeTier === "student";
  const currentModeMeta = MODE_META[mode];
  const currentLayoutMeta = LAYOUT_META[layoutMode];
  const synthFileLimit = getSynthFileLimit(activeTier);
  const currentSynthFileCount = useMemo(() => countSynthFiles(explorerTree), [explorerTree]);
  const problemStorageKey = useMemo(() => `codeless:problem:${projectId}`, [projectId]);

  const sidebarContainerClass = useMemo(
    () => (sidebarOpen ? "w-[17rem] opacity-100 translate-x-0" : "w-0 opacity-0 -translate-x-6"),
    [sidebarOpen]
  );

  const activeFile = useMemo(() => {
    if (!activeFileId) return null;
    const found = findNodeById(explorerTree, activeFileId);
    return found && found.type === "file" ? found : null;
  }, [explorerTree, activeFileId]);

  const currentFilePath = useMemo(() => {
    if (!activeFileId) return "No file selected";
    return findFilePathById(explorerTree, activeFileId) || "No file selected";
  }, [explorerTree, activeFileId]);

  const referenceFiles = useMemo(
    () => collectReferenceFiles(explorerTree, activeFileId),
    [explorerTree, activeFileId]
  );

  const diagnosticsSummary = useMemo(() => {
    const blocked = interpretationLines.filter((line) => getSeverity(line) === "blocked").length;
    const warnings = interpretationLines.filter((line) => getSeverity(line) === "warning").length;
    const ok = interpretationLines.filter((line) => getSeverity(line) === "ok").length;
    return { blocked, warnings, ok };
  }, [interpretationLines]);

  const derivedAverageSpecificity = useMemo(() => {
    const scores = interpretationLines
      .map((line) =>
        typeof line.specificity_score === "number" && Number.isFinite(line.specificity_score)
          ? line.specificity_score
          : null
      )
      .filter((score): score is number => score !== null);
    if (scores.length === 0) return null;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }, [interpretationLines]);

  const derivedAverageStructurePenalty = useMemo(() => {
    const scores = interpretationLines
      .map((line) =>
        typeof line.structure_penalty === "number" && Number.isFinite(line.structure_penalty)
          ? line.structure_penalty
          : null
      )
      .filter((score): score is number => score !== null);
    if (scores.length === 0) return null;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }, [interpretationLines]);

  const resolvedInterpretationLines = useMemo(
    () => resolveInterpretationLines(interpretationSourceDocument, interpretationLines),
    [interpretationLines, interpretationSourceDocument]
  );

  const inferredKinds = useMemo(() => {
    const counts = new Map<string, number>();
    interpretationLines.forEach((line) => {
      const key = line.type || "statement";
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);
  }, [interpretationLines]);

  const semanticHints = useMemo(() => {
    return interpretationLines.slice(0, 2).map((line, index) => ({
      id: index,
      label:
        getSeverity(line) === "blocked"
          ? "blocked"
          : getSeverity(line) === "warning"
          ? "ambiguous"
          : "valid",
      raw: line.raw,
    }));
  }, [interpretationLines]);

  const generatedPythonAllowed = SUBSCRIPTION_META[activeTier].generatedPython;
  const problemMode = mode === "problem_solving";
  const normalizedProblemStatement = useMemo(
    () => normalizeProblemStatement(problemStatement),
    [problemStatement]
  );
  const problemPanelStatus = useMemo(
    () => problemAlignment?.status ?? ("awaiting_check" as const),
    [problemAlignment]
  );
  const problemGoalSummary = useMemo(
    () => problemAlignment?.goal_summary || deriveProblemPreview(problemStatement),
    [problemAlignment, problemStatement]
  );
  const problemIssues = useMemo(
    () => (problemAlignment?.issues || []).slice(0, 3),
    [problemAlignment]
  );
  const problemLineNotices = useMemo(
    () => problemAlignment?.line_notices || [],
    [problemAlignment]
  );

  const outputSummaryLabel = useMemo(() => {
    const parts: string[] = [];
    if (problemMode && normalizedProblemStatement) {
      parts.push(getProblemStatusLabel(problemAlignment?.status || "partial"));
    }
    if (diagnosticsSummary.blocked > 0) parts.push(`${diagnosticsSummary.blocked} blocked`);
    else if (diagnosticsSummary.warnings > 0) parts.push(`${diagnosticsSummary.warnings} warning`);
    else if (diagnosticsSummary.ok > 0) parts.push(`${diagnosticsSummary.ok} clear`);
    if (visualArtifacts.length > 0) parts.push(`${visualArtifacts.length} visual`);
    return parts.length > 0 ? parts.join(" · ") : "Run or check to populate results";
  }, [diagnosticsSummary, normalizedProblemStatement, problemAlignment?.status, problemMode, visualArtifacts.length]);

  const checkMetrics = useMemo(
    () => [
      {
        label: "Time",
        value: formatDurationMs(devMetrics?.total_duration_ms),
      },
      {
        label: "Specificity",
        value: formatScore(devMetrics?.average_specificity ?? derivedAverageSpecificity),
      },
      {
        label: "Struct Penalty",
        value: formatScore(devMetrics?.average_structure_penalty ?? derivedAverageStructurePenalty),
      },
    ],
    [
      devMetrics,
      derivedAverageSpecificity,
      derivedAverageStructurePenalty,
    ]
  );

  function showToast(text: string) {
    setToast({ text, visible: true });
  }

  function openDevVisionPrompt() {
    setDevVisionPassword("");
    setDevVisionError("");
    setShowDevVisionPrompt(true);
  }

  function handleDevVisionUnlock() {
    if (devVisionPassword !== DEV_VISION_PASSWORD) {
      setDevVisionError("Incorrect password.");
      return;
    }

    setDevVisionEnabled(true);
    setShowDevVisionPrompt(false);
    setDevVisionPassword("");
    setDevVisionError("");
    setStatusMessage("Dev Vision enabled.");
  }

  function exitDevVision() {
    setDevVisionEnabled(false);
    setShowDevVisionPrompt(false);
    setDevVisionPassword("");
    setDevVisionError("");
    setStatusMessage("Dev Vision exited.");
  }

  function applyInterpretationState(
    nextLines: InterpretationLine[],
    sourceFilePath: string,
    sourceDocument: string
  ) {
    setInterpretationLines(nextLines);
    setInterpretationSourceFilePath(sourceFilePath);
    setInterpretationSourceDocument(sourceDocument);
  }

  function applyProblemAlignmentState(nextAlignment: ProblemAlignment | null) {
    setProblemAlignment(nextAlignment);
  }

  function openUpgradeModal(title: string, message: string) {
    setUpgradeModal({
      open: true,
      title,
      message,
    });
  }

  function buildBugSnapshot() {
    const selectedRun =
      runs.find((item) => item.id === (bugTargetRunId || activeRunId)) || null;

    return {
      bug_target_kind: bugTargetKind,
      captured_at: new Date().toISOString(),
      project_name: projectName,
      project_id: projectId,
      active_file_path: currentFilePath,
      active_document: activeFile?.content ?? "",
      problem_statement: normalizedProblemStatement || null,
      problem_alignment: problemAlignment,
      mode,
      layout_mode: layoutMode,
      subscription_tier: activeTier,
      status_message: statusMessage,
      dev_vision_enabled: devVisionEnabled,
      dev_metrics: devMetrics,
      terminal_output: terminalOutput,
      generated_python: generatedPython,
      interpretation_lines: interpretationLines,
      visual_artifacts: visualArtifacts.map((artifact) => ({
        name: artifact.name,
        artifact_type: artifact.artifact_type,
        label: artifact.label,
        source: artifact.source,
        url: artifact.url,
      })),
      selected_run: selectedRun,
      target_run_id: bugTargetRunId,
      browser:
        typeof window !== "undefined"
          ? {
              href: window.location.href,
              user_agent: window.navigator.userAgent,
            }
          : null,
    };
  }

  function openUiBugReport() {
    setBugTargetKind("ui");
    setBugTargetRunId(activeRunId);
    setShowBugModal(true);
  }

  function openTutorialPlaceholder() {
    setStatusMessage("Tutorials placeholder selected.");
    showToast("Tutorials window coming soon.");
  }

  async function openRunBugReport(runId: string) {
    if (activeRunId !== runId) {
      await loadRunDetails(runId);
    }
    setBugTargetKind("run");
    setBugTargetRunId(runId);
    setShowBugModal(true);
  }

  async function handleSubmitBugReport(values: BugReportFormValues) {
    const session = await getSupabaseSession(supabase);

    if (!session?.user?.id) {
      showToast("You must be signed in to report a bug.");
      return;
    }

    setBugSubmitting(true);

    try {
      const response = await fetch(`${backendUrl}/bugs/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          owner_id: session.user.id,
          project_id: projectId,
          run_id: bugTargetKind === "run" ? bugTargetRunId : null,
          active_file_path: currentFilePath,
          mode,
          category: values.category,
          title: values.title,
          description: values.description,
          expected_behavior: values.expectedBehavior || null,
          reproducible: values.reproducible,
          snapshot: buildBugSnapshot(),
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to submit bug report.");
      }

      setShowBugModal(false);
      setBugTargetKind("ui");
      setBugTargetRunId(null);
      showToast("Bug report submitted.");
    } catch (error) {
      console.error(error);
      showToast("Could not submit bug report.");
    } finally {
      setBugSubmitting(false);
    }
  }

  function enforceTierGuardrails(tier: SubscriptionTier) {
    const allowedMode = tierAllowsMode(tier, mode);
    const allowedLayout = tierAllowsLayout(tier, layoutMode);

    if (!allowedMode) {
      const nextMode = getDefaultModeForTier(tier);
      setMode(nextMode);
      if (nextMode === "problem_solving" && layoutMode !== "minimalist") {
        setProblemPanelOpen(true);
      }
      setShowModeOverlay(false);
      setStatusMessage(`${MODE_META[nextMode].label} mode selected for your plan.`);
      showToast(`${MODE_META[nextMode].label} mode selected for your plan.`);
    }

    if (!allowedLayout) {
      applyLayoutMode(getDefaultLayoutForTier(tier), true);
    }

    if (!SUBSCRIPTION_META[tier].generatedPython) {
      setShowPython(false);
    }
  }

  function applyLayoutMode(next: LayoutMode, silent = false) {
    setLayoutMode(next);

    if (next === "minimalist") {
      setSidebarOpen(false);
      setShowPython(false);
      setShowRunsSection(false);
      setShowBottomPanel(false);
      setActiveBottomTab("terminal");
      setAnalysisOpen(false);
      if (mode === "problem_solving") {
        setProblemPanelOpen(false);
      }
    } else if (next === "normal") {
      setSidebarOpen(true);
      setShowPython(false);
      setShowRunsSection(true);
      setShowBottomPanel(true);
      setActiveBottomTab("terminal");
      setAnalysisOpen(true);
      if (mode === "problem_solving") {
        setProblemPanelOpen(true);
      }
    } else {
      setSidebarOpen(true);
      if (generatedPythonAllowed) {
        setShowPython(true);
      }
      setShowRunsSection(true);
      setShowBottomPanel(true);
      setActiveBottomTab("terminal");
      setAnalysisOpen(true);
      if (mode === "problem_solving") {
        setProblemPanelOpen(true);
      }
    }

    if (!silent) {
      showToast(`${LAYOUT_META[next].label} layout selected.`);
    }
  }

  function appendTerminal(text: string, stream: TerminalEntry["stream"] = "system") {
    setTerminalOutput((prev) => prev + text);
    if (!text) return;
    setTerminalEntries((prev) => {
      const base = prev.length === 1 && prev[0]?.id === "initial" ? [] : prev;
      return [
        ...base,
        {
          id: uid("terminal"),
          stream,
          text,
        },
      ];
    });
  }

  function appendRuntimeIndicator(symbol: string) {
    setTerminalOutput((prev) => prev + `[${symbol}]\n`);
    setTerminalEntries((prev) => {
      const base = prev.length === 1 && prev[0]?.id === "initial" ? [] : prev;
      return [
        ...base,
        {
          id: uid("terminal"),
          stream: "runtime",
          text: "",
          symbol,
        },
      ];
    });
  }

  function replaceTerminalEntries(entries: TerminalEntry[]) {
    setTerminalEntries(
      entries.length > 0
        ? entries
        : [
            {
              id: uid("terminal"),
              stream: "system",
              text: "Program finished with no output.",
            },
          ]
    );
  }

  function replaceVisualArtifacts(
    runId: string,
    artifacts: BackendArtifact[],
    source: "live" | "persisted"
  ) {
    const cacheKey = `${Date.now()}`;
    setArtifactErrors({});
    setVisualArtifacts(
      convertArtifactsToVisuals(backendUrl, projectId, runId, artifacts, source, cacheKey)
    );
  }

  function addLiveArtifact(runId: string, artifact: BackendArtifact) {
    const cacheKey = `${Date.now()}`;
    setVisualArtifacts((prev) => {
      if (prev.some((item) => item.name === artifact.name)) {
        return prev;
      }
      return [
        ...prev,
        ...convertArtifactsToVisuals(backendUrl, projectId, runId, [artifact], "live", cacheKey),
      ];
    });
  }

  function canAddMoreSynthFiles(extra = 1) {
    if (synthFileLimit === null) return true;
    return currentSynthFileCount + extra <= synthFileLimit;
  }

  function requireStructureUpgradeIfFree(actionLabel: string) {
    if (activeTier === "free") {
      openUpgradeModal(
        "Upgrade required",
        `The Free plan is limited to a single-file minimalist workflow. Upgrade your subscription to ${actionLabel}.`
      );
      return true;
    }

    return false;
  }

  async function loadRuns() {
    try {
      const response = await fetch(`${backendUrl}/runs?project_id=${encodeURIComponent(projectId)}`);
      if (!response.ok) throw new Error("Failed to load runs");
      const data = await response.json();
      setRuns(data.runs || []);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadRunDetails(runId: string) {
    try {
      const response = await fetch(
        `${backendUrl}/runs/${encodeURIComponent(runId)}?project_id=${encodeURIComponent(projectId)}`
      );
      if (!response.ok) throw new Error("Failed to load run");
      const data = await response.json();

      setActiveRunId(runId);
      setGeneratedPython(data.generated_python || "");
      setProblemStatement(data.problem_statement || "");
      applyProblemAlignmentState(data.problem_alignment || null);
      setDevMetrics(data.dev_metrics || null);
      applyInterpretationState(
        data.interpretation_lines || [],
        data.active_file_path || "",
        data.document || ""
      );

      const stdout = data.stdout || "";
      const stderr = data.stderr || "";

      if (stderr.trim()) {
        setTerminalOutput(`STDERR:\n${stderr}\n\nSTDOUT:\n${stdout}`);
      } else {
        setTerminalOutput(stdout || "Program finished with no output.");
      }
      replaceTerminalEntries([
        ...(stderr.trim()
          ? [
              {
                id: uid("terminal"),
                stream: "stderr" as const,
                text: stderr,
              },
            ]
          : []),
        ...(stdout.trim()
          ? [
              {
                id: uid("terminal"),
                stream: "stdout" as const,
                text: stdout,
              },
            ]
          : []),
      ]);

      replaceVisualArtifacts(data.id, data.artifacts || [], "persisted");
      setMode(resolveModeForTier(activeTier, data.mode || null));
      setShowBottomPanel(true);
      setActiveBottomTab((data.artifacts || []).length > 0 ? "visual" : "terminal");
      setStatusMessage(`Loaded run ${data.id}.`);
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to load run.");
    }
  }

  useEffect(() => {
    void loadRuns();
  }, [backendUrl, projectId]);

  useEffect(() => {
    if (terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setProblemStatement(window.localStorage.getItem(problemStorageKey) || "");
  }, [problemStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (normalizedProblemStatement) {
      window.localStorage.setItem(problemStorageKey, problemStatement);
    } else {
      window.localStorage.removeItem(problemStorageKey);
    }
  }, [normalizedProblemStatement, problemStatement, problemStorageKey]);

  useEffect(() => {
    async function bootstrap() {
      const session = await getSupabaseSession(supabase);

      if (!session) {
        router.replace("/login");
        return;
      }

      setSessionEmail(session.user.email ?? "");

      try {
        const subscriptionRecord = await getOrCreateSubscription(
          supabase,
          session.user.id,
          session.user.email ?? ""
        );
        setSubscription(subscriptionRecord);

        const nextMode = resolveModeForTier(
          subscriptionRecord.tier,
          parseRequestedMode(searchParams.get("mode"))
        );
        setMode(nextMode);
        if (nextMode === "problem_solving") {
          setProblemPanelOpen(true);
        }
      } catch (error) {
        console.error(error);
      }

      if (!searchParams.get("project")) {
        router.replace("/dashboard");
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("id, name, tree_json")
        .eq("id", projectId)
        .single();

      if (error || !data) {
        setSaveStatus(error?.message || "Project not found.");
        return;
      }

      const loadedTree = Array.isArray(data.tree_json)
        ? (data.tree_json as ExplorerNode[])
        : createStarterTree();

      setProjectName(data.name || "Untitled Project");
      setExplorerTree(loadedTree);
      setActiveFileId(findFirstFileId(loadedTree));
      setProjectLoaded(true);
      setSaveStatus("Saved.");
      setStatusMessage("Project loaded.");
    }

    void bootstrap();
  }, [projectId, router, searchParams, supabase]);

  useEffect(() => {
    if (!subscription) return;
    enforceTierGuardrails(subscription.tier);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscription?.tier]);

  useEffect(() => {
    if (!projectLoaded || !projectId) return;

    const handle = setTimeout(async () => {
      setSaveStatus("Saving...");
      const { error } = await supabase
        .from("projects")
        .update({
          name: projectName,
          tree_json: explorerTree,
        })
        .eq("id", projectId);

      setSaveStatus(error ? error.message : "Saved.");
    }, 700);

    return () => clearTimeout(handle);
  }, [explorerTree, projectId, projectLoaded, projectName, supabase]);

  useEffect(() => {
    if (!toast.visible) return;
    const timeout = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2200);
    return () => clearTimeout(timeout);
  }, [toast.visible, toast.text]);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!isResizingTerminal) return;
      const newHeight = window.innerHeight - e.clientY - 16;
      const clampedHeight = Math.max(170, Math.min(540, newHeight));
      setTerminalHeight(clampedHeight);
    }

    function handleMouseUp() {
      setIsResizingTerminal(false);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowModeOverlay(false);
        setShowLayoutOverlay(false);
        setContextMenu(null);
        setShowAddMenu(false);
        setShowTreeMenu(false);
        setUpgradeModal((prev) => ({ ...prev, open: false }));
        setShowBugModal(false);
      }
    }

    function handleWindowClick(event: MouseEvent) {
      if (
        contextMenuRef.current &&
        event.target instanceof Node &&
        contextMenuRef.current.contains(event.target)
      ) {
        return;
      }

      if (
        addMenuRef.current &&
        event.target instanceof Node &&
        addMenuRef.current.contains(event.target)
      ) {
        return;
      }

      if (
        treeMenuRef.current &&
        event.target instanceof Node &&
        treeMenuRef.current.contains(event.target)
      ) {
        return;
      }

      setContextMenu(null);
      setShowAddMenu(false);
      setShowTreeMenu(false);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("click", handleWindowClick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("click", handleWindowClick);
    };
  }, [isResizingTerminal]);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  function updateActiveFileContent(nextContent: string) {
    if (!activeFileId) return;
    setExplorerTree((prev) =>
      updateNodeById(prev, activeFileId, (node) =>
        node.type === "file" ? { ...node, content: nextContent } : node
      )
    );
  }

  function toggleFolder(folderId: string) {
    setExplorerTree((prev) =>
      updateNodeById(prev, folderId, (node) =>
        node.type === "folder" ? { ...node, isOpen: !node.isOpen } : node
      )
    );
  }

  function createFile(parentFolderId?: string) {
    if (requireStructureUpgradeIfFree("create additional files")) return;

    if (!canAddMoreSynthFiles(1)) {
      openUpgradeModal(
        "Synth file limit reached",
        `Your ${SUBSCRIPTION_META[activeTier].label} plan allows ${getSynthFileLimitLabel(
          activeTier
        )} synth file(s) per project. Upgrade your subscription to add more.`
      );
      return;
    }

    const name = window.prompt("New file name", "new_file.synth");
    if (!name) return;

    const newFile: FileNode = {
      id: uid("file"),
      type: "file",
      name,
      content: "",
    };

    if (isSynthFileName(name) && !canAddMoreSynthFiles(1)) {
      openUpgradeModal(
        "Synth file limit reached",
        `Your ${SUBSCRIPTION_META[activeTier].label} plan allows ${getSynthFileLimitLabel(
          activeTier
        )} synth file(s) per project. Upgrade your subscription to add more.`
      );
      return;
    }

    setExplorerTree((prev) => {
      if (parentFolderId) return addChildToFolder(prev, parentFolderId, newFile);
      return [...prev, newFile];
    });
    setActiveFileId(newFile.id);
    setStatusMessage(`Created file ${name}.`);
  }

  function createFolder(parentFolderId?: string) {
    if (requireStructureUpgradeIfFree("create folders")) return;

    const name = window.prompt("New folder name", "new_folder");
    if (!name) return;

    const newFolder: FolderNode = {
      id: uid("folder"),
      type: "folder",
      name,
      isOpen: true,
      children: [],
    };

    setExplorerTree((prev) => {
      if (parentFolderId) return addChildToFolder(prev, parentFolderId, newFolder);
      return [...prev, newFolder];
    });
    setStatusMessage(`Created folder ${name}.`);
  }

  function renameNode(nodeId: string) {
    const node = findNodeById(explorerTree, nodeId);
    if (!node) return;

    const nextName = window.prompt("Rename", node.name);
    if (!nextName || nextName === node.name) return;

    const renamedWasNonSynth = node.type === "file" && !isSynthFileName(node.name);
    const renamedBecomesSynth = node.type === "file" && isSynthFileName(nextName);

    if (
      node.type === "file" &&
      renamedWasNonSynth &&
      renamedBecomesSynth &&
      !canAddMoreSynthFiles(1)
    ) {
      openUpgradeModal(
        "Synth file limit reached",
        `Your ${SUBSCRIPTION_META[activeTier].label} plan allows ${getSynthFileLimitLabel(
          activeTier
        )} synth file(s) per project. Upgrade your subscription to add more.`
      );
      return;
    }

    setExplorerTree((prev) =>
      updateNodeById(prev, nodeId, (current) => ({ ...current, name: nextName }))
    );
    setStatusMessage(`Renamed to ${nextName}.`);
  }

  function duplicateById(nodeId: string) {
    if (requireStructureUpgradeIfFree("duplicate files or folders")) return;

    const node = findNodeById(explorerTree, nodeId);
    if (!node) return;

    const synthsAdded = countSynthFilesInNode(node);
    if (!canAddMoreSynthFiles(synthsAdded)) {
      openUpgradeModal(
        "Synth file limit reached",
        `Duplicating this item would exceed your ${SUBSCRIPTION_META[activeTier].label} plan limit of ${getSynthFileLimitLabel(
          activeTier
        )} synth file(s) per project. Upgrade your subscription to continue.`
      );
      return;
    }

    const cloned = duplicateNode(node);
    setExplorerTree((prev) => insertSiblingAfterId(prev, nodeId, cloned));

    if (cloned.type === "file") {
      setActiveFileId(cloned.id);
    } else {
      const firstFile = findFirstFileId([cloned]);
      if (firstFile) setActiveFileId(firstFile);
    }

    setStatusMessage(`Duplicated ${node.name}.`);
  }

  function deleteById(nodeId: string) {
    const node = findNodeById(explorerTree, nodeId);
    if (!node) return;

    const confirmed = window.confirm(`Delete "${node.name}"?`);
    if (!confirmed) return;

    const nextTree = removeNodeById(explorerTree, nodeId);
    setExplorerTree(nextTree);

    if (activeFileId === nodeId || (node.type === "folder" && activeFileId)) {
      const nextActive = findFirstFileId(nextTree);
      setActiveFileId(nextActive);
    }

    setStatusMessage(`Deleted ${node.name}.`);
  }

  async function handleCheck() {
    if (!activeFile) return;

    if (!tierAllowsMode(activeTier, mode)) {
      openUpgradeModal("Mode locked", getLockedModeReason(activeTier, mode));
      return;
    }

    try {
      setIsChecking(true);
      setStatusMessage(`Checking in ${MODE_META[mode].label} mode...`);
      setShowBottomPanel(true);
      setActiveBottomTab(layoutMode === "minimalist" ? "terminal" : "validation");
      applyProblemAlignmentState(null);

      const response = await fetch(`${backendUrl}/interpret`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: projectId,
          active_document: activeFile.content,
          active_file_path: currentFilePath,
          problem_statement: normalizedProblemStatement || null,
          project_context: referenceFiles,
          mode,
          subscription_tier: activeTier,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend returned status ${response.status}`);
      }

      const data = await response.json();
      applyInterpretationState(data.lines || [], currentFilePath, activeFile.content);
      applyProblemAlignmentState(data.problem_alignment || null);
      setDevMetrics(data.dev_metrics || null);
      setStatusMessage("Check complete.");
    } catch (error) {
      console.error(error);
      applyProblemAlignmentState(null);
      setDevMetrics(null);
      applyInterpretationState(
        [
          {
            raw: "System error",
            type: "error",
            valid: false,
            message: describeBackendConnectionError(error, backendUrl).trim(),
          },
        ],
        currentFilePath,
        activeFile.content
      );
      setStatusMessage("Check failed.");
    } finally {
      setIsChecking(false);
    }
  }

  function connectRunStream(runId: string) {
    wsRef.current?.close();

    const ws = new WebSocket(`${wsBaseUrl}/run/${runId}/stream`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);

      if (payload.type === "run_started") {
        setStatusMessage("Execution started.");
        if (payload.executor_mode === "subprocess") {
          appendRuntimeIndicator("SP");
          setShowBottomPanel(true);
          setActiveBottomTab("terminal");
        }
        return;
      }

      if (payload.type === "stdout") {
        appendTerminal(payload.text || "", "stdout");
        return;
      }

      if (payload.type === "stderr") {
        appendTerminal(payload.text || "", "stderr");
        return;
      }

      if (payload.type === "input_requested") {
        setInputPrompt(payload.prompt || "Input:");
        setShowBottomPanel(true);
        setActiveBottomTab("terminal");
        if (payload.prompt) {
          appendTerminal(payload.prompt, "system");
        }
        return;
      }

      if (payload.type === "artifact_created") {
        addLiveArtifact(runId, {
          name: payload.name,
          artifact_type: payload.artifact_type || "file",
          label: payload.label || payload.name,
        });
        setShowBottomPanel(true);
        setActiveBottomTab("visual");
        return;
      }

      if (payload.type === "completed") {
        setIsRunning(false);
        setInputPrompt(null);
        setActiveRunId(payload.run_id || runId);

        const persistedRun = payload.persisted_run;
        if (persistedRun?.dev_metrics) {
          setDevMetrics(persistedRun.dev_metrics);
        }
        if (persistedRun?.artifacts) {
          replaceVisualArtifacts(persistedRun.id || runId, persistedRun.artifacts, "persisted");
          if (persistedRun.artifacts.length > 0) {
            setShowBottomPanel(true);
            setActiveBottomTab("visual");
          }
        }

        setStatusMessage(`Run ${payload.status}.`);
        void loadRuns();
        return;
      }

      if (payload.type === "error") {
        appendTerminal((payload.message || "Run stream error.") + "\n", "system");
        setIsRunning(false);
        setInputPrompt(null);
        setStatusMessage("Run failed.");
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    ws.onerror = () => {
      appendTerminal("WebSocket stream error.\n", "system");
      setIsRunning(false);
      setInputPrompt(null);
      setStatusMessage("Run stream failed.");
    };
  }

  async function handleRun() {
    if (!activeFile) return;

    if (!tierAllowsMode(activeTier, mode)) {
      openUpgradeModal("Mode locked", getLockedModeReason(activeTier, mode));
      return;
    }

    try {
      setIsRunning(true);
      setShowBottomPanel(true);
      setActiveBottomTab("terminal");
      setStatusMessage(`Starting ${MODE_META[mode].label} run...`);
      setTerminalOutput("");
      setTerminalEntries([]);
      applyProblemAlignmentState(null);
      applyInterpretationState([], currentFilePath, activeFile.content);
      setVisualArtifacts([]);
      setArtifactErrors({});
      setInputPrompt(null);
      setTerminalInput("");
      setGeneratedPython("");
      setDevMetrics(null);

      const response = await fetch(`${backendUrl}/run/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: projectId,
          active_document: activeFile.content,
          active_file_path: currentFilePath,
          problem_statement: normalizedProblemStatement || null,
          project_context: referenceFiles,
          mode,
          subscription_tier: activeTier,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend returned status ${response.status}`);
      }

      const data = await response.json();

      setGeneratedPython(data.generated_python || "");
      applyProblemAlignmentState(data.problem_alignment || null);
      setDevMetrics(data.dev_metrics || null);
      if (data.interpretation?.lines) {
        applyInterpretationState(data.interpretation.lines, currentFilePath, activeFile.content);
      }

      if (data.status === "blocked") {
        setIsRunning(false);
        setStatusMessage("Blocked.");
        appendTerminal((data.stderr || "Execution blocked.") + "\n", "stderr");
        setShowBottomPanel(true);
        setActiveBottomTab(layoutMode === "minimalist" ? "terminal" : "validation");
        if (data.run?.id) {
          setActiveRunId(data.run.id);
        }
        await loadRuns();
        return;
      }

      const runId = data.run_id;
      setActiveRunId(runId);
      connectRunStream(runId);
    } catch (error) {
      console.error(error);
      applyProblemAlignmentState(null);
      setDevMetrics(null);
      appendTerminal(describeBackendConnectionError(error, backendUrl));
      setIsRunning(false);
      setStatusMessage("Run failed.");
    }
  }

  function handleSendTerminalInput() {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !inputPrompt) return;
    wsRef.current.send(
      JSON.stringify({
        type: "input",
        value: terminalInput,
      })
    );
    appendTerminal(terminalInput + "\n", "input");
    setTerminalInput("");
    setInputPrompt(null);
  }

  function handleStopRun() {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "stop" }));
      setStatusMessage("Stopping run...");
    }
  }

  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    if (!editor || !monaco) return;

    const model = editor.getModel();
    const maxLineNumber = model?.getLineCount() || 0;
    const showHighlights =
      !!activeFile && interpretationSourceFilePath === currentFilePath && maxLineNumber > 0;

    const semanticDecorations = showHighlights
      ? resolvedInterpretationLines.flatMap((line) => {
          const severity = getSeverity(line);
          const lineNumber = normalizeLineNumber(line.resolvedLineNumber, maxLineNumber);

          if (!lineNumber || severity === "ok") return [];

          return [
            {
              range: new monaco.Range(lineNumber, 1, lineNumber, 1),
              options: {
                isWholeLine: true,
                className:
                  severity === "blocked"
                    ? "ide-validation-line--blocked"
                    : "ide-validation-line--warning",
                linesDecorationsClassName:
                  severity === "blocked"
                    ? "ide-validation-gutter--blocked"
                    : "ide-validation-gutter--warning",
                stickiness:
                  monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
              },
            },
          ];
        })
      : [];

    const problemDecorations =
      showHighlights && problemMode
        ? problemLineNotices.flatMap((notice) => {
            const severity = getProblemNoticeSeverity(notice);
            const lineNumber = normalizeLineNumber(notice.line_number, maxLineNumber);

            if (!lineNumber) return [];

            return [
              {
                range: new monaco.Range(lineNumber, 1, lineNumber, 1),
                options: {
                  isWholeLine: true,
                  className:
                    severity === "blocked"
                      ? "ide-validation-line--blocked"
                      : "ide-problem-line--warning",
                  linesDecorationsClassName:
                    severity === "blocked"
                      ? "ide-validation-gutter--blocked"
                      : "ide-problem-gutter--warning",
                  stickiness:
                    monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                },
              },
            ];
          })
        : [];

    const decorations = [...semanticDecorations, ...problemDecorations];

    editorDecorationIdsRef.current = editor.deltaDecorations(
      editorDecorationIdsRef.current,
      decorations
    );
  }, [
    activeFile,
    currentFilePath,
    interpretationSourceFilePath,
    problemLineNotices,
    problemMode,
    resolvedInterpretationLines,
  ]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  function handleSelectMode(nextMode: IdeMode) {
    if (!tierAllowsMode(activeTier, nextMode)) {
      openUpgradeModal("Mode locked", getLockedModeReason(activeTier, nextMode));
      return;
    }

    setMode(nextMode);
    if (nextMode === "problem_solving" && layoutMode !== "minimalist") {
      setProblemPanelOpen(true);
    }
    setShowModeOverlay(false);
    setStatusMessage(`${MODE_META[nextMode].label} mode selected.`);
    showToast(`${MODE_META[nextMode].label} mode selected.`);
  }

  function handleSelectLayout(nextLayout: LayoutMode) {
    if (!tierAllowsLayout(activeTier, nextLayout)) {
      openUpgradeModal("Layout locked", getLockedLayoutReason(activeTier, nextLayout));
      return;
    }

    applyLayoutMode(nextLayout);
    setShowLayoutOverlay(false);
    setStatusMessage(`${LAYOUT_META[nextLayout].label} layout selected.`);
  }

  function handleTogglePython() {
    if (!generatedPythonAllowed) {
      openUpgradeModal(
        "Python view locked",
        "Viewing the generated Python is not available on the Free plan. Upgrade your subscription to unlock it."
      );
      return;
    }

    setShowPython((prev) => !prev);
  }

  const developerExpanded = layoutMode === "developer";
  const minimalist = layoutMode === "minimalist";
  const iconControls = layoutMode !== "developer";
  const bottomTabs = (minimalist
    ? ["terminal", "visual"]
    : ["terminal", "validation", "visual"]) as BottomTab[];
  const showEditorInspector = !minimalist && !problemMode;
  const showEditorAnalysisRail = interpretationLines.length > 0 || problemLineNotices.length > 0;
  const showProblemPanel = problemMode;
  const editableLineCount =
    activeFile?.content.split("\n").filter((line) => line.trim().length > 0).length || 0;
  const runButtonLabel = isRunning ? "Running" : "Run";
  const checkButtonLabel = isChecking ? "Checking" : "Check";
  const devVisionButtonLabel = devVisionEnabled ? "Exit Dev Vision" : "Dev Vision";
  const pythonButtonLabel = !generatedPythonAllowed
    ? "Python Locked"
    : showPython
    ? "Hide Python"
    : "Show Python";
  const resultsButtonLabel = showBottomPanel ? "Hide Results" : "Show Results";
  const ideButtonClass = (options?: {
    active?: boolean;
    disabled?: boolean;
    compact?: boolean;
    pill?: boolean;
    danger?: boolean;
  }) => getModeButtonClass(currentModeMeta, options, theme);
  const shellSurfaceClass = isLight
    ? "border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(248,250,252,0.94))] shadow-[0_32px_100px_rgba(15,23,42,0.10)]"
    : "border-white/[0.08] bg-[linear-gradient(180deg,rgba(10,10,10,0.985),rgba(5,5,5,0.985))] shadow-[0_24px_90px_rgba(0,0,0,0.42),0_0_0_1px_rgba(255,255,255,0.02)]";
  const sidebarSurfaceClass = isLight
    ? "border-r border-slate-200/90 bg-[#f6f9fc]"
    : "border-r border-white/[0.08] bg-[#090909]";
  const sidebarCardClass = isLight
    ? "mb-3 rounded-[1.2rem] border border-slate-200/90 bg-white/92 px-3.5 py-3 shadow-[0_14px_34px_rgba(15,23,42,0.05)]"
    : "mb-3 rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.026),rgba(255,255,255,0.01))] px-4 py-3.5 shadow-[0_0_0_1px_rgba(255,255,255,0.01)]";
  const headerSurfaceClass = isLight
    ? "border-b border-slate-200/90 bg-white/92"
    : "border-b border-white/[0.08] bg-[#090909]/96";
  const subsectionSurfaceClass = isLight
    ? "border-b border-slate-200/90 bg-white/88"
    : "border-b border-white/[0.08] bg-[#0b0b0b]";
  const workspaceBgClass = isLight ? "bg-[#f4f8fc]" : "bg-[#050505]";
  const panelBgClass = isLight ? "bg-white/96" : "bg-[#070707]";
  const panelBorderClass = isLight ? "border-slate-200/90" : "border-white/[0.08]";
  const softTextClass = isLight ? "text-slate-500" : "!text-neutral-400";
  const mutedTextClass = isLight ? "text-slate-600" : "!text-neutral-300";
  const strongTextClass = isLight ? "text-slate-900" : "!text-white";
  const strongTextAltClass = isLight ? "text-slate-800" : "!text-neutral-100";
  const sectionLabelClass = isLight ? "text-slate-500" : "!text-neutral-400";
  const sectionMetaClass = isLight ? "text-slate-500" : "!text-neutral-300";
  const sectionTitleClass = isLight ? "text-slate-900" : "!text-white";
  const sidebarDividerClass = isLight ? "border-slate-200/90" : "border-white/[0.08]";
  const terminalTextClass = isLight ? currentModeMeta.terminalText : "!text-sky-300";
  const validationSeverityClass = (severity: "ok" | "warning" | "blocked") =>
    severity === "blocked"
      ? "border-red-500/30 bg-red-500/10 text-red-300"
      : severity === "warning"
      ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
      : "border-green-500/30 bg-green-500/10 text-green-300";
  const protectedDarkSurfaceStyle = getProtectedDarkSurfaceStyle(theme);
  const protectedDarkLabelStyle = getProtectedDarkTextStyle(theme, "#a3a3a3");
  const protectedDarkMetaStyle = getProtectedDarkTextStyle(theme, "#d4d4d8");
  const protectedDarkTitleStyle = getProtectedDarkTextStyle(theme, "#ffffff");
  const protectedDarkTerminalTextStyle = getProtectedDarkTextStyle(theme, "#7dd3fc");
  const modeBarGlowStyle = getModeBarGlowStyle(theme, mode, "soft");
  const modePanelGlowStyle = getModeBarGlowStyle(theme, mode, "medium");
  const inputSurfaceClass = isLight
    ? "border border-slate-200/90 bg-white/96 text-slate-900 placeholder:text-slate-400"
    : "border border-white/[0.08] bg-[#0b0b0b] text-white placeholder:text-neutral-500";
  const subtleChipClass = isLight
    ? "border-slate-200/90 bg-white/90 text-slate-500"
    : "border-white/[0.08] bg-white/[0.04] text-neutral-400";
  const pricingCardClass = isLight
    ? "border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] shadow-[0_18px_44px_rgba(15,23,42,0.08)]"
    : "border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.026),rgba(255,255,255,0.01))] shadow-[0_0_0_1px_rgba(255,255,255,0.01)]";
  const pricingCardHoverClass = isLight
    ? "hover:border-slate-300 hover:bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(241,245,249,0.96))]"
    : "hover:border-white/[0.14] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.014))]";

  return (
    <main
      className={`relative h-screen w-screen overflow-hidden ${
        isLight ? "bg-[#eef3f9] text-slate-900" : "bg-[#020202] text-white"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-90">
        <div
          className={`absolute inset-0 ${
            isLight
              ? "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.72),transparent_36%)]"
              : "bg-[linear-gradient(180deg,rgba(10,10,10,0.98),rgba(2,2,2,1))]"
          }`}
        />
        <div
          className={`absolute left-[20%] top-[10%] h-52 w-52 rounded-full blur-3xl ${
            isLight
              ? "bg-[radial-gradient(circle,rgba(255,255,255,0.55),transparent_72%)]"
              : "bg-[radial-gradient(circle,rgba(255,255,255,0.06),transparent_72%)]"
          }`}
        />
      </div>

      <div className="flex h-full w-full p-2.5">
        <div className={`flex h-full w-full overflow-hidden rounded-[1.65rem] border ${shellSurfaceClass}`}>
          <aside
            className={`relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${sidebarSurfaceClass} ${sidebarContainerClass}`}
          >
            <div
              className={`h-full w-[17rem] p-3.5 transition-all duration-500 ${
                sidebarOpen ? "opacity-100 blur-0" : "opacity-0 blur-sm"
              }`}
            >
              <div className={`mb-4 border-b pb-4 ${sidebarDividerClass}`}>
                <div className={`mb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] ${sectionLabelClass}`}>
                  Project
                </div>
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className={`w-full bg-transparent text-[1.35rem] ${PAGE_HEADING_CLASS} outline-none ${sectionTitleClass} ${isLight ? "placeholder:text-slate-400" : "placeholder:text-neutral-600"}`}
                />
                <div className={`mt-1.5 text-[10px] ${sectionMetaClass}`}>
                  {saveStatus}
                </div>
              </div>

              <div className={`mb-4 border-b pb-4 ${sidebarDividerClass}`}>
                <div className="mb-1.5 flex items-center justify-between">
                  <div className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${sectionLabelClass}`}>
                    Subscription
                  </div>
                  <Link
                    href="/subscriptions"
                    className={`${getModeButtonClass(currentModeMeta, {
                      compact: true,
                      pill: true,
                    }, theme)} ${iconControls ? "inline-flex min-w-9 items-center justify-center px-2" : "px-2.5 py-1 text-[10px] uppercase tracking-[0.18em]"}`}
                    aria-label={iconControls ? "Manage subscription" : undefined}
                    title={iconControls ? "Manage subscription" : undefined}
                  >
                    {iconControls ? (
                      <MinimalIconLabel icon="manage" label="Manage subscription" />
                    ) : (
                      "Manage"
                    )}
                  </Link>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className={`text-[13px] ${sectionTitleClass}`}>
                    {SUBSCRIPTION_META[activeTier].label}
                  </div>
                  <div className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] ${isLight ? "border-slate-200 bg-slate-50 text-slate-500" : "border-white/[0.08] bg-white/[0.03] text-neutral-500"}`}>
                    {getSynthFileLimitLabel(activeTier)} synth
                  </div>
                </div>
                {sessionEmail ? (
                  <div className={`mt-1.5 truncate text-[10px] ${sectionMetaClass}`}>{sessionEmail}</div>
                ) : null}
              </div>

              {!minimalist && (
                <>
                  <div className={`mb-4 border-b pb-4 ${sidebarDividerClass}`}>
                    <div className="mb-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${sectionLabelClass}`}>
                          Explorer
                        </div>
                        <InfoTooltip
                          label="File Explorer"
                          description="Only the selected file executes. Other files are passed as reference context."
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative" ref={addMenuRef}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (activeTier === "free") {
                                openUpgradeModal(
                                  "Single-file workflow",
                                  "The Free plan is limited to a single-file minimalist workflow. Upgrade your subscription to add more files or folders."
                                );
                                return;
                              }
                              setShowTreeMenu(false);
                              setShowAddMenu((prev) => !prev);
                            }}
                            className={`${ideButtonClass({
                              compact: true,
                              pill: true,
                              active: showAddMenu,
                            })} font-medium`}
                          >
                            + Add
                          </button>

                          {showAddMenu && (
                            <div className={`absolute right-0 top-9 z-30 w-40 rounded-[1rem] border p-1.5 backdrop-blur-md ${isLight ? "border-slate-200 bg-white/95 shadow-[0_18px_60px_rgba(15,23,42,0.12)]" : "border-neutral-800 bg-[#090909]/95 shadow-[0_18px_60px_rgba(0,0,0,0.5)]"}`}>
                              <button
                                onClick={() => {
                                  createFile();
                                  setShowAddMenu(false);
                                }}
                                className={`w-full rounded-[0.85rem] px-3 py-1.5 text-left text-sm transition-colors ${isLight ? "text-slate-700 hover:bg-slate-100 hover:text-slate-900" : "text-neutral-300 hover:bg-[#141414] hover:text-white"}`}
                              >
                                New file
                              </button>
                              <button
                                onClick={() => {
                                  createFolder();
                                  setShowAddMenu(false);
                                }}
                                className={`w-full rounded-[0.85rem] px-3 py-1.5 text-left text-sm transition-colors ${isLight ? "text-slate-700 hover:bg-slate-100 hover:text-slate-900" : "text-neutral-300 hover:bg-[#141414] hover:text-white"}`}
                              >
                                New folder
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="relative" ref={treeMenuRef}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAddMenu(false);
                              setShowTreeMenu((prev) => !prev);
                            }}
                            className={ideButtonClass({
                              compact: true,
                              pill: true,
                              active: showTreeMenu,
                            })}
                          >
                            Tree
                          </button>

                          {showTreeMenu && (
                            <div className={`absolute right-0 top-9 z-30 w-44 rounded-[1rem] border p-1.5 backdrop-blur-md ${isLight ? "border-slate-200 bg-white/95 shadow-[0_18px_60px_rgba(15,23,42,0.12)]" : "border-neutral-800 bg-[#090909]/95 shadow-[0_18px_60px_rgba(0,0,0,0.5)]"}`}>
                              <button
                                onClick={() => {
                                  setExplorerTree((prev) => setAllFoldersOpen(prev, true));
                                  setShowTreeMenu(false);
                                }}
                                className={`w-full rounded-[0.85rem] px-3 py-1.5 text-left text-sm transition-colors ${isLight ? "text-slate-700 hover:bg-slate-100 hover:text-slate-900" : "text-neutral-300 hover:bg-[#141414] hover:text-white"}`}
                              >
                                Expand all folders
                              </button>
                              <button
                                onClick={() => {
                                  setExplorerTree((prev) => setAllFoldersOpen(prev, false));
                                  setShowTreeMenu(false);
                                }}
                                className={`w-full rounded-[0.85rem] px-3 py-1.5 text-left text-sm transition-colors ${isLight ? "text-slate-700 hover:bg-slate-100 hover:text-slate-900" : "text-neutral-300 hover:bg-[#141414] hover:text-white"}`}
                              >
                                Collapse all folders
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={`mb-3 flex items-center justify-between border-b pb-3 text-[11px] ${sidebarDividerClass}`}>
                      <span className={sectionMetaClass}>Synth files</span>
                      <span className={sectionTitleClass}>{currentSynthFileCount} / {getSynthFileLimitLabel(activeTier)}</span>
                    </div>

                    <div className="mb-3">
                      <ExplorerTree
                        nodes={explorerTree}
                        activeFileId={activeFileId}
                        onSelectFile={setActiveFileId}
                        onToggleFolder={toggleFolder}
                        onContextMenu={(e, nodeId, nodeType) => {
                          e.preventDefault();
                          setContextMenu({
                            x: e.clientX,
                            y: e.clientY,
                            nodeId,
                            nodeType,
                          });
                        }}
                        modeAccentClass={currentModeMeta.accentSoftBg}
                      />
                    </div>

                    <div className={`text-[11px] leading-5 ${sectionMetaClass}`}>
                      Active file executes. Everything else stays as reference context.
                    </div>
                  </div>

                  <div className={`border-t pt-4 ${sidebarDividerClass}`}>
                    <button
                      onClick={() => setShowRunsSection((prev) => !prev)}
                      className="mb-2 flex w-full items-center justify-between text-left"
                    >
                      <span className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${sectionLabelClass}`}>Run History</span>
                        <InfoTooltip
                          label="Run History"
                          description="Restore previous output, diagnostics, artifacts, and generated Python."
                        />
                      </span>
                      <span>{showRunsSection ? "−" : "+"}</span>
                    </button>

                    <div
                      className={`grid overflow-hidden transition-all duration-300 ${
                        showRunsSection ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-70"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="max-h-[28vh] overflow-auto pr-1">
                          {runs.length === 0 ? (
                            <div className={`py-2 text-sm ${sectionMetaClass}`}>
                              No runs yet
                            </div>
                          ) : (
                            runs.map((run, index) => (
                              <div
                                key={run.id}
                                className={`py-3 ${index === 0 ? "" : `border-t ${sidebarDividerClass}`}`}
                              >
                                <button
                                  onClick={() => loadRunDetails(run.id)}
                                  className="block w-full text-left"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div className={`text-[13px] font-medium ${sectionTitleClass}`}>
                                      Run #{run.id.slice(0, 8)}
                                    </div>
                                    {run.mode && (
                                      <div
                                        className={`text-[10px] uppercase tracking-[0.2em] ${MODE_META[run.mode].badge}`}
                                      >
                                        {MODE_META[run.mode].label}
                                      </div>
                                    )}
                                  </div>
                                  <div className={`mt-0.5 text-[11px] ${sectionMetaClass}`}>
                                    {run.status} | {formatRunTimestamp(run.timestamp)}
                                  </div>
                                  {!!run.active_file_path && (
                                    <div className={`mt-0.5 truncate text-[10px] ${sectionMetaClass}`}>
                                      {run.active_file_path}
                                    </div>
                                  )}
                                </button>

                                <div className="mt-2 flex justify-end">
                                  <button
                                    onClick={() => void openRunBugReport(run.id)}
                                    className={`${getModeButtonClass(currentModeMeta, {
                                      compact: true,
                                    }, theme)} rounded-[0.85rem] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em]`}
                                  >
                                    Report
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </aside>

          <section className={`flex min-w-0 flex-1 flex-col ${workspaceBgClass}`}>
            <header
              className={`px-4 py-3 backdrop-blur-md ${headerSurfaceClass}`}
              style={modeBarGlowStyle}
            >
              <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 items-center gap-2.5">
                  <button
                    onClick={() => setSidebarOpen((prev) => !prev)}
                    aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                    className={joinClasses(
                      "group flex h-10 w-10 items-center justify-center rounded-[0.95rem] border transition-all duration-300",
                      isLight ? "border-slate-200 bg-white" : "border-neutral-900 bg-[#0b0b0b]",
                      currentModeMeta.accentHoverBorder,
                      currentModeMeta.accentHoverBg
                    )}
                  >
                    <div className="relative h-4 w-5">
                      <span className="absolute left-0 top-0 h-[2px] w-5 rounded-full bg-neutral-400 transition-all duration-300 group-hover:bg-white" />
                      <span className="absolute left-0 top-1/2 h-[2px] w-5 -translate-y-1/2 rounded-full bg-neutral-400 transition-all duration-300 group-hover:bg-white" />
                      <span className="absolute bottom-0 left-0 h-[2px] w-5 rounded-full bg-neutral-400 transition-all duration-300 group-hover:bg-white" />
                    </div>
                  </button>

                  <Link
                    href="/dashboard"
                    className={`group flex h-10 w-10 items-center justify-center rounded-[1rem] border transition-all duration-200 ${
                      isLight
                        ? "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        : "border-neutral-900 bg-[#0a0a0a] hover:border-neutral-700 hover:bg-[#111111]"
                    }`}
                  >
                    <div className="relative h-5 w-5">
                      <Image
                        src="/brand/trace%20logo%20graphic.png"
                        alt="T.R.A.C.E."
                        fill
                        sizes="20px"
                        className="object-contain opacity-90 transition-opacity duration-200 group-hover:opacity-100"
                        priority
                      />
                    </div>
                  </Link>

                  <div className={`hidden min-w-0 items-center gap-3 border-l pl-4 lg:flex ${sidebarDividerClass}`}>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${isLight ? "border-slate-200 bg-slate-50" : "border-white/[0.08] bg-[#111111]"}`}>
                      <div className={`h-2.5 w-2.5 rounded-full ${currentModeMeta.accentEditorBar}`} />
                    </div>
                    <div className="min-w-0">
                      <div className={`truncate text-[10px] font-semibold uppercase tracking-[0.22em] ${sectionLabelClass}`}>
                        Workspace
                      </div>
                      <div
                        className={`text-[18px] leading-[1.02] break-words ${PAGE_HEADING_CLASS} ${sectionTitleClass}`}
                      >
                        {projectName.trim() || "Untitled Project"}
                      </div>
                      <div className={`mt-1 truncate text-[10px] ${sectionMetaClass}`}>
                        {currentModeMeta.label} mode / {currentLayoutMeta.label} layout
                      </div>
                    </div>
                  </div>

                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <ThemeToggleButton variant="ide" />

                  <button
                    onClick={handleRun}
                    disabled={isRunning || !activeFile}
                    aria-label={iconControls ? runButtonLabel : undefined}
                    title={iconControls ? runButtonLabel : undefined}
                    className={joinClasses(
                      ideButtonClass({
                        disabled: isRunning || !activeFile,
                      }),
                      iconControls
                        ? "inline-flex min-w-11 items-center justify-center px-0 font-medium duration-300"
                        : "px-4 font-medium duration-300",
                      !isRunning &&
                        activeFile &&
                        `${currentModeMeta.accentBorder} ${currentModeMeta.accentBg} ${isLight ? "text-slate-900" : "text-white"} shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:-translate-y-[1px]`
                    )}
                  >
                    {iconControls ? (
                      <MinimalIconLabel icon="run" label={runButtonLabel} />
                    ) : isRunning ? (
                      "Running..."
                    ) : (
                      "Run"
                    )}
                  </button>

                  <button
                    onClick={handleCheck}
                    disabled={isChecking || !activeFile}
                    aria-label={iconControls ? checkButtonLabel : undefined}
                    title={iconControls ? checkButtonLabel : undefined}
                    className={joinClasses(
                      ideButtonClass({
                        disabled: isChecking || !activeFile,
                      }),
                      iconControls
                        ? "inline-flex min-w-11 items-center justify-center px-0 font-medium"
                        : "px-4 font-medium",
                      !isChecking &&
                        activeFile &&
                        isLight
                          ? "border-slate-200 bg-slate-50 text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                          : "border-white/10 bg-white/[0.045] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                    )}
                  >
                    {iconControls ? (
                      <MinimalIconLabel icon="check" label={checkButtonLabel} />
                    ) : isChecking ? (
                      "Checking..."
                    ) : (
                      "Check"
                    )}
                  </button>

                  {isRunning && (
                    <button
                      onClick={handleStopRun}
                      aria-label={iconControls ? "Stop" : undefined}
                      title={iconControls ? "Stop" : undefined}
                      className={`${ideButtonClass({
                        danger: true,
                      })} ${iconControls ? "inline-flex min-w-11 items-center justify-center px-0" : "px-4"}`}
                    >
                      {iconControls ? (
                        <MinimalIconLabel icon="stop" label="Stop" />
                      ) : (
                        "Stop"
                      )}
                    </button>
                  )}

                  <div className="hidden items-center gap-1.5 md:flex">
                    <button
                      onClick={() => {
                        if (!studentModeLocked) setShowModeOverlay(true);
                      }}
                      disabled={studentModeLocked}
                      aria-label={iconControls ? "Mode" : undefined}
                      title={
                        studentModeLocked
                          ? "Student accounts use Problem Solving mode only"
                          : iconControls
                          ? "Mode"
                          : undefined
                      }
                      className={`${ideButtonClass({ compact: true })} ${
                        iconControls ? "inline-flex min-w-9 items-center justify-center px-2" : ""
                      } ${studentModeLocked ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      {iconControls ? (
                        <MinimalIconLabel icon="mode" label="Mode" />
                      ) : (
                        "Mode"
                      )}
                    </button>

                    <button
                      onClick={() => setShowLayoutOverlay(true)}
                      aria-label={iconControls ? "Layout" : undefined}
                      className={`${ideButtonClass({ compact: true })} ${
                        iconControls ? "inline-flex min-w-9 items-center justify-center px-2" : ""
                      }`}
                      title={iconControls ? "Layout" : currentLayoutMeta.short}
                    >
                      {iconControls ? (
                        <MinimalIconLabel icon="layout" label="Layout" />
                      ) : (
                        "Layout"
                      )}
                    </button>

                    <button
                      onClick={openTutorialPlaceholder}
                      aria-label={iconControls ? "Tutorials" : undefined}
                      title={iconControls ? "Tutorials" : undefined}
                      className={`${ideButtonClass({ compact: true })} ${
                        iconControls ? "inline-flex min-w-9 items-center justify-center px-2" : ""
                      }`}
                    >
                      {iconControls ? (
                        <MinimalIconLabel icon="tutorial" label="Tutorials" />
                      ) : (
                        "Tutorials"
                      )}
                    </button>

                    <button
                      onClick={handleTogglePython}
                      aria-label={iconControls ? pythonButtonLabel : undefined}
                      title={iconControls ? pythonButtonLabel : undefined}
                      className={ideButtonClass({
                        compact: true,
                        disabled: !generatedPythonAllowed,
                        active: generatedPythonAllowed && showPython,
                      }) + (iconControls ? " inline-flex min-w-9 items-center justify-center px-2" : "")}
                    >
                      {iconControls ? (
                        <MinimalIconLabel icon="python" label={pythonButtonLabel} />
                      ) : !generatedPythonAllowed ? (
                        "Python Locked"
                      ) : showPython ? (
                        "Hide Python"
                      ) : (
                        "Show Python"
                      )}
                    </button>

                    <button
                      onClick={() => setShowBottomPanel((prev) => !prev)}
                      aria-label={iconControls ? resultsButtonLabel : undefined}
                      title={iconControls ? resultsButtonLabel : undefined}
                      className={ideButtonClass({
                        compact: true,
                        active: showBottomPanel,
                      }) + (iconControls ? " inline-flex min-w-9 items-center justify-center px-2" : "")}
                    >
                      {iconControls ? (
                        <MinimalIconLabel icon="results" label={resultsButtonLabel} />
                      ) : showBottomPanel ? (
                        "Hide Results"
                      ) : (
                        "Show Results"
                      )}
                    </button>

                  </div>

                  <button
                    onClick={devVisionEnabled ? exitDevVision : openDevVisionPrompt}
                    aria-label={iconControls ? devVisionButtonLabel : undefined}
                    title={iconControls ? devVisionButtonLabel : undefined}
                    className={`${ideButtonClass({
                      compact: true,
                      active: devVisionEnabled,
                    })} ${iconControls ? "inline-flex min-w-9 items-center justify-center px-2" : ""}`}
                  >
                    {iconControls ? (
                      <MinimalIconLabel icon="vision" label={devVisionButtonLabel} />
                    ) : devVisionEnabled ? (
                      "Exit Dev Vision"
                    ) : (
                      "Dev Vision"
                    )}
                  </button>

                  <button
                    onClick={openUiBugReport}
                    aria-label={iconControls ? "Report Bug" : undefined}
                    title={iconControls ? "Report Bug" : undefined}
                    className={`${ideButtonClass({ compact: true })} ${
                      iconControls ? "inline-flex min-w-9 items-center justify-center px-2" : ""
                    }`}
                  >
                    {iconControls ? (
                      <MinimalIconLabel icon="bug" label="Report Bug" />
                    ) : (
                      "Report Bug"
                    )}
                  </button>

                  <Link
                    href="/subscriptions"
                    aria-label={iconControls ? "Subscriptions" : undefined}
                    title={iconControls ? "Subscriptions" : undefined}
                    className={`${ideButtonClass({ compact: true })} ${
                      iconControls ? "inline-flex min-w-9 items-center justify-center px-2" : ""
                    }`}
                  >
                    {iconControls ? (
                      <MinimalIconLabel icon="subscriptions" label="Subscriptions" />
                    ) : (
                      "Subscriptions"
                    )}
                  </Link>

                  <button
                    onClick={handleSignOut}
                    aria-label={iconControls ? "Sign Out" : undefined}
                    title={iconControls ? "Sign Out" : undefined}
                    className={`${ideButtonClass({ compact: true })} ${
                      iconControls ? "inline-flex min-w-9 items-center justify-center px-2" : ""
                    }`}
                  >
                    {iconControls ? (
                      <MinimalIconLabel icon="signout" label="Sign Out" />
                    ) : (
                      "Sign Out"
                    )}
                  </button>
                </div>
              </div>
            </header>

            <div className="flex min-h-0 flex-1">
              <div className="flex min-w-0 flex-1 flex-col">
                <div
                  className={`relative isolate px-4 py-2.5 ${subsectionSurfaceClass}`}
                  style={{ ...modeBarGlowStyle, ...protectedDarkSurfaceStyle }}
                >
                  <div className="relative z-10 flex flex-col gap-2.5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div
                        className={`mb-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${sectionLabelClass}`}
                        style={protectedDarkLabelStyle}
                      >
                        Current file
                      </div>
                      <div
                        className={`truncate text-[17px] ${PAGE_HEADING_CLASS} ${sectionTitleClass}`}
                        style={protectedDarkTitleStyle}
                      >
                        {currentFilePath}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {problemMode && normalizedProblemStatement && (
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] ${getProblemStatusClass(problemPanelStatus, theme)}`}
                          >
                            {getProblemStatusLabel(problemPanelStatus)}
                          </span>
                        )}
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] ${subtleChipClass}`}>
                          {referenceFiles.length} reference file{referenceFiles.length === 1 ? "" : "s"} attached
                        </span>
                        {problemMode && normalizedProblemStatement ? (
                          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] ${subtleChipClass}`}>
                            Problem attached
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {inferredKinds.length > 0 ? (
                        inferredKinds.map(([kind, count]) => (
                          <div
                            key={kind}
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] ${subtleChipClass}`}
                          >
                            {humanizeType(kind)} | {count}
                          </div>
                        ))
                      ) : (
                        <div className={`text-[11px] ${sectionMetaClass}`} style={protectedDarkMetaStyle}>
                          No semantic analysis yet
                        </div>
                      )}

                      {!minimalist && (
                        <InfoTooltip
                          label="Editor Intelligence"
                          description="This file is the only executable source. Inferred structure, references, and diagnostics appear after Check or Run."
                        />
                      )}
                    </div>
                  </div>

                  {showEditorAnalysisRail && semanticHints.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {semanticHints.map((hint) => (
                        <div
                          key={hint.id}
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] ${subtleChipClass}`}
                        >
                          {hint.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`relative min-h-0 flex-1 overflow-hidden ${workspaceBgClass}`}>
                  {showEditorInspector && (
                    <div className="absolute right-3 top-3 z-20 hidden xl:block">
                      <button
                        onClick={() => setAnalysisOpen((prev) => !prev)}
                        className={`${ideButtonClass({
                          compact: true,
                          pill: true,
                          active: analysisOpen,
                        })} mb-1.5 ml-auto flex items-center gap-1.5 ${isLight ? "bg-white/90" : "bg-[#0b0b0b]/80"} text-[10px]`}
                      >
                        <span>{analysisOpen ? "Hide analysis" : "Show analysis"}</span>
                        <span
                          className={`transition-transform duration-300 ${analysisOpen ? "rotate-180" : "rotate-0"}`}
                        >
                          ▾
                        </span>
                      </button>

                      <div
                        className={`origin-top-right overflow-hidden rounded-[1rem] border backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          isLight ? "border-slate-200 bg-white/92" : "border-white/[0.05] bg-[#090909]/72"
                        } ${
                          analysisOpen
                            ? "max-h-72 w-52 scale-100 opacity-100"
                            : "max-h-0 w-52 scale-95 opacity-0"
                        }`}
                      >
                        <div className="p-2.5">
                          <div className={`mb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] ${softTextClass}`}>
                            Analysis summary
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className={softTextClass}>Executable lines</span>
                              <span className={strongTextAltClass}>{editableLineCount}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className={softTextClass}>Warnings</span>
                              <span className="text-yellow-300">{diagnosticsSummary.warnings}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className={softTextClass}>Blocked</span>
                              <span className="text-rose-300">{diagnosticsSummary.blocked}</span>
                            </div>
                            <div className={`mt-1 rounded-[0.85rem] border px-2.5 py-2 text-[10px] leading-4.5 ${isLight ? "border-slate-200 bg-slate-50 text-slate-600" : "border-white/[0.05] bg-black/25 text-neutral-400"}`}>
                              {interpretationLines.length > 0
                                ? "Semantic cues are folded into the editor header and diagnostics panel."
                                : "Run Check to populate editor semantics and execution diagnostics."}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeFile ? (
                    <Editor
                      onMount={(editor, monaco) => {
                        editorRef.current = editor;
                        monacoRef.current = monaco;
                        ensureMonacoThemes(monaco);
                      }}
                      height="100%"
                      language="plaintext"
                      value={activeFile.content}
                      onChange={(value) => updateActiveFileContent(value || "")}
                      beforeMount={ensureMonacoThemes}
                      theme={isLight ? "trace-light" : "trace-dark"}
                      options={{
                        minimap: { enabled: false },
                        fontSize: minimalist ? 17 : 15,
                        lineHeight: minimalist ? 32 : 28,
                        wordWrap: "on",
                        scrollBeyondLastLine: false,
                        lineNumbers: "on",
                        glyphMargin: false,
                        folding: false,
                        lineDecorationsWidth: 6,
                        padding: {
                          top: minimalist ? 24 : 18,
                          bottom: minimalist ? 24 : 18,
                        },
                        renderLineHighlight: "gutter",
                        cursorBlinking: "smooth",
                        smoothScrolling: true,
                        overviewRulerBorder: false,
                      }}
                    />
                  ) : (
                    <div className={`flex h-full items-center justify-center ${softTextClass}`}>
                      No file selected.
                    </div>
                  )}
                </div>

                <div
                  className={`relative isolate overflow-hidden border-t transition-all duration-500 ease-in-out ${panelBorderClass} ${panelBgClass} ${
                    showBottomPanel ? "opacity-100" : "opacity-0"
                  }`}
                  style={{
                    maxHeight: showBottomPanel ? `${terminalHeight}px` : "0px",
                    ...modePanelGlowStyle,
                    ...protectedDarkSurfaceStyle,
                  }}
                >
                  <div
                    onMouseDown={() => setIsResizingTerminal(true)}
                    className={`h-1.5 cursor-row-resize transition-colors duration-200 ${isLight ? "bg-slate-100 hover:bg-slate-200" : "bg-[#0a0a0a] hover:bg-neutral-800"}`}
                  />

                  <div className="relative z-10 flex h-full flex-col px-4 py-3" style={protectedDarkSurfaceStyle}>
                    <div className="mb-2.5 flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div
                          className={`text-[13px] font-medium ${sectionTitleClass}`}
                          style={protectedDarkTitleStyle}
                        >
                          Results
                        </div>
                        <div
                          className={`mt-0.5 text-[11px] ${sectionMetaClass}`}
                          style={protectedDarkMetaStyle}
                        >
                          {outputSummaryLabel}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {bottomTabs.map((tab) => {
                          const active = activeBottomTab === tab;
                          const count =
                            tab === "validation"
                              ? interpretationLines.length
                              : tab === "visual"
                              ? visualArtifacts.length
                              : 0;

                          return (
                            <button
                              key={tab}
                              onClick={() => setActiveBottomTab(tab)}
                              aria-label={
                                iconControls
                                  ? `${tab === "visual" ? "Visual" : tab === "validation" ? "Validation" : "Terminal"}${count > 0 ? ` (${count})` : ""}`
                                  : undefined
                              }
                              title={
                                iconControls
                                  ? `${tab === "visual" ? "Visual" : tab === "validation" ? "Validation" : "Terminal"}${count > 0 ? ` (${count})` : ""}`
                                  : undefined
                              }
                              className={`${ideButtonClass({
                                active,
                                compact: true,
                                pill: true,
                              })} ${
                                iconControls ? "inline-flex min-w-10 items-center justify-center px-2" : "uppercase tracking-[0.18em]"
                              }`}
                            >
                              {iconControls ? (
                                <MinimalIconLabel
                                  icon={
                                    tab === "visual"
                                      ? "visual"
                                      : tab === "validation"
                                      ? "check"
                                      : "terminal"
                                  }
                                  label={
                                    tab === "visual"
                                      ? "Visual"
                                      : tab === "validation"
                                      ? "Validation"
                                      : "Terminal"
                                  }
                                  count={count}
                                />
                              ) : (
                                <>
                                  {tab === "visual" ? "Visual" : tab}
                                  {count > 0 ? ` (${count})` : ""}
                                </>
                              )}
                            </button>
                          );
                        })}

                        {isRunning && (
                          <div className={`ml-2 flex items-center gap-2 text-xs ${sectionMetaClass}`}>
                            <div
                              className={`h-3 w-3 animate-spin rounded-full border border-neutral-700 ${currentModeMeta.terminalBorder}`}
                            />
                            <span>Streaming</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={`min-h-0 flex-1 overflow-hidden rounded-[1.1rem] border ${panelBorderClass} ${isLight ? "bg-slate-50" : "bg-[#050505]"}`}>
                      {activeBottomTab === "terminal" && (
                        <div className="flex h-full flex-col">
                          <div
                            ref={terminalScrollRef}
                            className="min-h-0 flex-1 overflow-auto p-3"
                            style={protectedDarkTerminalTextStyle}
                          >
                            <div className="min-w-0 space-y-2">
                              {terminalEntries.length === 0 ? (
                                <div
                                  className={`rounded-[0.95rem] border px-3 py-2.5 text-[13px] ${
                                    isLight
                                      ? "border-slate-200 bg-white text-slate-500"
                                      : "border-neutral-900 bg-[#0d0d0d] text-neutral-500"
                                  }`}
                                >
                                  Terminal output will appear here.
                                </div>
                              ) : (
                                terminalEntries.map((entry) =>
                                  entry.stream === "runtime" ? (
                                    <div
                                      key={entry.id}
                                      className={`inline-flex w-fit items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                                        isLight
                                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                          : "border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-200"
                                      }`}
                                    >
                                      <span
                                        className={`flex h-5 w-5 items-center justify-center rounded-full border text-[9px] ${
                                          isLight
                                            ? "border-emerald-200 bg-white"
                                            : "border-emerald-400/25 bg-emerald-400/[0.08]"
                                        }`}
                                        aria-label="Subprocess runtime"
                                      >
                                        {entry.symbol || "SP"}
                                      </span>
                                      <span>{terminalStreamLabel(entry.stream)}</span>
                                    </div>
                                  ) : (
                                    <div
                                      key={entry.id}
                                      className={`rounded-[0.95rem] border ${
                                        entry.stream === "stderr"
                                          ? isLight
                                            ? "border-rose-200 bg-rose-50"
                                            : "border-rose-500/20 bg-rose-500/[0.06]"
                                          : entry.stream === "stdout"
                                          ? isLight
                                            ? "border-sky-200 bg-white"
                                            : "border-sky-500/15 bg-sky-500/[0.04]"
                                          : isLight
                                          ? "border-slate-200 bg-white"
                                          : "border-neutral-900 bg-[#0d0d0d]"
                                      }`}
                                    >
                                      <div
                                        className={`flex items-center justify-between border-b px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                                          entry.stream === "stderr"
                                            ? isLight
                                              ? "border-rose-200 text-rose-700"
                                              : "border-rose-500/15 text-rose-200"
                                            : entry.stream === "stdout"
                                            ? isLight
                                              ? "border-sky-100 text-sky-700"
                                              : "border-sky-500/10 text-sky-200"
                                            : isLight
                                            ? "border-slate-200 text-slate-500"
                                            : "border-neutral-900 text-neutral-500"
                                        }`}
                                      >
                                        <span>{terminalStreamLabel(entry.stream)}</span>
                                        <span>{entry.text.split(/\r?\n/).filter(Boolean).length || 1} line</span>
                                      </div>
                                      <pre
                                        className={`whitespace-pre-wrap px-3 py-2.5 text-[13px] leading-6 ${terminalTextClass}`}
                                        style={protectedDarkTerminalTextStyle}
                                      >
                                        {entry.text}
                                      </pre>
                                    </div>
                                  )
                                )
                              )}
                            </div>
                          </div>

                          {inputPrompt && (
                            <div className={`border-t p-2.5 ${panelBorderClass} ${isLight ? "bg-white" : "bg-[#090909]"}`}>
                              <div className={`mb-1.5 text-[11px] ${sectionMetaClass}`}>
                                Awaiting input{inputPrompt ? `: ${inputPrompt}` : "."}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <input
                                  value={terminalInput}
                                  onChange={(e) => setTerminalInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSendTerminalInput();
                                  }}
                                  className={`flex-1 rounded-[0.95rem] px-3 py-2 text-[13px] outline-none transition-colors ${inputSurfaceClass} ${isLight ? "focus:border-blue-400/60" : "focus:border-neutral-600"}`}
                                  placeholder="Type input for the running program..."
                                />
                                <button
                                  onClick={handleSendTerminalInput}
                                  aria-label={iconControls ? "Send input" : undefined}
                                  title={iconControls ? "Send input" : undefined}
                                  className={`${ideButtonClass()} rounded-[0.95rem] px-3 py-2 ${
                                    iconControls ? "inline-flex min-w-10 items-center justify-center" : ""
                                  }`}
                                >
                                  {iconControls ? (
                                    <MinimalIconLabel icon="send" label="Send input" />
                                  ) : (
                                    "Send"
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {activeBottomTab === "validation" && (
                        <div className="flex h-full flex-col">
                          {problemMode && normalizedProblemStatement && (
                            <div className={`border-b px-3 py-2.5 ${panelBorderClass} ${isLight ? "bg-white" : "bg-[#0b0b0b]"}`}>
                              <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0">
                                  <div className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${softTextClass}`}>
                                    Problem Alignment
                                  </div>
                                  <div className={`mt-1 text-[13px] ${strongTextAltClass}`}>{problemGoalSummary}</div>
                                </div>
                                <div
                                  className={`inline-flex items-center gap-2 self-start rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${getProblemStatusClass(problemPanelStatus, theme)}`}
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                  {getProblemStatusLabel(problemPanelStatus)}
                                </div>
                              </div>
                              {problemIssues.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {problemIssues.map((issue, index) => (
                                    <div
                                      key={`${issue.kind}-${index}-${issue.message}`}
                                      className={`rounded-full border px-2.5 py-0.5 text-[10px] ${isLight ? "border-slate-200 bg-slate-50 text-slate-700" : "border-neutral-800 bg-black/20 text-neutral-300"}`}
                                    >
                                      {issue.message}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          <div className={`grid grid-cols-3 gap-2 border-b px-3 py-2 ${panelBorderClass} ${isLight ? "bg-white" : "bg-[#0b0b0b]"}`}>
                            {checkMetrics.map((metric) => (
                              <div
                                key={metric.label}
                                className={`rounded-[0.8rem] border px-2.5 py-2 ${
                                  isLight
                                    ? "border-slate-200 bg-slate-50"
                                    : "border-neutral-800 bg-black/20"
                                }`}
                              >
                                <div className={`text-[9px] font-semibold uppercase tracking-[0.14em] ${softTextClass}`}>
                                  {metric.label}
                                </div>
                                <div className={`mt-1 text-[12px] font-medium ${strongTextAltClass}`}>
                                  {metric.value}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className={`grid grid-cols-[80px_88px_minmax(0,1fr)] border-b px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${panelBorderClass} ${isLight ? "bg-slate-50 text-slate-500" : "bg-[#090909] text-neutral-500"}`}>
                            <div>Line</div>
                            <div>Status</div>
                            <div>Diagnostic</div>
                          </div>

                          <div className="h-full overflow-y-auto overflow-x-hidden">
                            {resolvedInterpretationLines.length === 0 ? (
                              <div className="p-3">
                                <div className={`rounded-[1rem] border px-3 py-2.5 text-sm ${isLight ? "border-slate-200 bg-white text-slate-500" : "border-neutral-900 bg-[#0d0d0d] text-neutral-600"}`}>
                                  No interpretation results yet. Click Check or Run.
                                </div>
                              </div>
                            ) : (
                              <div className={isLight ? "divide-y divide-slate-200" : "divide-y divide-neutral-900"}>
                                {resolvedInterpretationLines.map((line, index) => {
                                  const severity = getSeverity(line);
                                  const lineLabel = line.resolvedLineNumber || index + 1;

                                  return (
                                    <div
                                      key={`${index}-${line.raw}`}
                                      className="grid grid-cols-[80px_88px_minmax(0,1fr)] items-start px-3 py-2.5 text-[13px]"
                                    >
                                      <div className={`pr-3 ${softTextClass}`}>Line {lineLabel}</div>

                                      <div className="pr-3">
                                        <div
                                          className={`inline-flex items-center gap-2 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${validationSeverityClass(
                                            severity,
                                          )}`}
                                        >
                                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                          {severity}
                                        </div>
                                      </div>

                                      <div className="min-w-0">
                                        <div className={`truncate ${strongTextAltClass}`}>{line.raw}</div>
                                        <div className={`mt-0.5 text-[11px] leading-5 ${softTextClass}`}>
                                          <span className={`mr-2 uppercase tracking-[0.12em] ${isLight ? "text-slate-400" : "text-neutral-600"}`}>
                                            {humanizeType(line.type)}
                                          </span>
                                          {line.message}
                                        </div>
                                        {(line.ai_message || line.logic_risk || line.suggested_fix) && (
                                          <div
                                            className={`mt-2 rounded-[0.8rem] border px-2.5 py-2 text-[11px] leading-5 ${
                                              line.logic_risk
                                                ? isLight
                                                  ? "border-amber-200 bg-amber-50 text-amber-800"
                                                  : "border-amber-500/20 bg-amber-500/[0.06] text-amber-100"
                                                : isLight
                                                ? "border-slate-200 bg-slate-50 text-slate-600"
                                                : "border-neutral-800 bg-[#0a0a0a] text-neutral-300"
                                            }`}
                                          >
                                            {line.ai_message && <div>{line.ai_message}</div>}
                                            {line.logic_risk && (
                                              <div className="mt-1">
                                                Logic risk: {line.logic_risk}
                                              </div>
                                            )}
                                            {line.suggested_fix && (
                                              <div className="mt-1">Fix: {line.suggested_fix}</div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {activeBottomTab === "visual" && (
                        <div className="h-full overflow-auto p-3">
                          {visualArtifacts.length === 0 ? (
                            <div className={`rounded-[1rem] border px-3 py-2.5 text-sm ${isLight ? "border-slate-200 bg-white text-slate-500" : "border-neutral-900 bg-[#0d0d0d] text-neutral-600"}`}>
                              No visual output yet. Plots, images, tables, and HTML will appear here.
                            </div>
                          ) : (
                            <div className="grid gap-3 md:grid-cols-2">
                              {visualArtifacts.map((artifact) => (
                                <div
                                  key={`${artifact.source}-${artifact.name}`}
                                  className={`overflow-hidden rounded-[1rem] border ${isLight ? "border-slate-200 bg-white" : "border-neutral-900 bg-[#0d0d0d]"}`}
                                >
                                  <div className={`flex items-center justify-between border-b px-3 py-2 text-[11px] ${panelBorderClass} ${softTextClass}`}>
                                    <div className="flex min-w-0 items-center gap-2">
                                      <span className="truncate">{artifact.label}</span>
                                      <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ${isLight ? "border-slate-200 bg-slate-50 text-slate-500" : "border-neutral-800 bg-[#090909] text-neutral-500"}`}>
                                        {artifact.source}
                                      </span>
                                    </div>
                                    <a
                                      href={artifact.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className={currentModeMeta.accentText}
                                    >
                                      Open
                                    </a>
                                  </div>

                                  {artifactErrors[artifact.name] ? (
                                    <div className="p-4 text-sm text-rose-300">
                                      Could not load this artifact in-window.
                                    </div>
                                  ) : (
                                    <ArtifactPreview
                                      artifact={artifact}
                                      onError={(name) =>
                                        setArtifactErrors((prev) => ({ ...prev, [name]: true }))
                                      }
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {showProblemPanel && (
                <div
                  className={`relative isolate overflow-hidden border-l transition-all duration-500 ease-in-out ${
                    isLight
                      ? "border-slate-200 bg-white"
                      : "border-neutral-900 bg-[#070707]"
                  } ${problemPanelOpen ? "w-[19.5rem] opacity-100" : "w-[3.25rem] opacity-100"}`}
                  style={{ ...modePanelGlowStyle, ...protectedDarkSurfaceStyle }}
                >
                  <div className="relative z-10 flex h-full min-w-[3.25rem]">
                    <button
                      onClick={() => setProblemPanelOpen((prev) => !prev)}
                      className={`group relative flex w-[3.25rem] shrink-0 items-center justify-center border-r text-[10px] font-semibold uppercase tracking-[0.24em] transition-colors duration-300 ${
                        isLight
                          ? "border-amber-200 bg-[linear-gradient(180deg,rgba(251,191,36,0.14),rgba(255,255,255,0.96)_30%,rgba(248,250,252,0.98))] text-amber-700 hover:bg-[linear-gradient(180deg,rgba(245,158,11,0.18),rgba(255,255,255,1)_30%,rgba(241,245,249,1))]"
                          : "border-amber-400/15 bg-[linear-gradient(180deg,rgba(245,158,11,0.1),rgba(8,8,8,0.03)_28%,rgba(8,8,8,0.92))] text-amber-200 hover:bg-[linear-gradient(180deg,rgba(245,158,11,0.15),rgba(8,8,8,0.06)_28%,rgba(8,8,8,0.96))]"
                      }`}
                      aria-label={problemPanelOpen ? "Collapse problem panel" : "Expand problem panel"}
                    >
                      <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-amber-300/40" />
                      <span className="-rotate-90 whitespace-nowrap">Problem</span>
                    </button>

                      <div
                        className={`min-w-0 flex-1 overflow-hidden transition-all duration-300 ${
                          problemPanelOpen ? "opacity-100" : "opacity-0"
                        }`}
                        style={protectedDarkSurfaceStyle}
                      >
                        <div className="flex h-full flex-col">
                          <div
                            className={`border-b px-3.5 py-2.5 ${
                              isLight
                                ? "border-slate-200 bg-slate-50"
                                : "border-neutral-900 bg-[#090909]"
                            }`}
                            style={{ ...modeBarGlowStyle, ...protectedDarkSurfaceStyle }}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div
                                  className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${
                                    isLight ? "text-slate-500" : "text-neutral-500"
                                  }`}
                                  style={protectedDarkLabelStyle}
                                >
                                  Problem Context
                                </div>
                                <div
                                  className={`mt-0.5 text-[11px] ${isLight ? "text-slate-500" : "text-neutral-500"}`}
                                  style={protectedDarkMetaStyle}
                                >
                                  Quiet alignment checks for the active solution
                                </div>
                              </div>
                            <div
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${getProblemStatusClass(problemPanelStatus, theme)}`}
                            >
                              {normalizedProblemStatement
                                ? getProblemStatusLabel(problemPanelStatus)
                                : "Add Prompt"}
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-3.5 py-3" style={protectedDarkSurfaceStyle}>
                          <div className="space-y-3">
                            <div>
                              <div
                                className={`mb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] ${
                                  isLight ? "text-slate-500" : "text-neutral-500"
                                }`}
                                style={protectedDarkLabelStyle}
                              >
                                Problem Input
                              </div>
                              <textarea
                                value={problemStatement}
                                onChange={(e) => {
                                  setProblemStatement(e.target.value);
                                  setProblemAlignment(null);
                                }}
                                placeholder="Paste the coding prompt, algorithm question, or structured task here..."
                                rows={10}
                                className={`min-h-[9.5rem] w-full resize-none rounded-[1.05rem] border px-3 py-2.5 text-[13px] leading-6 outline-none transition-all focus:ring-1 focus:ring-amber-400/20 ${
                                  isLight
                                    ? "border-slate-200 bg-[#f8fafc] text-slate-900 placeholder:text-slate-400 focus:border-amber-300"
                                    : "border-neutral-800 bg-[#080808] text-white placeholder:text-neutral-600 focus:border-amber-400/35"
                                }`}
                              />
                            </div>

                            <div
                              className={`rounded-[1.05rem] border p-3 ${
                                isLight
                                  ? "border-slate-200 bg-[#f8fafc]"
                                  : "border-white/[0.05] bg-white/[0.015]"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div
                                    className={`mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${
                                      isLight ? "text-slate-500" : "text-neutral-500"
                                    }`}
                                    style={protectedDarkLabelStyle}
                                  >
                                    Goal Summary
                                  </div>
                                  <div
                                    className={`text-[13px] leading-5 ${isLight ? "text-slate-700" : "text-neutral-200"}`}
                                    style={!isLight ? protectedDarkMetaStyle : undefined}
                                  >
                                    {problemGoalSummary}
                                  </div>
                                </div>
                                <div
                                  className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${getProblemStatusClass(problemPanelStatus, theme)}`}
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                  {normalizedProblemStatement
                                    ? getProblemStatusLabel(problemPanelStatus)
                                    : "Awaiting Problem"}
                                </div>
                              </div>
                              <div
                                className={`mt-2 text-[11px] ${isLight ? "text-slate-500" : "text-neutral-500"}`}
                                style={protectedDarkMetaStyle}
                              >
                                Updates on Check or Run
                              </div>
                            </div>

                            <div
                              className={`rounded-[1.05rem] border p-3 ${
                                isLight
                                  ? "border-slate-200 bg-[#f8fafc]"
                                  : "border-white/[0.05] bg-white/[0.015]"
                              }`}
                            >
                              <div
                                className={`mb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] ${
                                  isLight ? "text-slate-500" : "text-neutral-500"
                                }`}
                                style={protectedDarkLabelStyle}
                              >
                                Issues / Hints
                              </div>
                              {problemIssues.length > 0 ? (
                                <div className="space-y-1.5">
                                  {problemIssues.map((issue, index) => (
                                    <div
                                      key={`${issue.kind}-${index}-${issue.message}`}
                                      className={`rounded-[0.9rem] border px-3 py-2 text-[13px] leading-5 ${
                                        isLight
                                          ? "border-slate-200 bg-white text-slate-700"
                                          : "border-neutral-900 bg-black/20 text-neutral-300"
                                      }`}
                                    >
                                      {issue.line_number ? `Line ${issue.line_number}: ` : ""}
                                      {issue.message}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div
                                  className={`text-[13px] leading-5 ${isLight ? "text-slate-500" : "text-neutral-500"}`}
                                  style={protectedDarkMetaStyle}
                                >
                                  {normalizedProblemStatement
                                    ? "No problem-specific notices yet. Run Check to compare the draft against the prompt."
                                    : "Add a problem statement to enable alignment feedback."}
                                </div>
                              )}
                            </div>

                            {problemAlignment?.problem_model?.explicit_constraints?.length ? (
                              <div>
                              <div
                                className={`mb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] ${
                                  isLight ? "text-slate-500" : "text-neutral-500"
                                }`}
                                style={protectedDarkLabelStyle}
                              >
                                Constraints
                              </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {problemAlignment.problem_model.explicit_constraints
                                    .slice(0, 3)
                                    .map((constraint, index) => (
                                      <div
                                        key={`${constraint}-${index}`}
                                        className={`rounded-full border px-2.5 py-0.5 text-[10px] ${
                                          isLight
                                            ? "border-amber-200 bg-amber-50 text-amber-700"
                                            : "border-amber-400/15 bg-amber-500/[0.06] text-amber-100/90"
                                        }`}
                                      >
                                        {constraint}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div
                className={`overflow-hidden border-l transition-all duration-500 ease-in-out ${panelBorderClass} ${isLight ? "bg-white" : "bg-[#070707]"} ${
                  showPython
                    ? developerExpanded
                      ? "w-[35%] opacity-100"
                      : "w-[30%] opacity-100"
                    : "w-0 opacity-0"
                }`}
              >
                <div
                  className="relative isolate h-full min-w-[360px]"
                  style={{ ...modeBarGlowStyle, ...protectedDarkSurfaceStyle }}
                >
                  <div
                    className={`relative z-10 flex items-center justify-between border-b px-4 py-2.5 text-[11px] ${panelBorderClass} ${isLight ? "bg-slate-50 text-slate-500" : "bg-[#101010] text-neutral-200"}`}
                    style={{ ...modeBarGlowStyle, ...protectedDarkSurfaceStyle }}
                  >
                    <div>
                      <div
                        className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${sectionLabelClass}`}
                        style={protectedDarkLabelStyle}
                      >
                        Generated Python
                      </div>
                      <div className={`mt-0.5 text-[10px] ${sectionMetaClass}`} style={protectedDarkMetaStyle}>
                        Secondary implementation view
                      </div>
                    </div>
                    {!minimalist && (
                      <InfoTooltip
                        label="Generated Python"
                        description="This pane is read-only. Edit the syntaxless source file to change behavior."
                      />
                    )}
                  </div>

                  <Editor
                    beforeMount={ensureMonacoThemes}
                    height="100%"
                    language="python"
                    value={generatedPython}
                    theme={isLight ? "trace-light" : "trace-dark"}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineHeight: 26,
                      scrollBeyondLastLine: false,
                      padding: { top: 14, bottom: 14 },
                      smoothScrolling: true,
                    }}
                  />
                </div>
              </div>

              <div
                className={`overflow-hidden border-l transition-all duration-500 ease-in-out ${panelBorderClass} ${
                  isLight ? "bg-white" : "bg-[#060606]"
                } ${devVisionEnabled ? (developerExpanded ? "w-[26rem] opacity-100" : "w-[24rem] opacity-100") : "w-0 opacity-0"}`}
              >
                <div className="flex h-full min-w-[360px] flex-col">
                  <div
                    className={`border-b px-4 py-3 ${
                      isLight ? "border-slate-200 bg-slate-50" : "border-neutral-900 bg-[#090909]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${softTextClass}`}>
                          Dev Vision
                        </div>
                        <div className={`mt-1 text-[13px] ${strongTextAltClass}`}>
                          Locked debugging telemetry
                        </div>
                        <div className={`mt-0.5 text-[11px] ${softTextClass}`}>
                          This panel stays open until Dev Vision is exited.
                        </div>
                      </div>
                      <button
                        onClick={exitDevVision}
                        className={`${ideButtonClass({ compact: true, pill: true })} shrink-0`}
                      >
                        Exit
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-3 py-3">
                    <div className="space-y-3">
                      <div
                        className={`rounded-[1.05rem] border p-3 ${
                          isLight ? "border-slate-200 bg-[#f8fafc]" : "border-white/[0.05] bg-white/[0.015]"
                        }`}
                      >
                        <div className={`mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] ${softTextClass}`}>
                          Run Metrics
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {checkMetrics.map((metric) => (
                            <div
                              key={metric.label}
                              className={`rounded-[0.95rem] border px-3 py-2 ${
                                isLight ? "border-slate-200 bg-white" : "border-neutral-900 bg-black/20"
                              }`}
                            >
                              <div className={`text-[10px] uppercase tracking-[0.18em] ${softTextClass}`}>
                                {metric.label}
                              </div>
                              <div className={`mt-1 text-[13px] font-medium ${strongTextAltClass}`}>
                                {metric.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div
                        className={`rounded-[1.05rem] border p-3 ${
                          isLight ? "border-slate-200 bg-[#f8fafc]" : "border-white/[0.05] bg-white/[0.015]"
                        }`}
                      >
                        <div className={`mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] ${softTextClass}`}>
                          Pipeline Timing
                        </div>
                        <div className="space-y-2">
                          {(devMetrics?.steps || []).length === 0 ? (
                            <div className={`rounded-[0.95rem] border px-3 py-2 text-[12px] ${isLight ? "border-slate-200 bg-white text-slate-500" : "border-neutral-900 bg-black/20 text-neutral-500"}`}>
                              Run the file to populate step timings.
                            </div>
                          ) : (
                            (devMetrics?.steps || []).map((step) => (
                              <div
                                key={step.key}
                                className={`rounded-[0.95rem] border px-3 py-2 ${
                                  isLight ? "border-slate-200 bg-white" : "border-neutral-900 bg-black/20"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <div className={`text-[13px] ${strongTextAltClass}`}>{step.label}</div>
                                    <div className={`mt-0.5 text-[11px] ${softTextClass}`}>
                                      {formatDurationMs(step.duration_ms)}
                                    </div>
                                  </div>
                                  <div
                                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${getDevStepStatusClass(step.status, theme)}`}
                                  >
                                    {step.status}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div
                        className={`rounded-[1.05rem] border p-3 ${
                          isLight ? "border-slate-200 bg-[#f8fafc]" : "border-white/[0.05] bg-white/[0.015]"
                        }`}
                      >
                        <div className={`mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] ${softTextClass}`}>
                          Line-by-Line Intent
                        </div>
                        <div className="space-y-2">
                          {resolvedInterpretationLines.length === 0 ? (
                            <div className={`rounded-[0.95rem] border px-3 py-2 text-[12px] ${isLight ? "border-slate-200 bg-white text-slate-500" : "border-neutral-900 bg-black/20 text-neutral-500"}`}>
                              No interpretation data yet.
                            </div>
                          ) : (
                            resolvedInterpretationLines.map((line, index) => {
                              const severity = getSeverity(line);
                              const confidence =
                                line.intent?.confidence_in_intent ?? line.confidence ?? null;
                              const strictStatus = line.strict_specificity_status || null;

                              return (
                                <div
                                  key={`${line.resolvedLineNumber || index}-${line.raw}`}
                                  className={`rounded-[0.95rem] border px-3 py-2 ${
                                    isLight ? "border-slate-200 bg-white" : "border-neutral-900 bg-black/20"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <div className={`text-[13px] ${strongTextAltClass}`}>
                                        Line {line.resolvedLineNumber || index + 1}
                                      </div>
                                      <div className={`mt-0.5 text-[11px] ${softTextClass}`}>
                                        {line.raw}
                                      </div>
                                    </div>
                                    <div
                                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${validationSeverityClass(
                                        severity,
                                      )}`}
                                    >
                                      {severity}
                                    </div>
                                  </div>

                                  <div className={`mt-2 text-[12px] ${strongTextAltClass}`}>
                                    {formatIntentLabel(line)}
                                  </div>

                                  <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                                    <div className={`rounded-[0.8rem] border px-2.5 py-2 ${isLight ? "border-slate-200 bg-slate-50 text-slate-600" : "border-neutral-800 bg-[#0a0a0a] text-neutral-400"}`}>
                                      <div className="uppercase tracking-[0.16em]">Mode Specificity</div>
                                      <div className={`mt-1 text-[12px] ${strongTextAltClass}`}>
                                        {formatScore(line.specificity_score)}
                                      </div>
                                    </div>
                                    <div className={`rounded-[0.8rem] border px-2.5 py-2 ${isLight ? "border-slate-200 bg-slate-50 text-slate-600" : "border-neutral-800 bg-[#0a0a0a] text-neutral-400"}`}>
                                      <div className="uppercase tracking-[0.16em]">Raw Specificity</div>
                                      <div className={`mt-1 text-[12px] ${strongTextAltClass}`}>
                                        {formatScore(line.raw_specificity_score)}
                                      </div>
                                    </div>
                                    <div className={`rounded-[0.8rem] border px-2.5 py-2 ${isLight ? "border-slate-200 bg-slate-50 text-slate-600" : "border-neutral-800 bg-[#0a0a0a] text-neutral-400"}`}>
                                      <div className="uppercase tracking-[0.16em]">Strict Score</div>
                                      <div className={`mt-1 text-[12px] ${strongTextAltClass}`}>
                                        {formatScore(line.strict_specificity_score)}
                                      </div>
                                    </div>
                                    <div className={`rounded-[0.8rem] border px-2.5 py-2 ${isLight ? "border-slate-200 bg-slate-50 text-slate-600" : "border-neutral-800 bg-[#0a0a0a] text-neutral-400"}`}>
                                      <div className="uppercase tracking-[0.16em]">Structure Score</div>
                                      <div className={`mt-1 text-[12px] ${strongTextAltClass}`}>
                                        {formatScore(line.structure_specificity_score)}
                                      </div>
                                    </div>
                                    <div className={`rounded-[0.8rem] border px-2.5 py-2 ${isLight ? "border-slate-200 bg-slate-50 text-slate-600" : "border-neutral-800 bg-[#0a0a0a] text-neutral-400"}`}>
                                      <div className="uppercase tracking-[0.16em]">Mode Struct Penalty</div>
                                      <div className={`mt-1 text-[12px] ${strongTextAltClass}`}>
                                        {formatScore(line.structure_penalty)}
                                      </div>
                                    </div>
                                    <div className={`rounded-[0.8rem] border px-2.5 py-2 ${isLight ? "border-slate-200 bg-slate-50 text-slate-600" : "border-neutral-800 bg-[#0a0a0a] text-neutral-400"}`}>
                                      <div className="uppercase tracking-[0.16em]">Intent Confidence</div>
                                      <div className={`mt-1 text-[12px] ${strongTextAltClass}`}>
                                        {formatScore(confidence)}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    <div
                                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${getCompatibilityClass(strictStatus, theme)}`}
                                    >
                                      Strict Compatibility {strictStatus || "n/a"}
                                    </div>
                                    <div
                                      className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] ${
                                        isLight ? "border-slate-200 bg-white text-slate-600" : "border-neutral-800 bg-[#090909] text-neutral-400"
                                      }`}
                                    >
                                      Strict Struct Penalty {formatScore(line.strict_structure_penalty)}
                                    </div>
                                  </div>

                                  {(line.intent?.target || line.intent?.value_or_source || line.intent?.context) && (
                                    <div className={`mt-2 rounded-[0.8rem] border px-2.5 py-2 text-[11px] leading-5 ${isLight ? "border-slate-200 bg-slate-50 text-slate-600" : "border-neutral-800 bg-[#0a0a0a] text-neutral-400"}`}>
                                      <div>Target: {line.intent?.target || "n/a"}</div>
                                      <div>Source: {line.intent?.value_or_source || "n/a"}</div>
                                      <div>Context: {line.intent?.context || "n/a"}</div>
                                    </div>
                                  )}

                                  {line.specificity_reasoning && (
                                    <div className={`mt-2 text-[11px] leading-5 ${softTextClass}`}>
                                      Mode note: {line.specificity_reasoning}
                                    </div>
                                  )}

                                  {(line.ai_message || line.logic_risk || line.suggested_fix || line.generated_code_excerpt) && (
                                    <div
                                      className={`mt-2 rounded-[0.8rem] border px-2.5 py-2 text-[11px] leading-5 ${
                                        line.logic_risk
                                          ? isLight
                                            ? "border-amber-200 bg-amber-50 text-amber-800"
                                            : "border-amber-500/20 bg-amber-500/[0.06] text-amber-100"
                                          : isLight
                                          ? "border-slate-200 bg-slate-50 text-slate-600"
                                          : "border-neutral-800 bg-[#0a0a0a] text-neutral-300"
                                      }`}
                                    >
                                      <div className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${softTextClass}`}>
                                        AI Line Feedback
                                      </div>
                                      {line.ai_message && <div className="mt-1">{line.ai_message}</div>}
                                      {line.logic_risk && <div className="mt-1">Logic risk: {line.logic_risk}</div>}
                                      {line.suggested_fix && <div className="mt-1">Fix: {line.suggested_fix}</div>}
                                      {line.generated_code_excerpt && (
                                        <code className="mt-2 block whitespace-pre-wrap rounded-[0.65rem] bg-black/10 px-2 py-1 font-mono text-[10px]">
                                          {line.generated_code_excerpt}
                                        </code>
                                      )}
                                    </div>
                                  )}

                                  {line.raw_specificity_reasoning &&
                                  line.raw_specificity_reasoning !== line.specificity_reasoning ? (
                                    <div className={`mt-2 text-[11px] leading-5 ${softTextClass}`}>
                                      Raw note: {line.raw_specificity_reasoning}
                                    </div>
                                  ) : null}

                                  {line.structure_reasoning ? (
                                    <div className={`mt-2 text-[11px] leading-5 ${softTextClass}`}>
                                      Structure note: {line.structure_reasoning}
                                    </div>
                                  ) : null}

                                  {line.strict_specificity_reasoning &&
                                  line.strict_specificity_reasoning !== line.specificity_reasoning ? (
                                    <div className={`mt-2 text-[11px] leading-5 ${softTextClass}`}>
                                      Strict note: {line.strict_specificity_reasoning}
                                    </div>
                                  ) : null}

                                  <div className={`mt-2 text-[11px] leading-5 ${softTextClass}`}>
                                    Diagnostic: {line.message}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div
        className={`absolute inset-0 z-[130] transition-all duration-300 ${
          showDevVisionPrompt ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          aria-label="Close Dev Vision prompt"
          onClick={() => {
            setShowDevVisionPrompt(false);
            setDevVisionPassword("");
            setDevVisionError("");
          }}
          className={`absolute inset-0 ${
            isLight ? "bg-white/65 backdrop-blur-sm" : "bg-black/70 backdrop-blur-sm"
          }`}
        />

        <div
          className={`absolute inset-0 flex items-center justify-center px-6 transition-all duration-300 ${
            showDevVisionPrompt ? "scale-100 opacity-100" : "scale-[0.98] opacity-0"
          }`}
        >
          <div
            className={`relative w-full max-w-md rounded-[1.75rem] border p-5 ${
              isLight
                ? "border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.14)]"
                : "border-white/[0.08] bg-[linear-gradient(180deg,rgba(12,12,12,0.98),rgba(8,8,8,0.96))] shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
            }`}
          >
            <div className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${softTextClass}`}>
              Dev Vision
            </div>
            <div className={`mt-2 text-[20px] ${PAGE_HEADING_CLASS} ${strongTextClass}`}>Developer access required</div>
            <div className={`mt-1 text-[13px] leading-6 ${softTextClass}`}>
              Enter the password to unlock the locked telemetry panel.
            </div>

            <div className="mt-4">
              <input
                autoFocus
                type="password"
                value={devVisionPassword}
                onChange={(e) => {
                  setDevVisionPassword(e.target.value);
                  if (devVisionError) setDevVisionError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleDevVisionUnlock();
                }}
                className={`w-full rounded-[1rem] px-3 py-3 text-[14px] outline-none transition-colors ${inputSurfaceClass} ${
                  isLight ? "focus:border-blue-400/60" : "focus:border-neutral-600"
                }`}
                placeholder="Enter password"
              />
              {devVisionError ? (
                <div className="mt-2 text-[12px] text-rose-300">{devVisionError}</div>
              ) : (
                <div className={`mt-2 text-[11px] ${softTextClass}`}>
                  Access reveals intent traces, specificity scores, and run timings.
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowDevVisionPrompt(false);
                  setDevVisionPassword("");
                  setDevVisionError("");
                }}
                className={`${ideButtonClass()} rounded-[0.95rem] px-4 py-2`}
              >
                Cancel
              </button>
              <button
                onClick={handleDevVisionUnlock}
                className={`${ideButtonClass({ active: true })} rounded-[0.95rem] px-4 py-2`}
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      </div>

      {contextMenu && (
        <div
          ref={contextMenuRef}
          className={`fixed z-[140] w-48 rounded-2xl border p-2 backdrop-blur-md ${
            isLight
              ? "border-slate-200 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.12)]"
              : "border-neutral-800 bg-[#090909]/95 shadow-[0_20px_80px_rgba(0,0,0,0.55)]"
          }`}
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              renameNode(contextMenu.nodeId);
              setContextMenu(null);
            }}
            className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors duration-200 ${
              isLight ? "text-slate-700 hover:bg-slate-100 hover:text-slate-900" : "text-neutral-300 hover:bg-[#141414] hover:text-white"
            }`}
          >
            Rename
          </button>

          <button
            onClick={() => {
              duplicateById(contextMenu.nodeId);
              setContextMenu(null);
            }}
            className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors duration-200 ${
              isLight ? "text-slate-700 hover:bg-slate-100 hover:text-slate-900" : "text-neutral-300 hover:bg-[#141414] hover:text-white"
            }`}
          >
            Duplicate
          </button>

          {contextMenu.nodeType === "folder" && (
            <>
              <button
                onClick={() => {
                  createFile(contextMenu.nodeId);
                  setContextMenu(null);
                }}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors duration-200 ${
                  isLight ? "text-slate-700 hover:bg-slate-100 hover:text-slate-900" : "text-neutral-300 hover:bg-[#141414] hover:text-white"
                }`}
              >
                New file inside
              </button>
              <button
                onClick={() => {
                  createFolder(contextMenu.nodeId);
                  setContextMenu(null);
                }}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors duration-200 ${
                  isLight ? "text-slate-700 hover:bg-slate-100 hover:text-slate-900" : "text-neutral-300 hover:bg-[#141414] hover:text-white"
                }`}
              >
                New folder inside
              </button>
            </>
          )}

          <button
            onClick={() => {
              deleteById(contextMenu.nodeId);
              setContextMenu(null);
            }}
            className="w-full rounded-xl px-3 py-2 text-left text-sm text-rose-300 transition-colors duration-200 hover:bg-rose-500/10"
          >
            Delete
          </button>
        </div>
      )}

      <div
        className={`absolute inset-0 z-[120] transition-all duration-300 ${
          showModeOverlay ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className={`absolute inset-0 backdrop-blur-sm ${isLight ? "bg-slate-200/70" : "bg-black/65"}`}
          onClick={() => setShowModeOverlay(false)}
        />

        <div
          className={`absolute inset-0 flex items-center justify-center px-6 transition-all duration-300 ${
            showModeOverlay ? "scale-100 opacity-100" : "scale-[0.98] opacity-0"
          }`}
        >
          <div
            className={`relative w-full max-w-7xl rounded-[2rem] border p-6 ${
              isLight
                ? "border-slate-200 bg-white/96 shadow-[0_25px_100px_rgba(15,23,42,0.12)]"
                : "border-white/[0.08] bg-[linear-gradient(180deg,rgba(12,12,12,0.98),rgba(8,8,8,0.96))] shadow-[0_25px_120px_rgba(0,0,0,0.65)]"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModeOverlay(false)}
              aria-label="Close mode selection"
              className={`absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-2xl border text-lg transition-all duration-200 ${
                isLight
                  ? "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900"
                  : "border-neutral-800 bg-[#0c0c0c] text-neutral-400 hover:border-neutral-600 hover:text-white"
              }`}
            >
              ×
            </button>

            <div className="mb-8 pr-14">
              <div className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] ${softTextClass}`}>
                Select IDE Mode
              </div>
              <h2
                className={`${PAGE_HEADING_CLASS} ${isLight ? "mb-3 text-3xl text-slate-900 md:text-4xl" : "mb-3 text-3xl text-white md:text-4xl"}`}
              >
                Choose how you want to code
              </h2>
              <p className={`max-w-3xl text-sm leading-7 ${mutedTextClass}`}>
                Each mode changes how the IDE interprets your syntaxless code, and Problem Solving adds prompt-aware alignment on top of the governed pipeline.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {(Object.keys(MODE_META) as IdeMode[]).map((modeKey, index) => {
                const item = MODE_META[modeKey];
                const selected = mode === modeKey;
                const unlocked = tierAllowsMode(activeTier, modeKey);

                return (
                  <button
                    key={modeKey}
                    onClick={() => handleSelectMode(modeKey)}
                    disabled={!unlocked}
                    className={`group relative min-h-[20rem] overflow-hidden rounded-[1.75rem] border p-5 text-left transition-all duration-300 ${
                      unlocked
                        ? selected
                          ? isLight
                            ? `border-slate-200 bg-white shadow-[0_24px_54px_rgba(15,23,42,0.12)] hover:-translate-y-1 ${item.active}`
                            : `${pricingCardClass} ${item.active} ${item.glow} hover:-translate-y-1`
                          : isLight
                          ? `border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] shadow-[0_18px_42px_rgba(15,23,42,0.08)] hover:-translate-y-1 hover:border-slate-300 ${item.hover}`
                          : `${pricingCardClass} ${pricingCardHoverClass} hover:-translate-y-1 ${item.hover}`
                        : isLight
                        ? "cursor-not-allowed border-slate-200 bg-slate-100/90 opacity-70 grayscale-[0.15]"
                        : `${pricingCardClass} cursor-not-allowed opacity-60 grayscale`
                    }`}
                    style={{
                      transitionDelay: showModeOverlay ? `${index * 35}ms` : "0ms",
                    }}
                  >
                    <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className={`absolute -right-10 -top-10 h-36 w-36 rounded-full blur-3xl ${isLight ? "bg-sky-200/40" : "bg-white/[0.04]"}`} />
                      <div className={`absolute inset-x-0 top-0 h-px ${isLight ? "bg-slate-200" : "bg-white/[0.05]"}`} />
                    </div>

                    {!unlocked && (
                      <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center ${isLight ? "bg-white/75" : "bg-black/35"}`}>
                        <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full border text-xl ${isLight ? "border-slate-200 bg-white text-slate-500" : "border-neutral-700 bg-[#0d0d0d] text-neutral-300"}`}>
                          🔒
                        </div>
                        <div className={`rounded-2xl border px-4 py-3 text-xs leading-5 ${isLight ? "border-slate-200 bg-white text-slate-600" : "border-neutral-800 bg-[#0a0a0a]/90 text-neutral-300"}`}>
                          Upgrade your subscription to access this mode.
                        </div>
                      </div>
                    )}

                    <div className="relative z-10 flex h-full flex-col">
                      <div className="mb-6 flex items-start justify-between">
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl ${item.badge} ${isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/[0.03]"}`}
                        >
                          {item.icon}
                        </div>

                        {selected && unlocked ? (
                          <div
                            className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.22em] ${item.badge} ${isLight ? "border-slate-200 bg-white" : "border-white/10 bg-white/[0.04]"}`}
                          >
                            Selected
                          </div>
                        ) : unlocked ? null : (
                          <div className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.22em] ${isLight ? "border-slate-200 bg-white text-slate-400" : "border-neutral-800 bg-[#090909] text-neutral-500"}`}>
                            Locked
                          </div>
                        )}
                      </div>

                      <div className={`mb-2 text-xl ${PAGE_HEADING_CLASS} ${isLight ? "text-slate-900" : "text-white"}`}>{item.label}</div>
                      <div className={`mb-5 text-sm leading-6 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>{item.short}</div>

                      <div className={`mt-auto rounded-2xl border p-4 text-xs leading-6 ${isLight ? "border-slate-200 bg-[#f8fafc] text-slate-500" : "border-white/5 bg-black/20 text-neutral-500"}`}>
                        {item.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`absolute inset-0 z-[120] transition-all duration-300 ${
          showLayoutOverlay ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className={`absolute inset-0 backdrop-blur-sm ${isLight ? "bg-slate-200/70" : "bg-black/65"}`}
          onClick={() => setShowLayoutOverlay(false)}
        />

        <div
          className={`absolute inset-0 flex items-center justify-center px-6 transition-all duration-300 ${
            showLayoutOverlay ? "scale-100 opacity-100" : "scale-[0.98] opacity-0"
          }`}
        >
          <div
            className={`relative w-full max-w-5xl rounded-[2rem] border p-6 ${
              isLight
                ? "border-slate-200 bg-white/96 shadow-[0_25px_100px_rgba(15,23,42,0.12)]"
                : "border-white/[0.08] bg-[linear-gradient(180deg,rgba(12,12,12,0.98),rgba(8,8,8,0.96))] shadow-[0_25px_120px_rgba(0,0,0,0.65)]"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLayoutOverlay(false)}
              aria-label="Close layout selection"
              className={`absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-2xl border text-lg transition-all duration-200 ${
                isLight
                  ? "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900"
                  : "border-neutral-800 bg-[#0c0c0c] text-neutral-400 hover:border-neutral-600 hover:text-white"
              }`}
            >
              ×
            </button>

            <div className="mb-8 pr-14">
              <div className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] ${softTextClass}`}>
                Select Layout
              </div>
              <h2
                className={`${PAGE_HEADING_CLASS} ${isLight ? "mb-3 text-3xl text-slate-900 md:text-4xl" : "mb-3 text-3xl text-white md:text-4xl"}`}
              >
                Choose your workspace
              </h2>
              <p className={`max-w-3xl text-sm leading-7 ${mutedTextClass}`}>
                Pick the interface density that fits how you want to work.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {(Object.keys(LAYOUT_META) as LayoutMode[]).map((layoutKey, index) => {
                const selected = layoutMode === layoutKey;
                const unlocked = tierAllowsLayout(activeTier, layoutKey);
                const item = LAYOUT_META[layoutKey];

                return (
                  <button
                    key={layoutKey}
                    onClick={() => handleSelectLayout(layoutKey)}
                    disabled={!unlocked}
                    className={`group relative min-h-[13.75rem] overflow-hidden rounded-[1.75rem] border p-5 text-left transition-all duration-300 ${
                      unlocked
                        ? selected
                          ? isLight
                            ? `border-slate-200 bg-white shadow-[0_24px_54px_rgba(15,23,42,0.12)] hover:-translate-y-1 ${item.accentBorder} ${item.accentBg}`
                            : `${pricingCardClass} ${item.accentBorder} ${item.accentBg} ${item.glow} hover:-translate-y-1`
                          : isLight
                          ? `border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] shadow-[0_18px_42px_rgba(15,23,42,0.08)] hover:-translate-y-1 hover:border-slate-300 ${item.hover}`
                          : `${pricingCardClass} ${pricingCardHoverClass} hover:-translate-y-1 ${item.hover}`
                        : isLight
                        ? "cursor-not-allowed border-slate-200 bg-slate-100/90 opacity-70 grayscale-[0.15]"
                        : `${pricingCardClass} cursor-not-allowed opacity-60 grayscale`
                    }`}
                    style={{
                      transitionDelay: showLayoutOverlay ? `${index * 35}ms` : "0ms",
                    }}
                  >
                    {!unlocked && (
                      <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center ${isLight ? "bg-white/75" : "bg-black/35"}`}>
                        <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full border text-xl ${isLight ? "border-slate-200 bg-white text-slate-500" : "border-neutral-700 bg-[#0d0d0d] text-neutral-300"}`}>
                          🔒
                        </div>
                        <div className={`rounded-2xl border px-4 py-3 text-xs leading-5 ${isLight ? "border-slate-200 bg-white text-slate-600" : "border-neutral-800 bg-[#0a0a0a]/90 text-neutral-300"}`}>
                          Upgrade your subscription to access this layout.
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-0 overflow-hidden rounded-[1.75rem]">
                      <div
                        className={`absolute left-1/2 top-[46%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-opacity duration-300 ${item.halo} ${
                          selected ? "opacity-70" : "opacity-0 group-hover:opacity-55"
                        }`}
                      />
                      <div className={`absolute inset-x-0 top-0 h-px ${isLight ? "bg-slate-200" : "bg-white/[0.05]"}`} />
                    </div>

                    <div className="relative z-10 flex h-full flex-col">
                      <div className="mb-6 flex items-start justify-between">
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-xs font-semibold uppercase tracking-[0.24em] ${item.accentText} ${isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/[0.03]"}`}
                        >
                          {layoutKey === "minimalist" ? "○" : layoutKey === "normal" ? "◫" : "▣"}
                        </div>

                        {selected && unlocked ? (
                          <div
                            className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.22em] ${item.accentText} ${isLight ? "border-slate-200 bg-white" : "border-white/10 bg-white/[0.04]"}`}
                          >
                            Selected
                          </div>
                        ) : unlocked ? null : (
                          <div className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.22em] ${isLight ? "border-slate-200 bg-white text-slate-400" : "border-neutral-800 bg-[#090909] text-neutral-500"}`}>
                            Locked
                          </div>
                        )}
                      </div>

                      <div className={`mb-2 text-xl ${PAGE_HEADING_CLASS} ${isLight ? "text-slate-900" : "text-white"}`}>
                        {item.label}
                      </div>

                      <div className={`mb-5 text-sm leading-6 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                        {item.short}
                      </div>

                      <div className={`mt-auto rounded-2xl border p-4 text-xs leading-6 ${isLight ? "border-slate-200 bg-[#f8fafc] text-slate-500" : "border-white/5 bg-black/20 text-neutral-500"}`}>
                        {item.detail}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <BugReportModal
        open={showBugModal}
        onClose={() => {
          if (!bugSubmitting) {
            setShowBugModal(false);
          }
        }}
        onSubmit={handleSubmitBugReport}
        isSubmitting={bugSubmitting}
        targetKind={bugTargetKind}
        context={{
          projectName,
          projectId,
          currentFilePath,
          mode,
          runId: bugTargetKind === "run" ? bugTargetRunId : activeRunId,
        }}
        modeMeta={currentModeMeta}
      />

      {upgradeModal.open && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center px-6">
          <div
            className={`absolute inset-0 backdrop-blur-sm ${isLight ? "bg-slate-200/70" : "bg-black/70"}`}
            onClick={() => setUpgradeModal((prev) => ({ ...prev, open: false }))}
          />
          <div className={`relative z-10 w-full max-w-lg rounded-[2rem] border p-6 ${
            isLight
              ? "border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]"
              : "border-white/[0.08] bg-[linear-gradient(180deg,rgba(12,12,12,0.98),rgba(8,8,8,0.96))] shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
          }`}>
            <div className={`mb-2 text-[11px] uppercase tracking-[0.26em] ${softTextClass}`}>
              Subscription Required
            </div>
            <h2
              className={`${PAGE_HEADING_CLASS} ${isLight ? "text-3xl text-slate-900" : "text-3xl text-white"}`}
            >
              {upgradeModal.title}
            </h2>
            <p className={`mt-3 text-sm leading-7 ${mutedTextClass}`}>{upgradeModal.message}</p>

            <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${isLight ? "border-slate-200 bg-slate-50 text-slate-700" : "border-neutral-800 bg-[#0b0b0b] text-neutral-300"}`}>
              Current plan: {SUBSCRIPTION_META[activeTier].label}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setUpgradeModal((prev) => ({ ...prev, open: false }))}
                className={`${ideButtonClass()} rounded-2xl px-4 py-2`}
              >
                Close
              </button>
              <Link
                href="/subscriptions"
                className={`${ideButtonClass()} rounded-2xl px-4 py-2`}
              >
                View Subscriptions
              </Link>
            </div>
          </div>
        </div>
      )}

      <div
        className={`pointer-events-none absolute right-6 top-6 z-[160] transition-all duration-300 ${
          toast.visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
        }`}
      >
        <div className={`rounded-[1.1rem] border px-4 py-3 text-sm shadow-[0_16px_48px_rgba(0,0,0,0.38)] backdrop-blur-md ${
          isLight ? "border-slate-200 bg-white/95 text-slate-700 shadow-[0_16px_48px_rgba(15,23,42,0.12)]" : "border-neutral-800 bg-[#0b0b0b]/95 text-neutral-300"
        }`}>
          {toast.text}
        </div>
      </div>

      <style jsx global>{`
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(136, 136, 136, 0.65) transparent;
        }

        *::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        *::-webkit-scrollbar-track {
          background: transparent;
        }

        *::-webkit-scrollbar-thumb {
          background: rgba(136, 136, 136, 0.72);
          border-radius: 999px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        *::-webkit-scrollbar-thumb:hover {
          background: rgba(172, 172, 172, 0.82);
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        *::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>
    </main>
  );
}

export default function IdePage() {
  return (
    <Suspense
      fallback={
        <main className="flex h-screen w-screen items-center justify-center bg-[var(--background)] text-sm text-[var(--muted-foreground)]">
          Loading IDE...
        </main>
      }
    >
      <IdePageContent />
    </Suspense>
  );
}
