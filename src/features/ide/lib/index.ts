/**
 * Pure helpers for the IDE.
 *
 * Formatting, diagnostic derivation, explorer-tree operations, and the
 * mode/tier rules. Everything here is a function of its arguments -- no React,
 * no component state -- which is why it separates cleanly from the component
 * and can be tested without rendering anything.
 */

import type { CSSProperties } from "react";
import type { Monaco } from "@monaco-editor/react";

import type { Theme } from "@/components/theme-provider";
import { BRAND } from "@/config/brand";
import {
  tierAllowsMode,
  SUBSCRIPTION_META,
} from "@/lib/subscriptions";
import type { SubscriptionTier } from "@/lib/subscriptions";

import type {
  ActionableDiagnostic,
  BackendArtifact,
  DiagnosticAction,
  ExplorerNode,
  IdeMode,
  InterpretationLine,
  LayoutMode,
  ProblemAlignmentIssue,
  ProblemAlignmentLineNotice,
  ProblemAlignmentStatus,
  ResolvedInterpretationLine,
  TerminalEntry,
  VisualArtifact,
} from "@/features/ide/types";
import {
  LAYOUT_META,
  MODE_META,
} from "@/features/ide/types";

export function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function getProtectedDarkTextStyle(theme: Theme, color: string): CSSProperties | undefined {
  if (theme === "light") return undefined;

  return {
    color,
    WebkitTextFillColor: color,
    opacity: 1,
    forcedColorAdjust: "none",
    colorScheme: "dark",
  };
}

export function getProtectedDarkSurfaceStyle(theme: Theme): CSSProperties | undefined {
  if (theme === "light") return undefined;

  return {
    forcedColorAdjust: "none",
    colorScheme: "dark",
  };
}

export function getModeAccentRgb(mode: IdeMode) {
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

export function getModeBarGlowStyle(
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

export function getModeButtonClass(
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

export function ensureMonacoThemes(monaco: Monaco) {
  monaco.editor.defineTheme("ide-dark", {
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

  monaco.editor.defineTheme("ide-light", {
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


export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createStarterTree(): ExplorerNode[] {
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

export function toWsUrl(url: string) {
  if (url.startsWith("https://")) return url.replace("https://", "wss://");
  if (url.startsWith("http://")) return url.replace("http://", "ws://");
  return url;
}

export function describeBackendConnectionError(error: unknown, backendUrl: string) {
  if (error instanceof TypeError) {
    return `Could not reach the backend at ${backendUrl}.\nMake sure the backend server is running and that CORS allows this frontend origin.\n`;
  }

  if (error instanceof Error) {
    return `${error.message}\n`;
  }

  return "Could not reach the server. Check that the backend is running, then try again.\n";
}

export function isBackendConnectionError(error: unknown) {
  return error instanceof TypeError;
}

export function formatRunTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDurationMs(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Pending";
  if (value < 1000) return `${value.toFixed(value >= 100 ? 0 : 1)} ms`;
  return `${(value / 1000).toFixed(value >= 10000 ? 0 : 2)} s`;
}

export function formatScore(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "n/a";
  return `${Math.round(value * 100)}%`;
}

export function formatIntentLabel(line: InterpretationLine) {
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

/**
 * The language to report runtime errors in.
 *
 * Reads the browser's preference, which is the best signal available until the
 * IDE has an explicit language setting. The backend narrows whatever it gets to
 * a locale it can actually speak, so a regional tag like `es-MX` or an
 * unsupported one is safe to send as-is.
 *
 * Returns null during server rendering rather than guessing, which the backend
 * reads the same way as an unsupported locale: English.
 */
export function getBrowserLocale(): string | null {
  if (typeof navigator === "undefined") return null;
  return navigator.language || null;
}

export function terminalStreamLabel(stream: TerminalEntry["stream"]) {
  if (stream === "stdout") return "Output";
  if (stream === "stderr") return "Error";
  if (stream === "input") return "Input";
  if (stream === "runtime") return "Runtime";
  if (stream === "explanation") return "What went wrong";
  return "System";
}

export function getDevStepStatusClass(status: string, theme: Theme = "dark") {
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

export function getCompatibilityClass(status: string | null | undefined, theme: Theme = "dark") {
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

export function getSeverity(line: InterpretationLine): "ok" | "warning" | "blocked" {
  if (!line.valid) return "blocked";
  if (line.type === "warning") return "warning";
  return "ok";
}

export function normalizeLineNumber(value: number | null | undefined, maxLineNumber: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const normalized = Math.trunc(value);
  if (normalized < 1 || normalized > maxLineNumber) return null;
  return normalized;
}

export function resolveInterpretationLines(
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

export function humanizeType(type: string) {
  return type.replaceAll("_", " ");
}

export function normalizeProblemStatement(value: string) {
  return value.replace(/\r\n?/g, "\n").trim();
}

export function deriveProblemPreview(problemStatement: string) {
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

export function getProblemStatusLabel(status: ProblemAlignmentStatus | "awaiting_check") {
  if (status === "on_track") return "On Track";
  if (status === "partial") return "Partial";
  if (status === "logic_mismatch") return "Logic Mismatch";
  if (status === "missing_constraint") return "Missing Constraint";
  if (status === "output_issue") return "Output Issue";
  if (status === "edge_case_risk") return "Edge Case Risk";
  return "Awaiting Check";
}

export function getProblemStatusClass(
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

export function getProblemNoticeSeverity(
  notice: Pick<ProblemAlignmentLineNotice, "severity" | "kind">
): "warning" | "blocked" {
  if (notice.severity === "blocked") return "blocked";
  if (notice.kind === "logic_mismatch" || notice.kind === "missing_constraint") return "blocked";
  return "warning";
}

export function getDiagnosticTitle(severity: ActionableDiagnostic["severity"], source: ActionableDiagnostic["source"]) {
  if (source === "problem") {
    return severity === "blocked"
      ? "This does not match the problem yet"
      : "A thought about the problem";
  }
  if (severity === "blocked") return "This line cannot run yet";
  if (severity === "warning") return "This line might not do what you expect";
  return "This line makes sense";
}

export function cleanDiagnosticText(value?: string | null) {
  return (value || "").replace(/\s+/g, " ").trim();
}

export function getSyntaxModeDetail(line: ResolvedInterpretationLine, mode: IdeMode) {
  const modeScore =
    line.specificity_score ?? line.strict_specificity_score ?? line.raw_specificity_score;
  const modeReason =
    cleanDiagnosticText(
      line.specificity_reasoning ||
        line.strict_specificity_reasoning ||
        line.raw_specificity_reasoning ||
        line.ai_message
    ) || "Nothing to flag for this mode.";
  const status = line.strict_specificity_status
    ? ` Status ${humanizeType(line.strict_specificity_status)}.`
    : "";

  return `${formatScore(modeScore)} in ${MODE_META[mode].label} Mode: ${modeReason}${status}`;
}

export function getSyntaxStructureDetail(line: ResolvedInterpretationLine) {
  const structureScore = line.structure_specificity_score;
  const penalty = line.structure_penalty ?? line.strict_structure_penalty;
  const scoreLabel =
    typeof penalty === "number" && Number.isFinite(penalty)
      ? `Score ${formatScore(structureScore)}, penalty ${formatScore(penalty)}`
      : `Score ${formatScore(structureScore)}`;
  const structureReason =
    cleanDiagnosticText(line.structure_reasoning || line.logic_risk || line.message) ||
    "Nothing to flag about the structure.";

  return `${scoreLabel}: ${structureReason}`;
}

export function getDiagnosticToneClasses(severity: ActionableDiagnostic["severity"], isLight: boolean) {
  if (severity === "blocked") {
    return {
      bubble: isLight
        ? "border-rose-400 bg-white/96 text-rose-950 shadow-[0_20px_55px_rgba(225,29,72,0.18)] ring-4 ring-rose-500/10"
        : "border-rose-400/70 bg-[#0d0708]/96 text-rose-50 shadow-[0_22px_60px_rgba(244,63,94,0.2)] ring-4 ring-rose-500/15",
      accent: isLight ? "text-rose-700" : "text-rose-200",
      chip: isLight
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : "border-rose-400/30 bg-rose-500/[0.1] text-rose-200",
      row: isLight
        ? "border-rose-200 bg-rose-50/65 text-rose-950"
        : "border-rose-400/20 bg-rose-500/[0.07] text-rose-50",
      primary: isLight
        ? "border-rose-300 bg-rose-100 text-rose-900 hover:bg-rose-200"
        : "border-rose-400/30 bg-rose-500/[0.15] text-rose-100 hover:bg-rose-500/[0.22]",
    };
  }

  if (severity === "warning") {
    return {
      bubble: isLight
        ? "border-amber-400 bg-white/96 text-amber-950 shadow-[0_20px_55px_rgba(217,119,6,0.16)] ring-4 ring-amber-500/10"
        : "border-amber-400/70 bg-[#0f0b04]/96 text-amber-50 shadow-[0_22px_60px_rgba(245,158,11,0.18)] ring-4 ring-amber-500/15",
      accent: isLight ? "text-amber-700" : "text-amber-200",
      chip: isLight
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-amber-400/30 bg-amber-500/[0.1] text-amber-200",
      row: isLight
        ? "border-amber-200 bg-amber-50/65 text-amber-950"
        : "border-amber-400/20 bg-amber-500/[0.07] text-amber-50",
      primary: isLight
        ? "border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200"
        : "border-amber-400/30 bg-amber-500/[0.15] text-amber-100 hover:bg-amber-500/[0.22]",
    };
  }

  return {
    bubble: isLight
      ? "border-emerald-300 bg-white/96 text-emerald-950 shadow-[0_20px_55px_rgba(5,150,105,0.14)] ring-4 ring-emerald-500/10"
      : "border-emerald-400/60 bg-[#05100b]/96 text-emerald-50 shadow-[0_22px_60px_rgba(16,185,129,0.16)] ring-4 ring-emerald-500/15",
    accent: isLight ? "text-emerald-700" : "text-emerald-200",
    chip: isLight
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-emerald-400/30 bg-emerald-500/[0.1] text-emerald-200",
    row: isLight
      ? "border-emerald-200 bg-emerald-50/65 text-emerald-950"
      : "border-emerald-400/20 bg-emerald-500/[0.07] text-emerald-50",
    primary: isLight
      ? "border-emerald-300 bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
      : "border-emerald-400/30 bg-emerald-500/[0.15] text-emerald-100 hover:bg-emerald-500/[0.22]",
  };
}

export function extractSuggestedReplacement(raw: string, suggestedFix?: string | null) {
  const fix = (suggestedFix || "").trim();
  if (!fix) return null;

  const candidates = [
    /^replace(?: this line)? with[:\s]+[`"']?(.+?)[`"']?\.?$/i,
    /^use[:\s]+[`"']?(.+?)[`"']?\.?$/i,
    /[`"]([^`"\n]+)[`"]/,
  ];

  for (const pattern of candidates) {
    const match = fix.match(pattern);
    const replacement = match?.[1]?.trim().replace(/[.;]\s*$/, "");

    if (
      replacement &&
      !replacement.includes("\n") &&
      replacement.length <= 180 &&
      replacement !== raw.trim()
    ) {
      return replacement;
    }
  }

  return null;
}

export function buildActionableDiagnostics({
  activeTier,
  currentFilePath,
  mode,
  problemIssues,
  problemLineNotices,
  resolvedInterpretationLines,
}: {
  activeTier: SubscriptionTier;
  currentFilePath: string;
  mode: IdeMode;
  problemIssues: ProblemAlignmentIssue[];
  problemLineNotices: ProblemAlignmentLineNotice[];
  resolvedInterpretationLines: ResolvedInterpretationLine[];
}): ActionableDiagnostic[] {
  const syntaxDiagnostics = resolvedInterpretationLines.map((line, index) => {
    const severity = getSeverity(line);
    const lineNumber = line.resolvedLineNumber;
    const actions: DiagnosticAction[] = [];
    const replacement = lineNumber
      ? extractSuggestedReplacement(line.raw, line.suggested_fix)
      : null;
    const detailParts = [
      cleanDiagnosticText(line.ai_message),
      line.logic_risk ? `Logic risk: ${cleanDiagnosticText(line.logic_risk)}` : "",
      line.specificity_reasoning ? `Mode note: ${cleanDiagnosticText(line.specificity_reasoning)}` : "",
      line.structure_reasoning ? `Structure note: ${cleanDiagnosticText(line.structure_reasoning)}` : "",
      ...(line.unresolved_slots || []).map((slot) => `Needs detail: ${slot}`),
      ...(line.assumptions || []).map((assumption) => `Assumption: ${assumption}`),
    ].filter(Boolean);

    if (lineNumber) {
      actions.push({
        kind: "go_to_line",
        label: "Go to line",
        lineNumber,
      });
    }

    if (lineNumber && replacement) {
      actions.push({
        kind: "replace_line",
        label: "Apply line",
        lineNumber,
        nextText: replacement,
      });
    }

    if (severity !== "ok") {
      if (mode === "strict" && tierAllowsMode(activeTier, "standard")) {
        actions.push({
          kind: "switch_mode",
          label: "Try Standard",
          mode: "standard",
        });
      } else if (
        (mode === "strict" || mode === "standard") &&
        tierAllowsMode(activeTier, "abstraction")
      ) {
        actions.push({
          kind: "switch_mode",
          label: "Try Abstraction",
          mode: "abstraction",
        });
      }
    }

    return {
      id: `language-${index}-${lineNumber || "unmapped"}`,
      source: "language" as const,
      severity,
      filePath: currentFilePath,
      lineNumber,
      title: getDiagnosticTitle(severity, "language"),
      message: line.message || `${BRAND.name} interpreted this line.`,
      explanation: detailParts.join(" "),
      modeDetail: getSyntaxModeDetail(line, mode),
      structureDetail: getSyntaxStructureDetail(line),
      suggestedFix: line.suggested_fix || undefined,
      raw: line.raw,
      actions,
    };
  });

  const problemNoticeInputs = [
    ...problemLineNotices,
    ...problemIssues.filter(
      (issue) =>
        !problemLineNotices.some(
          (notice) => notice.message === issue.message && notice.line_number === issue.line_number
        )
    ),
  ];

  const problemDiagnostics = problemNoticeInputs.map((notice, index) => {
    const severity = getProblemNoticeSeverity(notice);
    const lineNumber = notice.line_number ?? null;
    const replacement = lineNumber
      ? extractSuggestedReplacement("", notice.suggested_fix)
      : null;
    const actions: DiagnosticAction[] = [
      {
        kind: "open_problem_panel",
        label: "Open problem",
      },
    ];

    if (lineNumber) {
      actions.unshift({
        kind: "go_to_line",
        label: "Go to line",
        lineNumber,
      });
    }

    if (lineNumber && replacement) {
      actions.splice(lineNumber ? 1 : 0, 0, {
        kind: "replace_line",
        label: "Apply line",
        lineNumber,
        nextText: replacement,
      });
    }

    return {
      id: `problem-${index}-${lineNumber || "global"}`,
      source: "problem" as const,
      severity,
      filePath: currentFilePath,
      lineNumber,
      title: getProblemStatusLabel(notice.kind),
      message: notice.message,
      explanation: "Problem Solving mode compared this line with the attached prompt.",
      modeDetail: `n/a in Problem Solving Mode: ${notice.message}`,
      structureDetail: lineNumber
        ? `Structure: Linked to line ${lineNumber} in the active file.`
        : "Structure: Applies to the problem as a whole.",
      suggestedFix: notice.suggested_fix || undefined,
      actions,
    };
  });

  return [...problemDiagnostics, ...syntaxDiagnostics].sort((a, b) => {
    const severityOrder = { blocked: 0, warning: 1, ok: 2 };
    const severityDelta = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDelta !== 0) return severityDelta;
    return (a.lineNumber || Number.MAX_SAFE_INTEGER) - (b.lineNumber || Number.MAX_SAFE_INTEGER);
  });
}

export function buildArtifactUrl(
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

export function convertArtifactsToVisuals(
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

export function isSynthFileName(name: string) {
  return name.toLowerCase().endsWith(".synth");
}

export function countSynthFiles(nodes: ExplorerNode[]): number {
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

export function countSynthFilesInNode(node: ExplorerNode): number {
  if (node.type === "file") {
    return isSynthFileName(node.name) ? 1 : 0;
  }

  return countSynthFiles(node.children);
}

export function getDefaultModeForTier(tier: SubscriptionTier): IdeMode {
  return SUBSCRIPTION_META[tier].allowedModes[0] as IdeMode;
}

export function resolveModeForTier(tier: SubscriptionTier, requestedMode?: IdeMode | null): IdeMode {
  if (requestedMode && tierAllowsMode(tier, requestedMode)) return requestedMode;
  return getDefaultModeForTier(tier);
}

export function parseRequestedMode(value: string | null): IdeMode | null {
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

export function getDefaultLayoutForTier(tier: SubscriptionTier): LayoutMode {
  if (tier === "free") return "minimalist";
  if (tier === "plus" || tier === "student") return "normal";
  return "developer";
}

export function getLockedModeReason(tier: SubscriptionTier, mode: IdeMode) {
  if (tier === "free") {
    return `${MODE_META[mode].label} mode is locked on the Free plan. Upgrade your subscription to access more IDE modes.`;
  }

  if (tier === "student") {
    return "Student accounts use Problem Solving mode, which checks your work against the prompt as you go.";
  }

  if (tier === "plus" && mode === "vibe") {
    return "Vibe mode comes with the Pro plan. Your work is safe -- switching plans will not change it.";
  }

  return `${MODE_META[mode].label} mode is not available on your current subscription plan.`;
}

export function getLockedLayoutReason(tier: SubscriptionTier, layout: LayoutMode) {
  if (tier === "free") {
    return `${LAYOUT_META[layout].label} layout is locked on the Free plan. Upgrade your subscription to access more workspace layouts.`;
  }

  if ((tier === "plus" || tier === "student") && layout === "developer") {
    return "Developer layout comes with the Pro plan. Everything you can do today stays available.";
  }

  return `${LAYOUT_META[layout].label} layout is not available on your current subscription plan.`;
}


/* ---- explorer tree operations ---------------------------------------- */

export function findNodeById(nodes: ExplorerNode[], targetId: string): ExplorerNode | null {
  for (const node of nodes) {
    if (node.id === targetId) return node;
    if (node.type === "folder") {
      const found = findNodeById(node.children, targetId);
      if (found) return found;
    }
  }
  return null;
}

export function findFirstFileId(nodes: ExplorerNode[]): string | null {
  for (const node of nodes) {
    if (node.type === "file") return node.id;
    if (node.type === "folder") {
      const nested = findFirstFileId(node.children);
      if (nested) return nested;
    }
  }
  return null;
}

export function updateNodeById(
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

export function removeNodeById(nodes: ExplorerNode[], targetId: string): ExplorerNode[] {
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

export function duplicateNode(node: ExplorerNode): ExplorerNode {
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

export function insertSiblingAfterId(
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

export function addChildToFolder(
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

export function setAllFoldersOpen(nodes: ExplorerNode[], isOpen: boolean): ExplorerNode[] {
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

export function collectReferenceFiles(
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

export function findFilePathById(
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
