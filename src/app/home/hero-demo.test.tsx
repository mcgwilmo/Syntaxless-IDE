// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HeroDemo } from "./hero-demo";
import { HERO_DEMOS } from "./hero-demo-data";

/*
 * Two different kinds of test live here, and only one of them is about React.
 *
 * The first kind is a transcription check. The landing page claims these exact
 * strings are what the compiler produces and what the produced code prints, so
 * the strings are pinned here character for character, independently of the
 * data module. If someone "improves" a line -- drops the indent, reflows the
 * list, changes the spacing inside the brackets -- this suite says so, because
 * the failure being guarded against is not a crash, it is the page quietly
 * starting to lie. A real compiler change is meant to fail these: regenerate
 * hero-demo-data.ts from the pipeline, then update these expectations to
 * whatever the pipeline actually emitted.
 *
 * The second kind is the behaviour: run reveals output, switching examples does
 * not leave one program's answer under another's code, and reduced motion is
 * honoured.
 */

function setReducedMotion(reduced: boolean) {
  // jsdom has no matchMedia at all, so this is the definition as well as the
  // override.
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: reduced && query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

beforeEach(() => {
  setReducedMotion(false);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("the verified transcript", () => {
  it("carries exactly the two programs the pipeline generated", () => {
    expect(HERO_DEMOS.map((demo) => demo.id)).toEqual(["sort", "foreach"]);
  });

  it("transcribes the sort demo character for character", () => {
    const sort = HERO_DEMOS[0];

    expect(sort.english).toEqual([
      "create a list of numbers 5, 3, 8, 1",
      "sort the list",
      "print the list",
    ]);
    expect(sort.python).toEqual([
      "numbers = [5, 3, 8, 1]",
      "numbers.sort()",
      "print(numbers)",
    ]);
    expect(sort.stdout).toEqual(["[1, 3, 5, 8]"]);
  });

  it("transcribes the loop demo character for character, indent included", () => {
    const foreach = HERO_DEMOS[1];

    expect(foreach.english).toEqual([
      "create a list of numbers 1, 2, 3",
      "for each number in the list",
      "    print the number",
    ]);
    expect(foreach.python).toEqual([
      "numbers = [1, 2, 3]",
      "for number in numbers:",
      "    print(number)",
    ]);
    expect(foreach.stdout).toEqual(["1", "2", "3"]);

    // Stated separately because it is the detail most likely to be tidied away
    // by an editor, a formatter, or a helpful hand: the compiler needs the
    // four spaces, so the demo shows the four spaces.
    expect(foreach.english[2].startsWith("    ")).toBe(true);
    expect(foreach.python[2].startsWith("    ")).toBe(true);
  });
});

describe("HeroDemo", () => {
  it("shows the first program's English and Python before anything is pressed", () => {
    render(<HeroDemo onGetStarted={() => {}} getStartedLabel="Write your own" />);

    expect(screen.getByText("numbers = [5, 3, 8, 1]")).toBeDefined();
    expect(screen.getByText("sort the list")).toBeDefined();
    // The output has not been claimed yet, because nothing has been run.
    expect(screen.queryByText("[1, 3, 5, 8]")).toBeNull();
  });

  it("does not offer a text box the visitor could type into", () => {
    // The English pane looks like the editor. If it ever becomes focusable or
    // caret-bearing without becoming real, the page is promising an input that
    // does nothing.
    const { container } = render(
      <HeroDemo onGetStarted={() => {}} getStartedLabel="Write your own" />
    );

    expect(container.querySelectorAll("input, textarea")).toHaveLength(0);
    expect(container.querySelectorAll("[contenteditable]")).toHaveLength(0);
  });

  it("reveals the real output when Run is pressed, one line at a time", () => {
    vi.useFakeTimers();
    render(<HeroDemo onGetStarted={() => {}} getStartedLabel="Write your own" />);

    fireEvent.click(screen.getByRole("button", { name: /run/i }));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("[1, 3, 5, 8]")).toBeDefined();
    expect(screen.getByRole("button", { name: /run again/i })).toBeDefined();
  });

  it("announces the finished output once, rather than a line at a time", () => {
    vi.useFakeTimers();
    render(<HeroDemo onGetStarted={() => {}} getStartedLabel="Write your own" />);

    fireEvent.click(screen.getByRole("button", { name: /run/i }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByRole("status").textContent).toBe(
      "Verified output: [1, 3, 5, 8]"
    );
  });

  it("with reduced motion, output is there without a stagger", () => {
    setReducedMotion(true);
    vi.useFakeTimers();
    render(<HeroDemo onGetStarted={() => {}} getStartedLabel="Write your own" />);

    fireEvent.click(screen.getByRole("button", { name: /run/i }));

    // No timers advanced: the reveal must not depend on any of them.
    expect(screen.getByRole("status").textContent).toBe(
      "Verified output: [1, 3, 5, 8]"
    );
    expect(screen.getByText("[1, 3, 5, 8]")).toBeDefined();
  });

  it("switches programs and clears the previous program's output", () => {
    vi.useFakeTimers();
    render(<HeroDemo onGetStarted={() => {}} getStartedLabel="Write your own" />);

    fireEvent.click(screen.getByRole("button", { name: /run/i }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    fireEvent.click(screen.getByRole("tab", { name: "Loop over a list" }));

    expect(screen.getByText("for number in numbers:")).toBeDefined();
    expect(screen.queryByText("[1, 3, 5, 8]")).toBeNull();
    expect(screen.getByRole("status").textContent).toBe("");

    fireEvent.click(screen.getByRole("button", { name: /^run$/i }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByRole("status").textContent).toBe(
      "Verified output: 1, 2, 3"
    );
  });

  it("moves between examples with the arrow keys", () => {
    render(<HeroDemo onGetStarted={() => {}} getStartedLabel="Write your own" />);

    const first = screen.getByRole("tab", { name: "Sort a list" });
    expect(first.getAttribute("aria-selected")).toBe("true");

    fireEvent.keyDown(first, { key: "ArrowRight" });

    expect(
      screen.getByRole("tab", { name: "Loop over a list" }).getAttribute("aria-selected")
    ).toBe("true");
  });

  it("gives the panel a tab stop, since nothing inside it has one", () => {
    render(<HeroDemo onGetStarted={() => {}} getStartedLabel="Write your own" />);

    const panel = screen.getByRole("tabpanel");

    // Everything in the panel is read-only text. Without a stop of its own the
    // tab order skips from the switcher to Run to the footer and never enters
    // the demo, which leaves a keyboard reader choosing between two examples
    // they are never given a way to read.
    expect(panel.getAttribute("tabindex")).toBe("0");
    expect(
      panel.querySelectorAll("a, button, input, select, textarea, [tabindex]").length
    ).toBe(0);
  });

  it("routes to the real product", () => {
    const onGetStarted = vi.fn();
    render(
      <HeroDemo onGetStarted={onGetStarted} getStartedLabel="Write your own" />
    );

    fireEvent.click(screen.getByRole("button", { name: "Write your own" }));

    expect(onGetStarted).toHaveBeenCalledTimes(1);
  });
});
