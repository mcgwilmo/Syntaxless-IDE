/**
 * Point Monaco at this app's own copy instead of a CDN.
 *
 * @monaco-editor/react defaults to fetching Monaco from jsdelivr at runtime. On
 * a network that blocks it -- common in schools, and universal offline -- the
 * editor never loads and the student sees an empty pane with no error. The
 * assets are copied into public/monaco by scripts/copy-monaco.mjs before every
 * dev run and build, so they are always served from the same origin as the app.
 *
 * Import this once, before the first <Editor> renders. loader.config() has no
 * effect after Monaco has begun loading.
 */

import { loader } from "@monaco-editor/react";

loader.config({ paths: { vs: "/monaco/vs" } });

export { loader };
