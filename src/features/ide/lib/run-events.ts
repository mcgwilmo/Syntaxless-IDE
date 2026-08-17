import type { RuntimeErrorExplanation } from "@/lib/api/types";
import type {
  BackendArtifact,
  BottomTab,
  DevMetrics,
  TerminalEntry,
} from "../types";

/*
 * What the IDE should do when a run event arrives.
 *
 * This was eight `if (payload.type === ...)` branches inside `ws.onmessage`,
 * each calling four or five setters directly. That made the Run path -- the
 * one every student reaches, and the one carrying a program's actual output --
 * the least testable code in the repo: reaching it needed a WebSocket, a
 * rendered hook, and an authenticated Supabase session.
 *
 * Splitting it in two fixes that without changing what happens. This module
 * decides; `use-ide-state` performs. The decision is a pure function of the
 * payload, so it can be tested by calling it.
 *
 * Effects are returned as an ordered list and must be applied in order: the
 * original code ran its setters in a particular sequence, and preserving that
 * sequence is the point. Order is part of the contract, not an accident of it,
 * so the tests assert on whole arrays rather than on membership.
 *
 * Parsing stays with the caller. `JSON.parse` on a malformed frame throws, and
 * that is what it did before -- moving it in here would have quietly changed
 * behavior under cover of a refactor.
 */

export type RunStreamEffect =
  | { kind: "status"; message: string }
  | { kind: "terminal"; text: string; stream: TerminalEntry["stream"] }
  | { kind: "runtime_indicator"; symbol: string }
  | { kind: "show_panel"; tab: BottomTab }
  | { kind: "input_prompt"; prompt: string | null }
  | { kind: "running"; value: boolean }
  | { kind: "active_run"; runId: string }
  | { kind: "dev_metrics"; metrics: DevMetrics }
  | { kind: "add_artifact"; runId: string; artifact: BackendArtifact }
  | { kind: "replace_artifacts"; runId: string; artifacts: BackendArtifact[] }
  | { kind: "reload_runs" };

type RunEventPayload = {
  type?: string;
  text?: string;
  prompt?: string;
  message?: string;
  status?: string;
  run_id?: string;
  name?: string;
  artifact_type?: string;
  label?: string;
  executor_mode?: string;
  persisted_run?: {
    id?: string;
    dev_metrics?: DevMetrics;
    artifacts?: BackendArtifact[];
  };
};

/**
 * `runId` is the stream we opened, used wherever the payload does not name one
 * of its own -- an event that arrives without a run id still belongs to a run.
 */
export function applyRunEvent(payload: unknown, runId: string): RunStreamEffect[] {
  const event = (payload ?? {}) as RunEventPayload;

  switch (event.type) {
    case "run_started": {
      const effects: RunStreamEffect[] = [{ kind: "status", message: "Execution started." }];
      if (event.executor_mode === "subprocess") {
        // The weaker sandbox. Say so in the terminal rather than letting a run
        // look identical whether or not it was isolated.
        effects.push({ kind: "runtime_indicator", symbol: "SP" });
        effects.push({ kind: "show_panel", tab: "terminal" });
      }
      return effects;
    }

    case "stdout":
      return [{ kind: "terminal", text: event.text || "", stream: "stdout" }];

    case "stderr":
      return [{ kind: "terminal", text: event.text || "", stream: "stderr" }];

    case "error_explanation": {
      // Arrives after the raw traceback has already been streamed, so it reads
      // as a plain-language summary of the error above it rather than as a
      // replacement for it.
      //
      // Every string here is composed by the backend, `location` included --
      // the IDE has no locale catalog of its own, so any text added on this
      // side would arrive in English and undo the translation.
      const explanation = event as unknown as RuntimeErrorExplanation;
      const parts = [explanation.location, explanation.explanation, explanation.hint].filter(
        Boolean
      );
      return [{ kind: "terminal", text: parts.join("\n") + "\n", stream: "explanation" }];
    }

    case "input_requested": {
      const effects: RunStreamEffect[] = [
        { kind: "input_prompt", prompt: event.prompt || "Input:" },
        { kind: "show_panel", tab: "terminal" },
      ];
      if (event.prompt) {
        effects.push({ kind: "terminal", text: event.prompt, stream: "system" });
      }
      return effects;
    }

    case "artifact_created":
      return [
        {
          kind: "add_artifact",
          runId,
          artifact: {
            name: String(event.name ?? ""),
            artifact_type: event.artifact_type || "file",
            label: event.label || String(event.name ?? ""),
          },
        },
        { kind: "show_panel", tab: "visual" },
      ];

    case "completed": {
      const effects: RunStreamEffect[] = [
        { kind: "running", value: false },
        { kind: "input_prompt", prompt: null },
        { kind: "active_run", runId: event.run_id || runId },
      ];

      const persisted = event.persisted_run;
      if (persisted?.dev_metrics) {
        effects.push({ kind: "dev_metrics", metrics: persisted.dev_metrics });
      }
      if (persisted?.artifacts) {
        effects.push({
          kind: "replace_artifacts",
          runId: persisted.id || runId,
          artifacts: persisted.artifacts,
        });
        if (persisted.artifacts.length > 0) {
          effects.push({ kind: "show_panel", tab: "visual" });
        }
      }

      effects.push({ kind: "status", message: `Run ${event.status}.` });
      effects.push({ kind: "reload_runs" });
      return effects;
    }

    case "error":
      return [
        {
          kind: "terminal",
          text: (event.message || "Run stream error.") + "\n",
          stream: "system",
        },
        { kind: "running", value: false },
        { kind: "input_prompt", prompt: null },
        { kind: "status", message: "Run failed." },
      ];

    default:
      // An unrecognized event type is ignored, exactly as before. A backend
      // that grows a new event must not break an IDE that predates it.
      return [];
  }
}

/** The stream itself failed, as opposed to the program that was running. */
export function runStreamFailureEffects(): RunStreamEffect[] {
  return [
    { kind: "terminal", text: "WebSocket stream error.\n", stream: "system" },
    { kind: "running", value: false },
    { kind: "input_prompt", prompt: null },
    { kind: "status", message: "Run stream failed." },
  ];
}
