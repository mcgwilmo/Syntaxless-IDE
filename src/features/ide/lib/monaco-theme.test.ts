import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { ensureMonacoThemes } from "./index";

/*
 * Monaco's editor colours must equal the design tokens they claim to be.
 *
 * `monaco.editor.defineTheme` takes literal hex strings. It cannot read a CSS
 * custom property, so the editor's colours are necessarily a second copy of
 * values that live in tokens.css -- and a second copy is a thing that drifts.
 * Change --surface-sunken and the whole app follows except the editor, which
 * keeps the old colour and looks subtly wrong in a way nobody can place.
 *
 * The same argument as the tier matrix, which is duplicated across the two
 * repos and asserted literally in both: two copies of one value are fine as
 * long as something fails when they disagree.
 *
 * Alpha-suffixed entries (selection) are checked on their RGB prefix only --
 * the eight-digit form is the token's colour plus Monaco's own opacity byte.
 */

const TOKENS = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../design/tokens.css"
);

function tokenValues(themeSelector: string): Record<string, string> {
  const css = readFileSync(TOKENS, "utf8");
  const start = css.indexOf(themeSelector);
  const open = css.indexOf("{", start);

  let depth = 0;
  let end = open;
  for (; end < css.length; end += 1) {
    if (css[end] === "{") depth += 1;
    else if (css[end] === "}") {
      depth -= 1;
      if (depth === 0) break;
    }
  }

  const out: Record<string, string> = {};
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(css.slice(open + 1, end)))) out[m[1]] = m[2].trim();
  return out;
}

const light = tokenValues(":root");
const dark = { ...light, ...tokenValues(':root[data-theme="dark"]') };

/** Capture what ensureMonacoThemes hands to Monaco, without Monaco. */
function definedThemes() {
  const captured: Record<string, Record<string, string>> = {};
  const fake = {
    editor: {
      defineTheme(name: string, spec: { colors: Record<string, string> }) {
        captured[name] = spec.colors;
      },
    },
  };

  ensureMonacoThemes(fake as unknown as Parameters<typeof ensureMonacoThemes>[0]);
  return captured;
}

/** [monaco key, token name] */
const MIRRORED: Array<[string, string]> = [
  ["editor.background", "--surface-sunken"],
  ["editor.foreground", "--text-primary"],
  ["editorLineNumber.foreground", "--text-soft"],
  ["editorLineNumber.activeForeground", "--text-primary"],
  ["editor.lineHighlightBackground", "--surface-page"],
];

describe("Monaco themes mirror the design tokens", () => {
  const themes = definedThemes();

  it("defines both themes", () => {
    expect(Object.keys(themes).sort()).toEqual(["ide-dark", "ide-light"]);
  });

  describe.each([
    ["ide-light", light],
    ["ide-dark", dark],
  ])("%s", (themeName, tokens) => {
    it.each(MIRRORED)("%s equals %s", (monacoKey, tokenName) => {
      const actual = themes[themeName][monacoKey]?.toLowerCase();
      const expected = tokens[tokenName]?.toLowerCase();

      expect(expected, `${tokenName} missing from tokens.css`).toBeTruthy();
      expect(actual, `${monacoKey} missing from ${themeName}`).toBeTruthy();
      expect(actual).toBe(expected);
    });

    it("uses the accent for the cursor", () => {
      const cursor = themes[themeName]["editorCursor.foreground"].toLowerCase();
      const accents = [tokens["--accent-text"], tokens["--accent-solid"]].map((v) =>
        v?.toLowerCase()
      );

      expect(accents).toContain(cursor);
    });

    it("tints selection with the accent", () => {
      // Eight digits: the accent's six, plus Monaco's opacity byte.
      const selection = themes[themeName]["editor.selectionBackground"].toLowerCase();
      const inactive =
        themes[themeName]["editor.inactiveSelectionBackground"].toLowerCase();

      for (const value of [selection, inactive]) {
        expect(value).toMatch(/^#[0-9a-f]{8}$/);
      }

      // An inactive selection must be fainter than a live one, or "remembered"
      // and "selected right now" look identical.
      expect(parseInt(inactive.slice(7, 9), 16)).toBeLessThan(
        parseInt(selection.slice(7, 9), 16)
      );
    });
  });

  it("gives the editor a different ground in each theme", () => {
    expect(themes["ide-light"]["editor.background"]).not.toBe(
      themes["ide-dark"]["editor.background"]
    );
  });
});
