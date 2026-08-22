// @vitest-environment jsdom
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { cleanup, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import {
  AlgorithmsInk,
  CustomizeInk,
  InterfaceInk,
  PlotInk,
  PrimitivesInk,
  ProblemSolvingInk,
  ProgramCreationInk,
  StartCodingInk,
  type InkIllustrationProps,
} from "./index";
import { inkCurve, inkEllipse, inkLine, inkPath } from "./ink";

/*
 * These drawings replaced 15MB of screenshots, and three things about them are
 * load-bearing rather than decorative:
 *
 *   - they take their colour from tokens, so both themes are one code path;
 *   - they are named for a screen reader, because a picture on a marketing page
 *     is still content;
 *   - their geometry is deterministic, because they render on the server and
 *     again on the client and React compares the two.
 *
 * A regression in any of those is invisible in a screenshot of the light theme
 * on the machine that made the change, which is exactly why it is here.
 */

const ILLUSTRATIONS: Array<[string, (props: InkIllustrationProps) => ReactElement]> = [
  ["ProgramCreationInk", ProgramCreationInk],
  ["InterfaceInk", InterfaceInk],
  ["ProblemSolvingInk", ProblemSolvingInk],
  ["PlotInk", PlotInk],
  ["CustomizeInk", CustomizeInk],
  ["PrimitivesInk", PrimitivesInk],
  ["AlgorithmsInk", AlgorithmsInk],
  ["StartCodingInk", StartCodingInk],
];

afterEach(cleanup);

function renderSvg(Illustration: (props: InkIllustrationProps) => ReactElement) {
  const { container } = render(<Illustration />);
  const svg = container.querySelector("svg");
  if (!svg) throw new Error("the illustration rendered no <svg>");
  return svg;
}

describe.each(ILLUSTRATIONS)("%s", (_name, Illustration) => {
  it("is announced as an image with a title", () => {
    const svg = renderSvg(Illustration);

    expect(svg.getAttribute("role")).toBe("img");
    // An untitled role="img" is a hole in the page for anyone not looking at it.
    expect(svg.querySelector("title")?.textContent?.trim().length ?? 0).toBeGreaterThan(10);
  });

  it("scales with its box rather than to a pixel size", () => {
    const svg = renderSvg(Illustration);

    expect(svg.getAttribute("viewBox")).toMatch(/^0 0 \d+ \d+$/);
    expect(svg.getAttribute("width")).toBeNull();
    expect(svg.getAttribute("height")).toBeNull();
  });

  it("draws in currentColor and the accent token, never a literal colour", () => {
    const svg = renderSvg(Illustration);

    for (const element of svg.querySelectorAll("[stroke], [fill]")) {
      for (const attribute of ["stroke", "fill"]) {
        const value = element.getAttribute(attribute);
        if (value === null) continue;
        expect(
          value === "none" || value === "currentColor" || value.startsWith("var(--"),
          `${attribute}="${value}" is not a token`,
        ).toBe(true);
      }
    }
  });

  it("hides its shading from the accessibility tree", () => {
    const svg = renderSvg(Illustration);

    // Every drawing shades with hatching, and none of the hatching is subject.
    expect(svg.querySelectorAll('g[aria-hidden="true"]').length).toBeGreaterThan(0);
  });

  it("goes silent when it is marked decorative", () => {
    const { container } = render(<Illustration decorative />);
    const svg = container.querySelector("svg");
    if (!svg) throw new Error("the illustration rendered no <svg>");

    // Both halves matter. aria-hidden alone still leaves a <title> for a tree
    // walker to find, and dropping the title alone leaves an unnamed
    // role="img" -- which some screen readers announce as "image", i.e. worse
    // than either. Decorative has to mean the drawing is not there at all.
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.getAttribute("role")).toBeNull();
    expect(svg.querySelector("title")).toBeNull();
  });

  it("renders identical geometry twice, so hydration has nothing to argue with", () => {
    const first = renderSvg(Illustration).innerHTML;
    cleanup();
    const second = renderSvg(Illustration).innerHTML;

    expect(second).toBe(first);
  });
});

describe("the ink primitives", () => {
  it("are seeded, not random", () => {
    expect(inkLine([0, 0], [10, 10], 7)).toBe(inkLine([0, 0], [10, 10], 7));
    expect(inkEllipse(5, 5, 4, 3, 7)).toBe(inkEllipse(5, 5, 4, 3, 7));
    expect(inkLine([0, 0], [10, 10], 7)).not.toBe(inkLine([0, 0], [10, 10], 8));
  });

  it("gives inkPath a corner at each point and inkCurve a bend through it", () => {
    const points = [
      [0, 0],
      [10, -10],
      [20, 0],
    ] as const;

    // Same three points, two different instruments: the polyline turns at the
    // apex and the curve carries its tangent through it. Confusing them is what
    // turned every arc in the first draft into a chevron.
    expect(inkPath(points, 3)).not.toBe(inkCurve(points, 3));
    expect(inkCurve(points, 3).match(/C/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
  });
});

describe("the illustration sources", () => {
  // From the repo root, not from `import.meta.url`: this file declares the
  // jsdom environment, and under jsdom `import.meta.url` is an http URL rather
  // than a file one. Vitest runs with cwd at the project root.
  const directory = path.join(process.cwd(), "src/components/illustrations");
  const sources = readdirSync(directory).filter(
    (file) => /\.tsx?$/.test(file) && !file.endsWith(".test.tsx"),
  );

  it.each(sources)("%s contains no hardcoded colour", (file) => {
    const source = readFileSync(path.join(directory, file), "utf8");
    const stripped = source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|[^:])\/\/.*$/gm, "$1");

    // The repo-wide invariant: outside tokens.css, colour is always a var().
    // An SVG is the easiest place to break it, because a hex in path markup
    // looks like part of the drawing rather than like a colour decision.
    expect(stripped).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(stripped).not.toMatch(/\b(?:rgba?|hsla?)\s*\(/);
  });
});
