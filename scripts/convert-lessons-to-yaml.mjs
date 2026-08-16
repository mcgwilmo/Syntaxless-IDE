/**
 * One-off: convert the TypeScript lesson modules into YAML content files.
 *
 * The lesson files are pure data written as calls to lesson()/topic()/example(),
 * so this evaluates them with those three constructors supplied and writes the
 * result out as YAML. Evaluating rather than pattern-matching means the output
 * is exactly what the app was loading, including tab two's block() helper.
 *
 * Run once, verify with scripts/verify-lesson-migration.mjs, then delete both
 * this and the TypeScript modules.
 *
 *     node scripts/convert-lessons-to-yaml.mjs
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

const SOURCES = {
  operators: [
    "src/app/resources/tutorial-lessons-part1.ts",
    "src/app/resources/tutorial-lessons-part2.ts",
    "src/app/resources/tutorial-lessons-part3.ts",
    "src/app/resources/tutorial-lessons-part4.ts",
  ],
  "data-structures-algorithms": ["src/app/resources/tutorial-lessons-tab2.ts"],
};

const DESTINATION = "src/content/lessons";

// The three constructors the lesson files call, and tab two's local helper.
const example = (id, strict, standard, abstraction, pseudocode) => ({
  id,
  strict,
  standard,
  abstraction,
  pseudocode,
});
const topic = (id, title, definition, howAndWhy, examples) => ({
  id,
  title,
  definition,
  howAndWhy,
  examples,
});
const lesson = (id, number, title, overview, topics) => ({
  id,
  number,
  title,
  overview,
  topics,
});
function block(text) {
  const lines = text.replace(/\r/g, "").trim().split("\n");
  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^ */)?.[0].length ?? 0);
  const trimBy = indents.length > 0 ? Math.min(...indents) : 0;
  return lines.map((line) => line.slice(trimBy));
}

async function loadLessons(file) {
  let source = await readFile(file, "utf8");
  source = source.replace(/^import[\s\S]*?from\s+"[^"]+";\n/m, "");
  source = source.replace(/^function block\(text: string\)[\s\S]*?\n}\n/m, "");
  source = source.replace(/export const \w+: Lesson\[\] =/, "return");
  return new Function("example", "topic", "lesson", "block", source)(
    example,
    topic,
    lesson,
    block,
  );
}

/** `01-variables.yaml` -- ordered for humans reading the directory. */
function fileNameFor(lessonRecord) {
  return `${String(lessonRecord.number).padStart(2, "0")}-${lessonRecord.id}.yaml`;
}

function toYaml(lessonRecord) {
  return YAML.stringify(lessonRecord, {
    lineWidth: 0, // never fold a line the author wrote
    defaultStringType: "PLAIN",
    defaultKeyType: "PLAIN",
    singleQuote: false,
  });
}

async function main() {
  let written = 0;

  for (const [tab, files] of Object.entries(SOURCES)) {
    const lessons = (await Promise.all(files.map(loadLessons))).flat();
    const directory = path.join(DESTINATION, tab);
    await mkdir(directory, { recursive: true });

    for (const lessonRecord of lessons) {
      const header =
        `# ${lessonRecord.title}\n` +
        `#\n` +
        `# Lesson ${lessonRecord.number} of the ${tab} track.\n` +
        `# See ../README.md for what each field means and how to add a lesson.\n\n`;
      await writeFile(
        path.join(directory, fileNameFor(lessonRecord)),
        header + toYaml(lessonRecord),
        "utf8",
      );
      written += 1;
    }
    console.log(`${tab}: ${lessons.length} lessons -> ${directory}`);
  }

  console.log(`wrote ${written} lesson files`);
}

main().catch((error) => {
  console.error("Conversion failed:", error);
  process.exit(1);
});
