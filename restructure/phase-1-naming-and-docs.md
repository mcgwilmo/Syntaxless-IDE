# Phase 1 — Naming sweep, brand centralization, docs

## Context

A natural-language programming environment for **students learning to program**, often in a
classroom. Students write plain English; the backend detects intent, generates governed Python,
validates it against safety policy, and runs it in a Docker sandbox.

- `/Users/danielleknutson/Syntaxless-IDE` — Next.js 16 / React 19 / TS / Tailwind v4 / Supabase / Monaco. ~20.5k lines.
- `/Users/danielleknutson/Syntaxless-IDE-Backend` — FastAPI / Pydantic v2 / OpenAI / Docker sandbox. ~8.9k lines, pytest green.

This is phase 1 of 6 in a restructure. **Restructuring, not rewriting** — behavior, routes, API
contracts, and pipeline semantics stay identical unless I explicitly approve a change.

## Goal

The product has been called four things and is about to be called a fifth. Stop the bleeding: purge
the dead names, and make the surviving name a **single configurable value** instead of a string
scattered across both repos. Then fix the docs, which actively mislead new contributors.

**Do not pick a product name.** The rebrand is unresolved and blocked on trademark clearance. The
point of this phase is to make the eventual rename a one-line change.

## Findings to verify first

Measured 2026-08-12. Re-measure before acting; correct me if they've drifted.

| term | frontend | backend |
|---|---|---|
| `codeless` | 2 hits / 2 files | **270 hits / 24 files** |
| `trace` | 101 hits / 5 files | 101 hits / 15 files |
| `syntaxless` | 18 hits / 6 files | 8 hits / 5 files |

Names in play: **"Syntaxless IDE"** (repo names, frontend README), **"TRACE"** = Thinking and
Reasoning Assisted Coding Environment (backend README, `public/brand/trace logo*.png`), and
**"codeless"** (33 env vars, Docker image `codeless-python-sandbox`, `public/logo/codeless-mark.png`).

## Scope

### 1. Centralize the brand

- Frontend: `src/config/brand.ts` exporting `BRAND.name`, `BRAND.shortName`, `BRAND.tagline`,
  `BRAND.domain`, and logo asset paths. Every user-facing string and every `<title>`/metadata value
  derives from it. No component hardcodes a product name.
- Backend: `app/platform/branding.py` with the same role, plus a single `ENV_PREFIX` constant that
  **all** env-var lookups route through.
- Where a name is structurally required in an identifier and there's no better option, use the
  neutral `PRODUCT` / `product`.

### 2. Purge dead names

- `codeless` and `syntaxless` are pure legacy — remove all of them.
- `trace` needs a **human pass, not sed**. It's an ordinary English word and a programming term:
  `traceback`, `stack trace`, `trace()` logging, `tracing`. In the backend only ~5 hits are the
  programming sense; the rest are branding. **Produce the hit list with a keep/rename call for each
  and show it to me before changing anything.**

### 3. Fix the duplicated wire-protocol sentinel ⚠️

`__CODELESS_EVENT__` is hardcoded in **two** places — `app/services/executor.py:36` and
`sandbox/runner.py:9` — and prefixes every event line the sandboxed process writes back to the host.
These two constants must always agree, and nothing enforces that today.

Define it in **one** shared module that both the host and the sandbox import, so it can't drift.
Do **not** change its value in this phase — the host and Docker image would have to be rebuilt and
deployed together, and a partial rollout silently breaks every run. Centralize now, rename later.

Same for the 33 `CODELESS_*` env vars: route lookups through `ENV_PREFIX`, but **do not change the
actual strings**. Produce the full list as a table so we can plan the cutover separately.

### 4. Assets

Rename to kebab-case, **named by role, not by product**: `trace logo.png` → `logo.png`,
`trace logo updated dark.png` → `logo-dark.png`, etc. Route references through `BRAND`. This also
fixes the spaces-in-filenames problem (`ide window light.png`, `plot creation.png`, …).

Leave `id8-logo.png` and `antivenom-logo.png` alone — they look like partner or third-party marks.
Confirm with me if unsure.

### 5. Docs

- **Backend README is wrong.** It documents a monorepo with `/frontend` and `/backend` directories
  that don't exist — the repos are split. It also documents 2 env vars when there are 33.
- **Frontend README** still has create-next-app boilerplate ("your feedback and contributions are
  welcome", Vercel template links).
- Both should get a new contributor from clone to running app in under ten minutes.
- Backend `docs/` has 11 overlapping files: onboarding readme, onboarding lead checklist, development
  workflow, backend architecture, testing, deployment, troubleshooting, improvement plan, stress
  feasibility, stress results ×2. Consolidate. **Ask me before touching
  `trace-backend-improvement-plan.md`** — it may be a live planning doc.

## Out of scope

Directory restructuring, design/styling, splitting modules, tests. Those are phases 2–6. If you spot
something, note it in the plan — don't fix it.

## How to work

1. Re-measure the findings above. Then write `restructure/phase-1-plan.md`: the `trace` keep/rename
   table, the env-var table, the asset rename table, the docs consolidation map, and anything you
   disagree with. **Stop for my approval.**
2. Execute on a branch. Never commit to `main` without asking.
3. **Pure moves stay pure** — relocate a file in one commit, edit it in another, so diffs stay readable.

## Verify (show me real output, don't describe it)

```bash
cd /Users/danielleknutson/Syntaxless-IDE && npm run build && npm run lint
```

```bash
cd /Users/danielleknutson/Syntaxless-IDE-Backend && pytest && python scripts/run_stress_suite.py --disable-remote-models
```

Then run the app and confirm the IDE still generates and executes code end to end. The sandbox event
protocol is the risky part of this phase — a run that produces no output means the sentinel broke.

## Ask me before

- Changing any env-var string or the Docker image name (deploy-affecting).
- Changing the `__CODELESS_EVENT__` value.
- Renaming the GitHub repos or any domain.
- Deleting any doc that isn't provably superseded.
- Deleting anything else that isn't provably dead.

## Done when

- Grepping either repo for `syntaxless` or `codeless` returns nothing.
- Remaining `trace` hits are all the ordinary programming sense, and you've shown me the list.
- The product name lives in `src/config/brand.ts` and `app/platform/branding.py` only.
- The event sentinel is defined once and imported by both host and sandbox.
- Both READMEs are accurate; a new contributor can go clone → running in ten minutes.
- All builds, lints, and tests pass, with output shown.

## Hand off

Note in the plan file what phase 2 should know — especially any hardcoded colors or styling you had
to touch while updating brand references.
