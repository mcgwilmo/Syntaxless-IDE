# Phase 3 — Backend: pipeline structure and typed contracts

## Context

A natural-language programming environment for **students learning to program**. Students write plain
English; the backend detects intent, generates governed Python, validates it against safety policy,
and runs it in a Docker sandbox.

- `/Users/danielleknutson/Syntaxless-IDE-Backend` — FastAPI / Pydantic v2 / OpenAI / Docker sandbox. ~8.9k lines. Baseline: 26 pytest passed / 3 failed, 32 of 33 stress fixtures -- these fail on a clean checkout, see the backend README.
- `/Users/danielleknutson/Syntaxless-IDE` — Next.js frontend (not restructured this phase, but it
  calls this API — contracts must not change).

Phase 3 of 6. Phase 1 (naming/branding) should be merged first. **This is the highest-risk phase.**

## Goal

Two things, and the second is the real one:

1. **Scale** — five god modules are unmaintainable.
2. **Interpretability** — right now nothing in the layout tells a reader that these services form an
   *ordered pipeline*. `app/services/` is a flat bucket of 14 unrelated concerns: intent detection,
   codegen, policy, governance, execution, storage, billing, and lesson content, all siblings.

After this phase, someone should be able to read **one file** — `app/pipeline/pipeline.py` — and
understand the whole system.

## Current state

```
app/
  api/routes.py              381 lines, every endpoint
  models/ir.py                86
  schemas/                    run_schema, bug_report_schema
  services/                  ← flat bucket of 14
    interpreter.py          1915  ⚠️
    llm_codegen.py          1251  ⚠️
    executor.py              802  ⚠️
    problem_alignment.py     605  ⚠️
    specificity_scorer.py    583  ⚠️
    intent_detector.py       444
    generator.py             442
    governor.py              263
    run_store.py             229
    policy.py                214
    mode_policy.py           163
    learning_center_examples.py  85
    bug_store.py              68
    subscription_gate.py      46
main.py                       36
sandbox/runner.py            276
```

## Target

```
main.py
app/
  api/
    routes/          # split by concern: interpret, runs, bugs, health
    deps.py
  pipeline/          # the ordered stages — this package IS the product's story
    stage_01_intent/
    stage_02_codegen/
    stage_03_policy/
    stage_04_execution/
    pipeline.py      # one readable function composing the stages
    contracts.py     # typed input/output for EVERY stage boundary
  domain/            # models, IR, value types
  platform/          # run_store, bug_store, subscription_gate, config, branding, logging
  content/           # learning_center_examples
sandbox/
tests/               # mirrors app/
docs/
```

Rules:

- **Every stage has an explicit typed input and output** in `contracts.py`. This is the core
  deliverable — the handoffs are currently implicit and that's what makes the system hard to read.
- **No module over ~400 lines.** Split god modules along their *real seams* — find the natural
  boundaries by reading them, don't chop at line counts.
- Numeric stage prefixes are deliberate: they encode order for someone scanning the directory.
- The stage list above is my guess from the README. **If the actual code says the pipeline has
  different stages, follow the code and tell me** — governance and problem-alignment may deserve
  their own stages rather than living inside others.

## Hard constraints

- **The HTTP API cannot change.** Route paths, request shapes, response shapes, WebSocket event
  format — all identical. The frontend is not being updated in this phase. Current surface:
  `POST /interpret`, `POST /run/start`, `POST /run` (legacy alias), `WS /run/{run_id}/stream`,
  `GET /runs`, `GET /runs/{run_id}`, `GET /run/{run_id}/artifacts/{artifact_name}`,
  `POST /bugs/report`.
- **The sandbox event protocol cannot change.** `sandbox/runner.py` and the executor agree on a
  sentinel prefix for event lines. Moving the executor must not alter what crosses that boundary.
- **Pipeline semantics stay identical.** Same inputs produce the same generated code and the same
  policy decisions. This is a refactor, not a redesign.
- Docker is required in production; the host subprocess fallback is dev-only and gated behind
  `CODELESS_ALLOW_SUBPROCESS_FALLBACK=1`. Preserve that gating exactly.

## How to work

1. **Read the five god modules properly before planning anything.** Find their real seams. Then write
   `restructure/phase-3-plan.md`: the stage decomposition, the `contracts.py` type sketches, a
   file-by-file move/split map, and where you disagree with the target above. **Stop for approval.**
2. Execute **one stage at a time**, in dependency order, with tests passing between each. Do not move
   everything and then fix it up.
3. **Pure moves stay pure.** Relocate a file unchanged in one commit; split or edit it in the next.
   A reviewer must be able to see that a move changed nothing.
4. **Add a test at every stage boundary as you create it** — the contract is only real if something
   checks it. Don't defer these to phase 6.
5. Keep `tests/` mirroring `app/` as you go.

## Verify (show me real output, every time)

```bash
cd /Users/danielleknutson/Syntaxless-IDE-Backend && pytest
```

```bash
cd /Users/danielleknutson/Syntaxless-IDE-Backend && python scripts/run_stress_suite.py --disable-remote-models
```

Then **run the real stack** — backend plus frontend — and confirm a natural-language program still
generates, passes policy, executes in the Docker sandbox, and streams output back. The unit tests
will not catch a broken sandbox event protocol.

If anything fails, show me the actual failure output. Do not describe a run as passing that you
haven't run.

## Ask me before

- Changing any route path, request shape, response shape, or WS event.
- Changing the sandbox event protocol or the sentinel value.
- Changing generation, governance, or policy *behavior* — including "obvious" fixes. Note bugs you
  find in the plan; don't fix them here, or we won't know whether the refactor or the fix broke it.
- Changing the subscription gate or tier enforcement.
- Adding a dependency.
- Deleting anything not provably dead.

## Done when

- `app/pipeline/pipeline.py` reads as a clear narrative of the system, top to bottom.
- Every stage boundary has a type in `contracts.py` and a test.
- No module over ~400 lines.
- `app/services/` is gone; every module lives in `pipeline/`, `domain/`, `platform/`, or `content/`.
- Routes are split by concern.
- `tests/` mirrors `app/`.
- pytest and the stress suite pass, and a real end-to-end run works, with output shown.

## Hand off

In the plan file, record any behavior that looked wrong but you left alone, and the final API surface
so phase 4 can build a typed client against it.
