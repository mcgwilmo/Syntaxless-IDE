/**
 * Types for the IDE.
 *
 * The shapes the IDE works in. Wire types -- what the backend actually sends --
 * live in `src/lib/api/types.ts`; these are the view-side shapes, which differ
 * where the IDE resolves or enriches something before rendering it.
 */

export type InterpretationLine = {
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
  assumptions?: string[];
  unresolved_slots?: string[];
};

export type ResolvedInterpretationLine = InterpretationLine & {
  resolvedLineNumber: number | null;
};

export type DevMetricStep = {
  key: string;
  label: string;
  status: string;
  duration_ms?: number | null;
};

export type DevMetrics = {
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

export type ProblemAlignmentStatus =
  | "on_track"
  | "partial"
  | "logic_mismatch"
  | "missing_constraint"
  | "output_issue"
  | "edge_case_risk";

export type ProblemAlignmentIssue = {
  kind: ProblemAlignmentStatus | "partial";
  message: string;
  line_number?: number | null;
  severity?: "warning" | "blocked";
  suggested_fix?: string | null;
};

export type ProblemAlignmentLineNotice = {
  kind: ProblemAlignmentStatus | "partial";
  message: string;
  line_number?: number | null;
  severity?: "warning" | "blocked";
  suggested_fix?: string | null;
};

export type ProblemAlignment = {
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

export type IdeMode = "strict" | "standard" | "abstraction" | "problem_solving" | "vibe";
export type BottomTab = "terminal" | "visual";
export type LayoutMode = "minimalist" | "normal" | "developer";
export type IdeMenuId = "file" | "edit" | "view" | "help" | "account";

export type IdeMenuItem = {
  label: string;
  symbol?: string;
  icon?: MinimalControlIconName;
  detail?: string;
  href?: string;
  action?: () => void | Promise<void>;
  disabled?: boolean;
  active?: boolean;
  danger?: boolean;
};

export type IdeMenuGroup = {
  id: IdeMenuId;
  label: string;
  symbol: string;
  items: IdeMenuItem[];
};

export type DiagnosticAction =
  | {
      kind: "go_to_line";
      label: string;
      lineNumber: number;
    }
  | {
      kind: "replace_line";
      label: string;
      lineNumber: number;
      nextText: string;
    }
  | {
      kind: "switch_mode";
      label: string;
      mode: IdeMode;
    }
  | {
      kind: "open_problem_panel";
      label: string;
    };

export type ActionableDiagnostic = {
  id: string;
  source: "language" | "problem";
  severity: "ok" | "warning" | "blocked";
  filePath: string;
  lineNumber: number | null;
  title: string;
  message: string;
  explanation?: string;
  modeDetail?: string;
  structureDetail?: string;
  suggestedFix?: string;
  raw?: string;
  actions: DiagnosticAction[];
};

export type DiagnosticPopupState = {
  lineNumber: number;
  top: number;
  left: number;
};

export type RunHistoryItem = {
  id: string;
  timestamp: string;
  status: string;
  mode?: IdeMode;
  active_file_path?: string;
  artifact_count?: number;
};

export type BackendArtifact = {
  name: string;
  artifact_type: string;
  label: string;
};

export type VisualArtifact = {
  name: string;
  artifact_type: string;
  label: string;
  url: string;
  source: "live" | "persisted";
};

export type FileNode = {
  id: string;
  type: "file";
  name: string;
  content: string;
};

export type FolderNode = {
  id: string;
  type: "folder";
  name: string;
  isOpen: boolean;
  children: ExplorerNode[];
};

export type ExplorerNode = FileNode | FolderNode;

export type ContextMenuState = {
  x: number;
  y: number;
  nodeId: string;
  nodeType: "file" | "folder";
} | null;

export type ToastState = {
  text: string;
  visible: boolean;
};

export type UpgradeModalState = {
  open: boolean;
  title: string;
  message: string;
};

export type BugReportTargetKind = "ui" | "run";

export type BugReportCategory =
  | "incorrect_validation"
  | "wrong_generated_code"
  | "runtime_execution_failure"
  | "visual_artifact_issue"
  | "ide_ui_issue"
  | "performance_timeout"
  | "other";

export type BugReportFormValues = {
  category: BugReportCategory;
  title: string;
  description: string;
  expectedBehavior: string;
  reproducible: boolean;
};

/*
 * How each mode paints the IDE.
 *
 * The tint is not confined to the mode picker: the armed Run button, the active
 * menu item, and the open file in the explorer all take it, so this table is
 * what answers "which mode am I in" without anyone reading a label.
 *
 * Because it carries meaning, the tint is not a free hue. Each mode borrows the
 * token whose meaning already matches what the mode does to your code. Strict
 * is the mode that refuses lines, so --state-blocked; Problem Solving is the
 * mode that flags them, so --state-warning; Vibe refuses nothing, so
 * --state-success; Standard is the ordinary path and takes the accent.
 * Abstraction neither refuses nor flags, so it has no state to borrow and is
 * tinted with ink instead of hue -- which still reads as emphasis in both
 * themes, since --text-primary is near-black on the light page and near-white
 * on the dark one.
 *
 * `glow` and `accentGlow` used to be coloured 50-60px halos. A halo is a second
 * light source, and the material system has exactly one -- above and slightly
 * forward, with every surface only reflecting it. They are elevation rungs now,
 * and the same rung for every mode, because depth says what a surface IS rather
 * than which mode is selected. The identity those halos carried moved into the
 * border and fill fields, where half of it already lived.
 *
 * Strengths keep the states ordered: hover tints with the -subtle token, and
 * selected mixes the same colour to 16% behind a 45% border, which still
 * outweighs hover in the dark theme where the -subtle tokens sit at 12%.
 * Elevation and press travel stay with the call site -- two shadow utilities on
 * one element resolve by stylesheet order rather than by intent.
 *
 * Every class is written out rather than composed, because Tailwind only emits
 * the class names it can literally see in the source.
 */
export const MODE_META: Record<
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
    border: "border-[color-mix(in_srgb,var(--state-blocked)_30%,transparent)]",
    glow: "shadow-[var(--raised)]",
    hover:
      "hover:border-[color-mix(in_srgb,var(--state-blocked)_30%,transparent)] hover:bg-[var(--state-blocked-subtle)]",
    active:
      "border-[color-mix(in_srgb,var(--state-blocked)_45%,transparent)] bg-[color-mix(in_srgb,var(--state-blocked)_16%,transparent)]",
    badge: "text-[var(--state-blocked)]",
    accentText: "text-[var(--state-blocked)]",
    accentBorder: "border-[color-mix(in_srgb,var(--state-blocked)_45%,transparent)]",
    accentBg: "bg-[color-mix(in_srgb,var(--state-blocked)_16%,transparent)]",
    accentSoftBg: "bg-[var(--state-blocked-subtle)]",
    accentHoverText: "hover:text-[var(--state-blocked)]",
    accentHoverBorder: "hover:border-[color-mix(in_srgb,var(--state-blocked)_30%,transparent)]",
    accentHoverBg: "hover:bg-[var(--state-blocked-subtle)]",
    accentEditorBar: "bg-[var(--state-blocked)]",
    accentRing: "ring-[color-mix(in_srgb,var(--state-blocked)_30%,transparent)]",
    accentGlow: "shadow-[var(--raised-lg)]",
    accentSurface: "from-[var(--state-blocked-subtle)] to-transparent",
    accentLine: "bg-[color-mix(in_srgb,var(--state-blocked)_60%,transparent)]",
    terminalText: "text-[var(--state-blocked)]",
    terminalBorder: "border-t-[var(--state-blocked)]",
  },
  standard: {
    label: "Standard",
    short: "Executable English with ordinary inference and no fuss.",
    description:
      "Standard mode allows ordinary English statements and resolves obvious intended meaning without treating routine inference as a problem.",
    icon: "◫",
    // The default mode is the one place the accent is the honest choice: it is
    // the ordinary path, and the accent is what the system uses for emphasis.
    border: "border-[var(--accent-border)]",
    glow: "shadow-[var(--raised)]",
    hover: "hover:border-[var(--accent-border)] hover:bg-[var(--accent-subtle)]",
    active:
      "border-[color-mix(in_srgb,var(--accent-solid)_45%,transparent)] bg-[color-mix(in_srgb,var(--accent-solid)_16%,transparent)]",
    badge: "text-[var(--accent-text)]",
    accentText: "text-[var(--accent-text)]",
    accentBorder: "border-[color-mix(in_srgb,var(--accent-solid)_45%,transparent)]",
    accentBg: "bg-[color-mix(in_srgb,var(--accent-solid)_16%,transparent)]",
    accentSoftBg: "bg-[var(--accent-subtle)]",
    accentHoverText: "hover:text-[var(--accent-text)]",
    accentHoverBorder: "hover:border-[var(--accent-border)]",
    accentHoverBg: "hover:bg-[var(--accent-subtle)]",
    accentEditorBar: "bg-[var(--accent-solid)]",
    accentRing: "ring-[var(--accent-border)]",
    accentGlow: "shadow-[var(--raised-lg)]",
    accentSurface: "from-[var(--accent-subtle)] to-transparent",
    accentLine: "bg-[color-mix(in_srgb,var(--accent-solid)_60%,transparent)]",
    terminalText: "text-[var(--accent-text)]",
    terminalBorder: "border-t-[var(--accent-solid)]",
  },
  abstraction: {
    label: "Abstraction",
    short: "Executable intent first; implementation detail may be omitted.",
    description:
      "Abstraction mode allows non-specific executable requests and infers methodology/details freely. It mainly blocks non-functional or qualitative requests.",
    icon: "◎",
    // Ink rather than hue, for the reason above. The fill is mixed a little
    // lighter than the tinted modes because a neutral wash at their strength
    // reads as the surface being dimmed rather than chosen.
    border: "border-[var(--border-strong)]",
    glow: "shadow-[var(--raised)]",
    hover:
      "hover:border-[var(--border-strong)] hover:bg-[color-mix(in_srgb,var(--text-primary)_6%,transparent)]",
    active:
      "border-[color-mix(in_srgb,var(--text-primary)_35%,transparent)] bg-[color-mix(in_srgb,var(--text-primary)_12%,transparent)]",
    badge: "text-[var(--text-primary)]",
    accentText: "text-[var(--text-primary)]",
    accentBorder: "border-[color-mix(in_srgb,var(--text-primary)_35%,transparent)]",
    accentBg: "bg-[color-mix(in_srgb,var(--text-primary)_12%,transparent)]",
    accentSoftBg: "bg-[color-mix(in_srgb,var(--text-primary)_6%,transparent)]",
    accentHoverText: "hover:text-[var(--text-primary)]",
    accentHoverBorder: "hover:border-[var(--border-strong)]",
    accentHoverBg: "hover:bg-[color-mix(in_srgb,var(--text-primary)_6%,transparent)]",
    accentEditorBar: "bg-[var(--text-primary)]",
    accentRing: "ring-[var(--border-strong)]",
    accentGlow: "shadow-[var(--raised-lg)]",
    accentSurface: "from-[color-mix(in_srgb,var(--text-primary)_6%,transparent)] to-transparent",
    accentLine: "bg-[color-mix(in_srgb,var(--text-primary)_45%,transparent)]",
    terminalText: "text-[var(--text-primary)]",
    terminalBorder: "border-t-[var(--text-primary)]",
  },
  problem_solving: {
    label: "Problem Solving",
    short: "Strict execution rules with live problem-solution alignment.",
    description:
      "Problem Solving mode keeps the governed strict pipeline, but also compares your evolving solution against an attached prompt to catch likely logic and format mismatches.",
    icon: "PS",
    border: "border-[color-mix(in_srgb,var(--state-warning)_30%,transparent)]",
    glow: "shadow-[var(--raised)]",
    hover:
      "hover:border-[color-mix(in_srgb,var(--state-warning)_30%,transparent)] hover:bg-[var(--state-warning-subtle)]",
    active:
      "border-[color-mix(in_srgb,var(--state-warning)_45%,transparent)] bg-[color-mix(in_srgb,var(--state-warning)_16%,transparent)]",
    badge: "text-[var(--state-warning)]",
    accentText: "text-[var(--state-warning)]",
    accentBorder: "border-[color-mix(in_srgb,var(--state-warning)_45%,transparent)]",
    accentBg: "bg-[color-mix(in_srgb,var(--state-warning)_16%,transparent)]",
    accentSoftBg: "bg-[var(--state-warning-subtle)]",
    accentHoverText: "hover:text-[var(--state-warning)]",
    accentHoverBorder: "hover:border-[color-mix(in_srgb,var(--state-warning)_30%,transparent)]",
    accentHoverBg: "hover:bg-[var(--state-warning-subtle)]",
    accentEditorBar: "bg-[var(--state-warning)]",
    accentRing: "ring-[color-mix(in_srgb,var(--state-warning)_30%,transparent)]",
    accentGlow: "shadow-[var(--raised-lg)]",
    accentSurface: "from-[var(--state-warning-subtle)] to-transparent",
    accentLine: "bg-[color-mix(in_srgb,var(--state-warning)_60%,transparent)]",
    terminalText: "text-[var(--state-warning)]",
    terminalBorder: "border-t-[var(--state-warning)]",
  },
  vibe: {
    label: "Vibe",
    short: "Full high-level prompt-style generation.",
    description:
      "Vibe mode is the loosest mode. High-level requests are allowed and the system may infer substantial structure and implementation details.",
    icon: "✦",
    border: "border-[color-mix(in_srgb,var(--state-success)_30%,transparent)]",
    glow: "shadow-[var(--raised)]",
    hover:
      "hover:border-[color-mix(in_srgb,var(--state-success)_30%,transparent)] hover:bg-[var(--state-success-subtle)]",
    active:
      "border-[color-mix(in_srgb,var(--state-success)_45%,transparent)] bg-[color-mix(in_srgb,var(--state-success)_16%,transparent)]",
    badge: "text-[var(--state-success)]",
    accentText: "text-[var(--state-success)]",
    accentBorder: "border-[color-mix(in_srgb,var(--state-success)_45%,transparent)]",
    accentBg: "bg-[color-mix(in_srgb,var(--state-success)_16%,transparent)]",
    accentSoftBg: "bg-[var(--state-success-subtle)]",
    accentHoverText: "hover:text-[var(--state-success)]",
    accentHoverBorder: "hover:border-[color-mix(in_srgb,var(--state-success)_30%,transparent)]",
    accentHoverBg: "hover:bg-[var(--state-success-subtle)]",
    accentEditorBar: "bg-[var(--state-success)]",
    accentRing: "ring-[color-mix(in_srgb,var(--state-success)_30%,transparent)]",
    accentGlow: "shadow-[var(--raised-lg)]",
    accentSurface: "from-[var(--state-success-subtle)] to-transparent",
    accentLine: "bg-[color-mix(in_srgb,var(--state-success)_60%,transparent)]",
    terminalText: "text-[var(--state-success)]",
    terminalBorder: "border-t-[var(--state-success)]",
  },
};

export type TerminalEntry = {
  id: string;
  /**
   * `explanation` is the localized account of a runtime failure. It always
   * accompanies the `stderr` entry carrying the real traceback and never
   * stands in for it.
   */
  stream: "stdout" | "stderr" | "system" | "input" | "runtime" | "explanation";
  text: string;
  symbol?: string;
};

/*
 * Layouts are a density ladder, not a set of states -- there is nothing
 * successful about Normal or blocked about Minimalist -- so they do not borrow
 * the state colours the way modes do. They share the one accent and separate by
 * how much of it they carry: Minimalist the least, Developer the most, which is
 * the thing the choice is actually about.
 *
 * `halo` is the soft disc behind a layout card. It is a flat token tint rather
 * than a coloured light: blurred at these alphas it reads as the card's own
 * surface being tinted, where the amber/sky/violet discs it replaces read as a
 * lamp switched on inside the card. `glow` follows the mode table onto a rung.
 */
export const LAYOUT_META: Record<
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
    accentText: "text-[var(--accent-text)]",
    accentBorder: "border-[var(--accent-border)]",
    accentBg: "bg-[color-mix(in_srgb,var(--accent-solid)_16%,transparent)]",
    hover: "hover:border-[var(--accent-border)] hover:bg-[var(--accent-subtle)]",
    glow: "shadow-[var(--raised-lg)]",
    halo: "bg-[color-mix(in_srgb,var(--accent-solid)_8%,transparent)]",
  },
  normal: {
    label: "Normal",
    short: "Balanced full layout.",
    detail: "Balanced visibility for everyday use.",
    icon: "NRM",
    accentText: "text-[var(--accent-text)]",
    accentBorder: "border-[color-mix(in_srgb,var(--accent-solid)_38%,transparent)]",
    accentBg: "bg-[color-mix(in_srgb,var(--accent-solid)_22%,transparent)]",
    hover: "hover:border-[var(--accent-border)] hover:bg-[var(--accent-subtle)]",
    glow: "shadow-[var(--raised-lg)]",
    halo: "bg-[color-mix(in_srgb,var(--accent-solid)_14%,transparent)]",
  },
  developer: {
    label: "Developer",
    short: "Everything expanded and visible.",
    detail: "Everything expanded for full control and visibility.",
    icon: "DEV",
    accentText: "text-[var(--accent-text)]",
    accentBorder: "border-[color-mix(in_srgb,var(--accent-solid)_52%,transparent)]",
    accentBg: "bg-[color-mix(in_srgb,var(--accent-solid)_28%,transparent)]",
    hover: "hover:border-[var(--accent-border)] hover:bg-[var(--accent-subtle)]",
    glow: "shadow-[var(--raised-lg)]",
    halo: "bg-[color-mix(in_srgb,var(--accent-solid)_20%,transparent)]",
  },
};

export const DEV_VISION_PASSWORD = "MatWil.05";
export const PAGE_HEADING_CLASS = "font-bold leading-[0.95] tracking-[-0.045em]";

export type MinimalControlIconName =
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
