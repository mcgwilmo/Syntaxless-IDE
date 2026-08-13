# Phase 3 plan — backend pipeline and typed contracts

Surveyed 2026-08-12 on backend branch `phase-3-backend-pipeline` (off phase 1).
**Awaiting approval — nothing has been changed.**

## The stage list in the phase-3 prompt is wrong

The prompt proposed `stage_01_intent / stage_02_codegen / stage_03_policy / stage_04_execution`.
Having read the code, that misrepresents the system in four ways. The prompt asked me to follow the
code and say so.

**1. It omits the two largest stages.** Interpretation and governance are where the work happens.
Between "intent" and "codegen" sit `interpret_document_with_llm` (1,915 lines) and
`govern_interpreted_program`, which is what actually decides `execution_allowed`.

**2. Policy is not one stage — it runs twice, on different things.**

| function | operates on | called from |
|---|---|---|
| `review_semantic_safety` | the document / IR | `governor.py:78`, and both vibe paths (`llm_codegen.py:528,598`) |
| `validate_generated_python` | the emitted Python | `routes.py:218` — the **route**, not the pipeline |

A single `stage_03_policy` would have to be in two places at once.

**3. Execution is not a pipeline stage.** It is async, session-based, and streams over a WebSocket.
`start_execution_session` is called from the route and then driven by `WS /run/{run_id}/stream`. It
cannot sit in a synchronous stage sequence.

**4. There are two pipelines, not one.** `vibe` mode short-circuits the entire governed path in both
entry points (`llm_codegen.py:1016` and `:1110`), going straight to `_analysis_only_vibe` or
`_direct_codegen_vibe`. Any decomposition that models only the governed path will be a lie about
half the system.

## What the pipeline actually is

Two entry points in `llm_codegen.py`, which is the de-facto orchestrator:

```
analyze_document()            -> POST /interpret
  vibe?  -> _analysis_only_vibe + problem_alignment                         [BYPASS]
  else   -> interpret -> govern -> problem_alignment -> normalize lines
            -> (problem_solving only) LLM problem review

generate_code_with_llm()      -> POST /run/start
  vibe?  -> _direct_codegen_vibe + problem_alignment                        [BYPASS]
  else   -> analyze_document (everything above)
            -> if blocked, return
            -> codegen: llm_primary -> deterministic -> llm_fallback
            -> LLM line feedback
```

Then the **route** continues the pipeline:

```
routes.start_run()
  -> subscription gate
  -> generate_code_with_llm (above)
  -> validate_generated_python          <- policy, in the route
  -> add_run (persist)
  -> start_execution_session            <- execution, async + streaming
```

`specificity_scorer` is **not a stage** — `governor.py:82` calls it. It is a component of governance.

## The single most valuable finding

`_heuristic_interpret_document` (`interpreter.py:612-1502`) is **890 lines in one function** — the
largest in either repo. Its shape is:

```python
for index, raw in enumerate(active_document.splitlines(), start=1):
    ...
    if m := re.match(PATTERN_1, lowered):  ...   # "set X to Y"
    if m := re.match(PATTERN_2, lowered):  ...   # "sort the list"
    ...                                          # 45 regex patterns in total
```

One loop, **45 sequential regex branches**, each recognising one natural-language construct.

That is not a tangle — it is a **rule table that was never given a table**. It decomposes cleanly
into a dispatcher plus ~45 small named rules, and doing so directly serves the scaling goal: adding
a new construct becomes "add a rule", not "insert a branch at the right point in an 890-line
function". This is the highest-value refactor in the entire restructure and I would sequence it
first among the splits.

## Proposed structure

```
app/
  api/
    routes/            interpret.py, runs.py, bugs.py, health.py
    deps.py
    responses.py       <- the blocked-response shape, built 4x today
  pipeline/
    contracts.py       typed IO for every boundary
    pipeline.py        analyze() and generate() as readable narratives
    stage_01_intent/
    stage_02_interpret/
      rules/           ~45 named rules extracted from the 890-line function
      dispatcher.py
      expressions.py   _natural_expression_to_python, _condition_to_python, parsing helpers
    stage_03_govern/   governor + specificity_scorer + semantic safety
    stage_04_align/    problem_alignment + its LLM review
    stage_05_codegen/  the three-way fallback chain + generator
    stage_06_feedback/ line-feedback enrichment
    vibe.py            the bypass path, named rather than hidden in an if
    guards.py          validate_generated_python, moved out of the route
  execution/           executor + session lifecycle (NOT a pipeline stage)
  domain/              ir.py, value types
  platform/            run_store, bug_store, subscription_gate, branding
  content/             learning_center_examples
```

Deviations from the prompt, all deliberate: six stages not four; `vibe.py` and `guards.py` as
first-class members; `execution/` outside `pipeline/`.

## Per-module split

| module | lines | plan |
|---|---|---|
| `interpreter.py` | 1,915 | Dispatcher + 45 rules + expression helpers. The bulk is mechanical once the rule signature is fixed. |
| `llm_codegen.py` | 1,260 | Split by role: orchestration → `pipeline.py`; codegen paths → `stage_05`; feedback → `stage_06`; vibe → `vibe.py`; dev-metrics → `platform/metrics.py`. |
| `executor.py` | 813 | `ExecutionSession` (445 lines) is a coherent class — move whole. Split out mode selection, the runtime prelude (a 150-line embedded Python template), and env building. |
| `problem_alignment.py` | 605 | Already well-factored — mostly a move, plus splitting problem-model derivation from solution-model derivation. |
| `specificity_scorer.py` | 588 | Move under `stage_03_govern/` as the component it is. |
| `routes.py` | 381 | Split by concern; extract the 4x-duplicated blocked-response builder. `start_run` alone is 121 lines. |

## Risks

- **The route currently owns pipeline steps.** Moving `validate_generated_python` out of the route
  changes where a blocked response is produced. Response shape must stay byte-identical.
- **The blocked-response shape is duplicated 4 times.** Unifying it is the point, but any drift
  between the copies today becomes a behavior change. I will diff them before merging.
- **Two caches** (`_ANALYSIS_CACHE`, keyed by payload hash). Moving cache boundaries can change hit
  rates and therefore latency and cost.
- **`analyze_document` is called by `generate_code_with_llm`.** They are not siblings; one wraps the
  other. Easy to break by "parallelising" them.
- **The 3 failing unit tests and `T27_vibe`** are in exactly the areas being moved
  (interpreter/generator, problem alignment, vibe). They stay failing — that is the baseline — but
  they will not warn me if I break something nearby, so those areas need extra manual verification.

## Sequencing

Each step ends green against the baseline (26 passed / 3 failed, 32 of 33 stress) before the next.

1. Scaffold `contracts.py` with the types, no behavior change
2. Pure moves: `domain/`, `platform/`, `content/`, `execution/` — relocate, do not edit
3. `stage_04_align`, `stage_03_govern` (self-contained, low risk)
4. `stage_02_interpret` — the rule-table extraction, one batch of rules at a time
5. `stage_05_codegen` + `stage_06_feedback` + `vibe.py`
6. `pipeline.py` — compose the narrative
7. `api/routes/` split + `guards.py` move
8. `tests/` mirrored, contract tests at each boundary

## Verification

Per step: `pytest` (baseline 26/3) and `python scripts/run_stress_suite.py --disable-remote-models`
(baseline 32/33). At the end, a real end-to-end run through the frontend — the stress suite runs
offline and will not catch a broken sandbox event protocol or a changed WebSocket shape.

---

# Outcome — 3a and 3b (2026-08-12)

Branch `phase-3-backend-pipeline`, four commits. Baseline held at every step:
**26 passed / 3 failed** (+17 new pipeline tests) and **32 of 33** stress fixtures.

## Done

`app/services/` no longer exists. The layout now states the pipeline order:

```
app/pipeline/  contracts.py  policy.py  orchestrator.py
               stage_01_intent/  stage_02_interpret/  stage_03_govern/
               stage_04_align/   stage_05_codegen/
app/domain/    ir.py  mode_policy.py
app/platform/  branding  run_store  bug_store  subscription_gate
app/execution/ executor.py
app/content/   learning_center_examples.py
```

`contracts.py` names every stage handoff, with five tests validating the models against real stage
output so they cannot drift into fiction. Two things it makes explicit that the code hid: the vibe
bypass (`PipelinePath`), and that the two policy checks run at different points on different
artifacts.

The interpreter went **1,916 → 1,575 lines**: 13 pure expression helpers extracted, the shared
mutable state named as `InterpreterState`, and the first 5 of 45 rules moved into a real table.

## Not done — 40 rules remain

The pattern is proven and the infrastructure is in place; the remaining 40 rules are the same
mechanical shape. Two hard-won constraints for whoever continues:

1. **Extract only contiguous runs.** Order is semantically load-bearing — `if m: ... continue` is
   first-match-wins. `break` was left inline precisely because a `call` rule sits between it and
   `function_def`; taking it would have reordered it.
2. **Diff every rule against the branch it replaces.** I wrote `rule_break` from memory and got the
   kind and confidence wrong. The stress suite would probably have caught it; nothing guarantees
   that for a rarer construct.

3c (orchestrator split, routes split, moving `validate_generated_python` into `guards.py`) is
untouched, as planned.

## Behavior left alone

`T27_vibe` and the 3 unit failures are unchanged and pre-existing. Per the phase rules I did not fix
them: doing so mid-refactor would make it impossible to attribute any later breakage.

---

## Decisions I need

| | question | my recommendation |
|---|---|---|
| **D1** | Six stages + `vibe.py` + `guards.py`, instead of the prompt's four? | Yes — the four-stage version cannot represent policy running twice or the vibe bypass. |
| **D2** | `execution/` as a top-level package rather than a pipeline stage? | Yes. It is async and streaming; putting it in a synchronous stage sequence would misdescribe it. |
| **D3** | Move `validate_generated_python` out of the route into `pipeline/guards.py`? | Yes, but it is the riskiest single move here. Response shapes stay identical and I will diff all four blocked-response builders first. |
| **D4** | Scope: this is a big phase. Split it? | **Consider splitting.** 3a = moves + govern/align + contracts (low risk, immediate legibility). 3b = the interpreter rule table (the valuable, slow one). 3c = codegen/routes. Each is independently shippable and reviewable. My recommendation is to do 3a and 3b, and hold 3c until phase 4 has settled the frontend contract. |
| **D5** | The 3 failing tests are in the code being moved. Fix them first? | They are pre-existing behavior bugs, not structural. Fixing them mid-refactor makes it impossible to tell which change caused what. I would leave them, but flag that they reduce the safety net exactly where the risk is highest. |
