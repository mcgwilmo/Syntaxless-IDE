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

/*
 * Windows High Contrast and forced-colours modes override our palette wholesale.
 * That is the right default -- a user who has asked for forced colours means it --
 * but inside the editor chrome it repaints text we have already guaranteed to be
 * legible, so these two opt the dark theme back out for those specific surfaces.
 */
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

/*
 * Each mode's tint, drawn from the state tokens rather than from free-standing
 * hues, so the five modes read as one ladder instead of five unrelated colours.
 *
 * Ordered by how much the mode lets through: strict blocks the most, so it wears
 * the blocked tone; vibe checks the least, so it wears success. Problem-solving
 * takes warning, which is the hue its panel already wears.
 */
const MODE_TINT: Record<IdeMode, string> = {
  strict: "var(--state-blocked)",
  standard: "var(--accent-solid)",
  abstraction: "color-mix(in srgb, var(--accent-solid), var(--state-success))",
  problem_solving: "var(--state-warning)",
  vibe: "var(--state-success)",
};

/**
 * The mode's signature on a surface: a tinted edge, and a wash of the same tint
 * under the ordinary material sheen.
 *
 * This was a radial glow -- coloured light spilling out of the bar's left edge.
 * Under one light source, above and forward, a surface can only reflect; a
 * surface that emits reads as a second lamp and drags the rest of the material
 * out of the illusion with it. The tint stays because it carries meaning (which
 * mode is running). The light does not.
 *
 * The edge now does most of that work. A border can hold real chroma without
 * looking lit, whereas a wash sits behind text and so has to stay faint enough
 * to keep it legible -- it can only ever whisper.
 *
 * Returned as a style rather than classes because the tint is mixed per mode,
 * and Tailwind can only emit classes it can find written out in the source.
 * `theme` is unused: tokens and mixes both follow the theme on their own. It
 * stays in the signature because every call site passes it positionally.
 */
export function getModeBarGlowStyle(
  _theme: Theme,
  mode: IdeMode,
  strength: "soft" | "medium" = "soft",
): CSSProperties {
  const tint = MODE_TINT[mode];
  // "medium" is for the panels, which have the area to say it a little louder.
  // "soft" is for bars, where the wash sits directly behind small text.
  const wash = strength === "medium" ? "9%" : "6%";
  const edge = strength === "medium" ? "42%" : "30%";

  return {
    backgroundColor: `color-mix(in srgb, ${tint} ${wash}, var(--surface-raised))`,
    // Restated here because an inline background-image would otherwise drop the
    // sheen that the call site's bg-[image:var(--material-sheen)] puts down.
    backgroundImage: "var(--material-sheen)",
    borderColor: `color-mix(in srgb, ${tint} ${edge}, var(--border-subtle))`,
  };
}

/*
 * The material of a pressable IDE control: raised at rest, rising toward the
 * light on hover, then travelling down and inverting its shading when held.
 *
 * The travel is stated here as well as at the call site in app/ide/page.tsx.
 * Duplicating one class is cheaper than a control whose press is only
 * acknowledged on some of the screens it appears on.
 */
const MODE_BUTTON_PRESSABLE_CLASS = joinClasses(
  "shadow-[var(--raised)]",
  "hover:-translate-y-[var(--lift-travel)] hover:shadow-[var(--lifted)]",
  "active:translate-y-[var(--press-travel)] active:shadow-[var(--pressed)]",
  // Depth still reads with motion off; only the travel is dropped, so a press
  // is never communicated by movement alone.
  "motion-reduce:transform-none motion-reduce:hover:transform-none",
  "motion-reduce:active:transform-none"
);

/**
 * The shared IDE control: mode switches, toolbar buttons, dialog actions.
 *
 * Only the mode's own accent classes come in from `modeMeta` -- everything else
 * is a token, which is why there is no light/dark branch left. `theme` is
 * ignored for the same reason, and stays only because the call sites pass it.
 *
 * The blur that used to sit behind these is gone: every surface they sit on is
 * an opaque token fill now, so it cost a compositing pass per frame to blur
 * nothing.
 */
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
  _theme: Theme = "dark"
) {
  const { active, disabled, compact, pill, danger } = options ?? {};
  const radiusClass = pill ? "rounded-[var(--radius-full)]" : "rounded-[var(--radius-lg)]";
  const spacingClass = compact
    ? "px-[var(--space-3)] py-[var(--space-1)] text-[length:var(--text-xs)]"
    : "px-[var(--space-3)] py-[var(--space-2)] text-[length:var(--text-sm)]";
  const baseClass = joinClasses(
    radiusClass,
    spacingClass,
    "border font-medium tracking-[0.01em]",
    "transition-[background-color,border-color,box-shadow,transform]",
    "duration-[var(--duration-press)] ease-[var(--ease-spring)]"
  );

  if (disabled) {
    // Not a thing you can press, so the depth goes rather than just the colour.
    return joinClasses(
      baseClass,
      "cursor-not-allowed border-[var(--border-subtle)] bg-[var(--surface-sunken)]",
      "text-[var(--text-soft)] opacity-60 shadow-none"
    );
  }

  if (danger) {
    // Resting, this is an ordinary control -- the blocked tone only appears once
    // the pointer is on it, so a destructive action is not shouting from across
    // the toolbar before anyone reaches for it.
    return joinClasses(
      baseClass,
      MODE_BUTTON_PRESSABLE_CLASS,
      "border-[var(--border-strong)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)]",
      "text-[var(--text-muted)]",
      "hover:border-[color-mix(in_srgb,var(--state-blocked)_45%,transparent)]",
      "hover:bg-[var(--state-blocked-subtle)] hover:text-[var(--state-blocked)]"
    );
  }

  if (active) {
    // The selected mode is already in, so it wears the pressed shading and does
    // not rise on hover -- there is nowhere for it to go, and lifting the one
    // control that is switched on would say the opposite of what it means. A
    // click still travels, because a press that acknowledges nothing reads as a
    // control that has stopped working.
    return joinClasses(
      baseClass,
      modeMeta.accentBorder,
      modeMeta.accentBg,
      "text-[var(--text-primary)] shadow-[var(--pressed)]",
      "active:translate-y-[var(--press-travel)]",
      "motion-reduce:transform-none motion-reduce:active:transform-none"
    );
  }

  return joinClasses(
    baseClass,
    MODE_BUTTON_PRESSABLE_CLASS,
    "border-[var(--border-subtle)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)]",
    "text-[var(--text-muted)]",
    // The hover colours are the mode's, not the system's: reaching for a mode
    // button is when it is most useful to be told which mode you are in. They
    // are also the only hover colours on this branch -- a token hover border
    // here would be a second border-colour utility fighting this one, and which
    // won would come down to stylesheet order.
    modeMeta.accentHoverBorder,
    modeMeta.accentHoverBg,
    modeMeta.accentHoverText
  );
}

/*
 * Monaco builds its own stylesheet from these objects and never sees the page's
 * custom properties, so literal colours are the only option here -- these are
 * the last hardcoded colours in the file, and each one mirrors a token in
 * design/tokens.css value for value. Change one there, change it here.
 *
 * The editor is the deepest well in the app, so it takes --surface-sunken and
 * the current line takes the page colour above it: the same "you type into
 * this" relationship the material gives every other input. Selection uses the
 * accent at --accent-border strength and drops to --accent-subtle when the
 * editor loses focus, so an inactive selection reads as remembered rather than
 * live.
 */
export function ensureMonacoThemes(monaco: Monaco) {
  monaco.editor.defineTheme("ide-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#100f0e", // --surface-sunken
      "editor.foreground": "#f5f3f0", // --text-primary
      "editorLineNumber.foreground": "#9c9691", // --text-soft
      "editorLineNumber.activeForeground": "#f5f3f0", // --text-primary
      "editorCursor.foreground": "#5eead4", // --accent-text
      "editor.lineHighlightBackground": "#171614", // --surface-page
      "editor.selectionBackground": "#2dd4bf4d", // --accent-border
      "editor.inactiveSelectionBackground": "#2dd4bf1f", // --accent-subtle
    },
  });

  monaco.editor.defineTheme("ide-light", {
    base: "vs",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#f2f0ed", // --surface-sunken
      "editor.foreground": "#1c1a17", // --text-primary
      "editorLineNumber.foreground": "#78716c", // --text-soft
      "editorLineNumber.activeForeground": "#1c1a17", // --text-primary
      "editorCursor.foreground": "#0f766e", // --accent-solid
      "editor.lineHighlightBackground": "#faf9f7", // --surface-page
      "editor.selectionBackground": "#0f766e47", // --accent-border
      "editor.inactiveSelectionBackground": "#0f766e14", // --accent-subtle
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
 * `?locale=es` wins when present; otherwise the browser's own preference, which
 * is the best signal available until the IDE has an explicit language setting.
 * The backend narrows whatever it gets to a locale it can actually speak, so a
 * regional tag like `es-MX` or an unsupported one is safe to send as-is and
 * needs no validation here.
 *
 * The query parameter exists because the browser preference is otherwise the
 * only input, and changing it means changing an OS or browser setting -- far too
 * much friction to check that a translation reads well. It is deliberately not
 * persisted: a URL you can hand to someone, and that stops applying the moment
 * you drop it, is the right shape for something used to compare languages.
 *
 * Read from `window` rather than `useSearchParams` because this is called inside
 * the run handler, at the moment the request is built, and nothing re-renders on
 * the answer. Returns null during server rendering rather than guessing, which
 * the backend reads the same way as an unsupported locale: English.
 */
export function getRequestLocale(): string | null {
  if (typeof window === "undefined") return null;

  const override = new URLSearchParams(window.location.search).get("locale");
  if (override?.trim()) return override.trim();

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

/*
 * The tones a small status surface can take, as border/fill/text triples.
 *
 * Written out in full rather than composed from the tone name, because Tailwind
 * only emits the classes it can find spelled out in the source -- a class built
 * by interpolation at runtime produces no CSS at all and the chip renders bare.
 *
 * Callers supply the `border` width and shadow-[var(--inlaid)] themselves:
 * these are labels set into a surface, not things you press.
 */
const TONE_CLASS = {
  success:
    "border-[color-mix(in_srgb,var(--state-success)_30%,transparent)] bg-[var(--state-success-subtle)] text-[var(--state-success)]",
  warning:
    "border-[color-mix(in_srgb,var(--state-warning)_30%,transparent)] bg-[var(--state-warning-subtle)] text-[var(--state-warning)]",
  blocked:
    "border-[color-mix(in_srgb,var(--state-blocked)_30%,transparent)] bg-[var(--state-blocked-subtle)] text-[var(--state-blocked)]",
  // In progress: not succeeded and not failed, so it takes the accent, which is
  // what the app uses everywhere else for "this is the live one".
  accent: "border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--accent-text)]",
  neutral: "border-[var(--border-subtle)] bg-[var(--surface-sunken)] text-[var(--text-muted)]",
  // Same surface, quieter label: for statuses that are an absence of news.
  quiet: "border-[var(--border-subtle)] bg-[var(--surface-sunken)] text-[var(--text-soft)]",
} as const;

/*
 * `theme` is unused in the three helpers below. Every class they return is a
 * token that swaps with the theme by itself, so there is nothing left to
 * branch on; the parameter stays because the call sites pass it positionally.
 */

export function getDevStepStatusClass(status: string, _theme: Theme = "dark") {
  if (status === "completed" || status === "success") return TONE_CLASS.success;
  if (status === "running") return TONE_CLASS.accent;
  if (status === "blocked" || status === "error" || status === "timeout" || status === "stopped") {
    return TONE_CLASS.blocked;
  }
  // A skipped step is not a warning about anything -- it just did not happen.
  if (status === "skipped") return TONE_CLASS.quiet;
  return TONE_CLASS.warning;
}

export function getCompatibilityClass(status: string | null | undefined, _theme: Theme = "dark") {
  if (status === "valid" || status === "compatible") return TONE_CLASS.success;
  if (status === "warning") return TONE_CLASS.warning;
  if (status === "blocked" || status === "incompatible") return TONE_CLASS.blocked;
  return TONE_CLASS.quiet;
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
  _theme: Theme = "dark"
) {
  // On Track keeps the warning tone it has always had rather than moving to
  // success: alignment with the prompt is a running judgement the next line can
  // undo, and green in this system is reserved for "it ran".
  if (status === "on_track") return TONE_CLASS.warning;
  // A mismatch or a dropped constraint means the solution cannot be right as
  // written; an output or edge-case note means look at it. The four warm hues
  // these used to have were never separable at chip size anyway -- the label
  // inside the chip is what tells them apart, and it always renders.
  if (status === "logic_mismatch" || status === "missing_constraint") return TONE_CLASS.blocked;
  if (status === "output_issue" || status === "edge_case_risk") return TONE_CLASS.warning;
  if (status === "partial") return TONE_CLASS.neutral;
  return TONE_CLASS.quiet;
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

/*
 * The button inside a diagnostic bubble. Shared across the three tones because
 * the only thing that changes with severity is the colour, and the material --
 * raised, lifting on hover, pressed when held -- is the same object either way.
 */
const DIAGNOSTIC_ACTION_CLASS = joinClasses(
  "transition-[background-color,box-shadow,transform]",
  "duration-[var(--duration-press)] ease-[var(--ease-spring)]",
  "shadow-[var(--raised)] hover:shadow-[var(--lifted)]",
  "hover:-translate-y-[var(--lift-travel)]",
  "active:shadow-[var(--pressed)] active:translate-y-[var(--press-travel)]",
  "motion-reduce:transform-none motion-reduce:hover:transform-none",
  "motion-reduce:active:transform-none"
);

/**
 * The diagnostic bubble and the pieces inside it, by severity.
 *
 * The bubble used to be lit from within -- a 60px coloured shadow plus a 4px
 * tinted ring, which is a diagnostic glowing in the dark rather than a card
 * lying over the editor. It is a popover, so it now sits on the floating rung
 * and states its severity the way everything else does: a tinted border (the
 * call site draws it at border-2), a tinted title, and tinted fills on the rows
 * inside. Same message, no second light source.
 *
 * The bubble's own text is --text-primary rather than a deep tint of the
 * severity colour. Tinted body text was carrying no meaning the border and
 * title did not already carry, and it was the one thing here whose contrast
 * changed with severity.
 *
 * No theme argument: every class below is a token that swaps on its own.
 */
export function getDiagnosticToneClasses(severity: ActionableDiagnostic["severity"]) {
  if (severity === "blocked") {
    return {
      bubble:
        "border-[color-mix(in_srgb,var(--state-blocked)_55%,transparent)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] text-[var(--text-primary)] shadow-[var(--floating)]",
      accent: "text-[var(--state-blocked)]",
      chip: TONE_CLASS.blocked,
      row: "border-[color-mix(in_srgb,var(--state-blocked)_22%,transparent)] bg-[var(--state-blocked-subtle)] text-[var(--text-primary)]",
      primary: joinClasses(
        DIAGNOSTIC_ACTION_CLASS,
        "border-[color-mix(in_srgb,var(--state-blocked)_35%,transparent)]",
        "bg-[var(--state-blocked-subtle)] text-[var(--state-blocked)]",
        "hover:bg-[color-mix(in_srgb,var(--state-blocked)_16%,transparent)]"
      ),
    };
  }

  if (severity === "warning") {
    return {
      bubble:
        "border-[color-mix(in_srgb,var(--state-warning)_55%,transparent)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] text-[var(--text-primary)] shadow-[var(--floating)]",
      accent: "text-[var(--state-warning)]",
      chip: TONE_CLASS.warning,
      row: "border-[color-mix(in_srgb,var(--state-warning)_22%,transparent)] bg-[var(--state-warning-subtle)] text-[var(--text-primary)]",
      primary: joinClasses(
        DIAGNOSTIC_ACTION_CLASS,
        "border-[color-mix(in_srgb,var(--state-warning)_35%,transparent)]",
        "bg-[var(--state-warning-subtle)] text-[var(--state-warning)]",
        "hover:bg-[color-mix(in_srgb,var(--state-warning)_16%,transparent)]"
      ),
    };
  }

  return {
    bubble:
      "border-[color-mix(in_srgb,var(--state-success)_55%,transparent)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] text-[var(--text-primary)] shadow-[var(--floating)]",
    accent: "text-[var(--state-success)]",
    chip: TONE_CLASS.success,
    row: "border-[color-mix(in_srgb,var(--state-success)_22%,transparent)] bg-[var(--state-success-subtle)] text-[var(--text-primary)]",
    primary: joinClasses(
      DIAGNOSTIC_ACTION_CLASS,
      "border-[color-mix(in_srgb,var(--state-success)_35%,transparent)]",
      "bg-[var(--state-success-subtle)] text-[var(--state-success)]",
      "hover:bg-[color-mix(in_srgb,var(--state-success)_16%,transparent)]"
    ),
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
