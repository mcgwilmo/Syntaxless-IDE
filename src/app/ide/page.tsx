"use client";

import Image from "next/image";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
// Configures Monaco to load from this app rather than a CDN. Must be
// imported before the first <Editor> renders.
import "@/features/ide/lib/monaco-loader";
import Editor from "@monaco-editor/react";
import { createPortal } from "react-dom";
import {
} from "@/lib/supabase/client";
import { ThemeToggleButton, useTheme } from "@/components/theme-provider";
import { IdeProvider } from "@/features/ide/state/ide-context";
import { useIdeState } from "@/features/ide/state/use-ide-state";
import { RunComparePanel } from "@/features/ide/components/run-compare-panel";
import type {
  BugReportCategory,
  BugReportFormValues,
  BugReportTargetKind,
  ExplorerNode,
  IdeMode,
  LayoutMode,
  TerminalEntry,
  VisualArtifact,
} from "@/features/ide/types";
import {
  LAYOUT_META,
  MODE_META,
  PAGE_HEADING_CLASS,
} from "@/features/ide/types";
import {
  ensureMonacoThemes,
  formatDurationMs,
  formatIntentLabel,
  formatRunTimestamp,
  formatScore,
  getCompatibilityClass,
  getDevStepStatusClass,
  getModeButtonClass,
  getProblemStatusClass,
  getProblemStatusLabel,
  getSeverity,
  joinClasses,
  terminalStreamLabel,
  setAllFoldersOpen,
} from "@/features/ide/lib";
import { MinimalControlIcon, MinimalIconLabel } from "@/features/ide/components/icons";
import {
  SUBSCRIPTION_META,
  getSynthFileLimitLabel,
  tierAllowsLayout,
  tierAllowsMode,
} from "@/lib/subscriptions";

/*
 * Shared surfaces for the sidebar chrome.
 *
 * The IDE's own toolbar surfaces live in use-ide-state; these are the few the
 * explorer needs on top of those, kept here so the two small icon buttons and
 * the two small menus cannot drift apart from each other.
 */
const SIDEBAR_ICON_BUTTON_CLASS = joinClasses(
  // Size is left to the call site so the two 7x7 explorer controls and the
  // 6x6 report control can share one set of material rules.
  "flex items-center justify-center rounded-[var(--radius-sm)] border",
  "transition-[background-color,border-color,box-shadow,transform]",
  "duration-[var(--duration-press)] ease-[var(--ease-spring)]",
  "active:shadow-[var(--pressed)] active:translate-y-[var(--press-travel)]",
  "motion-reduce:transform-none motion-reduce:active:transform-none"
);

const SIDEBAR_ICON_BUTTON_RESTING_CLASS = joinClasses(
  "border-[var(--border-strong)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)]",
  "text-[var(--text-muted)] shadow-[var(--raised)]",
  "hover:-translate-y-[var(--lift-travel)] hover:text-[var(--text-primary)] hover:shadow-[var(--lifted)]",
  "motion-reduce:hover:transform-none"
);

/*
 * Menus hang off the page rather than resting on it, so they lose the contact
 * shadow entirely -- that absence is what separates the dropdown from the
 * toolbar it dropped out of, and it does more work than the bigger blur does.
 */
const MENU_PANEL_CLASS = joinClasses(
  // --border-strong, not --border-subtle: a menu is raised surface sitting on
  // raised surface, so the shadow alone does not draw its edge. This matches
  // menuPanelClass in use-ide-state.ts, which describes the same object.
  "rounded-[var(--radius-lg)] border border-[var(--border-strong)]",
  "bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] p-[var(--space-2)]",
  "text-[var(--text-primary)] shadow-[var(--floating)]"
);

const MENU_SURFACE_CLASS = joinClasses("absolute right-0 top-9 z-30", MENU_PANEL_CLASS);

const MENU_ROW_CLASS = joinClasses(
  "w-full rounded-[var(--radius-sm)] px-[var(--space-3)] py-1.5 text-left",
  "text-[length:var(--text-sm)] text-[var(--text-muted)]",
  "transition-colors duration-[var(--duration-fast)]",
  "hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]",
  "active:bg-[var(--accent-subtle)] active:text-[var(--accent-text)]"
);

/*
 * Modal sheets. The top of the stack, always paired with SCRIM_CLASS -- the
 * long shadow falloff only reads as distance when there is something dimmed
 * behind it to be distant from.
 */
const MODAL_SURFACE_CLASS = joinClasses(
  "rounded-[var(--radius-xl)] border border-[var(--border-subtle)]",
  "bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] shadow-[var(--modal)]"
);

const SCRIM_CLASS = "absolute inset-0 bg-[var(--surface-overlay)]";

/*
 * The press, for controls whose surface is owned by getModeButtonClass.
 *
 * Only the travel, deliberately: that helper already sets a shadow on every
 * branch, and a second shadow utility on the same element resolves by
 * stylesheet order rather than by intent. Travel is additive, so this is the
 * part that can be layered on safely -- and it is the part that was missing,
 * since the shared helper lifts on hover but never acknowledges the click.
 */
const PRESS_TRAVEL_CLASS = joinClasses(
  "active:translate-y-[var(--press-travel)]",
  "motion-reduce:transform-none motion-reduce:hover:transform-none motion-reduce:active:transform-none"
);

/*
 * The mode and layout cards in the two full-screen pickers.
 *
 * These are the largest pressable objects in the app, so they get the full
 * travel: raised at rest, rising on hover, pushed in and inverted when held.
 * The selected card carries the mode tint as its only fill -- stacking the tint
 * over a neutral fill is how the two backgrounds end up fighting for the same
 * element and one of them wins at random.
 */
const OVERLAY_CARD_CLASS = joinClasses(
  "group relative overflow-hidden rounded-[var(--radius-xl)] border p-5 text-left",
  "transition-[background-color,border-color,box-shadow,transform]",
  "duration-[var(--duration-base)] ease-[var(--ease-spring)]"
);

const OVERLAY_CARD_PRESSABLE_CLASS = joinClasses(
  "shadow-[var(--raised)]",
  "hover:-translate-y-[var(--lift-travel)] hover:shadow-[var(--lifted)]",
  "active:translate-y-[var(--press-travel)] active:shadow-[var(--pressed)]",
  "motion-reduce:transform-none motion-reduce:hover:transform-none motion-reduce:active:transform-none"
);

const OVERLAY_CARD_RESTING_CLASS = joinClasses(
  "border-[var(--border-subtle)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)]",
  "hover:border-[var(--border-strong)]"
);

// A locked card is not an object you can press, so the depth goes away with it.
const OVERLAY_CARD_LOCKED_CLASS = joinClasses(
  "cursor-not-allowed border-[var(--border-subtle)] bg-[var(--surface-sunken)]",
  "opacity-60 grayscale shadow-none"
);

const OVERLAY_LOCK_OVERLAY_CLASS =
  "absolute inset-0 z-20 flex flex-col items-center justify-center bg-[var(--surface-overlay)] px-6 text-center";

const OVERLAY_LOCK_NOTE_CLASS =
  "rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-4 py-3 text-xs leading-5 text-[var(--text-muted)] shadow-[var(--inlaid)]";

const OVERLAY_CARD_DETAIL_CLASS =
  "mt-auto rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-4 text-xs leading-6 text-[var(--text-muted)] shadow-[var(--inlaid)]";

/*
 * A label set flush into whatever it sits on. Never pressable, so --inlaid.
 *
 * Surface and text are separate because the mode/layout cards pair this chip
 * with MODE_META.badge, which is itself a text colour. Joining the two whole
 * strings put two text-* utilities on one element, and joinClasses is a plain
 * join -- the winner would be decided by stylesheet order, not by intent. Call
 * sites that bring their own text colour take CHIP_SURFACE_CLASS instead.
 */
const CHIP_SURFACE_CLASS =
  "border-[var(--border-subtle)] bg-[var(--surface-sunken)] shadow-[var(--inlaid)]";

const CHIP_CLASS = joinClasses(CHIP_SURFACE_CLASS, "text-[var(--text-muted)]");

/*
 * The side panels (Problem, Dev Vision) are read, not operated: their blocks
 * are inlaid into the panel rather than raised off it, so nothing in there
 * looks pressable when only one thing -- the textarea -- actually takes input.
 */
const PANEL_CARD_CLASS =
  "rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-[var(--space-3)] shadow-[var(--inlaid)]";

const PANEL_LABEL_CLASS =
  "mb-1.5 text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] text-[var(--text-muted)]";

// A tile set into a PANEL_CARD tray: lighter fill, same "read me" shading.
const PANEL_ROW_CLASS =
  "rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-3 py-2 text-[var(--text-muted)] shadow-[var(--inlaid)]";

const PANEL_SUBROW_CLASS =
  "rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] px-2.5 py-2 text-[var(--text-muted)] shadow-[var(--inlaid)]";

/*
 * Terminal stream tones.
 *
 * Tone carries meaning here and nothing else: rose = it stopped, amber = read
 * this, accent = the program's own output, neutral = the IDE talking. The
 * label above each block says the same thing in words, because the colour
 * alone is not readable by everyone.
 *
 * "default" is here because these entries arrive from the sandbox rather than
 * from our own code, so the stream union is a claim rather than a guarantee.
 *
 * Each tint is composited over --surface-raised rather than left to fall on
 * whatever is behind it. The blocks sit inside the terminal well, which is
 * --surface-sunken, and a 9%-alpha tint dropped straight onto that darker
 * ground pulled the light-theme label text down to 3.93:1 -- below AA. Painting
 * the same tint over a raised base restores it and is also the truer reading:
 * an output block is an object set into the well, not a stain on it.
 */
const TERMINAL_STREAM_TONES: Record<
  TerminalEntry["stream"] | "default",
  { box: string; text: string }
> = {
  stderr: {
    box: "border-[color-mix(in_srgb,var(--state-blocked)_30%,transparent)] bg-[var(--surface-raised)] bg-[image:linear-gradient(0deg,var(--state-blocked-subtle),var(--state-blocked-subtle))]",
    text: "text-[var(--state-blocked)]",
  },
  explanation: {
    box: "border-[color-mix(in_srgb,var(--state-warning)_30%,transparent)] bg-[var(--surface-raised)] bg-[image:linear-gradient(0deg,var(--state-warning-subtle),var(--state-warning-subtle))]",
    text: "text-[var(--state-warning)]",
  },
  stdout: {
    box: "border-[var(--accent-border)] bg-[var(--surface-raised)] bg-[image:linear-gradient(0deg,var(--accent-subtle),var(--accent-subtle))]",
    text: "text-[var(--accent-text)]",
  },
  runtime: {
    box: "border-[color-mix(in_srgb,var(--state-success)_30%,transparent)] bg-[var(--surface-raised)] bg-[image:linear-gradient(0deg,var(--state-success-subtle),var(--state-success-subtle))]",
    text: "text-[var(--state-success)]",
  },
  input: {
    box: "border-[var(--border-subtle)] bg-[var(--surface-raised)]",
    text: "text-[var(--text-muted)]",
  },
  system: {
    box: "border-[var(--border-subtle)] bg-[var(--surface-raised)]",
    text: "text-[var(--text-muted)]",
  },
  default: {
    box: "border-[var(--border-subtle)] bg-[var(--surface-raised)]",
    text: "text-[var(--text-muted)]",
  },
};

function InfoTooltip({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
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
        {/* Inlaid, not raised: the "i" is a marker you read and hover, and
            giving it a pressable edge promises a click that never happens. */}
        <div className="flex h-5 w-5 items-center justify-center rounded-[var(--radius-full)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] text-[length:var(--text-xs)] font-medium text-[var(--text-muted)] shadow-[var(--inlaid)] transition-colors duration-[var(--duration-base)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]">
          i
        </div>
      </div>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[300] w-72 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] px-[var(--space-3)] py-[var(--space-2)] text-[length:var(--text-xs)] leading-[var(--leading-normal)] text-[var(--text-muted)] shadow-[var(--floating)]"
            style={{ top: pos.top, left: pos.left }}
          >
            <div className="mb-[var(--space-1)] text-[length:var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-label)] text-[var(--text-muted)]">
              {label}
            </div>
            <div>{description}</div>
          </div>,
          document.body
        )}
    </>
  );
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
  // HTMLElement, not HTMLDivElement: both rows are <button> now, and the
  // handler only ever reads preventDefault/clientX/clientY off the event.
  onContextMenu: (
    e: React.MouseEvent<HTMLElement>,
    nodeId: string,
    nodeType: "file" | "folder"
  ) => void;
  depth?: number;
  modeAccentClass: string;
}) {
  return (
    <div className="space-y-0.5">
      {nodes.map((node) => {
        const paddingLeft = 10 + depth * 14;

        if (node.type === "folder") {
          return (
            <div key={node.id}>
              {/* Rows live inside a recessed well, so they do not travel on
                  press -- they darken into it instead.

                  A real <button>, not a clickable <div>. The explorer is how
                  you choose what to edit and what to run, and as divs none of
                  it could be reached from the keyboard at all: no tab stop, no
                  Enter/Space, and no focus ring for the global :focus-visible
                  rule to attach to. The chevron already showed open/closed, but
                  only visually, so aria-expanded states it too. */}
              <button
                type="button"
                aria-expanded={node.isOpen}
                onClick={() => onToggleFolder(node.id)}
                onContextMenu={(e) => onContextMenu(e, node.id, "folder")}
                className="group flex w-full cursor-pointer items-center rounded-[var(--radius-sm)] px-[var(--space-2)] py-1.5 text-left text-[length:var(--text-xs)] text-[var(--text-muted)] transition-[background-color,box-shadow,color] duration-[var(--duration-fast)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] active:shadow-[var(--pressed)]"
                style={{ paddingLeft }}
              >
                <span aria-hidden="true" className="mr-[var(--space-2)] text-[length:var(--text-xs)] text-[var(--text-muted)]">
                  {node.isOpen ? "▾" : "▸"}
                </span>
                <span aria-hidden="true" className="mr-[var(--space-2)] text-[var(--text-muted)]">⊟</span>
                <span className="truncate">{node.name}</span>
              </button>

              {/* inert while collapsed. The rows inside are <button>s now, and
                  a closed folder is only closed visually -- the grid collapses
                  to 0fr and clips, but every child stays in the DOM. Without
                  this, tabbing through the explorer walks into files that are
                  not on screen, and a click lands on a zero-height target. */}
              <div
                inert={!node.isOpen}
                className={`grid overflow-hidden transition-all duration-[var(--duration-slow)] ${
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
          <button
            key={node.id}
            type="button"
            /*
             * Which file is selected decides what Run runs, and it was said
             * three ways that a screen reader sees none of: an inlaid recess, a
             * mode tint, and an accent-coloured bullet. aria-current is the
             * fourth, and the only one that is not depth or colour.
             */
            aria-current={isActive ? "true" : undefined}
            onClick={() => onSelectFile(node.id)}
            onContextMenu={(e) => onContextMenu(e, node.id, "file")}
            className={joinClasses(
              "group flex w-full cursor-pointer items-center border-l px-[var(--space-2)] py-1.5 text-left text-[length:var(--text-xs)]",
              "transition-[background-color,border-color,box-shadow,color] duration-[var(--duration-fast)]",
              isActive
                ? // The selected file is set into the well rather than sitting
                  // on it; the mode tint is what says which file will run.
                  `border-[var(--accent-border)] text-[var(--text-primary)] shadow-[var(--inlaid)] ${modeAccentClass}`
                : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] active:shadow-[var(--pressed)]"
            )}
            style={{ paddingLeft }}
          >
            <span
              aria-hidden="true"
              className={`mr-[var(--space-2)] ${isActive ? "text-[var(--accent-text)]" : "text-[var(--text-muted)]"}`}
            >
              •
            </span>
            <span className="truncate">{node.name}</span>
          </button>
        );
      })}
    </div>
  );
}

/*
 * The bug-report form fields.
 *
 * Every one of these is a well you type into, so they take --recessed and the
 * sunken fill -- the exact inverse of the buttons underneath them. Pulled out
 * as constants because six identical fields repeating the same twelve classes
 * is how one of them quietly drifts.
 */
const BUG_FIELD_CLASS = joinClasses(
  "w-full rounded-[var(--radius-md)] border border-[var(--border-strong)]",
  "bg-[var(--surface-sunken)] px-[var(--space-4)] py-[var(--space-3)]",
  "text-[length:var(--text-sm)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
  "shadow-[var(--recessed)] outline-none",
  "transition-[border-color,box-shadow] duration-[var(--duration-fast)]",
  "focus:border-[var(--accent-solid)] focus:ring-1"
);

const BUG_FIELD_LABEL_CLASS =
  "mb-[var(--space-2)] block text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] text-[var(--text-muted)]";

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
  const { theme } = useTheme();

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
      {/* Click-outside is a pointer-only convenience and the dialog has its own
          Cancel, so the scrim is hidden from assistive tech rather than
          presented as a nameless clickable region. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[var(--surface-overlay)]"
        onClick={onClose}
      />
      <div className="relative z-10 flex min-h-full items-start justify-center px-[var(--space-6)] py-[var(--space-6)] md:py-[var(--space-8)]">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ide-bug-report-title"
          className={joinClasses(
            "w-full max-w-2xl max-h-[calc(100vh-3rem)] overflow-y-auto",
            "rounded-[var(--radius-xl)] border border-[var(--border-subtle)] p-[var(--space-6)]",
            // Top of the stack, over the scrim above -- the long falloff is
            // what reads as distance from the IDE behind it.
            "bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] shadow-[var(--modal)]"
          )}
        >
        <div className="mb-[var(--space-2)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] text-[var(--text-muted)]">
          Report Bug
        </div>

        <h2
          id="ide-bug-report-title"
          className={`${PAGE_HEADING_CLASS} text-[length:var(--text-3xl)] text-[var(--text-primary)]`}
        >
          {targetKind === "run" ? "Report this run" : "Report IDE issue"}
        </h2>

        <p className="mt-[var(--space-3)] text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--text-muted)]">
          {targetKind === "run"
            ? "This report will include the selected run diagnostics automatically."
            : "This report will include the current IDE state automatically."}
        </p>

        <div className="mt-[var(--space-6)] grid gap-[var(--space-4)]">
          <div>
            <label className={BUG_FIELD_LABEL_CLASS}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BugReportCategory)}
              className={`${BUG_FIELD_CLASS} ${modeMeta.accentRing}`}
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={BUG_FIELD_LABEL_CLASS}>
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary of the issue"
              className={`${BUG_FIELD_CLASS} ${modeMeta.accentRing}`}
            />
          </div>

          <div>
            <label className={BUG_FIELD_LABEL_CLASS}>
              What went wrong
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Describe what happened."
              className={`${BUG_FIELD_CLASS} ${modeMeta.accentRing}`}
            />
          </div>

          <div>
            <label className={BUG_FIELD_LABEL_CLASS}>
              Expected behavior
            </label>
            <textarea
              value={expectedBehavior}
              onChange={(e) => setExpectedBehavior(e.target.value)}
              rows={3}
              placeholder="What should have happened instead?"
              className={`${BUG_FIELD_CLASS} ${modeMeta.accentRing}`}
            />
          </div>

          <label className="flex items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] px-[var(--space-4)] py-[var(--space-3)] text-[length:var(--text-sm)] text-[var(--text-muted)] shadow-[var(--inlaid)]">
            <input
              type="checkbox"
              checked={reproducible}
              onChange={(e) => setReproducible(e.target.checked)}
              className="h-4 w-4 accent-[var(--accent-solid)]"
            />
            I can reproduce this issue consistently
          </label>

          {/* Read-only summary of what gets attached, so it is inlaid rather
              than recessed -- nothing is typed into it. */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-[var(--space-4)] shadow-[var(--inlaid)]">
            <div className="mb-[var(--space-2)] text-[length:var(--text-xs)] uppercase tracking-[var(--tracking-label)] text-[var(--text-muted)]">
              Attached context
            </div>
            <div className="space-y-[var(--space-1)] text-[length:var(--text-sm)] text-[var(--text-muted)]">
              <div>Project: {context.projectName || "Untitled Project"}</div>
              <div>Project ID: {context.projectId}</div>
              <div>File: {context.currentFilePath}</div>
              <div>Mode: {context.mode}</div>
              <div>Run ID: {context.runId || "None"}</div>
            </div>
          </div>
        </div>

          <div className="mt-[var(--space-6)] flex justify-end gap-[var(--space-2)]">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              /*
               * The disabled flag has to reach getModeButtonClass, not just the
               * element. Passing undefined here meant Cancel kept the full
               * pressable material while submitting -- raised, and still rising
               * toward the light on hover -- with a 50% opacity wash as the only
               * hint it was inert. The Submit button beside it already does this
               * correctly; this one silently did not, so the pair disagreed
               * about what "disabled" looks like.
               */
              className={`${getModeButtonClass(modeMeta, { disabled: isSubmitting }, theme)} rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)]`}
            >
              Cancel
            </button>
            <button
              onClick={() => void submit()}
              disabled={isSubmitting || !title.trim() || !description.trim()}
              className={`${getModeButtonClass(modeMeta, {
                disabled: isSubmitting || !title.trim() || !description.trim(),
              }, theme)} rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)]`}
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
  if (artifact.artifact_type === "image") {
    return (
      <img
        src={artifact.url}
        alt={artifact.label}
        className="max-h-[340px] w-full bg-[var(--surface-sunken)] object-contain"
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
      // The embedded document paints its own ground; this fill is only what
      // shows through before it loads, so it matches the card around it.
      <iframe
        src={artifact.url}
        title={artifact.label}
        className="h-[340px] w-full bg-[var(--surface-raised)]"
        onError={() => onError(artifact.name)}
      />
    );
  }

  return (
    <div className="p-[var(--space-4)] text-[length:var(--text-sm)] text-[var(--text-muted)]">
      Artifact available.
    </div>
  );
}

function IdePageContent() {
  const ide = useIdeState();
  const {
    activeTier,
    desktopIdeMenus,
    activeBottomTab,
    activeFile,
    activeFileId,
    activeRunId,
    addMenuRef,
    comparedRunIds,
    comparisonPair,
    openRunComparison,
    toggleRunForComparison,
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
    strongTextAltClass,
    strongTextClass,
    studentModeLocked,
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
  } = ide;

  /*
   * Every toolbar control acknowledges being pressed.
   *
   * ideButtonClass lifts on hover but has no held state at all, so a student
   * clicking Run on the slow path gets nothing back until output arrives. The
   * press is added here, once, instead of at each of the twenty-odd call
   * sites -- and as travel only, for the reason PRESS_TRAVEL_CLASS explains.
   */
  const ideButton = (options?: Parameters<typeof ideButtonClass>[0]) =>
    joinClasses(ideButtonClass(options), PRESS_TRAVEL_CLASS);

  // Run is armed when a file is open and nothing is in flight; the mode tint
  // is what marks it out from the rest of the toolbar.
  const armedControlClass = joinClasses(
    currentModeMeta.accentBorder,
    currentModeMeta.accentBg,
    "text-[var(--text-primary)]",
    PRESS_TRAVEL_CLASS
  );

  return (
    <IdeProvider value={ide}>
    {/* The sheen rides on the page's own background rather than on an overlay
        div, the way every other surface in the system carries it. The two
        decorative white blooms that used to sit on top of the shell are gone:
        with one light source the page falls off once, from the top, and a
        second glow placed at 20%/10% was light arriving from nowhere. */}
    <main className="relative h-screen w-screen overflow-hidden bg-[var(--surface-page)] bg-[image:var(--material-sheen)] text-[var(--text-primary)]">
      <div className="flex h-full w-full p-2.5">
        <div className={`flex h-full w-full overflow-hidden rounded-[var(--radius-xl)] border ${shellSurfaceClass}`}>
          <aside
            className={`relative overflow-hidden transition-all duration-500 ease-[var(--ease-out)] ${sidebarSurfaceClass} ${sidebarContainerClass}`}
          >
            <div
              className={`flex h-full min-h-0 w-[17rem] flex-col p-3.5 transition-all duration-500 ${
                sidebarOpen ? "opacity-100 blur-0" : "opacity-0 blur-sm"
              }`}
            >
              {!minimalist && (
                <>
                  <div className={`mb-3 border-b pb-3 ${sidebarDividerClass}`}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] ${sectionMetaClass}`}>
                          Explorer
                        </div>
                        <InfoTooltip
                          label="File Explorer"
                          description="Only the selected file executes. Other files are passed as reference context."
                        />
                      </div>

                      <div className="flex items-center gap-1">
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
                            className={joinClasses(
                              "h-7 w-7 text-[length:var(--text-sm)] font-semibold",
                              SIDEBAR_ICON_BUTTON_CLASS,
                              showAddMenu
                                ? `${currentModeMeta.accentBorder} ${currentModeMeta.accentBg} text-[var(--text-primary)] shadow-[var(--pressed)]`
                                : SIDEBAR_ICON_BUTTON_RESTING_CLASS
                            )}
                            aria-label="Add file or folder"
                            title="Add file or folder"
                          >
                            +
                          </button>

                          {showAddMenu && (
                            <div className={MENU_SURFACE_CLASS + " w-40"}>
                              <button
                                onClick={() => {
                                  createFile();
                                  setShowAddMenu(false);
                                }}
                                className={MENU_ROW_CLASS}
                              >
                                New file
                              </button>
                              <button
                                onClick={() => {
                                  createFolder();
                                  setShowAddMenu(false);
                                }}
                                className={MENU_ROW_CLASS}
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
                            className={joinClasses(
                              "h-7 w-7",
                              SIDEBAR_ICON_BUTTON_CLASS,
                              showTreeMenu
                                ? `${currentModeMeta.accentBorder} ${currentModeMeta.accentBg} text-[var(--text-primary)] shadow-[var(--pressed)]`
                                : SIDEBAR_ICON_BUTTON_RESTING_CLASS
                            )}
                            aria-label="Tree actions"
                            title="Tree actions"
                          >
                            <MinimalControlIcon name="layout" className="h-3.5 w-3.5" />
                          </button>

                          {showTreeMenu && (
                            <div className={MENU_SURFACE_CLASS + " w-44"}>
                              <button
                                onClick={() => {
                                  setExplorerTree((prev) => setAllFoldersOpen(prev, true));
                                  setShowTreeMenu(false);
                                }}
                                className={MENU_ROW_CLASS}
                              >
                                Expand all folders
                              </button>
                              <button
                                onClick={() => {
                                  setExplorerTree((prev) => setAllFoldersOpen(prev, false));
                                  setShowTreeMenu(false);
                                }}
                                className={MENU_ROW_CLASS}
                              >
                                Collapse all folders
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={`mb-2 flex items-center justify-between text-[11px] ${sectionMetaClass}`}>
                      <span className={sectionMetaClass}>Synth files</span>
                      <span className={sectionTitleClass}>{currentSynthFileCount} / {getSynthFileLimitLabel(activeTier)}</span>
                    </div>

                    {/* The tree scrolls, so the container is a well cut into
                        the sidebar rather than a card sitting on it. */}
                    <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-1.5 shadow-[var(--recessed)]">
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
                  </div>

                  <div className="flex min-h-0 flex-1 flex-col pt-1">
                    <button
                      onClick={() => setShowRunsSection((prev) => !prev)}
                      className="mb-2 flex w-full items-center justify-between text-left text-[var(--text-muted)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--text-primary)]"
                    >
                      <span className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] ${sectionMetaClass}`}>Run History</span>
                        <InfoTooltip
                          label="Run History"
                          description="Restore previous output, diagnostics, artifacts, and generated Python."
                        />
                      </span>
                      <span>{showRunsSection ? "−" : "+"}</span>
                    </button>

                    <div
                      className={`grid min-h-0 flex-1 overflow-hidden transition-all duration-[var(--duration-slow)] ${
                        showRunsSection ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-70"
                      }`}
                    >
                      <div className="flex min-h-0 flex-col overflow-hidden">
                        {comparisonPair && (
                          <button
                            onClick={openRunComparison}
                            className="mb-1.5 shrink-0 rounded-[var(--radius-md)] border border-[var(--accent-border)] bg-[var(--accent-subtle)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--accent-text)] transition-[box-shadow,transform] duration-[var(--duration-press)] ease-[var(--ease-spring)] hover:-translate-y-[var(--lift-travel)] active:translate-y-[var(--press-travel)] motion-reduce:transform-none"
                          >
                            Compare selected runs
                          </button>
                        )}

                        <div className="min-h-0 flex-1 space-y-1 overflow-auto pr-1">
                          {runs.length === 0 ? (
                            <div className={`rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] px-3 py-2 text-[12px] shadow-[var(--inlaid)] ${sectionMetaClass}`}>
                              No runs yet
                            </div>
                          ) : (
                            runs.map((run) => (
                              // Each run is a card resting on the sidebar and
                              // rises when pointed at, because clicking it
                              // restores that run's whole output.
                              //
                              // And it goes back down when clicked. It used to
                              // lift on hover and then do nothing at all under
                              // the press -- a card that offers itself and then
                              // ignores being taken, which is the one thing
                              // every other pressable card here (the dashboard
                              // grid, the learning-center cards, the mode and
                              // layout pickers) completes.
                              <div
                                key={run.id}
                                className={joinClasses(
                                  "rounded-[var(--radius-md)] border bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] px-2.5 py-2 shadow-[var(--raised)]",
                                  comparedRunIds.includes(run.id)
                                    ? "border-[var(--accent-solid)]"
                                    : "border-[var(--border-subtle)]",
                                  "transition-[box-shadow,transform] duration-[var(--duration-press)] ease-[var(--ease-spring)] hover:-translate-y-[var(--lift-travel)] hover:shadow-[var(--lifted)] active:translate-y-[var(--press-travel)] active:shadow-[var(--pressed)] motion-reduce:transform-none motion-reduce:hover:transform-none motion-reduce:active:transform-none",
                                )}
                              >
                                <div className="flex items-start gap-2">
                                  <button
                                    onClick={() => loadRunDetails(run.id)}
                                    className="min-w-0 flex-1 text-left"
                                  >
                                    <div className="flex min-w-0 items-center justify-between gap-2">
                                      <div className={`truncate text-[12px] font-semibold ${sectionTitleClass}`}>
                                        Run #{run.id.slice(0, 8)}
                                      </div>
                                      {run.mode && (
                                        <div
                                          className={`shrink-0 text-[9px] font-semibold uppercase tracking-[var(--tracking-label)] ${MODE_META[run.mode]?.badge ?? ""}`}
                                        >
                                          {MODE_META[run.mode]?.label ?? run.mode}
                                        </div>
                                      )}
                                    </div>
                                    <div className={`mt-0.5 truncate text-[10px] ${sectionMetaClass}`}>
                                      {run.status} | {formatRunTimestamp(run.timestamp)}
                                    </div>
                                    {!!run.active_file_path && (
                                      <div className={`mt-0.5 truncate text-[10px] ${sectionMetaClass}`}>
                                        {run.active_file_path}
                                      </div>
                                    )}
                                  </button>

                                  <button
                                    onClick={() => toggleRunForComparison(run.id)}
                                    aria-pressed={comparedRunIds.includes(run.id)}
                                    className={joinClasses(
                                      "mt-0.5 h-6 w-6 shrink-0 text-[length:var(--text-xs)]",
                                      SIDEBAR_ICON_BUTTON_CLASS,
                                      comparedRunIds.includes(run.id)
                                        ? "text-[var(--accent-text)]"
                                        : SIDEBAR_ICON_BUTTON_RESTING_CLASS
                                    )}
                                    aria-label={`Compare run ${run.id.slice(0, 8)}`}
                                    title="Select for comparison"
                                  >
                                    {comparedRunIds.includes(run.id) ? "\u25c9" : "\u25ce"}
                                  </button>

                                  <button
                                    onClick={() => void openRunBugReport(run.id)}
                                    className={joinClasses(
                                      "mt-0.5 h-6 w-6 shrink-0 text-[length:var(--text-xs)]",
                                      SIDEBAR_ICON_BUTTON_CLASS,
                                      SIDEBAR_ICON_BUTTON_RESTING_CLASS
                                    )}
                                    aria-label={`Report run ${run.id.slice(0, 8)}`}
                                    title="Report run"
                                  >
                                    !
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
            {/* No backdrop blur: modeBarGlowStyle mixes the mode tint into
                --surface-raised, an opaque fill, so there is never anything
                behind this header to blur -- it only cost a compositing pass
                per frame. */}
            <header
              className={`relative z-[120] overflow-visible px-4 py-3 ${headerSurfaceClass}`}
              style={modeBarGlowStyle}
            >
              <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 items-center gap-2.5">
                  <button
                    onClick={() => setSidebarOpen((prev) => !prev)}
                    aria-expanded={sidebarOpen}
                    aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                    className={joinClasses(
                      "group h-10 w-10 rounded-[var(--radius-md)]",
                      SIDEBAR_ICON_BUTTON_CLASS,
                      SIDEBAR_ICON_BUTTON_RESTING_CLASS,
                      currentModeMeta.accentHoverBorder,
                      currentModeMeta.accentHoverBg
                    )}
                  >
                    <div className="relative h-4 w-5">
                      {/* The bars inherit the button's text colour, so the
                          hover state is stated once rather than three times. */}
                      <span className="absolute left-0 top-0 h-[2px] w-5 rounded-[var(--radius-full)] bg-current" />
                      <span className="absolute left-0 top-1/2 h-[2px] w-5 -translate-y-1/2 rounded-[var(--radius-full)] bg-current" />
                      <span className="absolute bottom-0 left-0 h-[2px] w-5 rounded-[var(--radius-full)] bg-current" />
                    </div>
                  </button>

                  <Link
                    href="/dashboard"
                    // The mark's alt text named the product, not the
                    // destination, so this link announced as "T.R.A.C.E., link"
                    // -- which says what it is a picture of, not where it goes.
                    aria-label="Go to dashboard"
                    className={joinClasses(
                      "group h-10 w-10 rounded-[var(--radius-md)]",
                      SIDEBAR_ICON_BUTTON_CLASS,
                      SIDEBAR_ICON_BUTTON_RESTING_CLASS
                    )}
                  >
                    <div className="relative h-5 w-5">
                      <Image
                        src="/brand/logo-mark.png"
                        alt=""
                        fill
                        sizes="20px"
                        className="object-contain opacity-90 transition-opacity duration-[var(--duration-base)] group-hover:opacity-100"
                        priority
                      />
                    </div>
                  </Link>

                  <div className="hidden min-w-0 items-center gap-3 lg:flex">
                    <div className="min-w-0">
                      <div className={`truncate text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] ${sectionMetaClass}`}>
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
                  {minimalist ? (
                    <>
                  <ThemeToggleButton variant="ide" />

                  <button
                    onClick={handleRun}
                    disabled={isRunning || !activeFile}
                    aria-label={iconControls ? runButtonLabel : undefined}
                    title={iconControls ? runButtonLabel : undefined}
                    className={joinClasses(
                      ideButton({
                        disabled: isRunning || !activeFile,
                      }),
                      iconControls
                        ? "inline-flex min-w-11 items-center justify-center px-0 font-medium duration-[var(--duration-slow)]"
                        : "px-4 font-medium duration-[var(--duration-slow)]",
                      // Run is the one control on the bar that is armed, so it
                      // is the one that carries the mode tint. The rest of its
                      // material comes from ideButton -- adding a shadow here
                      // would race the one that already sets.
                      !isRunning && activeFile && armedControlClass
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
                      ideButton({
                        disabled: isChecking || !activeFile,
                      }),
                      iconControls
                        ? "inline-flex min-w-11 items-center justify-center px-0 font-medium"
                        : "px-4 font-medium",
                      // Check sits beside Run without competing with it: it
                      // presses the same way but takes no mode tint.
                      !isChecking &&
                        activeFile &&
                        `border-[var(--border-strong)] text-[var(--text-primary)] ${PRESS_TRAVEL_CLASS}`
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
                      className={`${ideButton({
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
                      className={`${ideButton({ compact: true })} ${
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
                      className={`${ideButton({ compact: true })} ${
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
                      className={`${ideButton({ compact: true })} ${
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
                      className={ideButton({
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
                      className={ideButton({
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
                    className={`${ideButton({
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
                    className={`${ideButton({ compact: true })} ${
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
                    className={`${ideButton({ compact: true })} ${
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
                    className={`${ideButton({ compact: true })} ${
                      iconControls ? "inline-flex min-w-9 items-center justify-center px-2" : ""
                    }`}
                  >
                    {iconControls ? (
                      <MinimalIconLabel icon="signout" label="Sign Out" />
                    ) : (
                      "Sign Out"
                    )}
                  </button>
                    </>
                  ) : (
                    <>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={handleRun}
                        disabled={isRunning || !activeFile}
                        className={joinClasses(
                          ideButton({
                            disabled: isRunning || !activeFile,
                          }),
                          "inline-flex items-center gap-2 px-3.5 py-2 text-[12px] font-semibold",
                          !isRunning && activeFile && armedControlClass
                        )}
                      >
                        <MinimalControlIcon name="run" className="h-4 w-4" />
                        {isRunning ? "Running" : "Run"}
                      </button>

                      <button
                        onClick={handleCheck}
                        disabled={isChecking || !activeFile}
                        className={joinClasses(
                          ideButton({
                            disabled: isChecking || !activeFile,
                          }),
                          "inline-flex items-center gap-2 px-3.5 py-2 text-[12px] font-semibold"
                        )}
                      >
                        <MinimalControlIcon name="check" className="h-4 w-4" />
                        {isChecking ? "Checking" : "Check"}
                      </button>

                      {isRunning && (
                        <button
                          onClick={handleStopRun}
                          className={`${ideButton({
                            danger: true,
                          })} inline-flex items-center gap-2 px-3.5 py-2 text-[12px] font-semibold`}
                        >
                          <MinimalControlIcon name="stop" className="h-4 w-4" />
                          Stop
                        </button>
                      )}
                    </div>

                    <nav className="flex flex-wrap items-center justify-end gap-1.5" aria-label="IDE menu">
                      {desktopIdeMenus.map((group) => {
                        const active = openIdeMenu === group.id;

                        return (
                          <div key={group.id} className="relative">
                            <button
                              type="button"
                              onClick={() => setOpenIdeMenu((current) => (current === group.id ? null : group.id))}
                              className={menuButtonClass(active)}
                              aria-expanded={active}
                            >
                              <span className={menuSymbolClass()}>{group.symbol}</span>
                              <span>{group.label}</span>
                              {/* The flip is the open/closed indicator, so the
                                  rotation itself has to survive reduced motion
                                  -- only the animation between the two states
                                  is dropped. */}
                              <span className={`text-[10px] transition-transform motion-reduce:transition-none ${active ? "rotate-180" : ""}`}>
                                v
                              </span>
                            </button>

                            {active && (
                              <div
                                className={`absolute right-0 top-11 z-[140] w-64 ${MENU_PANEL_CLASS}`}
                              >
                                <div className={`px-2.5 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] ${sectionMetaClass}`}>
                                  {group.symbol} {group.label}
                                </div>
                                <div className="space-y-0.5">
                                  {group.items.map((item) => {
                                    const content = (
                                      <>
                                        {item.icon ? (
                                          <span className={menuSymbolClass(item)}>
                                            <MinimalControlIcon name={item.icon} className="h-4 w-4" />
                                          </span>
                                        ) : (
                                          <span className={menuSymbolClass(item)}>{item.symbol}</span>
                                        )}
                                        <span className="min-w-0 flex-1">
                                          <span className="block truncate font-medium">{item.label}</span>
                                          {item.detail ? (
                                            <span className={`mt-0.5 block truncate text-[10px] ${item.disabled ? "" : sectionMetaClass}`}>
                                              {item.detail}
                                            </span>
                                          ) : null}
                                        </span>
                                      </>
                                    );

                                    if (item.href) {
                                      return (
                                        <Link
                                          key={item.label}
                                          href={item.href}
                                          onClick={() => setOpenIdeMenu(null)}
                                          className={menuItemClass(item)}
                                        >
                                          {content}
                                        </Link>
                                      );
                                    }

                                    return (
                                      <button
                                        key={item.label}
                                        type="button"
                                        disabled={item.disabled}
                                        onClick={() => {
                                          if (item.disabled) return;
                                          setOpenIdeMenu(null);
                                          void item.action?.();
                                        }}
                                        className={menuItemClass(item)}
                                      >
                                        {content}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </nav>
                    </>
                  )}
                </div>
              </div>
            </header>

            <div className="flex min-h-0 flex-1">
              <div className="flex min-w-0 flex-1 flex-col">
                {/* The editor is the deepest well on the page: everything the
                    student writes goes into it, so it takes the recess rather
                    than any part of the raised chrome around it. */}
                <div
                  ref={editorShellRef}
                  className={`relative z-0 min-h-0 flex-1 overflow-hidden shadow-[var(--recessed)] ${workspaceBgClass}`}
                >
                  {showEditorInspector && (
                    <div className="absolute right-3 top-3 z-20 hidden xl:block">
                      <button
                        onClick={() => setAnalysisOpen((prev) => !prev)}
                        className={`${ideButton({
                          compact: true,
                          pill: true,
                          active: analysisOpen,
                        })} mb-1.5 ml-auto flex items-center gap-1.5 text-[10px]`}
                      >
                        <span>{analysisOpen ? "Hide analysis" : "Show analysis"}</span>
                        <span
                          className={`transition-transform duration-[var(--duration-slow)] motion-reduce:transition-none ${analysisOpen ? "rotate-180" : "rotate-0"}`}
                        >
                          ▾
                        </span>
                      </button>

                      {/* A popover over the editor well, not part of it, so it
                          floats clear of the surface it is annotating. */}
                      <div
                        className={joinClasses(
                          "origin-top-right overflow-hidden rounded-[var(--radius-lg)]",
                          "border border-[var(--border-subtle)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)]",
                          "shadow-[var(--floating)]",
                          "transition-all duration-[var(--duration-slow)] ease-[var(--ease-spring)]",
                          // The height and fade still carry the open/close;
                          // only the zoom is dropped when motion is reduced.
                          "motion-reduce:transform-none",
                          analysisOpen
                            ? "max-h-72 w-52 scale-100 opacity-100"
                            : "max-h-0 w-52 scale-95 opacity-0"
                        )}
                      >
                        <div className="p-2.5">
                          <div className={`mb-1.5 text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] ${mutedTextClass}`}>
                            Analysis summary
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className={mutedTextClass}>Executable lines</span>
                              <span className={strongTextAltClass}>{editableLineCount}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className={mutedTextClass}>Warnings</span>
                              <span className="text-[var(--state-warning)]">{diagnosticsSummary.warnings}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className={mutedTextClass}>Blocked</span>
                              <span className="text-[var(--state-blocked)]">{diagnosticsSummary.blocked}</span>
                            </div>
                            <div className="mt-1 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] px-2.5 py-2 text-[10px] leading-4.5 text-[var(--text-muted)] shadow-[var(--inlaid)]">
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
                      theme={isLight ? "ide-light" : "ide-dark"}
                      options={{
                        minimap: { enabled: false },
                        fontSize: minimalist ? 17 : 15,
                        lineHeight: minimalist ? 32 : 28,
                        wordWrap: "on",
                        scrollBeyondLastLine: false,
                        lineNumbers: "on",
                        glyphMargin: true,
                        folding: false,
                        lineDecorationsWidth: 8,
                        padding: {
                          top: minimalist ? 24 : 18,
                          bottom: minimalist ? 24 : 18,
                        },
                        renderLineHighlight: "gutter",
                        cursorBlinking: "smooth",
                        smoothScrolling: true,
                        overviewRulerBorder: false,
                        hover: { enabled: false },
                      }}
                    />
                  ) : (
                    <div className={`flex h-full items-center justify-center ${mutedTextClass}`}>
                      No file selected.
                    </div>
                  )}

                  {/* Tone (and its shadow) comes from getDiagnosticToneClasses,
                      so the popup below only sets its geometry -- a second
                      shadow class would race the one the tone supplies. */}
                  {diagnosticPopup && selectedDiagnostic && (
                    <div
                      className={`absolute z-30 w-[min(25rem,calc(100%-2rem))] rounded-[var(--radius-xl)] border-2 px-3.5 py-3 text-[length:var(--text-sm)] ${selectedDiagnosticTone.bubble}`}
                      style={{ top: diagnosticPopup.top, left: diagnosticPopup.left }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className={`text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] ${selectedDiagnosticTone.accent}`}>
                            {selectedDiagnostic.severity === "blocked" ? "Error" : "Warning"} on line{" "}
                            {diagnosticPopup.lineNumber}
                          </div>
                          <div className="mt-1 truncate text-[13px] font-semibold">
                            {selectedDiagnostic.title}
                          </div>
                        </div>
                        <span
                          className={`inline-flex shrink-0 items-center rounded-[var(--radius-full)] border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] shadow-[var(--inlaid)] ${selectedDiagnosticTone.chip}`}
                        >
                          {selectedDiagnostic.source === "problem" ? "Problem" : selectedDiagnostic.severity}
                        </span>
                      </div>

                      <div className="mt-2 text-[13px] leading-5 opacity-90">
                        {selectedDiagnostic.message}
                      </div>

                      <div className="mt-3 space-y-1.5">
                        <div className={`flex min-w-0 items-center rounded-[var(--radius-lg)] border px-3 py-2 text-[12px] leading-5 shadow-[var(--inlaid)] ${selectedDiagnosticTone.row}`}>
                          <span className="shrink-0 font-semibold">Specificity / Mode</span>
                          <span className="mx-1.5 shrink-0 opacity-50">|</span>
                          <span
                            className="min-w-0 truncate"
                            title={selectedDiagnostic.modeDetail || "Specificity n/a / Mode n/a"}
                          >
                            {selectedDiagnostic.modeDetail || "Specificity n/a / Mode n/a"}
                          </span>
                        </div>
                        <div className={`flex min-w-0 items-center rounded-[var(--radius-lg)] border px-3 py-2 text-[12px] leading-5 shadow-[var(--inlaid)] ${selectedDiagnosticTone.row}`}>
                          <span className="shrink-0 font-semibold">Structure</span>
                          <span className="mx-1.5 shrink-0 opacity-50">|</span>
                          <span
                            className="min-w-0 truncate"
                            title={selectedDiagnostic.structureDetail || "No structure notes for this line."}
                          >
                            {selectedDiagnostic.structureDetail || "No structure notes for this line."}
                          </span>
                        </div>
                      </div>

                      {selectedDiagnostic.suggestedFix ? (
                        <div className={`mt-2 rounded-[var(--radius-lg)] border px-3 py-2 text-[12px] leading-5 shadow-[var(--inlaid)] ${selectedDiagnosticTone.row}`}>
                          <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-[var(--tracking-label)]">
                            Suggested Fix
                          </div>
                          <div>{selectedDiagnostic.suggestedFix}</div>
                        </div>
                      ) : null}

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
                  {/* The drag handle is a track you grab, not a button: it
                      stays flush and only changes value on hover. */}
                  <div
                    onMouseDown={() => setIsResizingTerminal(true)}
                    className="h-1.5 cursor-row-resize bg-[var(--surface-sunken)] transition-colors duration-[var(--duration-base)] hover:bg-[var(--accent-subtle)] active:bg-[var(--accent-border)]"
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
                          const count = tab === "visual" ? visualArtifacts.length : 0;

                          return (
                            <button
                              key={tab}
                              onClick={() => setActiveBottomTab(tab)}
                              aria-label={
                                iconControls
                                  ? `${tab === "visual" ? "Visual" : "Terminal"}${count > 0 ? ` (${count})` : ""}`
                                  : undefined
                              }
                              title={
                                iconControls
                                  ? `${tab === "visual" ? "Visual" : "Terminal"}${count > 0 ? ` (${count})` : ""}`
                                  : undefined
                              }
                              className={`${ideButton({
                                active,
                                compact: true,
                                pill: true,
                              })} ${
                                iconControls ? "inline-flex min-w-10 items-center justify-center px-2" : "uppercase tracking-[var(--tracking-label)]"
                              }`}
                            >
                              {iconControls ? (
                                <MinimalIconLabel
                                  icon={
                                    tab === "visual"
                                      ? "visual"
                                      : "terminal"
                                  }
                                  label={
                                    tab === "visual"
                                      ? "Visual"
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
                              className={`h-3 w-3 animate-spin rounded-[var(--radius-full)] border border-[var(--border-strong)] ${currentModeMeta.terminalBorder}`}
                            />
                            <span>Streaming</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Output scrolls into this, so it is a well like the
                        editor above it rather than a card on the panel. */}
                    <div className={`min-h-0 flex-1 overflow-hidden rounded-[var(--radius-lg)] border bg-[var(--surface-sunken)] shadow-[var(--recessed)] ${panelBorderClass}`}>
                      {activeBottomTab === "terminal" && (
                        <div className="flex h-full flex-col">
                          <div
                            ref={terminalScrollRef}
                            className="min-h-0 flex-1 overflow-auto p-3"
                            style={protectedDarkTerminalTextStyle}
                          >
                            <div className="min-w-0 space-y-2">
                              {terminalEntries.length === 0 ? (
                                <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-3 py-2.5 text-[13px] text-[var(--text-muted)] shadow-[var(--inlaid)]">
                                  Terminal output will appear here.
                                </div>
                              ) : (
                                terminalEntries.map((entry) => {
                                  const tone = TERMINAL_STREAM_TONES[entry.stream] ?? TERMINAL_STREAM_TONES.default;

                                  return entry.stream === "runtime" ? (
                                    // A marker rather than a message: it says a
                                    // subprocess took over, and carries no text
                                    // of its own, so it reads as a chip.
                                    <div
                                      key={entry.id}
                                      className={`inline-flex w-fit items-center gap-2 rounded-[var(--radius-full)] border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] shadow-[var(--inlaid)] ${tone.box} ${tone.text}`}
                                    >
                                      <span
                                        className={`flex h-5 w-5 items-center justify-center rounded-[var(--radius-full)] border text-[9px] ${tone.box}`}
                                        aria-label="Subprocess runtime"
                                      >
                                        {entry.symbol || "SP"}
                                      </span>
                                      <span>{terminalStreamLabel(entry.stream)}</span>
                                    </div>
                                  ) : (
                                    // Output blocks are set into the terminal
                                    // well, so they are inlaid, never raised --
                                    // nothing here is clickable.
                                    <div
                                      key={entry.id}
                                      className={`rounded-[var(--radius-md)] border shadow-[var(--inlaid)] ${tone.box}`}
                                    >
                                      <div
                                        className={`flex items-center justify-between border-b px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] ${tone.box} ${tone.text}`}
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
                                  );
                                })
                              )}
                            </div>
                          </div>

                          {inputPrompt && (
                            <div className={`border-t bg-[var(--surface-raised)] p-2.5 ${panelBorderClass}`}>
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
                                  className={`flex-1 rounded-[var(--radius-md)] px-3 py-2 text-[13px] outline-none transition-[border-color,box-shadow] duration-[var(--duration-fast)] focus:border-[var(--accent-solid)] ${inputSurfaceClass}`}
                                  placeholder="Type input for the running program..."
                                />
                                <button
                                  onClick={handleSendTerminalInput}
                                  aria-label={iconControls ? "Send input" : undefined}
                                  title={iconControls ? "Send input" : undefined}
                                  className={`${ideButton()} rounded-[var(--radius-md)] px-3 py-2 ${
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

                      {activeBottomTab === "visual" && (
                        <div className="h-full overflow-auto p-3">
                          {visualArtifacts.length === 0 ? (
                            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-3 py-2.5 text-[length:var(--text-sm)] text-[var(--text-muted)] shadow-[var(--inlaid)]">
                              No visual output yet. Plots, images, tables, and HTML will appear here.
                            </div>
                          ) : (
                            <div className="grid gap-3 md:grid-cols-2">
                              {/* Each artifact is a card lying in the results
                                  well -- something produced, not something to
                                  press, so it rests without a hover lift. */}
                              {visualArtifacts.map((artifact) => (
                                <div
                                  key={`${artifact.source}-${artifact.name}`}
                                  className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] shadow-[var(--raised)]"
                                >
                                  <div className={`flex items-center justify-between border-b px-3 py-2 text-[11px] ${panelBorderClass} ${mutedTextClass}`}>
                                    <div className="flex min-w-0 items-center gap-2">
                                      <span className="truncate">{artifact.label}</span>
                                      <span className={`rounded-[var(--radius-full)] border px-2 py-0.5 text-[10px] uppercase tracking-[var(--tracking-label)] ${CHIP_CLASS}`}>
                                        {artifact.source}
                                      </span>
                                    </div>
                                    <a
                                      href={artifact.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className={`transition-colors duration-[var(--duration-fast)] hover:text-[var(--text-primary)] ${currentModeMeta.accentText}`}
                                    >
                                      Open
                                    </a>
                                  </div>

                                  {artifactErrors[artifact.name] ? (
                                    <div className="p-[var(--space-4)] text-[length:var(--text-sm)] text-[var(--state-blocked)]">
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
                  className={`relative isolate overflow-hidden border-l border-[var(--border-subtle)] bg-[var(--surface-raised)] transition-all duration-500 ease-in-out ${
                    problemPanelOpen ? "w-[19.5rem] opacity-100" : "w-[3.25rem] opacity-100"
                  }`}
                  style={{ ...modePanelGlowStyle, ...protectedDarkSurfaceStyle }}
                >
                  <div className="relative z-10 flex h-full min-w-[3.25rem]">
                    {/* The spine is the panel's own handle: a full-height
                        control, so it presses in rather than travelling -- a
                        1px drop on something this tall reads as a glitch. */}
                    <button
                      onClick={() => setProblemPanelOpen((prev) => !prev)}
                      className={joinClasses(
                        "group relative flex w-[3.25rem] shrink-0 items-center justify-center border-r",
                        "border-[color-mix(in_srgb,var(--state-warning)_30%,transparent)]",
                        "bg-[var(--state-warning-subtle)] bg-[image:var(--material-sheen)]",
                        "text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] text-[var(--state-warning)]",
                        "shadow-[var(--raised)] transition-[background-color,box-shadow] duration-[var(--duration-base)]",
                        // Hover answers in colour, not in depth. --lifted is
                        // the shading of an object that has actually moved, and
                        // this one deliberately does not move (see above), so
                        // pairing them gave the spine a bigger shadow while it
                        // stood still -- which is exactly what reads as a glow
                        // rather than a lift. pricingCardHoverClass in
                        // use-ide-state names the same trap from the other
                        // side. Deepening the warning wash is how the other
                        // non-travelling controls in this app answer the
                        // cursor.
                        "hover:bg-[color-mix(in_srgb,var(--state-warning)_16%,transparent)]",
                        "active:shadow-[var(--pressed)]"
                      )}
                      aria-expanded={problemPanelOpen}
                      aria-label={problemPanelOpen ? "Collapse problem panel" : "Expand problem panel"}
                    >
                      <span className="-rotate-90 whitespace-nowrap">Problem</span>
                    </button>

                      <div
                        className={`min-w-0 flex-1 overflow-hidden transition-all duration-[var(--duration-slow)] ${
                          problemPanelOpen ? "opacity-100" : "opacity-0"
                        }`}
                        style={protectedDarkSurfaceStyle}
                      >
                        <div className="flex h-full flex-col">
                          <div
                            className="border-b border-[var(--border-subtle)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] px-3.5 py-2.5"
                            style={{ ...modeBarGlowStyle, ...protectedDarkSurfaceStyle }}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div
                                  className="text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] text-[var(--text-muted)]"
                                  style={protectedDarkLabelStyle}
                                >
                                  Problem Context
                                </div>
                                <div
                                  className="mt-0.5 text-[11px] text-[var(--text-muted)]"
                                  style={protectedDarkMetaStyle}
                                >
                                  Quiet alignment checks for the active solution
                                </div>
                              </div>
                            <div
                              className={`rounded-[var(--radius-full)] border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] shadow-[var(--inlaid)] ${getProblemStatusClass(problemPanelStatus, theme)}`}
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
                                className={PANEL_LABEL_CLASS}
                                style={protectedDarkLabelStyle}
                              >
                                Problem Input
                              </div>
                              {/* The one place in this panel that takes typing,
                                  so the one place that is recessed. */}
                              <textarea
                                value={problemStatement}
                                onChange={(e) => {
                                  setProblemStatement(e.target.value);
                                  setProblemAlignment(null);
                                }}
                                placeholder="Paste the coding prompt, algorithm question, or structured task here..."
                                rows={10}
                                className={`min-h-[9.5rem] w-full resize-none rounded-[var(--radius-lg)] px-3 py-2.5 text-[13px] leading-6 outline-none transition-[border-color,box-shadow] duration-[var(--duration-fast)] focus:border-[var(--accent-solid)] ${inputSurfaceClass}`}
                              />
                            </div>

                            <div className={PANEL_CARD_CLASS}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div
                                    className={PANEL_LABEL_CLASS}
                                    style={protectedDarkLabelStyle}
                                  >
                                    Goal Summary
                                  </div>
                                  <div
                                    className="text-[13px] leading-5 text-[var(--text-muted)]"
                                    style={protectedDarkMetaStyle}
                                  >
                                    {problemGoalSummary}
                                  </div>
                                </div>
                                <div
                                  className={`inline-flex items-center gap-2 rounded-[var(--radius-full)] border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] shadow-[var(--inlaid)] ${getProblemStatusClass(problemPanelStatus, theme)}`}
                                >
                                  <span className="h-1.5 w-1.5 rounded-[var(--radius-full)] bg-current" />
                                  {normalizedProblemStatement
                                    ? getProblemStatusLabel(problemPanelStatus)
                                    : "Awaiting Problem"}
                                </div>
                              </div>
                              <div
                                className="mt-2 text-[11px] text-[var(--text-muted)]"
                                style={protectedDarkMetaStyle}
                              >
                                Updates on Check or Run
                              </div>
                            </div>

                            <div className={PANEL_CARD_CLASS}>
                              <div
                                className={PANEL_LABEL_CLASS}
                                style={protectedDarkLabelStyle}
                              >
                                Issues / Hints
                              </div>
                              {problemIssues.length > 0 ? (
                                <div className="space-y-1.5">
                                  {problemIssues.map((issue, index) => (
                                    <div
                                      key={`${issue.kind}-${index}-${issue.message}`}
                                      className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] px-3 py-2 text-[13px] leading-5 text-[var(--text-muted)] shadow-[var(--inlaid)]"
                                    >
                                      {issue.line_number ? `Line ${issue.line_number}: ` : ""}
                                      {issue.message}
                                      {issue.suggested_fix ? (
                                        <div className="mt-1 text-[12px] text-[var(--text-muted)]">
                                          Fix: {issue.suggested_fix}
                                        </div>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div
                                  className="text-[13px] leading-5 text-[var(--text-muted)]"
                                  style={protectedDarkMetaStyle}
                                >
                                  {normalizedProblemStatement
                                    ? "Nothing compared yet. Press Check to see how your draft lines up with the problem."
                                    : "Add a problem statement to enable alignment feedback."}
                                </div>
                              )}
                            </div>

                            {problemAlignment?.problem_model?.explicit_constraints?.length ? (
                              <div>
                              <div
                                className={PANEL_LABEL_CLASS}
                                style={protectedDarkLabelStyle}
                              >
                                Constraints
                              </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {problemAlignment.problem_model.explicit_constraints
                                    .slice(0, 3)
                                    .map((constraint, index) => (
                                      // Warning tone: a constraint is something
                                      // to keep an eye on, not something wrong.
                                      <div
                                        key={`${constraint}-${index}`}
                                        className="rounded-[var(--radius-full)] border border-[color-mix(in_srgb,var(--state-warning)_30%,transparent)] bg-[var(--state-warning-subtle)] px-2.5 py-0.5 text-[10px] text-[var(--state-warning)] shadow-[var(--inlaid)]"
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
                className={`overflow-hidden border-l bg-[var(--surface-raised)] transition-all duration-500 ease-in-out ${panelBorderClass} ${
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
                    className={`relative z-10 flex items-center justify-between border-b bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] px-4 py-2.5 text-[11px] text-[var(--text-muted)] ${panelBorderClass}`}
                    style={{ ...modeBarGlowStyle, ...protectedDarkSurfaceStyle }}
                  >
                    <div>
                      <div
                        className={`text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] ${sectionMetaClass}`}
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
                    theme={isLight ? "ide-light" : "ide-dark"}
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
                className={`overflow-hidden border-l bg-[var(--surface-raised)] transition-all duration-500 ease-in-out ${panelBorderClass} ${
                  devVisionEnabled ? (developerExpanded ? "w-[26rem] opacity-100" : "w-[24rem] opacity-100") : "w-0 opacity-0"
                }`}
              >
                <div className="flex h-full min-w-[360px] flex-col">
                  <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className={`text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] ${mutedTextClass}`}>
                          Dev Vision
                        </div>
                        <div className={`mt-1 text-[13px] ${strongTextAltClass}`}>
                          Locked debugging telemetry
                        </div>
                        <div className={`mt-0.5 text-[11px] ${mutedTextClass}`}>
                          This panel stays open until Dev Vision is exited.
                        </div>
                      </div>
                      <button
                        onClick={exitDevVision}
                        className={`${ideButton({ compact: true, pill: true })} shrink-0`}
                      >
                        Exit
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-3 py-3">
                    <div className="space-y-3">
                      <div
                        className={PANEL_CARD_CLASS}
                      >
                        <div className={`mb-2 text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] ${mutedTextClass}`}>
                          Run Metrics
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {checkMetrics.map((metric) => (
                            <div
                              key={metric.label}
                              className={PANEL_ROW_CLASS}
                            >
                              <div className={`text-[10px] uppercase tracking-[var(--tracking-label)] ${mutedTextClass}`}>
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
                        className={PANEL_CARD_CLASS}
                      >
                        <div className={`mb-2 text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] ${mutedTextClass}`}>
                          Pipeline Timing
                        </div>
                        <div className="space-y-2">
                          {(devMetrics?.steps || []).length === 0 ? (
                            <div className={`${PANEL_ROW_CLASS} text-[12px]`}>
                              Run the file to populate step timings.
                            </div>
                          ) : (
                            (devMetrics?.steps || []).map((step) => (
                              <div
                                key={step.key}
                                className={PANEL_ROW_CLASS}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <div className={`text-[13px] ${strongTextAltClass}`}>{step.label}</div>
                                    <div className={`mt-0.5 text-[11px] ${mutedTextClass}`}>
                                      {formatDurationMs(step.duration_ms)}
                                    </div>
                                  </div>
                                  <div
                                    className={`rounded-[var(--radius-full)] border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] shadow-[var(--inlaid)] ${getDevStepStatusClass(step.status, theme)}`}
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
                        className={PANEL_CARD_CLASS}
                      >
                        <div className={`mb-2 text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] ${mutedTextClass}`}>
                          Line-by-Line Intent
                        </div>
                        <div className="space-y-2">
                          {resolvedInterpretationLines.length === 0 ? (
                            <div className={`${PANEL_ROW_CLASS} text-[12px]`}>
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
                                  className={PANEL_ROW_CLASS}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <div className={`text-[13px] ${strongTextAltClass}`}>
                                        Line {line.resolvedLineNumber || index + 1}
                                      </div>
                                      <div className={`mt-0.5 text-[11px] ${mutedTextClass}`}>
                                        {line.raw}
                                      </div>
                                    </div>
                                    <div
                                      className={`rounded-[var(--radius-full)] border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] shadow-[var(--inlaid)] ${validationSeverityClass(
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
                                    <div className={PANEL_SUBROW_CLASS}>
                                      <div className="uppercase tracking-[var(--tracking-label)]">Mode Specificity</div>
                                      <div className={`mt-1 text-[12px] ${strongTextAltClass}`}>
                                        {formatScore(line.specificity_score)}
                                      </div>
                                    </div>
                                    <div className={PANEL_SUBROW_CLASS}>
                                      <div className="uppercase tracking-[var(--tracking-label)]">Raw Specificity</div>
                                      <div className={`mt-1 text-[12px] ${strongTextAltClass}`}>
                                        {formatScore(line.raw_specificity_score)}
                                      </div>
                                    </div>
                                    <div className={PANEL_SUBROW_CLASS}>
                                      <div className="uppercase tracking-[var(--tracking-label)]">Strict Score</div>
                                      <div className={`mt-1 text-[12px] ${strongTextAltClass}`}>
                                        {formatScore(line.strict_specificity_score)}
                                      </div>
                                    </div>
                                    <div className={PANEL_SUBROW_CLASS}>
                                      <div className="uppercase tracking-[var(--tracking-label)]">Structure Score</div>
                                      <div className={`mt-1 text-[12px] ${strongTextAltClass}`}>
                                        {formatScore(line.structure_specificity_score)}
                                      </div>
                                    </div>
                                    <div className={PANEL_SUBROW_CLASS}>
                                      <div className="uppercase tracking-[var(--tracking-label)]">Mode Struct Penalty</div>
                                      <div className={`mt-1 text-[12px] ${strongTextAltClass}`}>
                                        {formatScore(line.structure_penalty)}
                                      </div>
                                    </div>
                                    <div className={PANEL_SUBROW_CLASS}>
                                      <div className="uppercase tracking-[var(--tracking-label)]">Intent Confidence</div>
                                      <div className={`mt-1 text-[12px] ${strongTextAltClass}`}>
                                        {formatScore(confidence)}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    <div
                                      className={`rounded-[var(--radius-full)] border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] shadow-[var(--inlaid)] ${getCompatibilityClass(strictStatus, theme)}`}
                                    >
                                      Strict Compatibility {strictStatus || "n/a"}
                                    </div>
                                    <div
                                      className={`rounded-[var(--radius-full)] border px-2.5 py-0.5 text-[10px] uppercase tracking-[var(--tracking-label)] ${CHIP_CLASS}`}
                                    >
                                      Strict Struct Penalty {formatScore(line.strict_structure_penalty)}
                                    </div>
                                  </div>

                                  {(line.intent?.target || line.intent?.value_or_source || line.intent?.context) && (
                                    <div className={`mt-2 text-[11px] leading-5 ${PANEL_SUBROW_CLASS}`}>
                                      <div>Target: {line.intent?.target || "n/a"}</div>
                                      <div>Source: {line.intent?.value_or_source || "n/a"}</div>
                                      <div>Context: {line.intent?.context || "n/a"}</div>
                                    </div>
                                  )}

                                  {line.specificity_reasoning && (
                                    <div className={`mt-2 text-[11px] leading-5 ${mutedTextClass}`}>
                                      Mode note: {line.specificity_reasoning}
                                    </div>
                                  )}

                                  {/* Warning tone only when the model actually
                                      flagged a logic risk; plain feedback stays
                                      neutral so the amber keeps its meaning. */}
                                  {(line.ai_message || line.logic_risk || line.suggested_fix || line.generated_code_excerpt) && (
                                    <div
                                      className={joinClasses(
                                        "mt-2 rounded-[var(--radius-sm)] border px-2.5 py-2 text-[11px] leading-5 shadow-[var(--inlaid)]",
                                        line.logic_risk
                                          ? "border-[color-mix(in_srgb,var(--state-warning)_30%,transparent)] bg-[var(--state-warning-subtle)] text-[var(--state-warning)]"
                                          : "border-[var(--border-subtle)] bg-[var(--surface-sunken)] text-[var(--text-muted)]"
                                      )}
                                    >
                                      <div className={`text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] ${mutedTextClass}`}>
                                        AI Line Feedback
                                      </div>
                                      {line.ai_message && <div className="mt-1">{line.ai_message}</div>}
                                      {line.logic_risk && <div className="mt-1">Logic risk: {line.logic_risk}</div>}
                                      {line.suggested_fix && <div className="mt-1">Fix: {line.suggested_fix}</div>}
                                      {line.generated_code_excerpt && (
                                        <code className="mt-2 block whitespace-pre-wrap rounded-[var(--radius-sm)] bg-[var(--surface-page)] px-2 py-1 font-mono text-[10px] text-[var(--text-primary)] shadow-[var(--recessed)]">
                                          {line.generated_code_excerpt}
                                        </code>
                                      )}
                                    </div>
                                  )}

                                  {line.raw_specificity_reasoning &&
                                  line.raw_specificity_reasoning !== line.specificity_reasoning ? (
                                    <div className={`mt-2 text-[11px] leading-5 ${mutedTextClass}`}>
                                      Raw note: {line.raw_specificity_reasoning}
                                    </div>
                                  ) : null}

                                  {line.structure_reasoning ? (
                                    <div className={`mt-2 text-[11px] leading-5 ${mutedTextClass}`}>
                                      Structure note: {line.structure_reasoning}
                                    </div>
                                  ) : null}

                                  {line.strict_specificity_reasoning &&
                                  line.strict_specificity_reasoning !== line.specificity_reasoning ? (
                                    <div className={`mt-2 text-[11px] leading-5 ${mutedTextClass}`}>
                                      Strict note: {line.strict_specificity_reasoning}
                                    </div>
                                  ) : null}

                                  <div className={`mt-2 text-[11px] leading-5 ${mutedTextClass}`}>
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

      {/*
       * inert while closed.
       *
       * This overlay is never unmounted -- it is faded out and set to
       * pointer-events-none instead, so the open/close can transition. But
       * pointer-events and opacity are both purely visual: every control inside
       * stayed in the tab order and in the accessibility tree while invisible,
       * so tabbing through the IDE dropped focus into a dialog nobody could see
       * -- including, here, an autoFocus password input.
       *
       * inert is the one attribute that removes a subtree from focus AND from
       * assistive tech, which is exactly the state "closed but still mounted"
       * is meant to be.
       */}
      <div
        inert={!showDevVisionPrompt}
        className={`absolute inset-0 z-[130] transition-all duration-[var(--duration-slow)] ${
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
          className="absolute inset-0 bg-[var(--surface-overlay)]"
        />

        <div
          className={`absolute inset-0 flex items-center justify-center px-6 transition-all duration-[var(--duration-slow)] motion-reduce:transform-none ${
            showDevVisionPrompt ? "scale-100 opacity-100" : "scale-[0.98] opacity-0"
          }`}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Developer access required"
            className={`relative w-full max-w-md p-5 ${MODAL_SURFACE_CLASS}`}
          >
            <div className={`text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] ${mutedTextClass}`}>
              Dev Vision
            </div>
            <div className={`mt-2 text-[20px] ${PAGE_HEADING_CLASS} ${strongTextClass}`}>Developer access required</div>
            <div className={`mt-1 text-[13px] leading-6 ${mutedTextClass}`}>
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
                className={`w-full rounded-[var(--radius-md)] px-3 py-3 text-[14px] outline-none transition-[border-color,box-shadow] duration-[var(--duration-fast)] focus:border-[var(--accent-solid)] ${inputSurfaceClass}`}
                placeholder="Enter password"
              />
              {devVisionError ? (
                <div className="mt-2 text-[12px] text-[var(--state-blocked)]">{devVisionError}</div>
              ) : (
                <div className={`mt-2 text-[11px] ${mutedTextClass}`}>
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
                className={`${ideButton()} rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)]`}
              >
                Cancel
              </button>
              <button
                onClick={handleDevVisionUnlock}
                className={`${ideButton({ active: true })} rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)]`}
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
          className={`fixed z-[140] w-48 ${MENU_PANEL_CLASS}`}
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              renameNode(contextMenu.nodeId);
              setContextMenu(null);
            }}
            className={MENU_ROW_CLASS}
          >
            Rename
          </button>

          <button
            onClick={() => {
              duplicateById(contextMenu.nodeId);
              setContextMenu(null);
            }}
            className={MENU_ROW_CLASS}
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
                className={MENU_ROW_CLASS}
              >
                New file inside
              </button>
              <button
                onClick={() => {
                  createFolder(contextMenu.nodeId);
                  setContextMenu(null);
                }}
                className={MENU_ROW_CLASS}
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
            className={joinClasses(
              "w-full rounded-[var(--radius-sm)] px-[var(--space-3)] py-[var(--space-2)] text-left",
              "text-[length:var(--text-sm)] text-[var(--state-blocked)]",
              "transition-colors duration-[var(--duration-fast)] hover:bg-[var(--state-blocked-subtle)]"
            )}
          >
            Delete
          </button>
        </div>
      )}

      {/* inert while closed -- see the Dev Vision prompt above. */}
      <div
        inert={!showModeOverlay}
        className={`absolute inset-0 z-[120] transition-all duration-[var(--duration-slow)] ${
          showModeOverlay ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {/* Pointer-only convenience; the dialog has its own Close button. */}
        <div
          aria-hidden="true"
          className={SCRIM_CLASS}
          onClick={() => setShowModeOverlay(false)}
        />

        <div
          className={`absolute inset-0 flex items-center justify-center px-6 transition-all duration-[var(--duration-slow)] motion-reduce:transform-none ${
            showModeOverlay ? "scale-100 opacity-100" : "scale-[0.98] opacity-0"
          }`}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Select IDE mode"
            className={`relative w-full max-w-7xl p-6 ${MODAL_SURFACE_CLASS}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModeOverlay(false)}
              aria-label="Close mode selection"
              className={joinClasses(
                "absolute right-5 top-5 h-10 w-10 rounded-[var(--radius-md)] text-lg",
                SIDEBAR_ICON_BUTTON_CLASS,
                SIDEBAR_ICON_BUTTON_RESTING_CLASS
              )}
            >
              ×
            </button>

            <div className="mb-8 pr-14">
              <div className={`mb-2 text-[11px] font-semibold uppercase tracking-[var(--tracking-label)] ${mutedTextClass}`}>
                Select IDE Mode
              </div>
              <h2
                className={`${PAGE_HEADING_CLASS} mb-3 text-3xl text-[var(--text-primary)] md:text-4xl`}
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
                    className={joinClasses(
                      "min-h-[20rem]",
                      OVERLAY_CARD_CLASS,
                      unlocked
                        ? joinClasses(
                            OVERLAY_CARD_PRESSABLE_CLASS,
                            selected
                              ? `${item.active} text-[var(--text-primary)]`
                              : `${OVERLAY_CARD_RESTING_CLASS} ${item.hover}`
                          )
                        : OVERLAY_CARD_LOCKED_CLASS
                    )}
                    style={{
                      transitionDelay: showModeOverlay ? `${index * 35}ms` : "0ms",
                    }}
                  >
                    {/* The catch of light along the top edge, brought up on
                        hover so the card reads as rising toward the source
                        rather than just moving. */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[var(--material-highlight)] opacity-0 transition-opacity duration-[var(--duration-base)] group-hover:opacity-100"
                    />

                    {!unlocked && (
                      <div className={OVERLAY_LOCK_OVERLAY_CLASS}>
                        <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-[var(--radius-full)] border text-xl ${CHIP_CLASS}`}>
                          🔒
                        </div>
                        <div className={OVERLAY_LOCK_NOTE_CLASS}>
                          Upgrade your subscription to access this mode.
                        </div>
                      </div>
                    )}

                    <div className="relative z-10 flex h-full flex-col">
                      <div className="mb-6 flex items-start justify-between">
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] border text-2xl ${CHIP_SURFACE_CLASS} ${item.badge}`}
                        >
                          {item.icon}
                        </div>

                        {selected && unlocked ? (
                          <div
                            className={`rounded-[var(--radius-full)] border px-3 py-1 text-[11px] uppercase tracking-[var(--tracking-label)] ${CHIP_SURFACE_CLASS} ${item.badge}`}
                          >
                            Selected
                          </div>
                        ) : unlocked ? null : (
                          <div className={`rounded-[var(--radius-full)] border px-3 py-1 text-[11px] uppercase tracking-[var(--tracking-label)] ${CHIP_CLASS}`}>
                            Locked
                          </div>
                        )}
                      </div>

                      <div className={`mb-2 text-xl ${PAGE_HEADING_CLASS} text-[var(--text-primary)]`}>{item.label}</div>
                      <div className="mb-5 text-[length:var(--text-sm)] leading-[var(--leading-normal)] text-[var(--text-muted)]">{item.short}</div>

                      <div className={OVERLAY_CARD_DETAIL_CLASS}>
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

      {/* inert while closed -- see the Dev Vision prompt above. */}
      <div
        inert={!showLayoutOverlay}
        className={`absolute inset-0 z-[120] transition-all duration-[var(--duration-slow)] ${
          showLayoutOverlay ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {/* Pointer-only convenience; the dialog has its own Close button. */}
        <div
          aria-hidden="true"
          className={SCRIM_CLASS}
          onClick={() => setShowLayoutOverlay(false)}
        />

        <div
          className={`absolute inset-0 flex items-center justify-center px-6 transition-all duration-[var(--duration-slow)] motion-reduce:transform-none ${
            showLayoutOverlay ? "scale-100 opacity-100" : "scale-[0.98] opacity-0"
          }`}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Select layout"
            className={`relative w-full max-w-5xl p-6 ${MODAL_SURFACE_CLASS}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLayoutOverlay(false)}
              aria-label="Close layout selection"
              className={joinClasses(
                "absolute right-5 top-5 h-10 w-10 rounded-[var(--radius-md)] text-lg",
                SIDEBAR_ICON_BUTTON_CLASS,
                SIDEBAR_ICON_BUTTON_RESTING_CLASS
              )}
            >
              ×
            </button>

            <div className="mb-8 pr-14">
              <div className={`mb-2 text-[11px] font-semibold uppercase tracking-[var(--tracking-label)] ${mutedTextClass}`}>
                Select Layout
              </div>
              <h2
                className={`${PAGE_HEADING_CLASS} mb-3 text-3xl text-[var(--text-primary)] md:text-4xl`}
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
                    className={joinClasses(
                      "min-h-[13.75rem]",
                      OVERLAY_CARD_CLASS,
                      unlocked
                        ? joinClasses(
                            OVERLAY_CARD_PRESSABLE_CLASS,
                            selected
                              ? `${item.accentBorder} ${item.accentBg} text-[var(--text-primary)]`
                              : `${OVERLAY_CARD_RESTING_CLASS} ${item.hover}`
                          )
                        : OVERLAY_CARD_LOCKED_CLASS
                    )}
                    style={{
                      transitionDelay: showLayoutOverlay ? `${index * 35}ms` : "0ms",
                    }}
                  >
                    {!unlocked && (
                      <div className={OVERLAY_LOCK_OVERLAY_CLASS}>
                        <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-[var(--radius-full)] border text-xl ${CHIP_CLASS}`}>
                          🔒
                        </div>
                        <div className={OVERLAY_LOCK_NOTE_CLASS}>
                          Upgrade your subscription to access this layout.
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-0 overflow-hidden rounded-[var(--radius-xl)]">
                      <div
                        className={`absolute left-1/2 top-[46%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-full)] blur-3xl transition-opacity duration-[var(--duration-base)] ${item.halo} ${
                          selected ? "opacity-70" : "opacity-0 group-hover:opacity-55"
                        }`}
                      />
                      {/* Same catch of light as the mode cards, and brought up
                          the same way: on hover, so the card reads as rising
                          toward the source rather than just moving. It was
                          painted permanently here, which put a second, brighter
                          top edge on top of the one --raised already draws and
                          left the two pickers -- the same OVERLAY_CARD object,
                          two panels apart -- lit differently at rest. */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-x-0 top-0 h-px bg-[var(--material-highlight)] opacity-0 transition-opacity duration-[var(--duration-base)] group-hover:opacity-100"
                      />
                    </div>

                    <div className="relative z-10 flex h-full flex-col">
                      <div className="mb-6 flex items-start justify-between">
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] border text-xs font-semibold uppercase tracking-[var(--tracking-label)] ${item.accentText} ${CHIP_CLASS}`}
                        >
                          {layoutKey === "minimalist" ? "○" : layoutKey === "normal" ? "◫" : "▣"}
                        </div>

                        {selected && unlocked ? (
                          <div
                            className={`rounded-[var(--radius-full)] border px-3 py-1 text-[11px] uppercase tracking-[var(--tracking-label)] ${item.accentText} ${CHIP_CLASS}`}
                          >
                            Selected
                          </div>
                        ) : unlocked ? null : (
                          <div className={`rounded-[var(--radius-full)] border px-3 py-1 text-[11px] uppercase tracking-[var(--tracking-label)] ${CHIP_CLASS}`}>
                            Locked
                          </div>
                        )}
                      </div>

                      <div className={`mb-2 text-xl ${PAGE_HEADING_CLASS} text-[var(--text-primary)]`}>
                        {item.label}
                      </div>

                      <div className="mb-5 text-[length:var(--text-sm)] leading-[var(--leading-normal)] text-[var(--text-muted)]">
                        {item.short}
                      </div>

                      <div className={OVERLAY_CARD_DETAIL_CLASS}>
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

      <RunComparePanel />

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
          {/* Pointer-only convenience; the dialog has its own Close button. */}
          <div
            aria-hidden="true"
            className={SCRIM_CLASS}
            onClick={() => setUpgradeModal((prev) => ({ ...prev, open: false }))}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ide-upgrade-modal-title"
            className={`relative z-10 w-full max-w-lg p-6 ${MODAL_SURFACE_CLASS}`}
          >
            <div className={`mb-2 text-[11px] uppercase tracking-[var(--tracking-label)] ${mutedTextClass}`}>
              Subscription Required
            </div>
            {/* labelledby rather than a duplicated aria-label: this heading is
                plain text, so the visible title and the announced one cannot
                drift apart. */}
            <h2
              id="ide-upgrade-modal-title"
              className={`${PAGE_HEADING_CLASS} text-3xl text-[var(--text-primary)]`}
            >
              {upgradeModal.title}
            </h2>
            <p className={`mt-3 text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] ${mutedTextClass}`}>{upgradeModal.message}</p>

            <div className="mt-5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] px-4 py-3 text-[length:var(--text-sm)] text-[var(--text-muted)] shadow-[var(--inlaid)]">
              Current plan: {SUBSCRIPTION_META[activeTier].label}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setUpgradeModal((prev) => ({ ...prev, open: false }))}
                className={`${ideButton()} rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)]`}
              >
                Close
              </button>
              <Link
                href="/subscriptions"
                className={`${ideButton()} rounded-[var(--radius-md)] px-[var(--space-4)] py-[var(--space-2)]`}
              >
                View Subscriptions
              </Link>
            </div>
          </div>
        </div>
      )}

      {/*
       * The toast is the IDE's only transient feedback channel -- it is what
       * confirms a save, a copy, a deleted file. It announced none of that:
       * with no live region the text simply appeared and vanished, so the
       * confirmation existed for sighted users only.
       *
       * polite, not assertive: these are acknowledgements, not emergencies, and
       * assertive would interrupt whatever the reader is in the middle of.
       * aria-atomic so the message is read as one sentence rather than as a
       * diff against the previous toast.
       *
       * The live region is the always-mounted wrapper, not the message: a
       * region that mounts at the same moment its content arrives is not
       * reliably announced, because there was no prior state to compare to.
       */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        // motion-reduce:translate-y-0, not transform-none -- Tailwind v4
        // compiles -translate-y-2 to the `translate` property, which
        // `transform: none` does not touch. The fade still carries the change.
        className={`pointer-events-none absolute right-6 top-6 z-[160] transition-all duration-[var(--duration-slow)] motion-reduce:transition-none motion-reduce:translate-y-0 ${
          toast.visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
        }`}
      >
        {/* A toast is not touching the page either, so it takes the same
            elevation as a menu rather than a card's contact shadow. */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] bg-[image:var(--material-sheen)] px-[var(--space-4)] py-[var(--space-3)] text-[length:var(--text-sm)] text-[var(--text-muted)] shadow-[var(--floating)]">
          {toast.visible ? toast.text : ""}
        </div>
      </div>

      {/* The scrollbar rules that used to live here were a raw-rgba copy of
          the ones in globals.css, and being last in the cascade they won --
          which is why the IDE's scrollbars stayed grey in both themes while
          the rest of the app followed the tokens. Deleted, not moved. */}
    </main>
    </IdeProvider>
  );
}

export default function IdePage() {
  return (
    <Suspense
      fallback={
        <main className="flex h-screen w-screen items-center justify-center bg-[var(--surface-page)] text-[length:var(--text-sm)] text-[var(--text-muted)]">
          Loading IDE...
        </main>
      }
    >
      <IdePageContent />
    </Suspense>
  );
}
