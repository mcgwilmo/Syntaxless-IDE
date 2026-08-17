import { describe, expect, it } from "vitest";
import type { InterpretationLine } from "@/lib/api/types";
import type { ProblemAlignmentLineNotice } from "../types";
import {
  buildActionableDiagnostics,
  extractSuggestedReplacement,
  getSeverity,
  normalizeLineNumber,
  resolveInterpretationLines,
} from "./index";

/*
 * The layer between "what the backend said" and "what the student reads".
 *
 * Two failure modes matter more than the rest, and neither announces itself:
 *
 *   - Pointing at the wrong line. A diagnostic on line 4 that belongs to line 7
 *     is worse than no diagnostic, because the student trusts it and edits the
 *     wrong code.
 *   - Offering to apply a fix that is not a fix. `extractSuggestedReplacement`
 *     parses a code fragment out of English prose, and whatever it returns can
 *     be written straight into the student's buffer by one click.
 */

function line(overrides: Partial<InterpretationLine> = {}): InterpretationLine {
  return {
    line_number: null,
    raw: "print hello",
    type: "valid",
    valid: true,
    message: "Interpreted this line.",
    ...overrides,
  };
}

describe("normalizeLineNumber", () => {
  it("accepts a line inside the document", () => {
    expect(normalizeLineNumber(3, 10)).toBe(3);
  });

  it("rejects a line past the end rather than clamping to it", () => {
    // Clamping would silently move the diagnostic to the last line, which
    // reads as a real answer. null lets the caller say "unmapped".
    expect(normalizeLineNumber(11, 10)).toBeNull();
  });

  it.each([0, -1, -100])("rejects %i as a line number", (value) => {
    expect(normalizeLineNumber(value, 10)).toBeNull();
  });

  it.each([null, undefined, NaN, Infinity, -Infinity])(
    "rejects %p rather than coercing it",
    (value) => {
      expect(normalizeLineNumber(value as number, 10)).toBeNull();
    }
  );

  it("truncates a fractional line number toward zero", () => {
    expect(normalizeLineNumber(3.9, 10)).toBe(3);
  });

  it("rejects everything when the document is empty", () => {
    expect(normalizeLineNumber(1, 0)).toBeNull();
  });
});

describe("getSeverity", () => {
  it("treats invalid as blocked regardless of type", () => {
    expect(getSeverity(line({ valid: false, type: "valid" }))).toBe("blocked");
  });

  it("reports a warning when the line is still valid", () => {
    expect(getSeverity(line({ type: "warning" }))).toBe("warning");
  });

  it("reports ok otherwise", () => {
    expect(getSeverity(line())).toBe("ok");
  });
});

describe("resolveInterpretationLines", () => {
  const document = "make a list called numbers\nprint the numbers\nprint the numbers";

  it("trusts an explicit line number", () => {
    const [resolved] = resolveInterpretationLines(document, [
      line({ line_number: 2, raw: "print the numbers" }),
    ]);

    expect(resolved.resolvedLineNumber).toBe(2);
  });

  it("falls back to matching the raw text when there is no line number", () => {
    const [resolved] = resolveInterpretationLines(document, [
      line({ raw: "print the numbers" }),
    ]);

    expect(resolved.resolvedLineNumber).toBe(2);
  });

  it("gives duplicate lines distinct numbers instead of stacking them", () => {
    // Both diagnostics say "print the numbers". Without the moving search
    // cursor they would both land on line 2 and line 3 would look clean.
    const resolved = resolveInterpretationLines(document, [
      line({ raw: "print the numbers" }),
      line({ raw: "print the numbers" }),
    ]);

    expect(resolved.map((item) => item.resolvedLineNumber)).toEqual([2, 3]);
  });

  it("ignores leading and trailing whitespace when matching", () => {
    const [resolved] = resolveInterpretationLines("  print hello  ", [
      line({ raw: "print hello" }),
    ]);

    expect(resolved.resolvedLineNumber).toBe(1);
  });

  it("wraps backwards rather than giving up once the cursor has moved past", () => {
    const resolved = resolveInterpretationLines("alpha\nbeta", [
      line({ raw: "beta" }),
      line({ raw: "alpha" }),
    ]);

    expect(resolved.map((item) => item.resolvedLineNumber)).toEqual([2, 1]);
  });

  it("returns null when the text is nowhere in the document", () => {
    const [resolved] = resolveInterpretationLines(document, [
      line({ raw: "something the student deleted" }),
    ]);

    expect(resolved.resolvedLineNumber).toBeNull();
  });

  it("returns null for a blank raw line rather than matching a blank line", () => {
    const [resolved] = resolveInterpretationLines("alpha\n\nbeta", [line({ raw: "   " })]);

    expect(resolved.resolvedLineNumber).toBeNull();
  });

  it("handles CRLF documents", () => {
    const [resolved] = resolveInterpretationLines("alpha\r\nbeta", [line({ raw: "beta" })]);

    expect(resolved.resolvedLineNumber).toBe(2);
  });

  it("discards an out-of-range line number and falls back to matching", () => {
    const [resolved] = resolveInterpretationLines(document, [
      line({ line_number: 99, raw: "print the numbers" }),
    ]);

    expect(resolved.resolvedLineNumber).toBe(2);
  });

  it("preserves the original fields", () => {
    const [resolved] = resolveInterpretationLines(document, [
      line({ line_number: 1, message: "kept", assumptions: ["a"] }),
    ]);

    expect(resolved.message).toBe("kept");
    expect(resolved.assumptions).toEqual(["a"]);
  });
});

describe("extractSuggestedReplacement", () => {
  it("returns null when there is no suggested fix", () => {
    expect(extractSuggestedReplacement("print x", null)).toBeNull();
    expect(extractSuggestedReplacement("print x", "   ")).toBeNull();
  });

  it("pulls the replacement out of a 'replace with' instruction", () => {
    expect(
      extractSuggestedReplacement("print x", 'Replace this line with: `print the numbers`')
    ).toBe("print the numbers");
  });

  it("pulls the replacement out of a 'use' instruction", () => {
    expect(extractSuggestedReplacement("print x", 'Use "print the total".')).toBe(
      "print the total"
    );
  });

  it("falls back to the first quoted fragment", () => {
    expect(
      extractSuggestedReplacement("print x", "Try naming it `scores` so the sort works.")
    ).toBe("scores");
  });

  it("strips a trailing period so the applied line is not punctuated prose", () => {
    expect(extractSuggestedReplacement("print x", "Use `print the numbers`.")).toBe(
      "print the numbers"
    );
  });

  it("refuses a replacement identical to the line it would replace", () => {
    // Offering "Apply line" that changes nothing is a dead button.
    expect(extractSuggestedReplacement("print x", "Use `print x`")).toBeNull();
  });

  it("ignores the surrounding whitespace of the line when comparing", () => {
    expect(extractSuggestedReplacement("   print x   ", "Use `print x`")).toBeNull();
  });

  it("refuses a multi-line replacement", () => {
    // The action rewrites exactly one line; a multi-line value would corrupt
    // the document around it.
    expect(
      extractSuggestedReplacement("print x", 'Replace with: "first line\nsecond line"')
    ).toBeNull();
  });

  it("refuses a replacement longer than 180 characters", () => {
    const long = "a".repeat(181);
    expect(extractSuggestedReplacement("print x", `Use \`${long}\``)).toBeNull();
  });

  it("accepts a replacement of exactly 180 characters", () => {
    const atLimit = "a".repeat(180);
    expect(extractSuggestedReplacement("print x", `Use \`${atLimit}\``)).toBe(atLimit);
  });

  it("returns null when the prose carries no quoted or prefixed fragment", () => {
    expect(
      extractSuggestedReplacement("print x", "Consider being more specific here.")
    ).toBeNull();
  });
});

describe("buildActionableDiagnostics", () => {
  const base = {
    activeTier: "pro" as const,
    currentFilePath: "main.synth",
    mode: "standard" as const,
    problemIssues: [],
    problemLineNotices: [],
  };

  function build(overrides: Partial<Parameters<typeof buildActionableDiagnostics>[0]> = {}) {
    return buildActionableDiagnostics({
      ...base,
      resolvedInterpretationLines: [],
      ...overrides,
    });
  }

  it("returns nothing for a document with no lines", () => {
    expect(build()).toEqual([]);
  });

  it("orders blocked before warning before ok", () => {
    const diagnostics = build({
      resolvedInterpretationLines: [
        { ...line({ raw: "c" }), resolvedLineNumber: 3 },
        { ...line({ raw: "b", valid: false }), resolvedLineNumber: 2 },
        { ...line({ raw: "a", type: "warning" }), resolvedLineNumber: 1 },
      ],
    });

    expect(diagnostics.map((item) => item.severity)).toEqual(["blocked", "warning", "ok"]);
  });

  it("orders by line number within the same severity", () => {
    const diagnostics = build({
      resolvedInterpretationLines: [
        { ...line({ raw: "b", valid: false }), resolvedLineNumber: 9 },
        { ...line({ raw: "a", valid: false }), resolvedLineNumber: 2 },
      ],
    });

    expect(diagnostics.map((item) => item.lineNumber)).toEqual([2, 9]);
  });

  it("sorts unmapped diagnostics last within their severity", () => {
    const diagnostics = build({
      resolvedInterpretationLines: [
        { ...line({ raw: "a", valid: false }), resolvedLineNumber: null },
        { ...line({ raw: "b", valid: false }), resolvedLineNumber: 4 },
      ],
    });

    expect(diagnostics.map((item) => item.lineNumber)).toEqual([4, null]);
  });

  it("offers 'Go to line' only when the line actually resolved", () => {
    const [mapped] = build({
      resolvedInterpretationLines: [{ ...line(), resolvedLineNumber: 1 }],
    });
    const [unmapped] = build({
      resolvedInterpretationLines: [{ ...line(), resolvedLineNumber: null }],
    });

    expect(mapped.actions.map((a) => a.kind)).toContain("go_to_line");
    expect(unmapped.actions.map((a) => a.kind)).not.toContain("go_to_line");
  });

  it("never offers to apply a fix to a line it could not locate", () => {
    // The action carries a lineNumber; without one there is nothing to write to.
    const [unmapped] = build({
      resolvedInterpretationLines: [
        {
          ...line({ suggested_fix: "Use `print the numbers`" }),
          resolvedLineNumber: null,
        },
      ],
    });

    expect(unmapped.actions.map((a) => a.kind)).not.toContain("replace_line");
  });

  it("carries the parsed replacement on the apply action", () => {
    const [diagnostic] = build({
      resolvedInterpretationLines: [
        {
          ...line({ raw: "print x", suggested_fix: "Use `print the numbers`" }),
          resolvedLineNumber: 1,
        },
      ],
    });
    const apply = diagnostic.actions.find((a) => a.kind === "replace_line");

    expect(apply).toMatchObject({ lineNumber: 1, nextText: "print the numbers" });
  });

  it("suggests a looser mode only when something is wrong", () => {
    const [ok] = build({
      mode: "strict",
      resolvedInterpretationLines: [{ ...line(), resolvedLineNumber: 1 }],
    });

    expect(ok.actions.map((a) => a.kind)).not.toContain("switch_mode");
  });

  it("suggests Standard from strict when the tier allows it", () => {
    const [blocked] = build({
      mode: "strict",
      resolvedInterpretationLines: [{ ...line({ valid: false }), resolvedLineNumber: 1 }],
    });

    expect(blocked.actions).toContainEqual(
      expect.objectContaining({ kind: "switch_mode", mode: "standard" })
    );
  });

  it("never suggests a mode the student's tier cannot reach", () => {
    // Free is strict-only. Offering "Try Standard" would send them into a
    // paywall from an error message.
    const [blocked] = build({
      activeTier: "free",
      mode: "strict",
      resolvedInterpretationLines: [{ ...line({ valid: false }), resolvedLineNumber: 1 }],
    });

    expect(blocked.actions.map((a) => a.kind)).not.toContain("switch_mode");
  });

  it("suggests Abstraction from standard", () => {
    const [blocked] = build({
      mode: "standard",
      resolvedInterpretationLines: [{ ...line({ valid: false }), resolvedLineNumber: 1 }],
    });

    expect(blocked.actions).toContainEqual(
      expect.objectContaining({ kind: "switch_mode", mode: "abstraction" })
    );
  });

  it("gathers assumptions and unresolved slots into the explanation", () => {
    const [diagnostic] = build({
      resolvedInterpretationLines: [
        {
          ...line({
            assumptions: ["assumed you meant numbers"],
            unresolved_slots: ["how many"],
          }),
          resolvedLineNumber: 1,
        },
      ],
    });

    expect(diagnostic.explanation).toContain("Assumption: assumed you meant numbers");
    expect(diagnostic.explanation).toContain("Needs detail: how many");
  });

  it("gives every diagnostic a distinct id", () => {
    const diagnostics = build({
      resolvedInterpretationLines: [
        { ...line({ raw: "a" }), resolvedLineNumber: null },
        { ...line({ raw: "b" }), resolvedLineNumber: null },
      ],
    });

    expect(new Set(diagnostics.map((d) => d.id)).size).toBe(2);
  });

  it("falls back to a message when the backend sent none", () => {
    const [diagnostic] = build({
      resolvedInterpretationLines: [{ ...line({ message: "" }), resolvedLineNumber: 1 }],
    });

    expect(diagnostic.message).not.toBe("");
  });

  it("puts problem notices ahead of language diagnostics of lower severity", () => {
    const diagnostics = build({
      problemLineNotices: [
        {
          kind: "logic_mismatch",
          message: "This does not sort.",
          line_number: 2,
        } satisfies ProblemAlignmentLineNotice,
      ],
      resolvedInterpretationLines: [{ ...line({ raw: "a" }), resolvedLineNumber: 1 }],
    });

    expect(diagnostics[0].source).toBe("problem");
  });

  it("does not repeat a problem issue that is already a line notice", () => {
    const notice: ProblemAlignmentLineNotice = {
      kind: "logic_mismatch",
      message: "Same text.",
      line_number: 2,
    };
    const diagnostics = build({
      problemLineNotices: [notice],
      problemIssues: [{ ...notice }],
    });

    expect(diagnostics.filter((d) => d.source === "problem")).toHaveLength(1);
  });
});
