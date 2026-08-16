/**
 * Prove the YAML content is identical to the TypeScript it replaced.
 *
 * Run before deleting the original modules. Loads both sources and compares
 * every lesson, topic, example, and line -- 29 lessons, 135 topics, 157
 * examples, 628 string arrays. Migrating content by eye is how a lesson quietly
 * loses a line, and there are no frontend tests to catch it.
 *
 *     node scripts/verify-lesson-migration.mjs
 *
 * Exits non-zero on any difference, printing the exact path that differs.
 */

import { readFile } from "node:fs/promises";
import { loadTab } from "./build-lessons.mjs";

const LEGACY = {
  operators: [
    "src/app/resources/tutorial-lessons-part1.ts",
    "src/app/resources/tutorial-lessons-part2.ts",
    "src/app/resources/tutorial-lessons-part3.ts",
    "src/app/resources/tutorial-lessons-part4.ts",
  ],
  "data-structures-algorithms": ["src/app/resources/tutorial-lessons-tab2.ts"],
};

const example = (id, strict, standard, abstraction, pseudocode) => ({
  id, strict, standard, abstraction, pseudocode,
});
const topic = (id, title, definition, howAndWhy, examples) => ({
  id, title, definition, howAndWhy, examples,
});
const lesson = (id, number, title, overview, topics) => ({
  id, number, title, overview, topics,
});
function block(text) {
  const lines = text.replace(/\r/g, "").trim().split("\n");
  const indents = lines.filter((l) => l.trim().length > 0).map((l) => l.match(/^ */)?.[0].length ?? 0);
  const trimBy = indents.length > 0 ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(trimBy));
}

async function loadLegacy(file) {
  let source = await readFile(file, "utf8");
  source = source.replace(/^import[\s\S]*?from\s+"[^"]+";\n/m, "");
  source = source.replace(/^function block\(text: string\)[\s\S]*?\n}\n/m, "");
  source = source.replace(/export const \w+: Lesson\[\] =/, "return");
  return new Function("example", "topic", "lesson", "block", source)(example, topic, lesson, block);
}

/** Structural deep-compare that reports the first differing path. */
function diff(a, b, path, out) {
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      out.push(`${path}: one side is a list and the other is not`);
      return;
    }
    if (a.length !== b.length) {
      out.push(`${path}: ${a.length} items before, ${b.length} after`);
    }
    for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
      diff(a[i], b[i], `${path}[${i}]`, out);
    }
    return;
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      diff(a[key], b[key], `${path}.${key}`, out);
    }
    return;
  }
  if (a !== b) {
    out.push(`${path}:\n      before: ${JSON.stringify(a)}\n      after:  ${JSON.stringify(b)}`);
  }
}

async function main() {
  const problems = [];
  let lessons = 0, topics = 0, examples = 0, arrays = 0;

  for (const [tab, files] of Object.entries(LEGACY)) {
    const before = (await Promise.all(files.map(loadLegacy))).flat()
      .slice().sort((a, b) => a.number - b.number);
    const after = await loadTab(tab);

    diff(before, after, tab, problems);

    lessons += before.length;
    for (const l of before) {
      topics += l.topics.length;
      for (const t of l.topics) {
        examples += t.examples.length;
        arrays += t.examples.length * 4;
      }
    }
  }

  console.log(`compared ${lessons} lessons, ${topics} topics, ${examples} examples, ${arrays} string arrays`);
  if (problems.length > 0) {
    console.error(`\n${problems.length} DIFFERENCE(S):`);
    problems.slice(0, 20).forEach((p) => console.error(`  ${p}`));
    if (problems.length > 20) console.error(`  ... and ${problems.length - 20} more`);
    process.exit(1);
  }
  console.log("identical -- the YAML reproduces the TypeScript exactly");
}

main().catch((error) => {
  console.error("Verification failed:", error);
  process.exit(1);
});
