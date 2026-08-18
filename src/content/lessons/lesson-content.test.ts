import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadTab } from "../../../scripts/build-lessons.mjs";
import {
  EXAMPLE_MODES,
  TAB_IDS,
  type Example,
  type Lesson,
  type TabId,
  type Topic,
} from "./lesson-schema";

/*
 * What the 29 shipped lessons must be true of, beyond what the build checks.
 *
 * scripts/build-lessons.mjs already refuses malformed content: a missing field,
 * an id that is not a slug, a lesson with no topics, an example missing one of
 * the four modes, two lessons in a tab sharing an id or a number. None of that
 * is retested here. What is tested here is the other failure -- content that is
 * perfectly well-formed and still wrong:
 *
 *   - the build rejects duplicate lesson numbers but never notices a missing
 *     one, so deleting lesson 7 ships a track that counts 6, 8, 9
 *   - ordering comes from the `number` field, so renaming a file leaves the
 *     directory listing a human reads disagreeing with the order a student sees
 *   - id collisions are caught per tab, but topic and example ids are deep-link
 *     addresses across the whole app, so a collision between the two tabs sends
 *     a student to the wrong lesson and nothing fails
 *   - `asLines` counts "   " as a line, so a mode can pass "at least one line"
 *     while being blank on screen
 *   - and the one that looks fine to every other check: four renderings that
 *     are byte-identical. The contrast between them *is* the lesson. Four copies
 *     of one sentence is a topic that teaches nothing, and it validates, it
 *     typechecks, and it renders.
 *
 * Everything is read from the YAML through loadTab rather than listed here, so
 * lesson 30 is covered the day it is written instead of the day someone
 * remembers this file exists.
 */

/** This test file sits in the content root, so the tracks are its neighbours. */
const CONTENT_ROOT = dirname(fileURLToPath(import.meta.url));

/*
 * Read through the build's own loader rather than through generated.ts, so a
 * stale committed artifact cannot make broken YAML look fine here. Annotating
 * the result is also the one place the build's untyped output is held against
 * the app's schema.
 */
const LESSONS = {} as Record<TabId, Lesson[]>;
for (const tab of TAB_IDS) LESSONS[tab] = await loadTab(tab);

/** The three that are English. `pseudocode` is a different register entirely. */
const PROSE_MODES = ["strict", "standard", "abstraction"] as const;

/** The shape `requireId` enforces -- so, what a title looks like when it is the id. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * A track may grow. It must not quietly shrink: deleting the *last* lesson of a
 * track leaves 1..n-1, which is still contiguous and still passes every other
 * check here. Lower these only alongside a deliberate removal.
 */
const MINIMUM_LESSONS: Record<TabId, number> = {
  operators: 19,
  "data-structures-algorithms": 10,
};

/*
 * Known content debt.
 *
 * These lists are not exemptions from the rules below -- they are those rules'
 * to-do list. Every entry is content that already shipped and is already wrong.
 * The assertions compare against them *exactly*, in both directions, so a new
 * offender fails and so does an entry whose content has since been fixed. The
 * ledger cannot outlive the bug it records.
 */

/**
 * Examples whose strict, standard and abstraction columns are the same
 * sentences three times over, so the lesson's central contrast is absent.
 * All of them are in operators 2-4, which suggests one authoring session.
 */
const IDENTICAL_RENDERINGS = [
  "common-data-types-example",
  "why-type-matters-example",
  "integers-and-decimals-example",
  "numeric-operations-example",
  "creating-strings-example",
  "string-length-example",
  "indexing-example",
  "slicing-strings-example",
  "concatenation-example",
  "repetition-example",
  "changing-case-example",
  "removing-extra-spaces-example",
  "replacing-text-example",
  "searching-inside-strings-example",
  "starts-with-and-ends-with-example",
  "splitting-strings-example",
  "joining-strings-example",
  "formatting-strings-example",
];

/** Prose modes holding a line that stops without punctuation, as `exampleId:mode`. */
const UNPUNCTUATED_PROSE = ["assign-multiple-values-example:standard"];

/** Words that mean "not written yet" and must never reach a student. */
const PLACEHOLDERS = [
  /\bTODO\b/i,
  /\bTBD\b/i,
  /\bFIXME\b/i,
  /\bWIP\b/i,
  /\bXXX\b/,
  /\?\?\?/,
  /lorem ipsum/i,
  /coming soon/i,
  /\bfill (?:this|me) in\b/i,
  /\bdummy text\b/i,
];

type Placed = { topic: Topic; example: Example };

function examplesIn(lesson: Lesson): Placed[] {
  return lesson.topics.flatMap((topic) =>
    topic.examples.map((example) => ({ topic, example }))
  );
}

/** Every string a student can read, paired with a name for the failure message. */
function readableText(lesson: Lesson): Array<[string, string]> {
  const texts: Array<[string, string]> = [
    [`${lesson.id} title`, lesson.title],
    [`${lesson.id} overview`, lesson.overview],
  ];
  for (const topic of lesson.topics) {
    texts.push(
      [`${topic.id} title`, topic.title],
      [`${topic.id} definition`, topic.definition],
      [`${topic.id} howAndWhy`, topic.howAndWhy]
    );
    for (const example of topic.examples) {
      for (const mode of EXAMPLE_MODES) {
        texts.push([`${example.id} ${mode}`, example[mode].join("\n")]);
      }
    }
  }
  return texts;
}

/** Which of the four renderings are byte-identical to each other. */
function repeatedRenderings(example: Example): string[] {
  const clashes: string[] = [];
  for (let i = 0; i < EXAMPLE_MODES.length; i += 1) {
    for (let j = i + 1; j < EXAMPLE_MODES.length; j += 1) {
      const one = example[EXAMPLE_MODES[i]].join("\n");
      const other = example[EXAMPLE_MODES[j]].join("\n");
      if (one === other) clashes.push(`${EXAMPLE_MODES[i]}/${EXAMPLE_MODES[j]}`);
    }
  }
  return clashes;
}

/** Ids that appear twice, reported as the two places that claim them. */
function collisions(entries: Array<[id: string, where: string]>): string[] {
  const firstSeen = new Map<string, string>();
  const clashes: string[] = [];
  for (const [id, where] of entries) {
    const already = firstSeen.get(id);
    if (already) clashes.push(`"${id}" is claimed by both ${already} and ${where}`);
    else firstSeen.set(id, where);
  }
  return clashes;
}

function lessonCases(tab: TabId): Array<[string, Lesson]> {
  return LESSONS[tab].map((lesson) => [lesson.id, lesson]);
}

const EVERY_LESSON = TAB_IDS.flatMap((tab) =>
  LESSONS[tab].map((lesson) => ({ tab, lesson }))
);

describe("the tracks themselves", () => {
  it("has a directory for every tab the app can show, and no others", () => {
    // A third list of tabs lives in build-lessons.mjs. It is not exported, so
    // this compares the two that are reachable: the app's TabId union and the
    // directories on disk. A track the app has no id for is unreachable
    // content; an id with no directory is a tab that renders empty.
    const directories = readdirSync(CONTENT_ROOT, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    expect(
      directories,
      "a track directory with no TabId is content no student can reach, and a " +
        "TabId with no directory renders an empty tab. Add the tab to TAB_IDS " +
        "in lesson-schema.ts and to TABS in scripts/build-lessons.mjs, or " +
        "delete the directory."
    ).toEqual([...TAB_IDS].sort());
  });
});

describe.each(TAB_IDS)("%s", (tab) => {
  const lessons = LESSONS[tab];
  const files = readdirSync(join(CONTENT_ROOT, tab))
    .filter((name) => name.endsWith(".yaml"))
    .sort();
  const byNumber = new Map(lessons.map((lesson) => [lesson.number, lesson]));

  describe("the track's shape", () => {
    it("numbers its lessons 1..n with nothing missing", () => {
      // The build rejects a repeated number and accepts a hole. A hole is what
      // a deleted or renumbered lesson leaves behind, and the student sees a
      // list that skips.
      const numbers = lessons.map((lesson) => lesson.number).sort((a, b) => a - b);
      const contiguous = Array.from({ length: lessons.length }, (_, i) => i + 1);

      expect(
        numbers,
        `${tab} must run 1..${lessons.length} with no gaps. Renumber the ` +
          "lessons whose `number` field is now wrong -- ordering comes from " +
          "that field, so a gap is a lesson a student never reaches in order."
      ).toEqual(contiguous);
    });

    it("has not lost a lesson", () => {
      expect(
        lessons.length,
        `${tab} shipped ${MINIMUM_LESSONS[tab]} lessons and now has ` +
          `${lessons.length}. If a lesson was removed on purpose, lower ` +
          "MINIMUM_LESSONS; otherwise restore the missing file."
      ).toBeGreaterThanOrEqual(MINIMUM_LESSONS[tab]);
    });

    it("keeps nothing in the directory but lesson files", () => {
      // Not `files.length === lessons.length`: loadTab builds exactly one
      // lesson per `*.yaml` in this same directory, so that comparison is the
      // same number twice and cannot fail. The failure that is real is the
      // other one -- a file the loader's filter skips. `05-booleans.yml`,
      // `05-booleans.yaml.bak`, `05-booleans copy.yaml`: each parses, each
      // looks like a lesson in the diff, and none of them ever reaches a
      // student, because `.endsWith(".yaml")` is the only thing that decides.
      const strays = readdirSync(join(CONTENT_ROOT, tab), { withFileTypes: true })
        // A dotfile is the editor's or the OS's, not the author's.
        .filter((entry) => !entry.name.startsWith("."))
        .filter((entry) => !(entry.isFile() && entry.name.endsWith(".yaml")))
        .map((entry) => entry.name);

      expect(
        strays,
        `${tab} holds entries the build ignores. scripts/build-lessons.mjs ` +
          "loads only files ending .yaml, so anything else here is a lesson no " +
          "student can reach. Rename it to NN-slug.yaml or delete it."
      ).toEqual([]);

      // `files` drives the per-file it.each below, and an empty list there
      // deletes those tests rather than failing them.
      expect(
        files.length,
        `${tab} has no .yaml files, so every filename test below vanished ` +
          "silently rather than failing."
      ).toBeGreaterThanOrEqual(MINIMUM_LESSONS[tab]);
    });
  });

  describe("filenames agree with the lessons inside them", () => {
    it.each(files)("%s", (file) => {
      const named = /^(\d{2,})-([a-z0-9]+(?:-[a-z0-9]+)*)\.yaml$/.exec(file);

      expect(
        named,
        `${file} must be named NN-slug.yaml, zero-padded, e.g. 07-recursion.yaml.`
      ).not.toBeNull();
      if (!named) return;

      const number = Number(named[1]);
      const lesson = byNumber.get(number);

      expect(
        lesson,
        `${file} sits at position ${number} in the directory listing, but no ` +
          `lesson in ${tab} has \`number: ${number}\`. Ordering comes from the ` +
          "field, so the listing a human reads and the order a student gets " +
          "have drifted. Rename the file or fix the field."
      ).toBeDefined();
      if (!lesson) return;

      expect(
        named[2],
        `${file} contains the lesson "${lesson.id}". Rename it ` +
          `${named[1]}-${lesson.id}.yaml so the id can be found by scanning ` +
          "the directory."
      ).toBe(lesson.id);
    });
  });

  describe("every lesson", () => {
    it.each(lessonCases(tab))("%s introduces itself in prose", (_id, lesson) => {
      const title = lesson.title.trim();
      const overview = lesson.overview.trim();

      expect(
        lesson.title,
        `${lesson.id} title has whitespace around it, which shows in the lesson list.`
      ).toBe(title);
      expect(
        SLUG.test(title),
        `${lesson.id} title is "${title}", which is the id pasted into the ` +
          "title field. Write the human name of the lesson."
      ).toBe(false);
      expect(
        title.length,
        `${lesson.id} title is too short to name anything.`
      ).toBeGreaterThanOrEqual(3);

      expect(
        overview.length,
        `${lesson.id} overview is ${overview.length} characters. The overview ` +
          "is the only thing shown before the topics; it needs to be a real " +
          "sentence about what the lesson is for."
      ).toBeGreaterThanOrEqual(40);
      expect(
        overview.split(/\s+/).length,
        `${lesson.id} overview is too few words to introduce a lesson.`
      ).toBeGreaterThanOrEqual(8);
      expect(
        /[.!?]$/.test(overview),
        `${lesson.id} overview stops without punctuation, so it was probably ` +
          `truncated: "...${overview.slice(-40)}"`
      ).toBe(true);
      expect(
        overview.toLowerCase(),
        `${lesson.id} overview only restates the title. Say what the lesson is for.`
      ).not.toBe(title.toLowerCase());
    });

    it.each(lessonCases(tab))("%s explains each of its topics", (_id, lesson) => {
      // The build guarantees these fields are non-empty strings. Non-empty is
      // not the same as written: "x." passes the build.
      expect(
        lesson.topics.length,
        `${lesson.id} has no topics, so the lesson page is blank.`
      ).toBeGreaterThanOrEqual(1);

      const thin = lesson.topics.flatMap((topic) => {
        const definition = topic.definition.trim();
        const howAndWhy = topic.howAndWhy.trim();
        const problems: string[] = [];

        if (topic.examples.length < 1) {
          problems.push(`${topic.id} has no examples, so there is nothing to compare`);
        }
        if (SLUG.test(topic.title.trim())) {
          problems.push(`${topic.id} title is the id, not a title`);
        }
        if (definition.length < 20) {
          problems.push(`${topic.id} definition is too short to define anything`);
        }
        if (!/[.!?]$/.test(definition)) {
          problems.push(`${topic.id} definition stops without punctuation`);
        }
        if (howAndWhy.length < 20) {
          problems.push(`${topic.id} howAndWhy is too short to say when to use this`);
        }
        if (!/[.!?]$/.test(howAndWhy)) {
          problems.push(`${topic.id} howAndWhy stops without punctuation`);
        }
        if (definition === howAndWhy) {
          // Two fields answering the same question is one field, and the
          // "how and why" half is the part students actually need.
          problems.push(`${topic.id} definition and howAndWhy are the same text`);
        }
        return problems;
      });

      expect(
        thin,
        `${lesson.id} has topics that are filled in rather than written. ` +
          "definition says what the concept is; howAndWhy says when to reach " +
          "for it. Both are shown to the student."
      ).toEqual([]);
    });

    it.each(lessonCases(tab))("%s ships no placeholder text", (_id, lesson) => {
      const left = readableText(lesson).flatMap(([where, text]) =>
        PLACEHOLDERS.filter((pattern) => pattern.test(text)).map(
          (pattern) => `${where} matches ${pattern}`
        )
      );

      expect(
        left,
        `${lesson.id} still contains a note to the author. Finish the content ` +
          "or remove the lesson from the track -- it is rendered verbatim."
      ).toEqual([]);
    });

    it.each(lessonCases(tab))("%s namespaces its example ids", (_id, lesson) => {
      // Example ids are deep-link addresses, and one prefixed by its topic is
      // one that cannot be silently copied into a neighbouring topic.
      const stray = examplesIn(lesson)
        .filter(
          ({ topic, example }) =>
            example.id !== topic.id && !example.id.startsWith(`${topic.id}-`)
        )
        .map(({ topic, example }) => `${example.id} sits under topic ${topic.id}`);

      expect(
        stray,
        `${lesson.id} has example ids that do not begin with their topic's id. ` +
          "Rename them <topic-id>-example so a link tells you where it lands."
      ).toEqual([]);
    });
  });

  describe("the four renderings", () => {
    it.each(lessonCases(tab))("%s says one program four ways", (_id, lesson) => {
      const repeated = examplesIn(lesson)
        .filter(({ example }) => repeatedRenderings(example).length > 0)
        .map(({ example }) => example.id)
        .sort();

      const known = IDENTICAL_RENDERINGS.filter((id) =>
        examplesIn(lesson).some(({ example }) => example.id === id)
      ).sort();

      expect(
        repeated,
        `${lesson.id} has examples whose renderings are byte-identical copies ` +
          "of each other. The contrast is the lesson: strict spells every step " +
          "out, standard reads naturally, abstraction states the goal, " +
          "pseudocode is SET x TO 5. Rewrite the duplicated modes, then delete " +
          "the example from IDENTICAL_RENDERINGS in this file."
      ).toEqual(known);
    });

    it.each(lessonCases(tab))("%s keeps its example lines clean", (_id, lesson) => {
      const dirty: string[] = [];
      for (const { example } of examplesIn(lesson)) {
        for (const mode of EXAMPLE_MODES) {
          example[mode].forEach((line, index) => {
            const at = `${example.id}.${mode}[${index}]`;
            // The build counts "   " as a line, so a mode can satisfy "at
            // least one line" and still render as a blank column.
            if (!line.trim()) dirty.push(`${at} is blank`);
            if (line.includes("\t")) dirty.push(`${at} indents with a tab`);
            if (/\s$/.test(line)) dirty.push(`${at} has trailing whitespace`);
            // A curly quote or an en dash pasted from a document is text a
            // student cannot type back into the editor.
            const exotic = line.match(/[^\x20-\x7E\t]/g);
            if (exotic) dirty.push(`${at} contains ${exotic.join(" ")}`);
          });
        }
      }

      expect(
        dirty,
        `${lesson.id} has example lines that will not render as written. ` +
          "Example lines are shown to the student character for character."
      ).toEqual([]);
    });

    it.each(lessonCases(tab))("%s gets terser as it gets more abstract", (_id, lesson) => {
      // strict spells out every step, abstraction states the goal, so the line
      // count cannot climb along that axis. When it does, two modes are swapped
      // -- which every other check in this repo is happy with.
      const inverted = examplesIn(lesson).flatMap(({ example }) => {
        const problems: string[] = [];
        if (example.strict.length < example.standard.length) {
          problems.push(
            `${example.id}: standard has ${example.standard.length} lines, ` +
              `strict only ${example.strict.length}`
          );
        }
        if (example.standard.length < example.abstraction.length) {
          problems.push(
            `${example.id}: abstraction has ${example.abstraction.length} ` +
              `lines, standard only ${example.standard.length}`
          );
        }
        return problems;
      });

      expect(
        inverted,
        `${lesson.id} has an example that grows as it abstracts. Check whether ` +
          "two modes were pasted into each other's fields."
      ).toEqual([]);
    });

    it.each(lessonCases(tab))("%s writes its prose as sentences", (_id, lesson) => {
      const unpunctuated = examplesIn(lesson)
        .flatMap(({ example }) =>
          PROSE_MODES.filter((mode) =>
            example[mode].some((line) => !/[.!?]$/.test(line.trim()))
          ).map((mode) => `${example.id}:${mode}`)
        )
        .sort();

      const known = UNPUNCTUATED_PROSE.filter((entry) =>
        examplesIn(lesson).some(({ example }) => example.id === entry.split(":")[0])
      ).sort();

      expect(
        unpunctuated,
        `${lesson.id} has a strict, standard or abstraction line that stops ` +
          "without punctuation -- usually a line that was cut off mid-thought. " +
          "Finish it, then delete the entry from UNPUNCTUATED_PROSE in this file."
      ).toEqual(known);
    });

    it.each(lessonCases(tab))("%s keeps the two registers apart", (_id, lesson) => {
      const confused = examplesIn(lesson).flatMap(({ example }) => {
        const problems: string[] = [];

        if (!example.pseudocode.some((line) => /\b[A-Z][A-Z0-9_]+\b/.test(line))) {
          problems.push(`${example.id}.pseudocode has no SET / PRINT / IF keyword`);
        }
        if (example.pseudocode.some((line) => /\.$/.test(line.trim()))) {
          problems.push(`${example.id}.pseudocode ends a line with a full stop`);
        }
        for (const mode of PROSE_MODES) {
          if (example[mode].every((line) => /^\s*[A-Z][A-Z0-9_]+\b/.test(line))) {
            problems.push(`${example.id}.${mode} reads as pseudocode, not prose`);
          }
        }
        return problems;
      });

      expect(
        confused,
        `${lesson.id} has a mode written in the wrong register. The prose modes ` +
          "are English sentences; pseudocode is SET x TO 5. A student sees them " +
          "side by side, so a mode in the wrong voice reads as a mistake."
      ).toEqual([]);
    });
  });
});

describe("ids across the whole app", () => {
  // validateTab checks each tab on its own. Topic and example ids address deep
  // links, which carry no tab, so a collision between the two tracks lands a
  // student in the other track's lesson with nothing failing anywhere.
  it("gives every lesson its own id", () => {
    expect(
      collisions(EVERY_LESSON.map(({ tab, lesson }) => [lesson.id, `${tab}/${lesson.id}`])),
      "two tracks are using one lesson id. Rename one of them."
    ).toEqual([]);
  });

  it("gives every topic its own id", () => {
    const topics = EVERY_LESSON.flatMap(({ tab, lesson }) =>
      lesson.topics.map(
        (topic) => [topic.id, `${tab}/${lesson.id}`] as [string, string]
      )
    );

    expect(
      collisions(topics),
      "topic ids are deep-link addresses across the whole app, not just within " +
        "a track. Rename one side of each collision -- a saved link currently " +
        "resolves to whichever lesson loads first."
    ).toEqual([]);
  });

  it("gives every example its own id", () => {
    const examples = EVERY_LESSON.flatMap(({ tab, lesson }) =>
      examplesIn(lesson).map(
        ({ topic, example }) => [example.id, `${tab}/${lesson.id}/${topic.id}`] as [string, string]
      )
    );

    expect(
      collisions(examples),
      "two examples share an id across the two tracks. Rename one -- and note " +
        "that the debt ledgers in this file key on example id."
    ).toEqual([]);
  });
});

describe("the content debt ledgers", () => {
  it("names only examples that still exist", () => {
    // A ledger entry pointing at a renamed example is an entry that quietly
    // stops covering anything: the per-lesson comparisons would still pass.
    const present = new Set(
      EVERY_LESSON.flatMap(({ lesson }) => examplesIn(lesson).map(({ example }) => example.id))
    );
    const dangling = [
      ...IDENTICAL_RENDERINGS,
      ...UNPUNCTUATED_PROSE.map((entry) => entry.split(":")[0]),
    ].filter((id) => !present.has(id));

    expect(
      dangling,
      "these ids are listed as known content debt but no longer exist. If the " +
        "example was renamed, update the ledger; if it was deleted, remove the entry."
    ).toEqual([]);
  });
});
