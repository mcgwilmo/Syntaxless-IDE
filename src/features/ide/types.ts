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

export type TerminalEntry = {
  id: string;
  stream: "stdout" | "stderr" | "system" | "input" | "runtime";
  text: string;
  symbol?: string;
};

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
