import { describe, expect, it } from "vitest";
import type { RunSummary } from "@/lib/api/types";
import {
  changeTone,
  orderForComparison,
  shortRunLabel,
  toggleRunSelection,
} from "./run-compare";

/*
 * Choosing two runs. The rule that matters most is ordering: the backend
 * phrases every sentence as a change *from* base *to* compare, so reversing the
 * pair produces a fluent, coherent, exactly wrong story -- additions reported as
 * deletions and back again. That is worse than an error, because it reads as an
 * answer.
 */

function runAt(id: string, timestamp: string): RunSummary {
  return { id, timestamp, status: "success" };
}

const OLDER = runAt("older", "2026-08-17T10:00:00");
const NEWER = runAt("newer", "2026-08-17T10:05:00");

describe("toggleRunSelection", () => {
  it("selects and deselects", () => {
    expect(toggleRunSelection([], "a")).toEqual(["a"]);
    expect(toggleRunSelection(["a"], "a")).toEqual([]);
    expect(toggleRunSelection(["a"], "b")).toEqual(["a", "b"]);
  });

  it("slides the window forward on a third pick instead of refusing it", () => {
    // Refusing would be the obvious alternative and it is worse: the click does
    // nothing visible, which reads as a broken button.
    expect(toggleRunSelection(["a", "b"], "c")).toEqual(["b", "c"]);
  });

  it("deselects the older of two without disturbing the other", () => {
    expect(toggleRunSelection(["a", "b"], "a")).toEqual(["b"]);
  });

  it("does not mutate the array it was given", () => {
    const selected = ["a", "b"];
    toggleRunSelection(selected, "c");
    expect(selected).toEqual(["a", "b"]);
  });
});

describe("orderForComparison", () => {
  it("puts the older run first however it was selected", () => {
    const runs = [NEWER, OLDER];

    expect(orderForComparison(["newer", "older"], runs)).toEqual({
      baseId: "older",
      compareId: "newer",
    });
    expect(orderForComparison(["older", "newer"], runs)).toEqual({
      baseId: "older",
      compareId: "newer",
    });
  });

  it("falls back to selection order when timestamps tie", () => {
    // Run history is written with second precision, so two runs a moment apart
    // genuinely share a timestamp.
    const sameSecond = [runAt("a", "2026-08-17T10:00:00"), runAt("b", "2026-08-17T10:00:00")];

    expect(orderForComparison(["b", "a"], sameSecond)).toEqual({
      baseId: "b",
      compareId: "a",
    });
  });

  it("falls back to selection order when a timestamp is unparseable", () => {
    const broken = [runAt("a", "not-a-date"), NEWER];

    expect(orderForComparison(["a", "newer"], broken)).toEqual({
      baseId: "a",
      compareId: "newer",
    });
  });

  it("returns null unless exactly two runs are selected", () => {
    expect(orderForComparison([], [OLDER, NEWER])).toBeNull();
    expect(orderForComparison(["older"], [OLDER, NEWER])).toBeNull();
  });

  it("returns null when a selected run is no longer in the list", () => {
    // The runs array is replaced whenever any run finishes, so a selection can
    // outlive the thing it points at.
    expect(orderForComparison(["older", "vanished"], [OLDER, NEWER])).toBeNull();
  });
});

describe("changeTone", () => {
  it("gives added and removed the colours those meanings already have", () => {
    expect(changeTone("added").text).toContain("success");
    expect(changeTone("removed").text).toContain("blocked");
  });

  it("keeps reworded neutral, because it is the nothing-happened case", () => {
    // Colouring it would make a non-event look like news.
    expect(changeTone("reworded").text).toContain("muted");
  });

  it("distinguishes every kind by glyph as well as colour", () => {
    const glyphs = ["changed", "added", "removed", "moved", "reworded", "unchanged"].map(
      (kind) => changeTone(kind).glyph,
    );

    expect(new Set(glyphs).size).toBe(glyphs.length);
  });

  it("renders an unknown classification plainly rather than throwing", () => {
    // `change` is unvalidated JSON from the backend.
    expect(changeTone("something-new").glyph).toBe("=");
  });
});

describe("shortRunLabel", () => {
  it("shortens an id", () => {
    expect(shortRunLabel("4af8676057da46ffa7aab12f45fdbcb6")).toBe("#4af86760");
  });

  it("handles a missing id", () => {
    expect(shortRunLabel(null)).toBe("—");
    expect(shortRunLabel(undefined)).toBe("—");
  });
});
