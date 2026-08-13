# Restructure — phase prompts

Six self-contained prompts. Paste **one** into a fresh Claude Code session with both
`Syntaxless-IDE` and `Syntaxless-IDE-Backend` as working directories. Each repeats the shared
context, so nothing depends on a prior conversation — only on prior phases being *merged*.

| # | Prompt | Goal | Risk |
|---|---|---|---|
| 1 | [phase-1-naming-and-docs.md](phase-1-naming-and-docs.md) | Kill dead product names, centralize branding, fix a duplicated wire-protocol constant, rewrite both READMEs | Low |
| 2 | [phase-2-design-system.md](phase-2-design-system.md) | Token scale + primitives, light-first warm palette, one pilot screen | Low |
| 3 | [phase-3-backend-pipeline.md](phase-3-backend-pipeline.md) | `app/pipeline/` with typed stage contracts; split 5 god modules | **High** |
| 4 | [phase-4-frontend-features.md](phase-4-frontend-features.md) | Decompose the 6,267-line IDE component; typed API client | **High** |
| 5 | [phase-5-lesson-content.md](phase-5-lesson-content.md) | ~5,200 lines of lesson data out of code into schema-validated content | Medium |
| 6 | [phase-6-tests-and-ci.md](phase-6-tests-and-ci.md) | Frontend test setup, backend stage tests, CI | Low |

## Order

1 → 2 → 3 → 4 → 5 → 6. Phases 3 and 4 are independent of each other and can run in parallel in
separate sessions if you want — they touch different repos. Everything else is sequential.

Phase 1 must be first: it centralizes the product name so later phases don't scatter a name you
haven't chosen yet across new files.

## Running order within a phase

Every prompt follows the same contract:

1. Survey and confirm the stated findings (they were measured on 2026-08-12 and may have drifted).
2. Write a plan. **Stop for approval.**
3. Execute on a branch.
4. Verify with real command output.

## Open decisions

These block specific phases. Decide before starting them, or the session will stop and ask.

- **Product name** — unresolved. "Rosetta" has a live `ROSETTA` trademark held by Rosetta Stone Ltd.
  in education software, and `rosettacode.org` (2007, in freeCodeCamp's curriculum) owns the search
  results for programming education. Phase 1 makes the name a one-line change so this stays cheap.
  *Blocks nothing if left undecided.*
- **Accent color** — warm teal vs. friendly indigo. *Blocks Phase 2 partway through.*
- **`docs/trace-backend-improvement-plan.md`** — is this a live planning doc to preserve, or stale?
  *Blocks Phase 1's docs consolidation.*
- **Env-var cutover** (`CODELESS_*` → new prefix) — deploy-affecting, needs a Vercel + backend host
  change. Phase 1 routes lookups through one constant but does **not** change the strings.
  *Deferred; decide later.*

## Measured baseline (2026-08-12)

Frontend ~20.5k lines, backend ~8.9k lines.

**The backend test suite is not green on a clean checkout**: 3 unit tests and stress fixture
`T27_vibe` fail before any of this work starts. Baseline is 26 passed / 3 failed and 32 of 33
stress fixtures. The frontend lint baseline is 10 warnings, 0 errors. Treat anything beyond those
as a regression.

| | |
|---|---|
| `src/app/ide/page.tsx` | 6,267 lines |
| `src/app/home/page.tsx` | 1,665 lines |
| lesson data (6 files) | ~5,200 lines |
| `app/services/interpreter.py` | 1,915 lines |
| `app/services/llm_codegen.py` | 1,251 lines |
| `app/services/executor.py` | 802 lines |
| `codeless` hits | 270 backend / 2 frontend |
| `trace` hits | 101 backend / 101 frontend (only ~5 are `traceback`) |
| `syntaxless` hits | 8 backend / 18 frontend |
| distinct `CODELESS_*` env vars | 28 |
| frontend tests | 0 |
