/**
 * Copy the Monaco editor assets into public/ so the editor loads from this app
 * rather than from a CDN.
 *
 * By default @monaco-editor/react fetches Monaco from jsdelivr at runtime. When
 * that host is unreachable -- which is routine on school networks, and on any
 * machine that is simply offline -- the student gets a blank pane where the
 * editor should be, with no error and no fallback. For a classroom product that
 * is a hard failure, so the assets ship with the app.
 *
 * A straight copy is 15MB. Most of that is for languages this product does not
 * edit, so it is pruned:
 *
 *   ts.worker      6.7MB   TypeScript/JavaScript language service
 *   css.worker     1.0MB
 *   html.worker    680KB
 *   json.worker    376KB
 *   nls.messages.<locale>  1.7MB across 14 locales; English is built in
 *
 * What remains is the editor core, the Python grammar, and the editor worker --
 * roughly 5MB, none of which is in the JS bundle. The browser fetches only what
 * it needs.
 *
 * Runs before dev and build. public/monaco is generated, and gitignored.
 */

import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

/** Workers for languages this product does not edit. */
const UNUSED_WORKERS = ["ts.worker", "css.worker", "html.worker", "json.worker"];

/** A locale bundle, e.g. nls.messages.fr.js.js. English needs no bundle. */
const LOCALE_BUNDLE = /^nls\.messages\.[a-z-]+\.js\.js$/;

function isPrunable(name) {
  return (
    UNUSED_WORKERS.some((worker) => name.startsWith(worker)) ||
    LOCALE_BUNDLE.test(name)
  );
}

async function directorySize(dir) {
  let total = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    total += entry.isDirectory() ? await directorySize(full) : (await stat(full)).size;
  }
  return total;
}

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)}MB`;

async function main() {
  const monacoRoot = path.dirname(require.resolve("monaco-editor/package.json"));
  const source = path.join(monacoRoot, "min", "vs");
  const destination = path.resolve("public", "monaco", "vs");

  const before = await directorySize(source);

  await rm(path.dirname(destination), { recursive: true, force: true });
  await mkdir(destination, { recursive: true });
  await cp(source, destination, {
    recursive: true,
    filter: (src) => !isPrunable(path.basename(src)),
  });

  const after = await directorySize(destination);
  console.log(
    `monaco: ${mb(before)} -> ${mb(after)} self-hosted at /monaco/vs ` +
      `(pruned ${mb(before - after)} of unused language workers and locales)`,
  );
}

main().catch((error) => {
  console.error("Failed to copy Monaco assets:", error);
  process.exit(1);
});
