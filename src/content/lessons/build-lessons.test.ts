import { describe, expect, it } from "vitest";
import {
  validateLesson as validateLessonJs,
  validateTab as validateTabJs,
} from "../../../scripts/build-lessons.mjs";
import { EXAMPLE_MODES, type Lesson } from "./lesson-schema";

/*
 * Proof that the lesson validator can say no.
 *
 * scripts/build-lessons.mjs is the entire safety net between a typo in a YAML
 * file and a student reading a broken lesson. It runs before every dev run and
 * every build, and it is the reason nobody proofreads generated.ts by hand. But
 * a check nobody has ever watched reject anything is indistinguishable from a
 * function that returns quietly, and it fails in the direction nobody notices:
 * green, while `topics: []` or an example missing its pseudocode walks into the
 * bundle.
 *
 * This project has made that argument twice already -- the backend's
 * tests/test_no_free_names.py plants a bug to prove its detector sees it, and
 * scripts/check-contrast.mjs is gated in CI because a green check that cannot
 * fail is worse than no check, since it also stops anyone looking.
 *
 * So every case below breaks exactly one field of an otherwise valid fixture
 * and asserts two separate things: that validateLesson throws, and that the
 * message names the field. Both halves matter. The build prints that message
 * and nothing else, so "is not a valid lesson" with no field named sends the
 * author hunting through 300 lines of YAML.
 *
 * The positive controls at the bottom are what keep the rest honest: a
 * validator that rejected everything would pass every rejection test above it.
 */

/*
 * The script runs in plain Node before the build, so it carries no types and
 * the import arrives untyped. Restating the signature against Lesson is the
 * point of the split described in lesson-schema.ts -- the types describe the
 * shape, the script enforces it -- and this file is where the halves meet.
 */
const validateLesson = validateLessonJs as unknown as (
  raw: unknown,
  file: string,
) => Lesson;
const validateTab = validateTabJs as unknown as (
  lessons: Lesson[],
  tab: string,
) => void;

const FILE = "src/content/lessons/operators/01-variables.yaml";

type Node = Record<string, unknown>;

/*
 * One small valid lesson, cloned fresh for every case and broken in exactly one
 * place. Isolating the break is what makes a failure readable: if the message
 * is missing the field name, there is only one field it could be about.
 */
const VALID_EXAMPLE: Node = {
  id: "variable-names-example",
  strict: [
    "Initialize a variable called score.",
    "Make score equal 95.",
    "Print score.",
  ],
  standard: ["Set a variable called score to 95.", "Print score."],
  abstraction: ["Print a variable score that equals 95."],
  pseudocode: ["SET score TO 95", "PRINT score"],
};

const VALID_TOPIC: Node = {
  id: "variable-names",
  title: "Variable names",
  definition:
    "A variable name is the label used to refer to stored information.",
  howAndWhy:
    "Use a name that says what the value is for, so later steps read as prose.",
  examples: [VALID_EXAMPLE],
};

const VALID_LESSON: Node = {
  id: "variables",
  number: 1,
  title: "Variables",
  overview:
    "Variables let a program keep track of information by giving it a name.",
  topics: [VALID_TOPIC],
};

/** Addresses a nested field the way an error message does: "topics.0.examples.0.strict". */
function locate(root: Node, path: string): [Node, string] {
  const keys = path.split(".");
  const leaf = keys.pop() as string;
  let node = root;
  for (const key of keys) node = node[key] as Node;
  return [node, leaf];
}

function apply(root: Node, fields: Record<string, unknown>): Node {
  for (const [path, value] of Object.entries(fields)) {
    const [holder, key] = locate(root, path);
    holder[key] = value;
  }
  return root;
}

/** The fixture with the named fields replaced. */
function lessonWith(fields: Record<string, unknown>): Node {
  return apply(structuredClone(VALID_LESSON), fields);
}

/** The fixture with one field replaced. */
function withField(path: string, value: unknown): Node {
  return lessonWith({ [path]: value });
}

/** The fixture with one field deleted outright -- the "I forgot it" mistake. */
function withoutField(path: string): Node {
  const lesson = structuredClone(VALID_LESSON);
  const [holder, key] = locate(lesson, path);
  delete holder[key];
  return lesson;
}

function topicWith(fields: Record<string, unknown>): Node {
  return apply(structuredClone(VALID_TOPIC), fields);
}

function exampleWith(fields: Record<string, unknown>): Node {
  return apply(structuredClone(VALID_EXAMPLE), fields);
}

/** A lesson that has already been through validateLesson, ready for validateTab. */
function validated(fields: Record<string, unknown>): Lesson {
  return validateLesson(lessonWith(fields), FILE);
}

/** Runs `attempt`, insists it threw, and hands back the message the build prints. */
function rejectionMessage(attempt: () => unknown, accepted: string): string {
  let thrown: unknown;
  try {
    attempt();
  } catch (error) {
    thrown = error;
  }

  expect(thrown, accepted).toBeInstanceOf(Error);
  return (thrown as Error).message;
}

const LESSON_ACCEPTED =
  "validateLesson accepted broken content. The rule that used to catch this is gone -- " +
  "restore it in scripts/build-lessons.mjs, or the next build hands this to a student.";

const TAB_ACCEPTED =
  "validateTab accepted colliding ids. Topic and example ids address deep links, so a " +
  "collision silently sends a student to the wrong place -- restore the check.";

/*
 * Problems are reported as "  - <problem>" bullets under a header naming the
 * file. Matching the bullet rather than a bare substring is what keeps these
 * assertions honest: "id must be a non-empty string" is a substring of
 * "topics[0].id must be a non-empty string" and of "lesson id must be a
 * non-empty string", so a plain toContain would still pass if a rule started
 * pointing at the wrong field or lost its exact wording.
 */
function bullet(problem: string): string {
  return `\n  - ${problem}`;
}

function expectRejected(lesson: unknown, expected: string): void {
  const message = rejectionMessage(() => validateLesson(lesson, FILE), LESSON_ACCEPTED);

  expect(
    message,
    `Rejected, but no line of the report reads "${expected}". The build prints this message ` +
      "and nothing else, so it has to name the field the author is supposed to fix -- and " +
      "name that exact field, not a parent or a neighbour of it.",
  ).toContain(bullet(expected));
}

function expectTabRejected(lessons: Lesson[], expected: string): void {
  const message = rejectionMessage(() => validateTab(lessons, "operators"), TAB_ACCEPTED);

  expect(
    message,
    `Rejected, but no line of the report reads "${expected}", so it does not tell the author ` +
      "which two lessons to reconcile.",
  ).toContain(bullet(expected));
}

describe("a file that is not a lesson at all", () => {
  it.each([
    ["an empty file, which YAML parses as null", null],
    ["a bare string", "id: variables"],
    ["a number", 7],
  ])("rejects %s", (_case, raw) => {
    expectRejected(raw, "the file must contain a mapping");
  });

  it("rejects a top-level list, naming its missing fields rather than its shape", () => {
    // `typeof [] === "object"`, so a list slips past the mapping guard and is
    // caught one layer down by the field checks instead. Still rejected, which
    // is what matters; asserting what it actually says keeps this test honest
    // about the diagnostic being less direct than the others.
    expectRejected([{ id: "variables" }], "id must be a non-empty string");
  });
});

describe("text that has to be there", () => {
  it.each<[string, unknown, string]>([
    ["the lesson id is missing", withoutField("id"), "id must be a non-empty string"],
    ["the lesson id is empty", withField("id", ""), "id must be a non-empty string"],
    ["the title is missing", withoutField("title"), "title must be a non-empty string"],
    [
      "the title is only whitespace",
      withField("title", "   "),
      "title must be a non-empty string",
    ],
    [
      "the overview is missing",
      withoutField("overview"),
      "overview must be a non-empty string",
    ],
    [
      "the overview is empty",
      withField("overview", ""),
      "overview must be a non-empty string",
    ],
    [
      "a topic has no id",
      withoutField("topics.0.id"),
      "topics[0].id must be a non-empty string",
    ],
    [
      "a topic has no title",
      withoutField("topics.0.title"),
      "topics[0].title must be a non-empty string",
    ],
    [
      "a topic has no definition",
      withField("topics.0.definition", ""),
      "topics[0].definition must be a non-empty string",
    ],
    [
      "a topic has no howAndWhy",
      withoutField("topics.0.howAndWhy"),
      "topics[0].howAndWhy must be a non-empty string",
    ],
    [
      "an example has no id",
      withoutField("topics.0.examples.0.id"),
      "topics[0].examples[0].id must be a non-empty string",
    ],
  ])("rejects when %s", (_case, lesson, expected) => {
    expectRejected(lesson, expected);
  });
});

describe("ids that are not lowercase-hyphen slugs", () => {
  // Ids are URLs in disguise: topic ids address deep links, so anything a
  // browser would escape or a reader would mistype has to be refused at build
  // time rather than shipped and worked around later.
  it.each(["variable names", "Variables", "variable_names", "-variables", "variables-", "variables--names", "variables!"])(
    'rejects the lesson id "%s"',
    (id) => {
      expectRejected(
        withField("id", id),
        `id must be lowercase words joined by hyphens (got "${id}")`,
      );
    },
  );

  it("rejects a topic id that is not a slug, naming the topic", () => {
    expectRejected(
      withField("topics.0.id", "Base Case"),
      'topics[0].id must be lowercase words joined by hyphens (got "Base Case")',
    );
  });

  it("rejects an example id that is not a slug, naming the example", () => {
    expectRejected(
      withField("topics.0.examples.0.id", "example_1"),
      'topics[0].examples[0].id must be lowercase words joined by hyphens (got "example_1")',
    );
  });
});

describe("the lesson number", () => {
  // The number is what orders the track -- filenames are only a convenience --
  // so a missing or nonsensical one silently reshuffles the curriculum.
  it.each<[string, unknown]>([
    ["is missing", withoutField("number")],
    ["is zero", withField("number", 0)],
    ["is negative", withField("number", -3)],
    ["is fractional", withField("number", 1.5)],
    ["is quoted in the YAML, so it arrives as a string", withField("number", "1")],
    ["is null", withField("number", null)],
  ])("rejects a lesson whose number %s", (_case, lesson) => {
    expectRejected(lesson, "number must be a whole number of 1 or more");
  });
});

describe("topics and examples that are not there", () => {
  it.each<[string, unknown, string]>([
    ["topics is missing", withoutField("topics"), "topics must have at least one topic"],
    ["topics is empty", withField("topics", []), "topics must have at least one topic"],
    [
      "topics is a string instead of a list",
      withField("topics", "see the section below"),
      "topics must have at least one topic",
    ],
    [
      "topics is a mapping instead of a list",
      withField("topics", { "variable-names": {} }),
      "topics must have at least one topic",
    ],
    [
      "a topic has no examples key",
      withoutField("topics.0.examples"),
      "topics[0].examples must have at least one example",
    ],
    [
      "a topic has an empty examples list",
      withField("topics.0.examples", []),
      "topics[0].examples must have at least one example",
    ],
    [
      "a topic's examples is not a list",
      withField("topics.0.examples", "coming soon"),
      "topics[0].examples must have at least one example",
    ],
  ])("rejects when %s", (_case, lesson, expected) => {
    expectRejected(lesson, expected);
  });
});

describe("the list this suite iterates is not empty", () => {
  // EXAMPLE_MODES drives the describe.each below, and it is imported rather
  // than written out here, so it can shrink from somewhere else. An empty or
  // shortened list does not fail anything -- it deletes those cases silently
  // and the file still reports green with the modes no longer checked.
  it("has example modes to break", () => {
    expect(
      EXAMPLE_MODES.length,
      "EXAMPLE_MODES in lesson-schema.ts is empty, so the per-mode cases below vanished " +
        "and nothing here checks that an example carries its four renderings any more.",
    ).toBeGreaterThan(0);
  });

  it("agrees with the modes the build script enforces", () => {
    // The script cannot import these types, so it keeps its own copy of the
    // list. If the two drift, the build enforces one set of modes while the
    // app's type declares another, and this file would test the wrong ones.
    const enforced = Object.keys(
      validateLesson(structuredClone(VALID_LESSON), FILE).topics[0].examples[0],
    ).filter((key) => key !== "id");

    expect(
      enforced.sort(),
      "the modes scripts/build-lessons.mjs validates are no longer the modes EXAMPLE_MODES " +
        "declares. Add the mode to both -- to EXAMPLE_MODES in lesson-schema.ts and to " +
        "EXAMPLE_MODES in the script -- or the build accepts an example the app cannot render.",
    ).toEqual([...EXAMPLE_MODES].sort());
  });
});

describe.each([...EXAMPLE_MODES])("the %s mode", (mode) => {
  // Every example must carry all four renderings. The contrast between them is
  // the teaching idea, so an example missing one is not a smaller lesson, it is
  // a broken one -- the student toggles a mode and gets a blank panel.
  const path = `topics.0.examples.0.${mode}`;
  const where = `topics[0].examples[0].${mode}`;

  it("is rejected when the example omits it entirely", () => {
    expectRejected(
      withoutField(path),
      `${where} must be a list of lines, or an indented block`,
    );
  });

  it("is rejected when it is an empty list", () => {
    expectRejected(withField(path, []), `${where} must have at least one line`);
  });

  it.each<[string, unknown]>([
    ["written as an empty string", ""],
    ["written as a block holding only whitespace", "   \n\t\n"],
    ["written as a list whose every line is blank", ["", "   "]],
  ])("is rejected when it is %s", (_case, value) => {
    // The hole this closes: asLines turns "" into [""], which is one line, so
    // the empty-list rule above never saw it. `strict: ""` shipped an example
    // whose strict panel was a single blank line -- which reads to a student as
    // the app being broken, not the lesson being unfinished.
    expectRejected(
      withField(path, value),
      `${where} must have at least one line with text on it`,
    );
  });

  it("is rejected when a line is not a string", () => {
    // A bare number in the YAML -- `- 95` rather than `- Print 95.` -- is the
    // realistic version of this, and it would otherwise reach the renderer as
    // a non-string and break it there instead of here.
    expectRejected(withField(path, ["Set score to 95.", 95]), `${where}[1] must be a string`);
  });
});

describe("the message the author actually reads", () => {
  it("names the file, so the author knows which one to open", () => {
    const message = rejectionMessage(
      () => validateLesson(withoutField("id"), FILE),
      LESSON_ACCEPTED,
    );

    expect(
      message,
      "The report names the broken field but not the file it is in. There are 29 lesson " +
        "files; the build prints nothing else, so the header has to say which one to open.",
    ).toContain(`${FILE} is not a valid lesson`);
  });

  it("reports every problem at once, not just the first", () => {
    // Failing fast would be correct and useless: it would make fixing a newly
    // authored lesson a sequence of one-error build runs.
    const lesson = lessonWith({
      number: 0,
      "topics.0.id": "Base Case",
      "topics.0.examples.0.pseudocode": [],
    });

    const message = rejectionMessage(() => validateLesson(lesson, FILE), LESSON_ACCEPTED);

    for (const expected of [
      "number must be a whole number of 1 or more",
      'topics[0].id must be lowercase words joined by hyphens (got "Base Case")',
      "topics[0].examples[0].pseudocode must have at least one line",
    ]) {
      expect(
        message,
        "Three fields are broken but the report stopped early. Collect the problems and " +
          "throw once, so one build run tells the author everything to fix.",
      ).toContain(bullet(expected));
    }
  });
});

describe("validateTab: collisions no single file can see", () => {
  // validateLesson checks one file in isolation, so uniqueness is necessarily
  // validateTab's job. Topic and example ids are deep-link addresses: a
  // collision does not crash anything, it just sends a student somewhere else.
  const alpha = validated({
    id: "alpha",
    number: 1,
    "topics.0.id": "alpha-topic",
    "topics.0.examples.0.id": "alpha-example",
  });
  const beta = validated({
    id: "beta",
    number: 2,
    "topics.0.id": "beta-topic",
    "topics.0.examples.0.id": "beta-example",
  });

  it("accepts two lessons that share nothing", () => {
    // Without this, a validateTab that threw unconditionally would pass every
    // rejection test in this block.
    expect(
      () => validateTab([alpha, beta], "operators"),
      "validateTab rejected two lessons with no id, number, topic or example in common. " +
        "It now fails the build on valid content, which is the failure nobody can work around.",
    ).not.toThrow();
  });

  it("rejects two lessons with the same id", () => {
    const clash = validated({
      id: "alpha",
      number: 2,
      "topics.0.id": "beta-topic",
      "topics.0.examples.0.id": "beta-example",
    });

    expectTabRejected([alpha, clash], 'two lessons share the id "alpha"');
  });

  it("rejects two lessons with the same number", () => {
    const clash = validated({
      id: "beta",
      number: 1,
      "topics.0.id": "beta-topic",
      "topics.0.examples.0.id": "beta-example",
    });

    expectTabRejected([alpha, clash], 'lessons "alpha" and "beta" are both number 1');
  });

  it("rejects two lessons whose topics share an id", () => {
    const clash = validated({
      id: "beta",
      number: 2,
      "topics.0.id": "alpha-topic",
      "topics.0.examples.0.id": "beta-example",
    });

    expectTabRejected(
      [alpha, clash],
      'topic id "alpha-topic" is used by both "alpha" and "beta"',
    );
  });

  it("rejects one lesson whose two topics share an id", () => {
    // validateLesson never compares a lesson's topics with each other, so this
    // collision -- both topics inside one file -- is only ever caught here.
    const doubled = validated({
      id: "alpha",
      number: 1,
      "topics.0.id": "alpha-topic",
      "topics.0.examples.0.id": "alpha-example",
      "topics.1": topicWith({
        id: "alpha-topic",
        "examples.0.id": "second-example",
      }),
    });

    expectTabRejected([doubled], 'topic id "alpha-topic" is used by both');
  });

  it("rejects two topics whose examples share an id", () => {
    const clash = validated({
      id: "beta",
      number: 2,
      "topics.0.id": "beta-topic",
      "topics.0.examples.0.id": "alpha-example",
    });

    expectTabRejected(
      [alpha, clash],
      'example id "alpha-example" is used by both "alpha-topic" and "beta-topic"',
    );
  });

  it("rejects one topic whose two examples share an id", () => {
    // The copy-paste mistake: duplicate an example inside a topic and forget to
    // rename it. Like the doubled topic above, no single field is malformed, so
    // validateLesson has nothing to object to -- only the tab-wide sweep sees it.
    const doubled = validated({
      id: "alpha",
      number: 1,
      "topics.0.id": "alpha-topic",
      "topics.0.examples": [
        exampleWith({ id: "alpha-example" }),
        exampleWith({ id: "alpha-example" }),
      ],
    });

    expectTabRejected([doubled], 'example id "alpha-example" is used by both');
  });

  it("names the tab, since the ids alone do not say which track they are in", () => {
    const message = rejectionMessage(() => validateTab([alpha, alpha], "operators"), TAB_ACCEPTED);

    expect(
      message,
      "The report names the colliding ids but not the tab. Both tracks have lessons, topics " +
        "and examples, so without the tab the author does not know which directory to open.",
    ).toContain('tab "operators" has conflicts');
  });
});

describe("the positive control", () => {
  // Without these, a validateLesson that threw on everything would pass every
  // test above and this file would be worth nothing.
  it("accepts a well-formed lesson and returns its content intact", () => {
    const intact =
      "validateLesson changed the lesson on its way through. It compiles content into " +
      "generated.ts verbatim, so anything it rewrites here is what a student reads.";
    const lesson = validateLesson(structuredClone(VALID_LESSON), FILE);

    expect(lesson.id, intact).toBe("variables");
    expect(lesson.number, intact).toBe(1);
    expect(lesson.title, intact).toBe("Variables");
    expect(lesson.topics, intact).toHaveLength(1);
    expect(lesson.topics[0].id, intact).toBe("variable-names");
    expect(lesson.topics[0].examples[0].pseudocode, intact).toEqual([
      "SET score TO 95",
      "PRINT score",
    ]);
  });

  it("accepts an indented block and splits it into lines", () => {
    // The README offers two ways to write a mode, a list or a `|` block, and
    // promises they produce the same thing. A trailing newline must not become
    // a blank final line -- that renders as a gap in the middle of a program.
    const lesson = validateLesson(
      withField(
        "topics.0.examples.0.strict",
        "Set score to 95.\r\nPrint score.\n\n",
      ),
      FILE,
    );

    expect(
      lesson.topics[0].examples[0].strict,
      "a `|` block no longer produces the same lines a list would. If a trailing newline " +
        "became a blank final line, every block-form example renders with a gap at the end " +
        "of the program; if the block form throws, the README is now lying about it.",
    ).toEqual(["Set score to 95.", "Print score."]);
  });

  it("keeps a blank line that separates two blocks of a program", () => {
    // The counterweight to the blank-mode rule above. Rejecting a mode that is
    // *entirely* blank must not become rejecting -- or silently stripping -- a
    // blank line used to separate a setup from a loop, which several examples
    // rely on to be readable.
    const lesson = validateLesson(
      withField("topics.0.examples.0.strict", [
        "Initialize a variable called score.",
        "",
        "Print score.",
      ]),
      FILE,
    );

    expect(
      lesson.topics[0].examples[0].strict,
      "a blank line inside a program was rejected or dropped. It is how an example separates " +
        "setup from the steps that follow; only an all-blank mode is meant to be refused.",
    ).toEqual(["Initialize a variable called score.", "", "Print score."]);
  });

  it("keeps only the fields the Lesson type declares", () => {
    // generated.ts assigns an object literal to Record<TabId, Lesson[]>, and
    // TypeScript's excess property check applies to nested literals. A stray
    // YAML key carried through would fail the typecheck of a generated file
    // nobody edits, which is a confusing place to find out about a typo.
    const lesson = validateLesson(
      lessonWith({
        author: "dani",
        "topics.0.examples.0.psuedocode": ["a misspelled mode"],
      }),
      FILE,
    );

    const leaked =
      "a YAML key the Lesson type does not declare was carried into the compiled lesson. " +
      "generated.ts assigns an object literal to Record<TabId, Lesson[]>, and TypeScript's " +
      "excess property check reaches nested literals, so this fails `tsc` inside a generated " +
      "file nobody edits. Build the output field by field rather than spreading the raw YAML.";

    expect(Object.keys(lesson).sort(), leaked).toEqual([
      "id",
      "number",
      "overview",
      "title",
      "topics",
    ]);
    expect(Object.keys(lesson.topics[0].examples[0]).sort(), leaked).toEqual([
      "abstraction",
      "id",
      "pseudocode",
      "standard",
      "strict",
    ]);
  });
});
