/**
 * Wire types for the backend API.
 *
 * These mirror the shapes the backend actually returns, verified against
 * `scripts/capture_api_shapes.py` in the backend repo -- which records the keys
 * and types of every response across nine cases. If a field here disagrees with
 * that capture, the capture is right.
 *
 * Fields are optional where the backend genuinely omits them. A blocked run has
 * no `run_id`; a successful one has no `stderr`. Those are different responses
 * that happen to share a route, and pretending otherwise pushes the problem
 * into the component.
 */

export type IdeMode =
  | "strict"
  | "standard"
  | "abstraction"
  | "problem_solving"
  | "vibe";

export type DiagnosticStatus = "valid" | "warning" | "blocked";

/** What every analyze/run request carries. */
export type PipelineRequest = {
  project_id: string;
  active_document: string;
  active_file_path: string;
  problem_statement: string | null;
  project_context: Array<{ path: string; content: string }>;
  mode: IdeMode;
  subscription_tier: string;
  /**
   * Language to report runtime errors in, as a BCP-47 tag.
   *
   * Free-form rather than a union: the backend accepts regional forms like
   * `es-MX` and falls back to English for anything it cannot speak, so an
   * unrecognized tag degrades the message instead of failing the run.
   */
  locale?: string | null;
};

/**
 * A runtime failure, explained in the student's language.
 *
 * Sits alongside the raw stderr rather than replacing it -- the traceback is
 * still streamed verbatim. `line_number` counts lines of the student's own
 * program, already mapped back past the sandbox's runtime prelude, and is null
 * when the backend could not map it honestly.
 */
export type RuntimeErrorExplanation = {
  exception_type: string;
  raw_message: string;
  line_number: number | null;
  /** Localized label for `line_number`, e.g. "Línea 7". Null when unmapped. */
  location: string | null;
  locale: string;
  explanation: string;
  hint: string | null;
  /** CPython's own spelling suggestion, when it offered one. */
  did_you_mean: string | null;
  message_key: string;
  /** False when only the generic per-type explanation applied. */
  recognized: boolean;
};

/** One line of the student's program, as the backend understood it. */
export type InterpretationLine = {
  representation_version?: string;
  line_number: number | null;
  raw: string;
  type: DiagnosticStatus;
  valid: boolean;
  message: string;
  kind?: string | null;
  intent?: Record<string, unknown> | null;
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
  assumptions?: string[];
  unresolved_slots?: string[];
  ai_message?: string | null;
  logic_risk?: string | null;
  suggested_fix?: string | null;
  generated_code_excerpt?: string | null;
};

export type ProblemAlignment = {
  status?: string;
  goal_summary?: string | null;
  issues?: Array<Record<string, unknown>>;
  line_notices?: Array<Record<string, unknown>>;
  review_source?: string;
  [key: string]: unknown;
};

/** Developer-panel timings. Diagnostic only -- never drives behavior. */
export type DevMetrics = Record<string, unknown>;

/** POST /interpret -- analysis only, generates no Python. */
export type InterpretResponse = {
  representation_version: string;
  project_id: string;
  mode: IdeMode;
  active_file_path: string;
  problem_statement: string | null;
  execution_allowed: boolean;
  reason_if_blocked: string | null;
  lines: InterpretationLine[];
  problem_alignment: ProblemAlignment | null;
  dev_metrics: DevMetrics | null;
};

/**
 * POST /run/start.
 *
 * `status` distinguishes the two shapes: "started" carries `run_id` and no
 * stderr; "blocked" carries `stderr` and the persisted `run`, and nothing was
 * executed.
 */
export type RunStartResponse = {
  representation_version: string;
  status: "started" | "blocked";
  project_id: string;
  mode: IdeMode;
  active_file_path: string;
  problem_statement: string | null;
  generated_python: string;
  interpretation?: { lines: InterpretationLine[] };
  problem_alignment: ProblemAlignment | null;
  dev_metrics: DevMetrics | null;
  run_id?: string;
  stderr?: string;
  run?: PersistedRun;
};

export type PersistedRun = {
  run_id?: string;
  id?: string;
  project_id?: string;
  status: string;
  mode?: string;
  created_at?: string;
  document?: string;
  generated_python?: string;
  stdout?: string;
  stderr?: string;
  active_file_path?: string;
  problem_statement?: string | null;
  problem_alignment?: ProblemAlignment | null;
  interpretation_lines?: InterpretationLine[];
  dev_metrics?: DevMetrics | null;
  artifacts?: BackendArtifact[];
  [key: string]: unknown;
};

export type BackendArtifact = {
  name: string;
  artifact_type?: string;
  label?: string;
  [key: string]: unknown;
};

/**
 * One row of run history.
 *
 * NOT a `PersistedRun`. `GET /runs` returns exactly these six fields -- no
 * document, no generated Python, and no `interpretation_lines`. Typing the list
 * as full runs (which this did) type-checks code that reads
 * `item.interpretation_lines`, gets `undefined`, and silently treats a program
 * as having no steps at all.
 */
export type RunSummary = {
  id: string;
  timestamp: string;
  status: string;
  mode?: IdeMode;
  active_file_path?: string;
  artifact_count?: number;
};

export type RunListResponse = { runs: RunSummary[] };

/** How one step differs between two runs. Stable keys; the prose is separate. */
export type RunDiffChange =
  | "changed"
  | "added"
  | "removed"
  | "moved"
  | "reworded"
  | "unchanged";

/**
 * One step's difference between two runs.
 *
 * `description`, `detail` and the `*_location` labels arrive already written in
 * the requested language. The IDE has no locale catalog, so it may position and
 * style these strings but must never compose its own -- anything it adds arrives
 * in English and undoes the translation.
 */
export type RunDiffEntry = {
  change: RunDiffChange;
  base_line_number: number | null;
  compare_line_number: number | null;
  /** Localized, e.g. "Línea 7". Null when the step exists on only one side. */
  base_location: string | null;
  compare_location: string | null;
  /** The student's own words. Never translated. */
  base_text: string | null;
  compare_text: string | null;
  description: string;
  /** Only ever set for `changed`, and only when something specific differs. */
  detail: string | null;
  /** Internal step name, for grouping. Not for display -- it is not localized. */
  step: string | null;
};

export type RunDiffSide = {
  run_id: string | null;
  timestamp: string | null;
  status: string | null;
  mode: string | null;
  active_file_path: string | null;
};

/**
 * GET /runs/{base}/diff/{compare} -- what changed between two runs, by meaning.
 *
 * `semantic` is false when a side carried no interpreted structure (a vibe run).
 * The comparison then rests on wording alone, `notice` says so, and the result
 * should be presented as the weaker thing it is.
 */
export type RunDiff = {
  locale: string;
  base: RunDiffSide;
  compare: RunDiffSide;
  headline: string;
  summary: Record<RunDiffChange, number>;
  /** Localized names for each count, so the IDE never writes one itself. */
  summary_labels: Record<RunDiffChange, string>;
  entries: RunDiffEntry[];
  semantic: boolean;
  notice: string | null;
};

/**
 * Events streamed over WS /run/{run_id}/stream.
 *
 * The sandbox writes these; anything it prints that is not an event arrives as
 * a `stdout` event. `completed` is terminal -- the socket closes after it.
 *
 * `error_explanation` is emitted at most once, immediately before `completed`,
 * and only when the run failed with an actual Python exception. Runs that ended
 * for our reasons rather than the student's -- a timeout, a stop, an output
 * limit -- have no exception to explain and send nothing.
 */
export type RunEvent =
  | { type: "run_started"; run_id: string; executor_mode: string }
  | { type: "stdout"; text: string }
  | { type: "stderr"; text: string }
  | { type: "runtime_message"; text: string }
  | { type: "input_requested"; prompt: string }
  | { type: "artifact_created"; name: string; artifact_type?: string; label?: string }
  | ({ type: "error_explanation"; run_id: string } & RuntimeErrorExplanation)
  | {
      type: "completed";
      run_id: string;
      status: string;
      exit_code: number;
      artifacts?: BackendArtifact[];
      [key: string]: unknown;
    }
  | { type: string; [key: string]: unknown };

export type BugReportRequest = {
  owner_id: string;
  project_id: string;
  run_id: string | null;
  active_file_path: string;
  mode: IdeMode;
  category: string;
  title: string;
  description: string;
  expected_behavior: string | null;
  reproducible: string;
  snapshot: Record<string, unknown>;
};
