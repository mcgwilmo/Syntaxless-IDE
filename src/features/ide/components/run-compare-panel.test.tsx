// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RunDiff, RunDiffEntry } from "@/lib/api/types";
import { RunComparePanel } from "./run-compare-panel";

/*
 * What this panel must not do is invent language.
 *
 * Every sentence in a comparison is composed by the backend in the requested
 * locale, because the IDE has no locale catalog to compose one with. A label
 * added on this side arrives in English no matter what was asked for, and that
 * is invisible to anyone testing in English -- which is why these tests render
 * a Spanish payload and assert that what reaches the screen is Spanish.
 */

const mockIde = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));

vi.mock("@/features/ide/state/ide-context", () => ({
  useIde: () => mockIde.value,
}));

afterEach(cleanup);

function entry(overrides: Partial<RunDiffEntry> = {}): RunDiffEntry {
  return {
    change: "changed",
    base_line_number: 2,
    compare_line_number: 2,
    base_location: "Línea 2",
    compare_location: "Línea 2",
    base_text: "ordena por cuenta",
    compare_text: "ordena por longitud",
    description: "Este paso ahora hace algo diferente.",
    detail: "El valor pasó de «count» a «length».",
    step: "sort_variable",
    ...overrides,
  };
}

function diff(overrides: Partial<RunDiff> = {}): RunDiff {
  return {
    locale: "es",
    base: {
      run_id: "4af8676057da46ff",
      timestamp: "2026-08-17T10:00:00",
      status: "success",
      mode: "standard",
      active_file_path: "main.synth",
    },
    compare: {
      run_id: "f998756bb8cf4f88",
      timestamp: "2026-08-17T10:05:00",
      status: "success",
      mode: "standard",
      active_file_path: "main.synth",
    },
    headline: "2 pasos cambiaron.",
    summary: { changed: 1, added: 1, removed: 0, moved: 0, reworded: 1, unchanged: 3 },
    summary_labels: {
      changed: "Cambiados",
      added: "Agregados",
      removed: "Eliminados",
      moved: "Movidos",
      reworded: "Reformulados",
      unchanged: "Sin cambios",
    },
    entries: [entry()],
    semantic: true,
    notice: null,
    ...overrides,
  };
}

function mountWith(state: Record<string, unknown>) {
  mockIde.value = {
    runDiff: null,
    runDiffError: null,
    isComparingRuns: false,
    showRunCompare: true,
    closeRunComparison: vi.fn(),
    ...state,
  };
  return render(<RunComparePanel />);
}

describe("visibility", () => {
  it("renders nothing until a comparison is opened", () => {
    mountWith({ showRunCompare: false, runDiff: diff() });

    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("the prose it shows", () => {
  it("shows the backend's sentences verbatim, in the locale they arrived in", () => {
    mountWith({ runDiff: diff() });

    expect(screen.getByText("2 pasos cambiaron.")).toBeDefined();
    expect(screen.getByText("Este paso ahora hace algo diferente.")).toBeDefined();
    expect(screen.getByText("El valor pasó de «count» a «length».")).toBeDefined();
  });

  it("labels the counts with the backend's words, not its own", () => {
    // The failure this catches: rendering "1 changed" client-side, which is
    // English on a Spanish payload and looks correct to an English reviewer.
    mountWith({ runDiff: diff() });

    expect(screen.getByText(/Cambiados/)).toBeDefined();
    expect(screen.getByText(/Reformulados/)).toBeDefined();
    expect(screen.queryByText(/\bChanged\b/)).toBeNull();
    expect(screen.queryByText(/\bReworded\b/)).toBeNull();
  });

  it("uses the backend's line labels rather than composing 'Line N'", () => {
    mountWith({ runDiff: diff() });

    expect(screen.getByText("Línea 2")).toBeDefined();
    expect(screen.queryByText(/^Line 2$/)).toBeNull();
  });

  it("omits a count that is zero rather than showing an empty category", () => {
    mountWith({ runDiff: diff() });

    expect(screen.queryByText(/Eliminados/)).toBeNull();
    expect(screen.queryByText(/Movidos/)).toBeNull();
  });

  it("surfaces the degraded-comparison notice when there is one", () => {
    mountWith({
      runDiff: diff({
        semantic: false,
        notice: "Una de estas ejecuciones no se interpretó paso a paso.",
      }),
    });

    expect(
      screen.getByText("Una de estas ejecuciones no se interpretó paso a paso."),
    ).toBeDefined();
  });
});

describe("the student's own words", () => {
  it("shows both sides of a rewritten step", () => {
    mountWith({ runDiff: diff() });

    expect(screen.getByText("ordena por cuenta")).toBeDefined();
    expect(screen.getByText("ordena por longitud")).toBeDefined();
  });

  it("shows only the side that exists for an addition", () => {
    // An empty box for the missing side reads as data that failed to load.
    mountWith({
      runDiff: diff({
        entries: [
          entry({
            change: "added",
            base_text: null,
            base_location: null,
            base_line_number: null,
            description: "Paso nuevo.",
            detail: null,
          }),
        ],
      }),
    });

    expect(screen.getByText("Paso nuevo.")).toBeDefined();
    expect(screen.getByText("ordena por longitud")).toBeDefined();
  });

  it("does not print the same sentence twice when only the meaning changed", () => {
    // base_text === compare_text happens when the wording stayed put and the
    // interpretation moved under it.
    mountWith({
      runDiff: diff({
        entries: [entry({ compare_text: "ordena por cuenta" })],
      }),
    });

    expect(screen.getAllByText("ordena por cuenta")).toHaveLength(1);
  });
});

describe("strikethrough means the words are gone", () => {
  /*
   * The bug this guards: every entry with a `base_text` was struck through,
   * including a `moved` step -- whose wording is identical on both sides, so the
   * struck copy was the ONLY rendering of it. A reorder was drawn exactly like a
   * deletion, directly under a sentence saying the step still runs. Counting
   * occurrences, as the test above does, cannot catch it; which side survived is
   * the whole question.
   */

  function struck(text: string): boolean {
    const node = screen.getByText(text);
    return node.className.includes("line-through");
  }

  it("does not strike a moved step, whose words did not go anywhere", () => {
    mountWith({
      runDiff: diff({
        entries: [
          entry({
            change: "moved",
            base_location: "Línea 3",
            compare_location: "Línea 2",
            base_text: "ordena la lista",
            compare_text: "ordena la lista",
            description: "El mismo paso, ahora se ejecuta en otro punto.",
            detail: null,
          }),
        ],
      }),
    });

    expect(struck("ordena la lista")).toBe(false);
  });

  it("does not strike a changed step whose wording stayed put", () => {
    mountWith({
      runDiff: diff({
        entries: [
          entry({ base_text: "ordena la lista", compare_text: "ordena la lista" }),
        ],
      }),
    });

    expect(struck("ordena la lista")).toBe(false);
  });

  it("strikes a removed step, which really is gone", () => {
    mountWith({
      runDiff: diff({
        entries: [
          entry({
            change: "removed",
            compare_text: null,
            compare_location: null,
            compare_line_number: null,
            description: "Se eliminó este paso.",
            detail: null,
          }),
        ],
      }),
    });

    expect(struck("ordena por cuenta")).toBe(true);
  });

  it("strikes only the replaced half of a rewrite", () => {
    mountWith({ runDiff: diff() });

    expect(struck("ordena por cuenta")).toBe(true);
    expect(struck("ordena por longitud")).toBe(false);
  });
});

describe("every change kind renders", () => {
  // The suite previously rendered only `changed` and `added`, so a mutation
  // erasing a removed step's text entirely survived both suites.
  const KINDS = ["changed", "added", "removed", "moved", "reworded", "unchanged"] as const;

  it.each(KINDS)("shows the student's words and the backend's sentence for %s", (change) => {
    mountWith({
      runDiff: diff({
        summary: { changed: 0, added: 0, removed: 0, moved: 0, reworded: 0, unchanged: 0, [change]: 1 },
        entries: [entry({ change, description: `sentencia-${change}` })],
      }),
    });

    expect(screen.getByText(`sentencia-${change}`)).toBeDefined();
    expect(screen.getByText("ordena por cuenta")).toBeDefined();
  });
});

describe("states other than success", () => {
  it("reports an error instead of an empty comparison", () => {
    mountWith({ runDiff: null, runDiffError: "Could not compare those runs." });

    expect(screen.getByText("Could not compare those runs.")).toBeDefined();
  });

  it("survives a classification this build has never heard of", () => {
    // `change` is unvalidated JSON; a newer backend may classify differently.
    mountWith({
      runDiff: diff({
        entries: [entry({ change: "reordered" as RunDiffEntry["change"] })],
      }),
    });

    expect(screen.getByText("Este paso ahora hace algo diferente.")).toBeDefined();
  });
});

describe("accessibility", () => {
  it("is a labelled modal dialog with a reachable close control", () => {
    mountWith({ runDiff: diff() });

    expect(screen.getByRole("dialog", { name: "Run comparison" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Close comparison" })).toBeDefined();
  });

  it("marks each change with a glyph as well as a colour", () => {
    // Colour alone fails greyscale and the most common colour blindness.
    const { container } = mountWith({ runDiff: diff() });

    // Scoped to the row: the header carries its own decorative arrow.
    const glyph = container.querySelector('li [aria-hidden="true"]');
    expect(glyph?.textContent).toBe("~");
  });
});
