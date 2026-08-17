# Phase 6 plan — tests and CI

Branch: `phase-6-tests-ci`, cut from `main`.

## Measured baseline

Everything below was run, not remembered.

| | result |
|---|---|
| Backend `pytest -q` | **51 passed**, 1 warning, 1.01s |
| Backend test files | 12 files, 51 tests |
| Backend pytest config | **none** — no `pytest.ini`, no `pyproject.toml`; `tests/conftest.py` sets `sys.path` and `DISABLE_REMOTE_MODELS=1` |
| Frontend tests | **zero.** No test dir, no test script, no test dependency |
| Frontend `tsc --noEmit` | clean |
| Frontend `eslint` | **0 errors, 10 warnings** |
| CI, either repo | **none.** No `.github/` anywhere |

Two facts shape the whole plan:

- The frontend has never had a test. Phase 4's plan said so in writing: *"there is no safety net at all here… this is the weakest-net phase of the whole restructure."* Phase 6 is where that gets paid.
- Three separate times in this restructure a **green suite was the wrong signal** — the `NameError` after the `llm.py` extraction, the test that silently stopped isolating `add_run`, and the Docker probe timeout that quietly downgraded every run. Two of those were structurally invisible to pytest. So this phase is not only "add tests"; it also makes the two checks that *did* catch them permanent.

## What I will test

### Frontend — 4 files, no framework beyond Vitest

Priority order, by "how much student-visible behavior breaks silently if this is wrong":

**1. `src/features/ide/lib/index.ts` — 56 exported pure functions, currently 0 covered.**
This is the single highest-value target in either repo and it needs no DOM, no network, and no React. It is the layer that turns a backend response into what a student actually reads. Concentrating on:

- `buildActionableDiagnostics` (151 lines) — the backend's validation output → the messages in the gutter. If this drifts, students get told the wrong thing about their own code.
- `resolveInterpretationLines`, `normalizeLineNumber`, `getSeverity` — line-number mapping. Off-by-one here points the student at the wrong line, which is worse than no diagnostic at all.
- `extractSuggestedReplacement` — parses a fix out of prose and offers to apply it to the buffer. A bad parse edits the student's file.
- `deriveProblemPreview`, `getProblemStatusLabel`, `getProblemNoticeSeverity` — problem-alignment display.
- The `ExplorerNode` tree operations (`findNodeById`, `updateNodeById`, `removeNodeById`, `duplicateNode`, `insertSiblingAfterId`, `addChildToFolder`, `setAllFoldersOpen`) — recursive, immutable, easy to get subtly wrong, and a wrong one loses a student's file.

**2. `src/lib/subscriptions.ts` — tier gating.**
`tierAllowsMode`, `tierAllowsLayout`, `canCreateProject`, `getProjectLimit`, `getSynthFileLimit`, `normalizeTier`, `isEduEmail`, `isPartneredSchoolEmail`. Pure, and it is a **gate** — the failure mode is failing open. `normalizeTier` in particular takes `unknown` off the wire.

Not testing `getOrCreateSubscription` — it is a Supabase round-trip; see skips.

**3. `src/lib/api/` — mocked at the network boundary.**
Per the phase-6 prompt: stub `fetch`, never our own modules. Covering `request`'s split between `BackendUnreachableError` (fetch rejected) and `BackendResponseError` (server answered and refused) — the IDE shows different copy for each, and getting it backwards tells a student their program was blocked when the server is simply down. Plus URL construction in `artifactUrl` / `openRunStream` / `getRun`, and that `postJson` sets its headers.

**4. `src/design/primitives/` — smoke only.**
Renders, applies the right variant class, forwards `disabled`, `Field` wires `htmlFor`/`aria-describedby`/`aria-invalid` correctly. No snapshots. This is the only frontend target that needs React Testing Library and jsdom — see the framework decision below.

### Backend — filling the gaps the survey found

21 app modules currently have no test importing them. Ranked by risk, I will cover:

**1. `app/platform/subscription_gate.py`** — a gate, untested. Same failing-open argument as the frontend tier logic, and the prompt says policy and governance get the most attention.

**2. `app/pipeline/vibe.py` + the `PipelinePath` bypass** — phase 3 flagged this in writing as a thing the code hid: vibe mode *skips governance*. That a bypass exists is fine; that it is untested is not. Pinning which stages it skips and which it cannot.

**3. `app/pipeline/stage_01_intent/detector.py`** — stage 1 decides what every later stage sees, and nothing tests it.

**4. `app/pipeline/stage_02_interpret/references.py` and `expressions.py`** — shared by every rule module. `references.py` is where the `NameError` lived.

**5. `app/api/routes/interpret.py` and `routes/bugs.py`** — `test_routes.py` covers runs only. Contract-level: status codes, and that a blocked interpretation still returns the shape the IDE destructures.

**6. `app/platform/bug_store.py`** — same store pattern as `run_store.py`, which is tested; this one is not.

### The two checks that caught what pytest could not

**`tests/test_no_free_names.py`** — walks every module in `app/` with `ast`, resolving each `Name` load against builtins, imports, assignments, comprehension targets, and parameters. Anything unresolved is a `NameError` waiting for the first request that reaches that branch. This is exactly the class of bug the `llm.py` extraction introduced, and it is invisible to pytest because the offline suite never reaches those lines. Rebuilding it as a permanent test rather than a scratchpad script.

**`tests/test_api_shapes.py`** — `scripts/capture_api_shapes.py` already produces a structural fingerprint (keys and types, never values) across 9 cases including every blocked path. Nothing commits the expected output, so it is a tool you must remember to run. Committing the fingerprint as a fixture and asserting against it turns it into a regression test. It is the check that caught the `NameError`, not pytest.

## What I will deliberately skip, and why

| Skipped | Why |
|---|---|
| Anything calling live OpenAI | Prompt says so. `conftest.py` already sets `DISABLE_REMOTE_MODELS=1`; I will assert that holds rather than weaken it. |
| Docker sandbox execution in unit tests | Prompt says so. `test_docker_probe.py` tests the *decision* to use Docker, which is the part that broke. Actual container execution stays in the stress suite. |
| Third-party behavior | FastAPI routing, Pydantic validation, Supabase auth, Monaco. Not ours. |
| Next.js page components | 15 screens, heavy Supabase and Monaco mocking, and they assert layout — the highest-maintenance, lowest-signal tests available. The primitives underneath them get smoke tests instead. |
| Snapshot tests | Prompt says so. They fail on every intentional change and get regenerated without reading, which trains people to ignore the suite. |
| `getOrCreateSubscription` | A Supabase round-trip. Testing it means asserting against a mock I wrote, which tests the mock. |
| The 43-fixture stress suite in CI | It executes real Python through the sandbox. See decision 5. |
| The 10 existing eslint warnings | Real but out of scope; cleaning them is a code change, not a test. CI gates on errors only. See CI design. |

## CI design

Two workflows, one per repo, `push` and `pull_request`. Action versions pinned. Dependency caching on. **No secrets** — verified below, not assumed.

**Backend — `.github/workflows/backend.yml`**
```
ubuntu-latest, Python 3.14 (matches local 3.14.6)
actions/checkout@v4 · actions/setup-python@v5 (cache: pip)
pip install -r requirements.txt
python -m pytest -q
```
Needs no secrets: `conftest.py` already forces `DISABLE_REMOTE_MODELS=1`, and the suite runs in 1.01s offline.

**Frontend — `.github/workflows/frontend.yml`**
```
ubuntu-latest, Node 22 LTS
actions/checkout@v4 · actions/setup-node@v4 (cache: npm)
npm ci
npx tsc --noEmit        # currently clean — gates
npx eslint              # gates on errors; 10 warnings do not fail
npx vitest run
npm run build           # prebuild runs copy:monaco
```

*Node version:* local is v26, which is not an LTS line. CI pins 22 LTS. If you would rather CI mirror local exactly, say so and I will pin 26 instead.

*Building without secrets:* every Supabase consumer is a `"use client"` component and `getSupabaseBrowserClient()` constructs lazily inside a function, never at module scope — so nothing touches Supabase env during prerender. `NEXT_PUBLIC_BACKEND_URL` falls back to `http://127.0.0.1:8000`. I expect a clean secret-free build and **will verify it by building with `.env.local` moved aside** before writing the workflow, rather than shipping a workflow that only works on my machine.

## Decisions I need

**1. Vitest — and Testing Library only for the primitives.**
The prompt's default was Vitest + React Testing Library. Having surveyed it, RTL earns its place for exactly one of the four frontend targets; the other three are pure functions needing nothing but a runner. My recommendation: add `vitest` now, and `@testing-library/react` + `jsdom` only for the primitive smoke tests — three devDependencies, none shipped to students. Alternative: Vitest alone, drop the primitive smoke tests, two fewer dependencies. **Which?**

**2. The run-event stream.**
The prompt lists it as a target. The survey says it is not currently testable: the handler is inline in `ws.onmessage` at `use-ide-state.ts:1277`, inside a 2,052-line hook, and its seven event branches (`run_started`, `stdout`, `stderr`, `input_requested`, `artifact_created`, `completed`, `error`) all close over setState. Three options:
- **(a)** Extract a pure `applyRunEvent(state, payload)` reducer and test that. Best coverage of the path students actually hit, but it is an application-code change — which the prompt says to ask about first. My recommendation.
- **(b)** Test through the hook with RTL, jsdom, a fake WebSocket, and a mocked Supabase session. Expensive, brittle, and I already failed three times at faking a Supabase session during phase 4 verification.
- **(c)** Defer to a later phase. **Which?**

**3. Lesson schema validation is not on `main`.**
The prompt lists it as a frontend target, but the 29 YAML lessons, `lesson-schema.ts`, and the `build:lessons` step live on the unmerged `phase-5-lesson-content` branch. Options: merge phase 5 into `main` first and include lesson tests here; or scope phase 6 to `main` and add lesson tests when phase 5 merges. **Which?**

**4. Required check on `main`.**
Do you want CI to be a required status check on `main` (blocking merges), or reporting-only for now? Reporting-only is the safer start given `main` has never had CI. **Which?**

**5. The stress suite in CI.**
`scripts/run_stress_suite.py` runs 43 fixtures through real code execution — currently 33/33 on the ones it asserts. It is the check that caught the Docker probe regression. But it executes Python in a sandbox, so in CI it would fall back to the subprocess sandbox and take real wall-clock. Default: **keep it local/manual**, documented in the README. Alternative: a separate non-blocking CI job so drift is at least visible. **Which?**

## Decisions taken

All four were approved as recommended:

1. **Vitest + Testing Library for the primitives.** Three devDependencies: `vitest`, `jsdom`, `@testing-library/react`. Default environment is `node`; only `primitives.test.tsx` opts into jsdom.
2. **Extract a pure `applyRunEvent` reducer.** Done — see findings.
3. **Scope to `main`.** Lesson schema tests wait for phase 5 to merge.
4. **Reporting-only CI**, not a required check.

Stress suite stays local/manual, as defaulted.

## What actually happened vs. the plan

| Planned | Outcome |
|---|---|
| Backend gaps: gate, vibe, references, detector, routes, bug_store | All but **the stage-1 detector** — see below |
| Free-name check + API shape regression | Both done, both with self-tests |
| Frontend: ide/lib, subscriptions, api, primitives | All four |
| CI builds without secrets | **Wrong** — see findings |

**Not done: `stage_01_intent/detector.py`.** It is still untested. The other five backend targets and all four frontend targets went further than planned (parametrization pushed the count well past what I expected), and I stopped rather than rush the last one. It is the single largest remaining gap and the obvious first item for a follow-up.

## Findings

**The build does not work without Supabase env, contrary to what this plan predicted.** I reasoned that because every consumer is a `"use client"` component and the client constructs lazily, nothing would touch Supabase during the build. That was wrong: Next still prerenders client components, and `/dashboard` calls `getSupabaseBrowserClient()` during that pass. Caught only because the plan committed to verifying it by moving `.env.local` aside instead of asserting it. CI supplies obviously-fake placeholder values — not secrets, and nothing in CI reaches a real project.

**Three branches in `references.py` are unreachable.** Each is shadowed by an earlier branch matching on a strictly weaker condition:

- `raw == "the numbers" and "numbers" in defined_symbols` — the earlier `without_article in defined_symbols` fires first, and emits `local_reference_carryover` where this would have emitted `canonical_naming`.
- `raw == "numbers" and "numbers" in defined_symbols` — shadowed by the very first branch.
- The trailing `mode in {"standard", "abstraction"} and raw in context_symbols` — shadowed by the earlier unguarded `raw in context_symbols`, so the mode gate does nothing.

Pinned as unreachable in `tests/pipeline/test_references.py` rather than deleted; phase 6 adds tests, it does not change behavior. Same open decision as `rule_while_true`.

**`routes/bugs.py` returns `str(exc)` to the browser as a 500 detail.** That is the raw Supabase error body and URL. The `service_role` key is not in it — there are now two tests holding that line — but returning backend internals to a client is worth revisiting.

**A malformed WebSocket frame throws.** `JSON.parse` sits in `ws.onmessage` and always did; the extraction left it there deliberately rather than changing behavior under cover of a refactor. `applyRunEvent` itself tolerates any payload, so the fix is a one-line try/catch when someone wants it.

**Two different `BackendArtifact` types exist** — `@/lib/api/types` (loose, index-signature) and `@/features/ide/types` (strict). The compiler caught this during the extraction. Not reconciled here.

**The store-leak guard is now session-scoped** in `tests/conftest.py`. Verified by planting a deliberate leak: it fails and names the files. The suite itself is clean — the `.codeless_store` entries dated today were from my own manual verification, not from tests.

## Wrap-up

Per the prompt, phase 6 ends by writing `restructure/SUMMARY.md` covering all six phases.
