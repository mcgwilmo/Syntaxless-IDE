/**
 * Compile the YAML lesson content into a TypeScript module.
 *
 * The Learning Center is a client component, so it cannot read files at
 * runtime -- the content has to be bundled. Compiling here rather than adding a
 * YAML loader to the bundler keeps `yaml` a dev dependency: nothing extra ships
 * to the browser.
 *
 * Validation happens here too, so malformed content fails the build with the
 * file and field named, instead of reaching a student.
 *
 * Runs before every dev run and build. The generated module is committed, so a
 * fresh clone typechecks without running anything first -- but it is generated,
 * and editing it by hand will be overwritten on the next build.
 */

import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import YAML from "yaml";

const CONTENT_ROOT = "src/content/lessons";
const OUTPUT = path.join(CONTENT_ROOT, "generated.ts");
const TABS = ["operators", "data-structures-algorithms"];

/**
 * Validation rules.
 *
 * These live here rather than beside the types in lesson-schema.ts because this
 * script runs in plain Node before the build and cannot import TypeScript. The
 * types describe the shape; these rules enforce it. Adding a field means
 * touching both -- and if you forget this half, the build accepts content the
 * app's types would reject, so keep them in step.
 */
const EXAMPLE_MODES = ["strict", "standard", "abstraction", "pseudocode"];
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function asLines(value, where, problems) {
  if (Array.isArray(value)) {
    value.forEach((line, index) => {
      if (typeof line !== "string") problems.push(`${where}[${index}] must be a string`);
    });
    return value.map((line) => String(line));
  }
  if (typeof value === "string") {
    return value.replace(/\r/g, "").replace(/\n+$/, "").split("\n");
  }
  problems.push(`${where} must be a list of lines, or an indented block`);
  return [];
}

function requireText(value, where, problems) {
  if (typeof value !== "string" || !value.trim()) {
    problems.push(`${where} must be a non-empty string`);
    return "";
  }
  return value;
}

function requireId(value, where, problems) {
  const text = requireText(value, where, problems);
  if (text && !ID_PATTERN.test(text)) {
    problems.push(`${where} must be lowercase words joined by hyphens (got "${text}")`);
  }
  return text;
}

function validateLesson(raw, file) {
  const problems = [];
  if (typeof raw !== "object" || raw === null) {
    throw new Error(`${file} is not a valid lesson:\n  - the file must contain a mapping`);
  }

  if (!Number.isInteger(raw.number) || raw.number < 1) {
    problems.push("number must be a whole number of 1 or more");
  }
  const topics = Array.isArray(raw.topics) ? raw.topics : [];
  if (topics.length === 0) problems.push("topics must have at least one topic");

  const lesson = {
    id: requireId(raw.id, "id", problems),
    number: Number.isInteger(raw.number) ? raw.number : 0,
    title: requireText(raw.title, "title", problems),
    overview: requireText(raw.overview, "overview", problems),
    topics: topics.map((topic, t) => {
      const where = `topics[${t}]`;
      const examples = Array.isArray(topic?.examples) ? topic.examples : [];
      if (examples.length === 0) problems.push(`${where}.examples must have at least one example`);
      return {
        id: requireId(topic?.id, `${where}.id`, problems),
        title: requireText(topic?.title, `${where}.title`, problems),
        definition: requireText(topic?.definition, `${where}.definition`, problems),
        howAndWhy: requireText(topic?.howAndWhy, `${where}.howAndWhy`, problems),
        examples: examples.map((example, e) => {
          const at = `${where}.examples[${e}]`;
          const built = { id: requireId(example?.id, `${at}.id`, problems) };
          for (const mode of EXAMPLE_MODES) {
            const lines = asLines(example?.[mode], `${at}.${mode}`, problems);
            if (lines.length === 0) problems.push(`${at}.${mode} must have at least one line`);
            built[mode] = lines;
          }
          return built;
        }),
      };
    }),
  };

  if (problems.length > 0) {
    throw new Error(`${file} is not a valid lesson:\n` + problems.map((p) => `  - ${p}`).join("\n"));
  }
  return lesson;
}

function validateTab(lessons, tab) {
  const problems = [];
  const seen = { id: new Map(), number: new Map(), topic: new Map(), example: new Map() };

  for (const lesson of lessons) {
    if (seen.id.has(lesson.id)) problems.push(`two lessons share the id "${lesson.id}"`);
    seen.id.set(lesson.id, true);
    if (seen.number.has(lesson.number)) {
      problems.push(`lessons "${seen.number.get(lesson.number)}" and "${lesson.id}" are both number ${lesson.number}`);
    }
    seen.number.set(lesson.number, lesson.id);

    for (const topic of lesson.topics) {
      if (seen.topic.has(topic.id)) {
        problems.push(`topic id "${topic.id}" is used by both "${seen.topic.get(topic.id)}" and "${lesson.id}"`);
      }
      seen.topic.set(topic.id, lesson.id);
      for (const example of topic.examples) {
        if (seen.example.has(example.id)) {
          problems.push(`example id "${example.id}" is used by both "${seen.example.get(example.id)}" and "${topic.id}"`);
        }
        seen.example.set(example.id, topic.id);
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(`tab "${tab}" has conflicts:\n` + problems.map((p) => `  - ${p}`).join("\n"));
  }
}

async function loadTab(tab) {
  const directory = path.join(CONTENT_ROOT, tab);
  const files = (await readdir(directory)).filter((name) => name.endsWith(".yaml")).sort();

  const lessons = [];
  for (const file of files) {
    const full = path.join(directory, file);
    let parsed;
    try {
      parsed = YAML.parse(await readFile(full, "utf8"));
    } catch (error) {
      throw new Error(`${full} is not valid YAML:\n  - ${error.message}`);
    }
    lessons.push(validateLesson(parsed, full));
  }

  validateTab(lessons, tab);
  // Order by the number field, not the filename -- the prefix is a convenience.
  lessons.sort((a, b) => a.number - b.number);
  return lessons;
}

async function main() {
  const byTab = {};
  for (const tab of TABS) byTab[tab] = await loadTab(tab);

  const banner =
    "// GENERATED FILE -- DO NOT EDIT.\n" +
    "//\n" +
    "// Built from the YAML in src/content/lessons by scripts/build-lessons.mjs,\n" +
    "// which runs before every dev run and build. Edit the YAML instead; changes\n" +
    "// made here are overwritten.\n\n" +
    'import type { Lesson, TabId } from "./lesson-schema";\n\n';

  const body =
    "export const LESSONS_BY_TAB: Record<TabId, Lesson[]> = " +
    JSON.stringify(byTab, null, 2) +
    ";\n";

  await writeFile(OUTPUT, banner + body, "utf8");

  const counts = TABS.map((tab) => {
    const lessons = byTab[tab];
    const topics = lessons.reduce((n, l) => n + l.topics.length, 0);
    const examples = lessons.reduce(
      (n, l) => n + l.topics.reduce((m, t) => m + t.examples.length, 0),
      0,
    );
    return `${tab}: ${lessons.length} lessons / ${topics} topics / ${examples} examples`;
  });
  console.log(`lessons: ${counts.join("  |  ")}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`\n${error.message}\n`);
    process.exit(1);
  });
}

export { loadTab, validateLesson, validateTab };
