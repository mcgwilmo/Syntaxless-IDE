/*
 * Measure every text/surface pair in the token system against WCAG AA.
 *
 * The important part is that it composites. A token's declared value is not
 * what the eye receives: --material-sheen lays a translucent white gradient
 * over filled surfaces, and --material-highlight and --material-shade sit
 * inside every raised edge. Checking --text-soft against --surface-raised as
 * declared gives one number; checking it against what is actually painted
 * gives another, and only the second one is true.
 *
 * This was learned the hard way. The skeuomorphic pass set the sheen to 55%,
 * which left white-on-accent at 1.98:1 -- a number no amount of reading the
 * token file would have surfaced, because both tokens were individually fine.
 * A later pass found --text-soft failing on a raised card in dark theme at
 * 4.46:1, having only ever been measured against the page.
 *
 * Run: node scripts/check-contrast.mjs
 * Exits non-zero if any required pair fails, so CI can gate on it.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOKENS = join(ROOT, "src/design/tokens.css");

/* ---- parsing ------------------------------------------------------------ */

/**
 * Pull `--name: value;` out of a block. Values may span lines (shadows do), so
 * the terminator is the semicolon, not the newline.
 */
function parseBlock(css) {
  const out = {};
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(css))) out[m[1]] = m[2].trim().replace(/\s+/g, " ");
  return out;
}

function extractTheme(css, selector) {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`no ${selector} block in tokens.css`);
  const open = css.indexOf("{", start);
  let depth = 0;
  let i = open;
  for (; i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  return parseBlock(css.slice(open + 1, i));
}

/* ---- colour ------------------------------------------------------------- */

function parseColor(value) {
  const v = value.trim();

  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1];
    const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
      a: 1,
    };
  }

  const rgba = v.match(/^rgba?\(([^)]+)\)$/i);
  if (rgba) {
    const parts = rgba[1].split(",").map((p) => parseFloat(p.trim()));
    return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
  }

  return null;
}

/** Lay `fg` (possibly translucent) over opaque `bg`. */
function composite(fg, bg) {
  const a = fg.a;
  return {
    r: fg.r * a + bg.r * (1 - a),
    g: fg.g * a + bg.g * (1 - a),
    b: fg.b * a + bg.b * (1 - a),
    a: 1,
  };
}

function relativeLuminance({ r, g, b }) {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * The peak of --material-sheen, composited onto a surface.
 *
 * The gradient runs from `rgba(255,255,255,X)` at the top to transparent at
 * 62%, so the strongest wash -- and therefore the worst case for contrast --
 * is at the very top of the element, where a button's label often sits.
 */
function applySheen(surface, sheenValue) {
  const top = sheenValue.match(/rgba\(([^)]+)\)/);
  if (!top) return surface;
  const parts = top[1].split(",").map((p) => parseFloat(p.trim()));
  return composite({ r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 }, surface);
}

/* ---- the pairs that must hold ------------------------------------------- */

const AA_BODY = 4.5;
const AA_LARGE = 3.0;

/** [text token, surface token, minimum, label, sheen?] */
const PAIRS = [
  ["--text-primary", "--surface-page", AA_BODY, "body on page"],
  ["--text-muted", "--surface-page", AA_BODY, "muted on page"],
  ["--text-soft", "--surface-page", AA_BODY, "soft on page"],

  // Raised surfaces carry the sheen, so they are measured with it.
  ["--text-primary", "--surface-raised", AA_BODY, "body on card", true],
  ["--text-muted", "--surface-raised", AA_BODY, "muted on card", true],
  ["--text-soft", "--surface-raised", AA_BODY, "soft on card", true],

  ["--text-primary", "--surface-sunken", AA_BODY, "body in a well"],
  ["--text-muted", "--surface-sunken", AA_BODY, "muted in a well"],

  // The tightest pair in the system, and the one the sheen broke before.
  ["--text-inverted", "--accent-solid", AA_BODY, "label on primary button", true],
  ["--text-inverted", "--state-blocked", AA_BODY, "label on danger button", true],

  ["--accent-text", "--surface-page", AA_BODY, "link on page"],
  ["--accent-text", "--surface-raised", AA_BODY, "link on card", true],

  ["--state-success", "--surface-page", AA_BODY, "success text"],
  ["--state-warning", "--surface-page", AA_BODY, "warning text"],
  ["--state-blocked", "--surface-page", AA_BODY, "blocked text"],

  ["--state-success", "--surface-raised", AA_BODY, "success on card", true],
  ["--state-warning", "--surface-raised", AA_BODY, "warning on card", true],
  ["--state-blocked", "--surface-raised", AA_BODY, "blocked on card", true],

  // Focus ring against both grounds it can land on. Non-text UI, so AA is 3:1.
  ["--accent-solid", "--surface-page", AA_LARGE, "focus ring on page"],
  ["--accent-solid", "--surface-raised", AA_LARGE, "focus ring on card", true],
];

/* ---- run ---------------------------------------------------------------- */

const css = readFileSync(TOKENS, "utf8");
const light = extractTheme(css, ":root");
const dark = { ...light, ...extractTheme(css, ':root[data-theme="dark"]') };

let failures = 0;
let checked = 0;

for (const [themeName, theme] of [
  ["light", light],
  ["dark", dark],
]) {
  console.log(`\n${themeName}`);
  console.log("-".repeat(58));

  for (const [fgToken, bgToken, min, label, withSheen] of PAIRS) {
    const fgRaw = theme[fgToken];
    const bgRaw = theme[bgToken];

    if (!fgRaw || !bgRaw) {
      console.log(`  ?? ${label}: missing ${!fgRaw ? fgToken : bgToken}`);
      failures += 1;
      continue;
    }

    const fg = parseColor(fgRaw);
    let bg = parseColor(bgRaw);
    if (!fg || !bg) {
      console.log(`  ?? ${label}: unparseable (${fgRaw} on ${bgRaw})`);
      failures += 1;
      continue;
    }

    // A translucent surface token sits over the page, not over nothing.
    if (bg.a < 1) bg = composite(bg, parseColor(theme["--surface-page"]));
    if (withSheen && theme["--material-sheen"]) bg = applySheen(bg, theme["--material-sheen"]);

    const ratio = contrast(composite(fg, bg), bg);
    const pass = ratio >= min;
    checked += 1;
    if (!pass) failures += 1;

    console.log(
      `  ${pass ? "ok" : "FAIL"} ${label.padEnd(26)} ${ratio.toFixed(2)}:1` +
        `${withSheen ? " (with sheen)" : ""}${pass ? "" : `  needs ${min}:1`}`
    );
  }
}

console.log(`\n${checked} pairs checked, ${failures} failing`);

if (failures > 0) {
  console.error(
    "\nContrast regression. Adjust the token, not the check -- and remember the\n" +
      "sheen is composited in, so raising it darkens every filled surface at once."
  );
  process.exit(1);
}
