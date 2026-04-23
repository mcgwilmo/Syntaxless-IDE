"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/components/theme-provider";

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

type BugReportModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: BugReportFormValues) => Promise<void>;
  isSubmitting: boolean;
  targetKind: "ui" | "run";
  context: {
    projectName: string;
    projectId: string;
    currentFilePath: string;
    mode: string;
    runId: string | null;
  };
};

const CATEGORY_OPTIONS: Array<{
  value: BugReportCategory;
  label: string;
}> = [
  { value: "incorrect_validation", label: "Incorrect validation" },
  { value: "wrong_generated_code", label: "Wrong generated code" },
  { value: "runtime_execution_failure", label: "Runtime / execution failure" },
  { value: "visual_artifact_issue", label: "Visual / artifact issue" },
  { value: "ide_ui_issue", label: "IDE / UI issue" },
  { value: "performance_timeout", label: "Performance / timeout" },
  { value: "other", label: "Other" },
];

export default function BugReportModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  targetKind,
  context,
}: BugReportModalProps) {
  const { isLight } = useTheme();
  const defaultCategory = useMemo<BugReportCategory>(() => {
    return targetKind === "run"
      ? "runtime_execution_failure"
      : "ide_ui_issue";
  }, [targetKind]);

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

  async function handleSubmit() {
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
    <div className={`fixed inset-0 z-[500] flex items-center justify-center px-4 backdrop-blur-sm ${isLight ? "bg-slate-200/70" : "bg-black/70"}`}>
      <div className={`w-full max-w-2xl rounded-[1.75rem] border p-6 ${isLight ? "border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]" : "border-neutral-800 bg-[linear-gradient(180deg,rgba(12,12,12,0.98),rgba(8,8,8,0.96))] shadow-[0_20px_80px_rgba(0,0,0,0.45)]"}`}>
        <div className={`mb-2 text-[11px] uppercase tracking-[0.26em] ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
          CodeLess
        </div>

        <div className="mb-2 flex items-start justify-between gap-4">
          <div>
            <h2
              className={isLight ? "text-3xl text-slate-900" : "text-3xl text-white"}
              style={{ fontFamily: "Georgia, Times New Roman, serif" }}
            >
              Report Bug
            </h2>
            <p className={`mt-3 text-sm leading-7 ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
              {targetKind === "run"
                ? "This report will include the currently selected run diagnostics automatically."
                : "This report will include the current IDE state automatically."}
            </p>
          </div>

          <button
            onClick={onClose}
            className={`rounded-2xl border px-3 py-2 text-sm transition-colors ${isLight ? "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900" : "border-neutral-800 bg-[#0b0b0b] text-neutral-300 hover:border-white/10 hover:bg-[#111111] hover:text-white"}`}
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          <div>
            <label className={`mb-2 block text-[11px] uppercase tracking-[0.22em] ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BugReportCategory)}
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors ${isLight ? "border-slate-200 bg-white text-slate-900 focus:border-sky-400/60" : "border-neutral-800 bg-[#080808] text-white focus:border-sky-400/40"}`}
            >
              {CATEGORY_OPTIONS.map((option) => (
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
              placeholder="Short summary of the bug"
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors ${isLight ? "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-sky-400/60" : "border-neutral-800 bg-[#080808] text-white placeholder:text-neutral-600 focus:border-sky-400/40"}`}
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
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors ${isLight ? "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-sky-400/60" : "border-neutral-800 bg-[#080808] text-white placeholder:text-neutral-600 focus:border-sky-400/40"}`}
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
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors ${isLight ? "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-sky-400/60" : "border-neutral-800 bg-[#080808] text-white placeholder:text-neutral-600 focus:border-sky-400/40"}`}
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
            className={`rounded-2xl border px-4 py-2 text-sm transition-all duration-300 disabled:opacity-50 ${isLight ? "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900" : "border-neutral-800 bg-[#0b0b0b] text-neutral-300 hover:border-white/10 hover:bg-[#111111] hover:text-white"}`}
          >
            Cancel
          </button>
          <button
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || !title.trim() || !description.trim()}
            className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-200 transition-all duration-300 hover:border-amber-300/40 hover:bg-amber-500/15 hover:text-white disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
