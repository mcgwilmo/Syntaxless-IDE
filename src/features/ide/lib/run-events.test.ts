import { describe, expect, it } from "vitest";
import { applyRunEvent, runStreamFailureEffects } from "./run-events";

/*
 * The Run path: what happens between "the student pressed Run" and "output
 * appears". Until this was extracted from `ws.onmessage` it could not be
 * reached without a WebSocket, a rendered hook, and a Supabase session.
 *
 * Whole arrays are asserted rather than individual members, because order is
 * the contract. `completed` clearing `isRunning` before it sets the status
 * message is not incidental -- reversing the two leaves the IDE showing
 * "Run success." while the spinner is still going.
 */

const RUN_ID = "run-1";

describe("run_started", () => {
  it("announces the run", () => {
    expect(applyRunEvent({ type: "run_started" }, RUN_ID)).toEqual([
      { kind: "status", message: "Execution started." },
    ]);
  });

  it("flags the weaker sandbox and opens the terminal to show it", () => {
    // A subprocess run is not isolated the way a Docker run is. Saying so is
    // the difference between a student knowing and not knowing.
    expect(applyRunEvent({ type: "run_started", executor_mode: "subprocess" }, RUN_ID)).toEqual([
      { kind: "status", message: "Execution started." },
      { kind: "runtime_indicator", symbol: "SP" },
      { kind: "show_panel", tab: "terminal" },
    ]);
  });

  it("says nothing extra when the sandbox is the real one", () => {
    const effects = applyRunEvent({ type: "run_started", executor_mode: "docker" }, RUN_ID);

    expect(effects.map((e) => e.kind)).not.toContain("runtime_indicator");
  });
});

describe("stdout and stderr", () => {
  it("routes stdout to the stdout stream", () => {
    expect(applyRunEvent({ type: "stdout", text: "hello\n" }, RUN_ID)).toEqual([
      { kind: "terminal", text: "hello\n", stream: "stdout" },
    ]);
  });

  it("routes stderr to the stderr stream", () => {
    expect(applyRunEvent({ type: "stderr", text: "boom\n" }, RUN_ID)).toEqual([
      { kind: "terminal", text: "boom\n", stream: "stderr" },
    ]);
  });

  it.each(["stdout", "stderr"] as const)("tolerates %s with no text", (type) => {
    expect(applyRunEvent({ type }, RUN_ID)).toEqual([
      { kind: "terminal", text: "", stream: type },
    ]);
  });

  it("preserves whitespace-only output rather than trimming it away", () => {
    // Indentation in printed output is meaningful; a student printing a shape
    // out of spaces should see the shape.
    expect(applyRunEvent({ type: "stdout", text: "   \n" }, RUN_ID)).toEqual([
      { kind: "terminal", text: "   \n", stream: "stdout" },
    ]);
  });
});

describe("error_explanation", () => {
  it("joins the localized parts into one explanation entry", () => {
    const effects = applyRunEvent(
      {
        type: "error_explanation",
        location: "Line 7",
        explanation: "The list has 2 items, so item 9 does not exist.",
        hint: "Check the number you are counting to.",
      },
      RUN_ID
    );

    expect(effects).toEqual([
      {
        kind: "terminal",
        text:
          "Line 7\nThe list has 2 items, so item 9 does not exist.\n" +
          "Check the number you are counting to.\n",
        stream: "explanation",
      },
    ]);
  });

  it("drops the parts the backend did not send", () => {
    const effects = applyRunEvent(
      { type: "error_explanation", location: null, explanation: "Something went wrong.", hint: null },
      RUN_ID
    );

    expect(effects[0]).toMatchObject({ text: "Something went wrong.\n" });
  });

  it("uses its own stream so it never replaces the traceback above it", () => {
    const [effect] = applyRunEvent(
      { type: "error_explanation", explanation: "e" },
      RUN_ID
    );

    expect(effect).toMatchObject({ stream: "explanation" });
  });
});

describe("input_requested", () => {
  it("prompts, opens the terminal, and echoes the prompt", () => {
    expect(
      applyRunEvent({ type: "input_requested", prompt: "What is your name? " }, RUN_ID)
    ).toEqual([
      { kind: "input_prompt", prompt: "What is your name? " },
      { kind: "show_panel", tab: "terminal" },
      { kind: "terminal", text: "What is your name? ", stream: "system" },
    ]);
  });

  it("falls back to a generic prompt and echoes nothing", () => {
    // Echoing an empty string would push a blank line into the terminal for
    // no reason.
    expect(applyRunEvent({ type: "input_requested" }, RUN_ID)).toEqual([
      { kind: "input_prompt", prompt: "Input:" },
      { kind: "show_panel", tab: "terminal" },
    ]);
  });
});

describe("artifact_created", () => {
  it("adds the artifact and switches to the visual tab", () => {
    expect(
      applyRunEvent(
        { type: "artifact_created", name: "plot.png", artifact_type: "image", label: "My plot" },
        RUN_ID
      )
    ).toEqual([
      {
        kind: "add_artifact",
        runId: RUN_ID,
        artifact: { name: "plot.png", artifact_type: "image", label: "My plot" },
      },
      { kind: "show_panel", tab: "visual" },
    ]);
  });

  it("falls back to the file name as the label and 'file' as the type", () => {
    const [effect] = applyRunEvent({ type: "artifact_created", name: "out.csv" }, RUN_ID);

    expect(effect).toMatchObject({
      artifact: { name: "out.csv", artifact_type: "file", label: "out.csv" },
    });
  });
});

describe("completed", () => {
  it("stops the run, clears the prompt, and reloads history", () => {
    expect(applyRunEvent({ type: "completed", status: "success" }, RUN_ID)).toEqual([
      { kind: "running", value: false },
      { kind: "input_prompt", prompt: null },
      { kind: "active_run", runId: RUN_ID },
      { kind: "status", message: "Run success." },
      { kind: "reload_runs" },
    ]);
  });

  it("stops the run before announcing the outcome", () => {
    const effects = applyRunEvent({ type: "completed", status: "error" }, RUN_ID);
    const stopped = effects.findIndex((e) => e.kind === "running");
    const announced = effects.findIndex((e) => e.kind === "status");

    expect(stopped).toBeLessThan(announced);
  });

  it("prefers the run id the payload names", () => {
    const effects = applyRunEvent(
      { type: "completed", status: "success", run_id: "run-2" },
      RUN_ID
    );

    expect(effects).toContainEqual({ kind: "active_run", runId: "run-2" });
  });

  it("falls back to the stream's run id", () => {
    const effects = applyRunEvent({ type: "completed", status: "success" }, RUN_ID);

    expect(effects).toContainEqual({ kind: "active_run", runId: RUN_ID });
  });

  it("carries dev metrics through when the run persisted them", () => {
    const metrics = { generator_path: "deterministic" } as never;
    const effects = applyRunEvent(
      { type: "completed", status: "success", persisted_run: { dev_metrics: metrics } },
      RUN_ID
    );

    expect(effects).toContainEqual({ kind: "dev_metrics", metrics });
  });

  it("replaces artifacts and opens the visual tab when there are any", () => {
    const artifacts = [{ name: "p.png", artifact_type: "image", label: "p" }];
    const effects = applyRunEvent(
      {
        type: "completed",
        status: "success",
        persisted_run: { id: "run-9", artifacts },
      },
      RUN_ID
    );

    expect(effects).toContainEqual({
      kind: "replace_artifacts",
      runId: "run-9",
      artifacts,
    });
    expect(effects).toContainEqual({ kind: "show_panel", tab: "visual" });
  });

  it("replaces artifacts but does not open the panel when the list is empty", () => {
    // A rerun that produced no plot must clear the old one without yanking
    // the student over to an empty tab.
    const effects = applyRunEvent(
      { type: "completed", status: "success", persisted_run: { artifacts: [] } },
      RUN_ID
    );

    expect(effects).toContainEqual({
      kind: "replace_artifacts",
      runId: RUN_ID,
      artifacts: [],
    });
    expect(effects).not.toContainEqual({ kind: "show_panel", tab: "visual" });
  });

  it("does not touch artifacts at all when the run reported none", () => {
    const effects = applyRunEvent({ type: "completed", status: "success" }, RUN_ID);

    expect(effects.map((e) => e.kind)).not.toContain("replace_artifacts");
  });

  it("reloads run history last, after the state it depends on is set", () => {
    const effects = applyRunEvent({ type: "completed", status: "success" }, RUN_ID);

    expect(effects[effects.length - 1]).toEqual({ kind: "reload_runs" });
  });
});

describe("error", () => {
  it("prints the message and stops the run", () => {
    expect(applyRunEvent({ type: "error", message: "Sandbox died." }, RUN_ID)).toEqual([
      { kind: "terminal", text: "Sandbox died.\n", stream: "system" },
      { kind: "running", value: false },
      { kind: "input_prompt", prompt: null },
      { kind: "status", message: "Run failed." },
    ]);
  });

  it("still stops the run when the backend sent no message", () => {
    // The worst outcome is a spinner that never stops.
    const effects = applyRunEvent({ type: "error" }, RUN_ID);

    expect(effects).toContainEqual({ kind: "running", value: false });
    expect(effects[0]).toMatchObject({ text: "Run stream error.\n" });
  });

  it("clears the input prompt so the terminal is not left waiting", () => {
    const effects = applyRunEvent({ type: "error" }, RUN_ID);

    expect(effects).toContainEqual({ kind: "input_prompt", prompt: null });
  });
});

describe("unrecognized events", () => {
  it.each([
    { type: "something_new" },
    { type: "" },
    {},
    null,
    undefined,
    42,
    "run_started",
  ])("ignores %p rather than throwing", (payload) => {
    // A backend that grows a new event type must not break an older IDE.
    expect(applyRunEvent(payload, RUN_ID)).toEqual([]);
  });
});

describe("runStreamFailureEffects", () => {
  it("reports the stream failing, distinctly from the program failing", () => {
    expect(runStreamFailureEffects()).toEqual([
      { kind: "terminal", text: "WebSocket stream error.\n", stream: "system" },
      { kind: "running", value: false },
      { kind: "input_prompt", prompt: null },
      { kind: "status", message: "Run stream failed." },
    ]);
  });

  it("says something different from a program error", () => {
    const stream = runStreamFailureEffects().find((e) => e.kind === "status");
    const program = applyRunEvent({ type: "error" }, RUN_ID).find((e) => e.kind === "status");

    expect(stream).not.toEqual(program);
  });
});

describe("every branch stops the run when it is over", () => {
  it.each([
    [{ type: "completed", status: "success" }],
    [{ type: "error" }],
  ])("%p clears isRunning", (payload) => {
    expect(applyRunEvent(payload, RUN_ID)).toContainEqual({ kind: "running", value: false });
  });

  it.each([
    [{ type: "stdout", text: "x" }],
    [{ type: "stderr", text: "x" }],
    [{ type: "run_started" }],
    [{ type: "input_requested" }],
    [{ type: "artifact_created", name: "a" }],
  ])("%p leaves isRunning alone", (payload) => {
    expect(applyRunEvent(payload, RUN_ID).map((e) => e.kind)).not.toContain("running");
  });
});
