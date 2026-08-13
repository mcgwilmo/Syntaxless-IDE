# Phase 1 plan — naming sweep, brand centralization, docs

Surveyed 2026-08-12. **Awaiting approval — nothing has been changed.**

## Headline: the phase-1 "done" condition was wrong

The prompt said *"grepping either repo for `syntaxless` or `codeless` returns nothing."*
**That is not safely achievable**, and shipping it would break things. The survey found that a
substantial fraction of those hits are not branding at all — they're persisted storage keys, a
data-format version stamped into every saved run, a sandbox wire protocol, and LLM tool names and
system-prompt text.

Renaming them isn't a rename; it's a data migration plus a prompt change. Revised target below.

## Re-measured counts (match the earlier survey)

| term | frontend | backend |
|---|---|---|
| `codeless` | 2 hits / 2 files | 270 hits / 24 files |
| `trace` | 95 hits / 5 files | 101 hits / 15 files (66 in docs) |
| `syntaxless` | 18 hits / 6 files | 8 hits / 5 files |

Backend docs are 4,672 lines across 10 `.md` files plus one generated `.json`.

---

## Classification — every hit, by what it actually is

### A. Safe cosmetic renames (internal identifiers, no persistence, no user impact)

| what | where |
|---|---|
| Monaco theme names `trace-dark` / `trace-light` | `ide/page.tsx:623,639,4802,5422` |
| Local style vars `traceCardClass`, `traceTitleClass`, `traceBodyClass`, `traceLabelClass`, `tracePanelClass`, `traceAccentLineClass`, `traceAccentFillClass`, `traceAccentTextClass` | `home/page.tsx:538-549` |
| Component `TraceHeroStage` | `home/page.tsx:374,667` |
| Data consts `traceLearningSettings`, `traceWorkflowStages`, `traceFocusAreas`, `traceProjectSignals` | `home/page.tsx:94-129` |
| Generated-snippet vars `_CODELESS_EVENT_PREFIX`, `_codeless_json` | `executor.py:148,154` (inside a string template — care needed) |

**Action:** rename freely to neutral names (`heroStage`, `cardClass`, `editorThemeDark`, …).

### B. User-visible brand prose → route through `BRAND.name`

`home/page.tsx` (~20 hits: testimonials, headings, feature copy), `layout.tsx:23` (metadata
description, currently "T.R.A.C.E. is a browser-based syntaxless IDE…"), `site-shell.tsx:353`,
`docs/page.tsx` (4 changelog entries), `dashboard/page.tsx` (3), `ide/page.tsx:1480`
("TRACE interpreted this line."), `BugReportModal.tsx:108` ("CodeLess"),
`interactive-image-accordion.tsx:85` (aria-label).

**Action:** replace literals with `BRAND.name`. Note `docs/page.tsx` entries are a **historical
changelog** — rewriting past entries to a new name arguably falsifies the record. Recommend leaving
changelog prose as written and only templating forward-facing copy. **Flagging for your call.**

### C. ⚠️ Persisted state and data formats — DO NOT rename in phase 1

| what | where | what breaks if renamed |
|---|---|---|
| `THEME_STORAGE_KEY = "trace-ui-theme"` | `theme-provider.tsx:15` | Every user's saved light/dark preference resets |
| `` `codeless:problem:${projectId}` `` | `ide/page.tsx:2393` | Every user's saved problem state is orphaned |
| `REPRESENTATION_VERSION = "trace_ir_v1"` | `models/ir.py:5` | Stamped into **every persisted run record** and returned in API responses; asserted in `test_routes.py` (×3), `test_run_store.py` (×2), `test_mode_policy.py`. Not read by the frontend (verified). |
| `STORAGE_ROOT = ".codeless_store"` | `run_store.py:11` | The actual run-data directory on the deployed backend. Renaming orphans all run history. Also in `.gitignore:10`. |
| `__CODELESS_EVENT__` | `executor.py:36`, `sandbox/runner.py:9` | Sandbox↔host wire protocol |

**Action:** leave every value unchanged. Centralize each behind a named constant in one place so a
future migration is a one-line change, and document the migration each would need. The sentinel gets
the shared-module treatment the prompt asked for (below).

### D. ⚠️ LLM tool names and system-prompt text — behavior risk, not cosmetics

| what | where |
|---|---|
| `"name": "syntaxless_specificity_score"` | `specificity_scorer.py:41` |
| `"name": "syntaxless_line_intent"` | `intent_detector.py:29` |
| `"name": "trace_line_feedback_result"` | `llm_codegen.py:98` |
| `"name": "trace_problem_alignment_review_result"` | `llm_codegen.py:130` |
| `"You are the SyntaxLess IDE intent engine."` | `llm_codegen.py:213` |
| `"You are TRACE's Problem Solving reviewer."` | `llm_codegen.py:847` |
| `"You are TRACE's line feedback engine."` | `llm_codegen.py:918` |
| `"Compare the student's syntaxless solution…"` | `llm_codegen.py:849` |

These are OpenAI function-calling tool names and system prompts. **Changing prompt text can change
model output.** The phase-3 prompt explicitly forbids behavior changes during a refactor; the same
logic applies here, and there's no way to verify a prompt change without an eval set we don't have.

**Action:** leave alone in phase 1. Flag for a deliberate, separately-verified change later.

### E. `syntaxless` as domain vocabulary, not branding

`ide/page.tsx:185` — `source: "syntaxless" | "problem"` — a discriminated union tag distinguishing
two kinds of diagnostic. Also `:1474-1479` (ID construction, `getDiagnosticTitle`). This is a
**semantic** value that happens to share a word with the old brand. It should not become the new
brand name; it should become something descriptive.

Separately, ~8 prose uses treat "syntaxless" as a **common adjective**: "your syntaxless code",
"a fresh syntaxless workspace", "the syntaxless source file". If the product stops being called
Syntaxless IDE, does the word survive as vocabulary? That's a copy decision, not a mechanical one.

**Needs your decision — see D1 and D2 below.**

---

## Work I'll do, assuming approval

### 1. `src/config/brand.ts` and `app/platform/branding.py`
`BRAND.name`, `.shortName`, `.tagline`, `.domain`, logo paths. Backend equivalent plus a single
`ENV_PREFIX` constant that all 28 env-var lookups route through (**values unchanged**).

### 2. Shared event sentinel
Define `__CODELESS_EVENT__` in one module imported by both `executor.py` and `sandbox/runner.py`,
so the two copies can't drift. **Value unchanged** — no rebuild/redeploy coordination needed.
Verify the sandbox Dockerfile actually copies the shared module in, or this breaks at runtime.

### 3. Category A renames + category B templating.

### 4. Assets
Rename referenced assets to role-based kebab-case, route through `BRAND`:

| current | new |
|---|---|
| `brand/trace logo.png` | `brand/logo.png` |
| `brand/trace logo graphic.png` | `brand/logo-mark.png` |
| `brand/ide window.png` / `ide window light.png` | `brand/ide-window.png` / `ide-window-light.png` |
| `brand/profile photo.png` | `brand/profile-photo.png` |
| `content/*.png` (8 files) | kebab-case |

**7 assets have zero references**: `trace logo dark.png`, `trace logo home.png`,
`trace logo updated.png`, `trace logo updated dark.png`, `logo/codeless-mark.png`,
`brand/id8-logo.png`, `brand/antivenom-logo.png`. Note this corrects my earlier guess that id8 and
antivenom were partner marks in active use — they aren't referenced anywhere. **See D5.**

### 5. Docs
Rewrite both READMEs (backend's describes a `/frontend` + `/backend` monorepo that doesn't exist,
and documents 2 env vars when there are 31). Consolidate 10 backend docs → proposed 5:
`architecture.md`, `development.md`, `testing.md`, `deployment.md`, `troubleshooting.md`.
Onboarding content folds into README + development. Stress results are generated output — leave.

---

## Decisions I need from you

| | question | my recommendation |
|---|---|---|
| **D1** | Rename the `"syntaxless" \| "problem"` diagnostic tag to what? | `"language"` — it distinguishes language-level diagnostics from problem-alignment ones. Internal only, no persistence. |
| **D2** | Is "syntaxless" still product vocabulary in user copy? | Keep it as a common adjective. It describes what the product *does* and doesn't depend on the brand name. |
| **D3** | Rename LLM tool names / prompt text? | **No.** Behavior risk with no eval set to verify against. Defer. |
| **D4** | Rename persisted keys (theme, problem state, IR version, store dir)? | **No.** Centralize now, migrate deliberately later. |
| **D5** | Delete the 7 unreferenced assets? | Delete the 5 old logo variants. **Keep** `id8-logo.png` and `antivenom-logo.png` pending your word — unreferenced isn't the same as unwanted. |
| **D6** | `docs/trace-backend-improvement-plan.md` (637 lines) — live or stale? | Unknown. Excluded from consolidation until you say. |
| **D7** | `docs/page.tsx` changelog — rewrite historical entries to the new brand? | No. Leave the record as written. |

## Revised done condition

- `codeless` and `syntaxless` remain **only** in category C and D locations, each behind a named
  constant, each documented with the migration it would need.
- `trace` remains only as ordinary programming vocabulary (`traceback`) plus categories C and D.
- Product name lives in `brand.ts` / `branding.py`; renaming is a one-line change **for display
  purposes** — with a documented, separately-scheduled migration for persisted identifiers.
- Event sentinel defined once, value unchanged.
- Both READMEs accurate; docs consolidated.
- `npm run build`, `npm run lint`, `pytest`, stress suite all pass; a real end-to-end run works.
