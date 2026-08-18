import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored Monaco assets, copied by scripts/copy-monaco.mjs. Third-party
    // minified source -- linting it reports thousands of problems we cannot act on.
    "public/monaco/**",
  ]),
  {
    rules: {
      /*
       * A leading underscore means "deliberately unused".
       *
       * The skeuomorphic migration left a number of these: functions that took
       * a `theme` argument only to pick colours no longer need it, because the
       * tokens swap themselves -- but the parameter has to stay to keep the
       * call signature, so it became `_theme`. Without this rule the linter
       * reports each one, and a warning that is expected is a warning nobody
       * reads.
       */
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
]);

export default eslintConfig;
