# Phase 6 — Tests and CI

## Context

A natural-language programming environment for **students learning to program**. Students write plain
English; the backend detects intent, generates governed Python, validates it against safety policy,
and runs it in a Docker sandbox.

- `/Users/danielleknutson/Syntaxless-IDE` — Next.js 16 / React 19 / TS / Tailwind v4 / Supabase / Monaco.
- `/Users/danielleknutson/Syntaxless-IDE-Backend` — FastAPI / Pydantic v2 / OpenAI / Docker sandbox.

Phase 6 of 6, the last. Phases 1–5 should be merged. Read the `restructure/phase-*-plan.md` files
from the earlier phases — each was asked to record what its extracted modules should be tested on.
Start there rather than deciding from scratch.

## Goal

The frontend has **zero tests**. The backend has a reasonable pytest suite (9 files) but it predates
the phase 3 restructure and won't cover the new stage contracts. Close both gaps and make them run
automatically.

**Test what would actually break a student's session**, not what's easy to reach for coverage. A
student hitting a broken run mid-lesson is the failure that matters.

## Scope

### 1. Frontend test setup

Vitest + React Testing Library (**ask before adding — confirm Vitest over Jest for a Next.js 16 /
React 19 project**, and check whether anything is already configured). Include jsdom, a test script
in `package.json`, and a working example so the setup is demonstrably real.

### 2. Frontend coverage — priority order

1. **`src/lib/api/`** — every client function. Request shape, response parsing, error handling,
   non-200s, malformed payloads. Mock at the network boundary (MSW or fetch mocking), not by stubbing
   your own modules — stubbing your own code tests nothing.
2. **Lesson schema validation** (phase 5) — valid content passes; each way content can be malformed
   fails with the right message. Cheap to test, and it's the guard on the thing you'll edit most.
3. **The run-event stream hook** (phase 4) — event ordering, partial output, stream close, error
   events, reconnect if applicable. This is the most stateful thing in the app and the most likely
   to break silently.
4. **Diagnostics mapping** — a backend diagnostics response produces the right line decorations and
   glyph types. Pure logic if phase 4 extracted it properly.
5. **Design primitives** — light smoke tests only. Don't snapshot-test styling; it produces churn
   without catching real bugs.

Skip page-level rendering tests for marketing pages. Low value, high maintenance.

### 3. Backend coverage

- **Every stage boundary in `contracts.py` gets a contract test** — the typed handoffs from phase 3
  are only real if something enforces them. Phase 3 should have added some as it went; fill the gaps.
- Keep `tests/` mirroring `app/`.
- **Policy and governance deserve the most attention**: they're the safety boundary. Test that unsafe
  code is refused, that undefined variables and functions are caught, and that the refusal reaches
  the user as a helpful message rather than a stack trace.
- Preserve the existing tests' intent through the restructure — if one no longer applies, say so
  rather than deleting it quietly.
- The stress suite (`scripts/run_stress_suite.py --disable-remote-models`) stays as-is and stays
  green.

### 4. What NOT to test

- Anything requiring a live OpenAI call. Tests must run offline and deterministically — the existing
  `--disable-remote-models` flag and `CODELESS_DISABLE_REMOTE_MODELS` show the pattern.
- Docker sandbox execution in unit tests. Test the executor's contract with the sandbox (what it
  sends, how it parses events) using a fake, and leave real sandbox execution to the stress suite.
- Third-party library behavior.

### 5. CI

GitHub Actions, one workflow per repo, on push and PR:

- **Frontend:** install → lint → typecheck → test → build.
- **Backend:** install → pytest → stress suite with remote models disabled.
- Pin action versions. Cache dependencies. Keep the run under a few minutes so it stays useful.
- **Do not put secrets in CI** — if a test needs a key, it's the wrong test. Say so instead of
  wiring one up.

## How to work

1. Read the phase 1–5 plan files for their handoff notes. Survey what backend tests exist and what
   they cover post-restructure. Then write `restructure/phase-6-plan.md`: what you'll test, what
   you'll deliberately skip and why, and the CI design. **Stop for approval.**
2. Write tests that fail first where practical — a test that has never failed hasn't been verified to
   test anything.
3. Don't chase a coverage number. If you report coverage, report it as information, not a goal.

## Verify (show me real output)

```bash
cd /Users/danielleknutson/Syntaxless-IDE && npm run lint && npm run test && npm run build
```

```bash
cd /Users/danielleknutson/Syntaxless-IDE-Backend && pytest && python scripts/run_stress_suite.py --disable-remote-models
```

- Show the actual test output, including counts.
- Show CI passing on a real PR, not just the workflow file.
- Demonstrate that the tests catch something: break one thing deliberately, show the red, revert it.

## Ask me before

- Adding any test framework or library.
- Adding a CI service beyond GitHub Actions.
- Making CI a required check on `main` (that's a workflow decision for the team).
- Changing application code to make it testable — if something can't be tested without a change,
  tell me what and why rather than quietly refactoring in a test phase.

## Done when

- `npm run test` exists, runs, and covers the API client, lesson schema, run-event stream, and
  diagnostics mapping.
- Every phase-3 stage contract has a test.
- Policy and governance refusals are tested, including the message the student sees.
- All tests run offline and deterministically — no network, no Docker, no API keys.
- CI runs both repos on push and PR, and has passed on a real PR.
- You've shown a deliberately broken test going red and then green again.

## Wrap up

This is the last phase. Write `restructure/SUMMARY.md`: what changed across all six phases, what was
deliberately left undone, and the open decisions still outstanding — the product name, the env-var
cutover, and anything the earlier phases flagged and deferred.
