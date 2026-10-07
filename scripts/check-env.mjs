/*
 * Refuse to build a bundle that cannot talk to anything.
 *
 * Every NEXT_PUBLIC_* value is inlined at build time. There is no proxy route
 * and no rewrite, so the backend origin is frozen into the JavaScript we ship
 * and editing the variable afterwards changes nothing until the next build.
 *
 * This existed as a claim before it existed as a check: config.ts said a missing
 * value "fails the build rather than degrading in production". It did not. A
 * production build with the variable unset shipped a bundle calling
 * http://127.0.0.1:8000, which on an https origin is a mixed-content block --
 * and the IDE reports that as "Could not reach the backend", the same words it
 * uses when the backend is genuinely down. The failure a deploy is most likely
 * to cause was also the one hardest to tell apart from the failure it was not.
 *
 * A throw from config.ts would not fix that: that module is evaluated in the
 * browser, not during the prerender pass, so it would crash visitors rather than
 * stop the build. The check has to run here, before next build.
 */

const isProductionBuild = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

/** Values that exist only so the build can construct a client. Never deployed. */
const PLACEHOLDER = /placeholder|example\.com|your-project|changeme/i;

const problems = [];

const backend = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
if (!backend) {
  problems.push(
    "NEXT_PUBLIC_BACKEND_URL is not set.\n" +
      "    Without it the bundle calls http://127.0.0.1:8000, which fails for\n" +
      "    every visitor on an https origin and reports as 'Could not reach the\n" +
      "    backend' -- indistinguishable from the backend being down."
  );
} else if (!/^https?:\/\//i.test(backend)) {
  // Worth its own check: toWsUrl() converts https:// -> wss:// by prefix, and
  // silently no-ops on a bare host. new WebSocket("host/run/123") then resolves
  // RELATIVE to the page, so the run stream quietly dials the frontend's own
  // origin and fails with only "WebSocket stream error."
  problems.push(
    `NEXT_PUBLIC_BACKEND_URL has no scheme: ${backend}\n` +
      "    It must start with https:// (or http:// locally). A bare host breaks\n" +
      "    the WebSocket run stream in a way that reports almost nothing."
  );
}

for (const name of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"]) {
  if (!process.env[name]?.trim()) problems.push(`${name} is not set.`);
}

// A placeholder is correct in CI and wrong in a real deploy. VERCEL_ENV is set
// by Vercel itself, so this only fires where it actually matters.
if (process.env.VERCEL_ENV === "production" && backend && PLACEHOLDER.test(backend)) {
  problems.push(
    `NEXT_PUBLIC_BACKEND_URL still looks like a placeholder: ${backend}\n` +
      "    That is fine for CI and not fine for production."
  );
}

if (problems.length && isProductionBuild) {
  console.error("\n  Build stopped: environment is not deployable.\n");
  for (const p of problems) console.error(`  - ${p}\n`);
  console.error("  These are inlined at build time. Set them, then rebuild.\n");
  process.exit(1);
}

if (problems.length) {
  console.warn("\n  Env warnings (not a production build, continuing):");
  for (const p of problems) console.warn(`  - ${p.split("\n")[0]}`);
  console.warn("");
}
