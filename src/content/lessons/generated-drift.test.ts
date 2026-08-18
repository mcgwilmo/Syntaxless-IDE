import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadTab } from "../../../scripts/build-lessons.mjs";
import { LESSONS_BY_TAB } from "./generated";
import {
  EXAMPLE_MODES,
  TAB_IDS,
  type Example,
  type ExampleMode,
  type Lesson,
  type TabId,
} from "./lesson-schema";

/*
 * generated.ts must say what the YAML says.
 *
 * The lesson content exists twice: as YAML, which is what a human writes and
 * what a reviewer reads in a diff, and as generated.ts, which is what the
 * bundler actually ships to a student. The build keeps them in step, but the
 * generated half is committed, so nothing stops the two from parting company:
 * edit a lesson and push without running `npm run build:lessons`, or take the
 * shortcut of fixing a typo directly in generated.ts, and the app serves one
 * lesson while the reviewed source says another. Neither half looks wrong on
 * its own -- that is what makes it survive review.
 *
 * So this test compiles the real YAML in this directory the same way the build
 * does, by importing loadTab from the build script rather than reimplementing
 * it, and holds the committed file against the result.
 *
 * The tab list, the lesson counts, and the ordered lesson ids are written out
 * literally instead of being read back from either side. Both halves agreeing
 * is not the same as both halves being right: a deleted lesson that was
 * deleted from the YAML and rebuilt is still a deleted lesson, and lesson ids
 * address deep links, so a rename that both halves agree on still breaks every
 * saved URL pointing at it. Changing those lists is meant to be deliberate.
 *
 * The per-lesson outline tests exist for readability. A whole-tab deep equal
 * is the assertion that catches everything, but its diff is thousands of lines
 * of lesson prose; the outlines fail first and name the lesson that drifted.
 */

const REPO_ROOT = path.resolve(fileURLToPath(new URL("../../../", import.meta.url)));

/** The build script resolves its content root against its own location, so this
 * reads the same YAML no matter where the runner's working directory is. */
async function compileTab(tab: TabId): Promise<Lesson[]> {
  return (await loadTab(tab)) as Lesson[];
}

const REBUILD = "run `npm run build:lessons` and commit the result";

/** Transcribed from the YAML filenames and their `id` fields, in `number` order. */
const EXPECTED_LESSON_IDS: Record<TabId, string[]> = {
  operators: [
    "variables",
    "data-types",
    "numbers",
    "strings",
    "booleans",
    "operators",
    "lists-and-list-operations",
    "tuples-and-tuple-operations",
    "sets-and-set-operations",
    "dictionaries-and-dictionary-operations",
    "if-else-logic",
    "case-or-match-logic",
    "while-loops",
    "for-loops",
    "functions",
    "range",
    "types-of-errors",
    "try-except",
    "oop",
  ],
  "data-structures-algorithms": [
    "linked-list",
    "doubly-linked-list",
    "hash-table",
    "undirected-graph",
    "directed-graph",
    "directed-acyclic-graph",
    "heap",
    "sorting-algorithms",
    "greedy-algorithms",
    "dynamic-programming",
  ],
};

/**
 * Everything about a lesson except its prose: the identifiers a deep link uses
 * and the shape of each example. Small enough that a failed diff is readable,
 * specific enough that a missing topic or a dropped line shows up in it.
 */
function outline(lesson: Lesson) {
  return {
    id: lesson.id,
    number: lesson.number,
    title: lesson.title,
    topics: lesson.topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      examples: topic.examples.map((example) => ({
        id: example.id,
        lines: lineCounts(example),
      })),
    })),
  };
}

function lineCounts(example: Example): Record<ExampleMode, number> {
  const counts = {} as Record<ExampleMode, number>;
  for (const mode of EXAMPLE_MODES) counts[mode] = example[mode].length;
  return counts;
}

describe("the lists this suite iterates are not empty", () => {
  // Each of these drives a describe.each or a for-of below. An empty one does
  // not fail anything -- it deletes tests silently, and the suite still reports
  // green with nothing left in it.
  it("has tabs to check", () => {
    expect(TAB_IDS.length, "TAB_IDS is empty, so every per-tab test below vanished").toBeGreaterThan(0);
  });

  it("has example modes to compare", () => {
    expect(
      EXAMPLE_MODES.length,
      "EXAMPLE_MODES is empty, so lineCounts compares {} to {} and the outline " +
        "test stops checking example bodies",
    ).toBeGreaterThan(0);
  });

  it.each(TAB_IDS)("has expected lesson ids for %s", (tab) => {
    expect(
      EXPECTED_LESSON_IDS[tab]?.length,
      `EXPECTED_LESSON_IDS["${tab}"] is empty, so the per-lesson tests for that ` +
        `track vanished. It should list every lesson id in the track, in number order.`,
    ).toBeGreaterThan(0);
  });
});

const COMPILED = Object.fromEntries(
  await Promise.all(TAB_IDS.map(async (tab) => [tab, await compileTab(tab)] as const)),
) as Record<TabId, Lesson[]>;

describe("generated.ts is still the file the build would write", () => {
  const source = readFileSync(path.join(REPO_ROOT, "src/content/lessons/generated.ts"), "utf8");

  const BANNER =
    "the banner is written by the `banner` template in scripts/build-lessons.mjs. " +
    "Do not hand-edit it back in -- if it is missing, generated.ts was edited by " +
    `hand or written by something else, so ${REBUILD}.`;

  it("opens with the line that stops people editing it", () => {
    expect(
      source.split("\n")[0],
      `generated.ts no longer opens with its DO-NOT-EDIT line, which is the only ` +
        `thing telling the next reader their edits get overwritten. ${BANNER}`,
    ).toBe("// GENERATED FILE -- DO NOT EDIT.");
  });

  it("points a reader at the source of truth and the script", () => {
    const header = source.slice(0, source.indexOf("import type"));

    expect(
      header,
      `the header no longer names the script that writes generated.ts, so a reader ` +
        `who wants to change a lesson cannot tell what to run. ${BANNER}`,
    ).toContain("scripts/build-lessons.mjs");
    expect(
      header,
      `the header no longer tells the reader to edit the YAML, which is the ` +
        `instruction that keeps the two halves in step. ${BANNER}`,
    ).toContain("Edit the YAML instead");
  });

  it("covers exactly the tabs the schema declares", () => {
    // A tab missing here is a whole track of lessons the app cannot show; an
    // extra one is content nothing renders.
    expect(
      Object.keys(LESSONS_BY_TAB).sort(),
      `the tabs in generated.ts do not match TAB_IDS in lesson-schema.ts. A tab in ` +
        `the schema but not here is a track the app cannot show; a tab here but not ` +
        `in the schema is content nothing renders. Add the tab to TABS in ` +
        `scripts/build-lessons.mjs and to TAB_IDS, then ${REBUILD}.`,
    ).toEqual([...TAB_IDS].sort());
  });
});

describe.each(TAB_IDS)("%s", (tab) => {
  const generated = LESSONS_BY_TAB[tab];
  const compiled = COMPILED[tab];
  const expectedIds = EXPECTED_LESSON_IDS[tab];

  it("has the lessons this track is supposed to have, in order", () => {
    expect(
      generated.map((lesson) => lesson.id),
      `generated.ts has the wrong lessons for "${tab}". If a lesson was added, ` +
        `removed, or renamed on purpose, update EXPECTED_LESSON_IDS here -- ` +
        `renaming an id breaks every saved deep link to it.`,
    ).toEqual(expectedIds);
  });

  it("was built from every YAML file in the directory", () => {
    expect(
      compiled.map((lesson) => lesson.id),
      `the YAML in src/content/lessons/${tab} no longer matches EXPECTED_LESSON_IDS ` +
        `in this test. Update the list if the change was intended.`,
    ).toEqual(expectedIds);
  });

  it("stores lessons in ascending number order", () => {
    // The Learning Center walks this array as-is, so array order is the order
    // a student sees. `number` is what the build sorts by.
    const numbers = generated.map((lesson) => lesson.number);
    expect(
      numbers,
      `the lessons in generated.ts for "${tab}" are not in ascending \`number\` ` +
        `order, so the Learning Center would list them out of order. The build ` +
        `sorts by \`number\`, so this means generated.ts was hand-edited -- ${REBUILD}.`,
    ).toEqual([...numbers].sort((a, b) => a - b));
  });

  describe.each(expectedIds.map((id, index) => [index + 1, id] as const))(
    "lesson %i (%s)",
    (_position, id) => {
      it("matches the YAML, topic for topic and example for example", () => {
        const fromGenerated = generated.find((lesson) => lesson.id === id);
        const fromYaml = compiled.find((lesson) => lesson.id === id);

        expect(fromGenerated, `"${id}" is missing from generated.ts -- ${REBUILD}`).toBeDefined();
        expect(fromYaml, `"${id}" is missing from src/content/lessons/${tab}`).toBeDefined();

        expect(
          outline(fromGenerated as Lesson),
          `"${id}" drifted: generated.ts and the YAML disagree about its ` +
            `title, topics, examples, or how many lines a mode has. ${REBUILD}.`,
        ).toEqual(outline(fromYaml as Lesson));
      });

      it("matches the YAML word for word", () => {
        const fromGenerated = generated.find((lesson) => lesson.id === id);
        const fromYaml = compiled.find((lesson) => lesson.id === id);

        // The outline above compares structure; this compares the prose a
        // student actually reads -- overview, definition, howAndWhy, and the
        // text of every line of every mode.
        expect(
          fromGenerated,
          `the text of "${id}" differs between generated.ts and its YAML. ` +
            `The YAML is the source of truth: ${REBUILD}.`,
        ).toEqual(fromYaml);
      });
    },
  );

  it("agrees with the YAML across the whole track", () => {
    // The catch-all. The per-lesson tests above name the lesson that moved;
    // this one also fails if a lesson appears in one half only, or if the two
    // halves hold the same lessons in a different order.
    expect(
      generated,
      `generated.ts is out of date for "${tab}". It is built from the YAML in ` +
        `src/content/lessons/${tab}, so do not edit it by hand -- ${REBUILD}.`,
    ).toEqual(compiled);
  });
});
