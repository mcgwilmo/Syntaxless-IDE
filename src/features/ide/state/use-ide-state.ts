"use client";

/**
 * All of the IDE's state, in one hook.
 *
 * Not a tidy design: 53 pieces of state, 13 effects, and 42 handlers that
 * reference one another. That is the honest shape of what IdePageContent
 * already was. Moving it here changes none of the coupling -- it stops the
 * coupling living in the middle of 2,200 lines of JSX.
 *
 * Panels consume this via useIde() rather than props, because each JSX region
 * needs 46-59 identifiers and no component takes 59 props.
 *
 * The context type is inferred from this hook's return, so there is no
 * 162-field interface to keep in step by hand.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type Monaco } from "@monaco-editor/react";
import type { editor as MonacoEditor } from "monaco-editor";
import {
  getSupabaseBrowserClient,
  getSupabaseSession,
} from "@/lib/supabase/client";
import { useTheme } from "@/components/theme-provider";
import { STORAGE_KEYS } from "@/config/brand";
import type { RuntimeErrorExplanation } from "@/lib/api/types";
import type {
  ActionableDiagnostic,
  BackendArtifact,
  BottomTab,
  BugReportFormValues,
  BugReportTargetKind,
  ContextMenuState,
  DevMetrics,
  DiagnosticAction,
  DiagnosticPopupState,
  ExplorerNode,
  FileNode,
  FolderNode,
  IdeMenuGroup,
  IdeMenuId,
  IdeMenuItem,
  IdeMode,
  InterpretationLine,
  LayoutMode,
  ProblemAlignment,
  RunHistoryItem,
  TerminalEntry,
  ToastState,
  UpgradeModalState,
  VisualArtifact,
} from "@/features/ide/types";
import {
  DEV_VISION_PASSWORD,
  LAYOUT_META,
  MODE_META,
} from "@/features/ide/types";
import {
  buildActionableDiagnostics,
  convertArtifactsToVisuals,
  countSynthFiles,
  countSynthFilesInNode,
  createStarterTree,
  deriveProblemPreview,
  describeBackendConnectionError,
  formatDurationMs,
  formatScore,
  getDefaultLayoutForTier,
  getDefaultModeForTier,
  getDiagnosticToneClasses,
  getLockedLayoutReason,
  getLockedModeReason,
  getModeBarGlowStyle,
  getModeButtonClass,
  getProblemNoticeSeverity,
  getBrowserLocale,
  getProblemStatusLabel,
  getProtectedDarkSurfaceStyle,
  getProtectedDarkTextStyle,
  getSeverity,
  isBackendConnectionError,
  isSynthFileName,
  joinClasses,
  normalizeLineNumber,
  normalizeProblemStatement,
  parseRequestedMode,
  resolveInterpretationLines,
  resolveModeForTier,
  toWsUrl,
  uid,
  addChildToFolder,
  collectReferenceFiles,
  duplicateNode,
  findFilePathById,
  findFirstFileId,
  findNodeById,
  insertSiblingAfterId,
  removeNodeById,
  updateNodeById,
} from "@/features/ide/lib";
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

export function useIdeState() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const { isLight, theme, toggleTheme } = useTheme();
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
  const wsBaseUrl = useMemo(() => toWsUrl(backendUrl), [backendUrl]);

  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const terminalScrollRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const addMenuRef = useRef<HTMLDivElement | null>(null);
  const treeMenuRef = useRef<HTMLDivElement | null>(null);
  const editorShellRef = useRef<HTMLDivElement | null>(null);
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
  const [openIdeMenu, setOpenIdeMenu] = useState<IdeMenuId | null>(null);
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
  const [diagnosticPopup, setDiagnosticPopup] = useState<DiagnosticPopupState | null>(null);
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

  const getDiagnosticPopupPosition = useCallback((lineNumber: number) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const shell = editorShellRef.current;
    const editorNode = editor?.getDomNode();

    if (!editor || !shell || !editorNode || !monaco) return { top: 12, left: 12 };

    const editorRect = editorNode.getBoundingClientRect();
    const shellRect = shell.getBoundingClientRect();
    const layout = editor.getLayoutInfo();
    const lineHeight = editor.getOption(monaco.editor.EditorOption.lineHeight);
    const lineTop = editor.getTopForLineNumber(lineNumber) - editor.getScrollTop();
    const top = editorRect.top - shellRect.top + lineTop + lineHeight + 6;
    const left = editorRect.left - shellRect.left + layout.contentLeft;
    const maxTop = Math.max(12, shell.clientHeight - 230);
    const maxLeft = Math.max(12, shell.clientWidth - 416);

    return {
      top: Math.min(Math.max(top, 12), maxTop),
      left: Math.min(Math.max(left, 12), maxLeft),
    };
  }, []);
  const synthFileLimit = getSynthFileLimit(activeTier);
  const currentSynthFileCount = useMemo(() => countSynthFiles(explorerTree), [explorerTree]);
  const problemStorageKey = useMemo(() => STORAGE_KEYS.problem(projectId), [projectId]);

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
  const actionableDiagnostics = useMemo(
    () =>
      buildActionableDiagnostics({
        activeTier,
        currentFilePath,
        mode,
        problemIssues,
        problemLineNotices,
        resolvedInterpretationLines,
      }),
    [activeTier, currentFilePath, mode, problemIssues, problemLineNotices, resolvedInterpretationLines]
  );
  const selectedDiagnostic = useMemo(() => {
    if (!diagnosticPopup) return null;

    const lineCount = activeFile?.content.split("\n").length || 0;

    return (
      actionableDiagnostics.find((diagnostic) => {
        if (diagnostic.severity === "ok") return false;
        return normalizeLineNumber(diagnostic.lineNumber, lineCount) === diagnosticPopup.lineNumber;
      }) || null
    );
  }, [actionableDiagnostics, activeFile?.content, diagnosticPopup]);
  const diagnosticPopupLineNumber = diagnosticPopup?.lineNumber ?? null;
  const selectedDiagnosticTone = getDiagnosticToneClasses(selectedDiagnostic?.severity ?? "warning", isLight);

  useEffect(() => {
    if (diagnosticPopup && !selectedDiagnostic) {
      setDiagnosticPopup(null);
    }
  }, [diagnosticPopup, selectedDiagnostic]);

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor || !diagnosticPopupLineNumber) return;

    const scrollDisposable = editor.onDidScrollChange(() => {
      setDiagnosticPopup((current) =>
        current
          ? {
              ...current,
              ...getDiagnosticPopupPosition(current.lineNumber),
            }
          : current
      );
    });

    return () => scrollDisposable.dispose();
  }, [diagnosticPopupLineNumber, getDiagnosticPopupPosition]);
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

  function handleDiagnosticAction(action: DiagnosticAction, diagnostic: ActionableDiagnostic) {
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    if (action.kind === "go_to_line") {
      editor?.focus();
      editor?.setPosition({ lineNumber: action.lineNumber, column: 1 });
      editor?.revealLineInCenterIfOutsideViewport(action.lineNumber);
      setStatusMessage(`Focused line ${action.lineNumber}.`);
      setDiagnosticPopup(null);
      return;
    }

    if (action.kind === "replace_line") {
      const model = editor?.getModel();

      if (!editor || !monaco || !model) return;

      const maxColumn = model.getLineMaxColumn(action.lineNumber);
      editor.executeEdits("diagnostic-fix", [
        {
          range: new monaco.Range(action.lineNumber, 1, action.lineNumber, maxColumn),
          text: action.nextText,
          forceMoveMarkers: true,
        },
      ]);
      updateActiveFileContent(model.getValue());
      editor.focus();
      setStatusMessage(`Applied suggested fix on line ${action.lineNumber}.`);
      showToast("Suggested fix applied.");
      setDiagnosticPopup(null);
      return;
    }

    if (action.kind === "switch_mode") {
      handleSelectMode(action.mode);
      setDiagnosticPopup(null);
      return;
    }

    setProblemPanelOpen(true);
    setStatusMessage(diagnostic.source === "problem" ? "Opened problem guidance." : diagnostic.title);
    setDiagnosticPopup(null);
  }

  function handleApplySelectedDiagnostic(diagnostic: ActionableDiagnostic) {
    const applyAction = diagnostic.actions.find((action) => action.kind === "replace_line");

    if (!applyAction) return;

    handleDiagnosticAction(applyAction, diagnostic);
  }

  function handleJumpToSelectedDiagnostic(diagnostic: ActionableDiagnostic) {
    const jumpAction = diagnostic.actions.find((action) => action.kind === "go_to_line");

    if (jumpAction) {
      handleDiagnosticAction(jumpAction, diagnostic);
    }
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
      if (isBackendConnectionError(error)) {
        setRuns([]);
        setStatusMessage(`Run history unavailable. Backend is not reachable at ${backendUrl}.`);
        return;
      }

      console.error(error);
      setStatusMessage("Failed to load run history.");
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
      setActiveBottomTab("terminal");
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

      if (payload.type === "error_explanation") {
        // Arrives after the raw traceback has already been streamed, so this
        // reads as a plain-language summary of the error above it rather than
        // a replacement for it.
        //
        // Every string here is composed by the backend, `location` included --
        // the IDE has no locale catalog of its own yet, so any text added on
        // this side would arrive in English and undo the translation.
        const explanation = payload as unknown as RuntimeErrorExplanation;
        const parts = [
          explanation.location,
          explanation.explanation,
          explanation.hint,
        ].filter(Boolean);
        appendTerminal(parts.join("\n") + "\n", "explanation");
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
          locale: getBrowserLocale(),
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
        setActiveBottomTab("terminal");
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
    const diagnosticsByLine = new Map<number, ActionableDiagnostic[]>();

    if (showHighlights) {
      actionableDiagnostics.forEach((diagnostic) => {
        if (diagnostic.severity === "ok") return;
        const lineNumber = normalizeLineNumber(diagnostic.lineNumber, maxLineNumber);
        if (!lineNumber) return;
        const current = diagnosticsByLine.get(lineNumber) || [];
        current.push(diagnostic);
        diagnosticsByLine.set(lineNumber, current);
      });
    }
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
                glyphMarginClassName:
                  severity === "blocked"
                    ? "ide-diagnostic-glyph--blocked"
                    : "ide-diagnostic-glyph--warning",
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
                  glyphMarginClassName:
                    severity === "blocked"
                      ? "ide-diagnostic-glyph--blocked"
                      : "ide-diagnostic-glyph--problem",
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

    const mouseDownDisposable = editor.onMouseDown((event) => {
      const lineNumber = event.target.position?.lineNumber ?? event.target.range?.startLineNumber;
      const isDiagnosticGutter =
        event.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN ||
        event.target.type === monaco.editor.MouseTargetType.GUTTER_LINE_DECORATIONS;

      if (!lineNumber || !diagnosticsByLine.has(lineNumber)) {
        setDiagnosticPopup(null);
        return;
      }

      if (!isDiagnosticGutter) return;

      event.event.preventDefault();
      event.event.stopPropagation();
      setDiagnosticPopup({
        lineNumber,
        ...getDiagnosticPopupPosition(lineNumber),
      });
    });

    const mouseMoveDisposable = editor.onMouseMove((event) => {
      const lineNumber = event.target.position?.lineNumber ?? event.target.range?.startLineNumber;

      if (!lineNumber || !diagnosticsByLine.has(lineNumber)) {
        setDiagnosticPopup((current) => (current ? null : current));
        return;
      }

      const position = getDiagnosticPopupPosition(lineNumber);
      setDiagnosticPopup((current) =>
        current?.lineNumber === lineNumber &&
        current.top === position.top &&
        current.left === position.left
          ? current
          : {
              lineNumber,
              ...position,
            }
      );
    });

    return () => {
      mouseDownDisposable.dispose();
      mouseMoveDisposable.dispose();
    };
  }, [
    actionableDiagnostics,
    activeFile,
    currentFilePath,
    getDiagnosticPopupPosition,
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

    setOpenIdeMenu(null);
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

    setOpenIdeMenu(null);
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
  const iconControls = minimalist;
  const bottomTabs = ["terminal", "visual"] as BottomTab[];
  const showEditorInspector = !minimalist && !problemMode;
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
  // ---- IDE surfaces -----------------------------------------------------
  //
  // Every surface in the IDE is defined here, so the whole editor picks up the
  // material without touching the JSX. Colours come from tokens and swap with
  // the theme on their own, which is why almost none of these branch on isLight
  // any more -- what is left branches on something that genuinely differs
  // between themes, not on colour.
  //
  // The lighting rule from design/tokens.css applies throughout: things you
  // press are raised, things you put content into are recessed, and things that
  // are neither are flat.

  // The editor shell: the largest object on the page, lifted off it.
  const shellSurfaceClass =
    "border-[var(--border-subtle)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] shadow-[var(--raised-lg)]";

  // Chrome beside the work rather than part of it, so it sits back.
  const sidebarSurfaceClass =
    "border-r border-[var(--border-subtle)] bg-[var(--surface-sunken)]";

  const sidebarCardClass =
    "mb-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] px-3.5 py-3 shadow-[var(--raised)]";

  const headerSurfaceClass =
    "border-b border-[var(--border-subtle)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)]";

  const subsectionSurfaceClass =
    "border-b border-[var(--border-subtle)] bg-[var(--surface-raised)]";

  // The well the editor sits in. Recessed, because the work goes into it.
  const workspaceBgClass = "bg-[var(--surface-sunken)]";
  const panelBgClass = "bg-[var(--surface-raised)]";
  const panelBorderClass = "border-[var(--border-subtle)]";

  const softTextClass = "text-[var(--text-soft)]";
  const mutedTextClass = "text-[var(--text-muted)]";
  const strongTextClass = "text-[var(--text-primary)]";
  const strongTextAltClass = "text-[var(--text-primary)]";
  const sectionLabelClass = "text-[var(--text-soft)]";
  const sectionMetaClass = "text-[var(--text-muted)]";
  const sectionTitleClass = "text-[var(--text-primary)]";
  const sidebarDividerClass = "border-[var(--border-subtle)]";
  const terminalTextClass = "text-[var(--accent-text)]";

  const validationSeverityClass = (severity: "ok" | "warning" | "blocked") =>
    severity === "blocked"
      ? "border-[color-mix(in_srgb,var(--state-blocked)_30%,transparent)] bg-[var(--state-blocked-subtle)] text-[var(--state-blocked)]"
      : severity === "warning"
      ? "border-[color-mix(in_srgb,var(--state-warning)_30%,transparent)] bg-[var(--state-warning-subtle)] text-[var(--state-warning)]"
      : "border-[color-mix(in_srgb,var(--state-success)_30%,transparent)] bg-[var(--state-success-subtle)] text-[var(--state-success)]";

  const protectedDarkSurfaceStyle = getProtectedDarkSurfaceStyle(theme);
  const protectedDarkLabelStyle = getProtectedDarkTextStyle(theme, "#a3a3a3");
  const protectedDarkMetaStyle = getProtectedDarkTextStyle(theme, "#d4d4d8");
  const protectedDarkTitleStyle = getProtectedDarkTextStyle(theme, "#ffffff");
  const protectedDarkTerminalTextStyle = getProtectedDarkTextStyle(theme, "#7dd3fc");
  const modeBarGlowStyle = getModeBarGlowStyle(theme, mode, "soft");
  const modePanelGlowStyle = getModeBarGlowStyle(theme, mode, "medium");

  // Recessed: you type into these.
  const inputSurfaceClass =
    "border border-[var(--border-strong)] bg-[var(--surface-sunken)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] shadow-[var(--recessed)]";

  // Inlaid: a label set into the surface, not a control.
  const subtleChipClass =
    "border-[var(--border-subtle)] bg-[var(--surface-sunken)] text-[var(--text-muted)] shadow-[inset_0_1px_1px_rgba(28,26,23,0.07)]";

  const pricingCardClass =
    "border-[var(--border-subtle)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] shadow-[var(--raised)]";
  const pricingCardHoverClass =
    "hover:border-[var(--border-strong)] hover:shadow-[var(--raised-lg)]";

  // Toolbar buttons are objects: raised at rest, pressed in when held.
  const menuButtonClass = (active: boolean) =>
    joinClasses(
      "inline-flex h-9 items-center gap-2 rounded-[var(--radius-md)] border px-3 text-[12px] font-semibold",
      "transition-[background-color,box-shadow,transform] duration-150",
      "shadow-[var(--raised)] active:shadow-[var(--pressed)] active:translate-y-[var(--press-travel)]",
      active
        ? `${currentModeMeta.accentBorder} ${currentModeMeta.accentBg} text-[var(--text-primary)]`
        : "border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
    );

  // Floating above everything, so the largest elevation in the IDE.
  const menuPanelClass =
    "border-[var(--border-strong)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] text-[var(--text-primary)] shadow-[var(--raised-lg)]";

  const menuItemBaseClass =
    "flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-[12px] transition-colors duration-150";

  const menuItemClass = (item: IdeMenuItem) =>
    joinClasses(
      menuItemBaseClass,
      item.disabled
        ? "cursor-not-allowed text-[var(--text-soft)]"
        : item.danger
        ? "text-[var(--state-blocked)] hover:bg-[var(--state-blocked-subtle)]"
        : item.active
        ? `${currentModeMeta.accentBg} text-[var(--text-primary)]`
        : "text-[var(--text-muted)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]"
    );

  const menuSymbolClass = (item?: IdeMenuItem) =>
    joinClasses(
      "flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border text-[12px] font-semibold",
      // Inlaid, like a key cap set into the menu row.
      "shadow-[inset_0_1px_1px_rgba(28,26,23,0.07)]",
      item?.danger
        ? "border-[color-mix(in_srgb,var(--state-blocked)_30%,transparent)] bg-[var(--state-blocked-subtle)] text-[var(--state-blocked)]"
        : "border-[var(--border-subtle)] bg-[var(--surface-sunken)] text-[var(--text-muted)]"
    );
  const desktopIdeMenus: IdeMenuGroup[] = [
    {
      id: "file",
      label: "File",
      symbol: "▣",
      items: [
        {
          label: "Dashboard",
          symbol: "⌂",
          href: "/dashboard",
          detail: "Return to projects",
        },
      ],
    },
    {
      id: "edit",
      label: "Edit",
      symbol: "✎",
      items: [
        {
          label: pythonButtonLabel,
          icon: "python",
          action: handleTogglePython,
          disabled: !generatedPythonAllowed,
          active: generatedPythonAllowed && showPython,
          detail: generatedPythonAllowed ? "Generated Python panel" : "Upgrade required",
        },
        {
          label: resultsButtonLabel,
          icon: "results",
          action: () => setShowBottomPanel((prev) => !prev),
          active: showBottomPanel,
          detail: "Terminal and visual output",
        },
        {
          label: devVisionButtonLabel,
          icon: "vision",
          action: devVisionEnabled ? exitDevVision : openDevVisionPrompt,
          active: devVisionEnabled,
          detail: "Developer diagnostics",
        },
      ],
    },
    {
      id: "view",
      label: "View",
      symbol: "◫",
      items: [
        {
          label: isLight ? "Dark Theme" : "Light Theme",
          symbol: isLight ? "☾" : "☀",
          action: toggleTheme,
          detail: "Switch editor theme",
        },
        {
          label: "Mode",
          icon: "mode",
          action: () => {
            if (!studentModeLocked) setShowModeOverlay(true);
          },
          disabled: studentModeLocked,
          detail: studentModeLocked ? "Student plan is locked" : currentModeMeta.label,
        },
        {
          label: "Layout",
          icon: "layout",
          action: () => setShowLayoutOverlay(true),
          detail: currentLayoutMeta.label,
        },
      ],
    },
    {
      id: "help",
      label: "Help",
      symbol: "?",
      items: [
        {
          label: "Tutorials",
          icon: "tutorial",
          action: openTutorialPlaceholder,
          detail: "Learning resources",
        },
        {
          label: "Report Bug",
          icon: "bug",
          action: openUiBugReport,
          detail: "Tell us what went wrong",
        },
      ],
    },
    {
      id: "account",
      label: "Account",
      symbol: "@",
      items: [
        {
          label: "Manage Subscription",
          icon: "subscriptions",
          href: "/subscriptions",
          detail: activeTier.toUpperCase(),
        },
        {
          label: "Sign Out",
          icon: "signout",
          action: handleSignOut,
          danger: true,
          detail: sessionEmail || "Current session",
        },
      ],
    },
  ];

  return {
    activeTier,
    desktopIdeMenus,
    activeBottomTab,
    activeFile,
    activeFileId,
    activeRunId,
    addMenuRef,
    analysisOpen,
    artifactErrors,
    bottomTabs,
    bugSubmitting,
    bugTargetKind,
    bugTargetRunId,
    checkButtonLabel,
    checkMetrics,
    contextMenu,
    contextMenuRef,
    createFile,
    createFolder,
    currentFilePath,
    currentLayoutMeta,
    currentModeMeta,
    currentSynthFileCount,
    deleteById,
    devMetrics,
    devVisionButtonLabel,
    devVisionEnabled,
    devVisionError,
    devVisionPassword,
    developerExpanded,
    diagnosticPopup,
    diagnosticsSummary,
    duplicateById,
    editableLineCount,
    editorRef,
    editorShellRef,
    exitDevVision,
    explorerTree,
    generatedPython,
    generatedPythonAllowed,
    handleCheck,
    handleDevVisionUnlock,
    handleRun,
    handleSelectLayout,
    handleSelectMode,
    handleSendTerminalInput,
    handleSignOut,
    handleStopRun,
    handleSubmitBugReport,
    handleTogglePython,
    headerSurfaceClass,
    iconControls,
    ideButtonClass,
    inputPrompt,
    inputSurfaceClass,
    interpretationLines,
    isChecking,
    isLight,
    isRunning,
    layoutMode,
    loadRunDetails,
    menuButtonClass,
    menuItemClass,
    menuPanelClass,
    menuSymbolClass,
    minimalist,
    mode,
    modeBarGlowStyle,
    modePanelGlowStyle,
    monacoRef,
    mutedTextClass,
    normalizedProblemStatement,
    openDevVisionPrompt,
    openIdeMenu,
    openRunBugReport,
    openTutorialPlaceholder,
    openUiBugReport,
    openUpgradeModal,
    outputSummaryLabel,
    panelBgClass,
    panelBorderClass,
    pricingCardClass,
    pricingCardHoverClass,
    problemAlignment,
    problemGoalSummary,
    problemIssues,
    problemPanelOpen,
    problemPanelStatus,
    problemStatement,
    projectId,
    projectName,
    protectedDarkLabelStyle,
    protectedDarkMetaStyle,
    protectedDarkSurfaceStyle,
    protectedDarkTerminalTextStyle,
    protectedDarkTitleStyle,
    pythonButtonLabel,
    renameNode,
    resolvedInterpretationLines,
    resultsButtonLabel,
    runButtonLabel,
    runs,
    sectionLabelClass,
    sectionMetaClass,
    sectionTitleClass,
    selectedDiagnostic,
    selectedDiagnosticTone,
    setActiveBottomTab,
    setActiveFileId,
    setAnalysisOpen,
    setArtifactErrors,
    setContextMenu,
    setDevVisionError,
    setDevVisionPassword,
    setExplorerTree,
    setIsResizingTerminal,
    setOpenIdeMenu,
    setProblemAlignment,
    setProblemPanelOpen,
    setProblemStatement,
    setShowAddMenu,
    setShowBottomPanel,
    setShowBugModal,
    setShowDevVisionPrompt,
    setShowLayoutOverlay,
    setShowModeOverlay,
    setShowRunsSection,
    setShowTreeMenu,
    setSidebarOpen,
    setTerminalInput,
    setUpgradeModal,
    shellSurfaceClass,
    showAddMenu,
    showBottomPanel,
    showBugModal,
    showDevVisionPrompt,
    showEditorInspector,
    showLayoutOverlay,
    showModeOverlay,
    showProblemPanel,
    showPython,
    showRunsSection,
    showTreeMenu,
    sidebarContainerClass,
    sidebarDividerClass,
    sidebarOpen,
    sidebarSurfaceClass,
    softTextClass,
    strongTextAltClass,
    strongTextClass,
    studentModeLocked,
    subscription,
    terminalEntries,
    terminalHeight,
    terminalInput,
    terminalScrollRef,
    terminalTextClass,
    theme,
    toast,
    toggleFolder,
    treeMenuRef,
    updateActiveFileContent,
    upgradeModal,
    validationSeverityClass,
    visualArtifacts,
    workspaceBgClass,
  };
}
