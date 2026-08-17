import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/*
 * Test runner config.
 *
 * The default environment is `node`, not `jsdom`, because most of what is worth
 * testing here is pure: diagnostic building, line-number mapping, tier gating,
 * URL construction. Those need no DOM, and spinning one up for them makes the
 * suite slower for no benefit.
 *
 * The few tests that render a component opt in per file with a docblock:
 *
 *     // @vitest-environment jsdom
 *
 * Named .mts so it is loaded as ESM. Vite's native config loader treats a
 * plain .ts as CommonJS and warns on the import syntax.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    // Monaco and the lesson bundle are large and irrelevant to unit tests.
    exclude: ["node_modules/**", ".next/**", "public/**"],
    clearMocks: true,
    restoreMocks: true,
  },
});
