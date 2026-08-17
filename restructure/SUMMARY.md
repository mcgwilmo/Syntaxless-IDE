# The restructure, end to end

Six phases across two repositories, from a codebase with no design system, no
frontend tests, and no CI, to one with all three.

The goal set at the start was three things at once: **easier to scale**, **better
for interpretability**, and **good for students without intimidating them**.
Those pull in different directions more often than they agree, and where they
did, the student won.

---

## What each phase did

### Phase 1 — naming and docs

Branding was scattered across 28 environment variables, storage keys, and user
facing strings, each spelling the product name slightly differently. Centralized
behind `branding.py` / `config/brand.ts` and one `env_key()` helper, so renaming
the product is now a config change rather than an archaeology project.

The sandbox wire protocol (`__CODELESS_EVENT__`) is duplicated by necessity —
the Dockerfile copies only `runner.py`, so it cannot import a shared constant.
Pinned with a contract test that parses `runner.py` with `ast` instead.

### Phase 2 — the design system

CSS custom properties with semantic names (`--surface-raised`, not
`--warm-grey-100`), light-first, dark as an override, wired into Tailwind's
`@theme`. Warm off-white replaced cold slate; base font size went to 15px and
line-height to 1.6, because crowding reads as difficulty.

Then five primitives — `Button`, `Field`, `Card`/`Panel`/`Badge`, `Callout` — so
call sites stop branching on `isLight`.

Every color was measured for contrast rather than eyeballed.

### Phase 3 — the backend pipeline

The largest change. A flat `app/` became six named stages:

```
stage_01_intent → stage_02_interpret → stage_03_govern
                → stage_04_align → stage_05_codegen → stage_06_feedback
```

`contracts.py` names every handoff between them, which made two things explicit
that the code had hidden: that the two policy checks run at different points on
different artifacts, and that **vibe mode bypasses governance entirely**
(`PipelinePath`). The bypass was always there; it just read as an `if` at the
top of a function.

Inside stage 2, 45 sequential regex branches became an ordered, named rule table
where **order is semantics** — first match wins, and the ordering is now
something you can read rather than infer. `interpreter.py` went from 1,916 lines
to 809.

**Phase 3c** split the orchestrator from the route layer, and its review found a
test that had silently stopped isolating `add_run` and was writing live records
while passing green.

### Phase 4a — IDE state

2,000 lines of IDE state moved out of the page component into a hook behind a
context. The decision to use Context rather than props was made by measurement:
the JSX regions needed 46–59 identifiers each.

Phase 4b — migrating the remaining ~105 `isLight` uses — is still outstanding.

### Phase 5 — lesson content

29 lessons moved out of TypeScript and into YAML, compiled to a TS module at
build time so `yaml` stays a devDependency and the runtime bundle does not grow.
Lessons are now editable by someone who does not write TypeScript, which was the
point.

### Phase 6 — tests and CI

Covered below.

---

## Three real bugs, found by looking rather than by testing

These had been sitting behind "known failing tests" and were assumed cosmetic.
All three were student-visible.

**Loop bodies fell out of their loops.** The interpreter discarded indentation
and re-derived structure by asking "does this line mention the loop variable?".
A body line that did not mention it was hoisted out of the loop. Fixed by
honoring the indentation the student actually typed.

**Undefined references reported `status: valid`.** A line referring to something
that did not exist passed validation, then failed at Run with an internal
message. It now blocks at check time and says which name it could not resolve.

**Problem alignment reported the wrong reason.** It had already computed the
specific `logic_mismatch` and then returned the generic `edge_case_risk`.

Plus one infrastructure bug with a large blast radius: the **Docker probe
timeout was 2 seconds against a real probe time of 3.1 seconds**, so every run
silently downgraded to the weaker subprocess sandbox. Fixing it also fixed a
stress fixture that had been failing for unrelated-looking reasons — the suite
went 32/33 → **33/33**.

Monaco was also self-hosted (15MB → 4.7MB after pruning unused workers and
locales), so a blocked CDN no longer blanks the editor.

---

## Phase 6 in detail

### Before

| | |
|---|---|
| Backend | 51 tests, no pytest config |
| Frontend | **zero tests** — no directory, no script, no dependency |
| CI | **none**, either repo |

Phase 4's plan had said so in writing: *"there is no safety net at all here…
this is the weakest-net phase of the whole restructure."*

### After

| | before | after |
|---|---|---|
| Backend | 51 | **261** (250 passed, 11 skipped) |
| Frontend | 0 | **280** |
| CI | none | one workflow per repo |

### What got tested, and why that

**Frontend.** The highest-value target turned out not to be React at all:
`features/ide/lib/index.ts` held 56 exported pure functions with no coverage,
including the 151-line `buildActionableDiagnostics` — the layer that turns a
backend response into the words a student reads — and the line-number mapping
that decides *which* line gets flagged. A diagnostic on the wrong line is worse
than no diagnostic, because the student trusts it and edits the wrong code.

Also covered: tier gating (a gate, so the failure mode is failing open), the API
boundary mocked at `fetch` rather than at our own modules, the file-tree
operations (where a bug loses a student's file), and accessibility wiring on the
primitives.

**Backend.** 21 modules had no test importing them. The two worst were
`subscription_gate.py` — access control that had never been tested — and
`vibe.py`, the path that skips governance. An untested bypass around the safety
layer is the worst-placed gap in the repo.

### The two checks that exist because pytest could not have caught it

Three times during this restructure, **a green suite was the wrong signal**. Two
of those were structurally invisible to pytest, so both are now permanent tests:

- **`test_no_free_names.py`** walks every module with `ast` and resolves every
  name load. This catches the class of bug the phase-3 `llm.py` extraction
  introduced — a helper referenced after its import was dropped, on a branch the
  offline suite never reaches. An unexecuted line is an untested line; reading
  the AST does not care whether a line ever runs.
- **`test_api_shapes.py`** turns the existing shape-capture script into a
  regression test with a committed fixture. It is what actually caught that
  `NameError` — but only because someone happened to think of running it.

Both have self-tests proving they can fail, because a clean pass proves nothing
otherwise. The store-leak guard from phase 3c is now session-scoped in
`conftest.py` and was verified by planting a deliberate leak.

### CI

One workflow per repo, on push and PR, **reporting-only** — not a required check
on `main` yet. Backend: pytest, offline, ~1s. Frontend: typecheck, lint, tests,
build.

The plan predicted the frontend would build without any Supabase configuration,
reasoning that every consumer is a client component and the client constructs
lazily. **That was wrong** — Next still prerenders client components, and
`/dashboard` calls `getSupabaseBrowserClient()` during that pass. It was caught
only because the plan committed to verifying it by moving `.env.local` aside
rather than asserting it. CI supplies obviously-fake placeholders; nothing in CI
touches a real project, and no secret goes near it.

---

## Recurring lessons

**Transcribe, never reconstruct.** Writing a rule from memory produced the wrong
kind and the wrong confidence. Diffing against source caught it. Every rule and
every table since was transcribed.

**A green suite is not evidence.** Three separate times it was actively
misleading. Static analysis and shape capture caught what test execution
structurally could not.

**Assert the literal, not the derived.** The tier matrix is asserted as a
transcribed literal in both repos. Deriving it from the implementation would
make the test agree with any change, including a wrong one — and there are two
copies of that policy, one per repo, so drift is the expected failure.

**Verify the thing you are about to claim.** The secret-free build, the store
isolation, the unreachable branches — each was a confident belief that turned
out to be checkable, and two of the three were wrong.

---

## Still open

**Decisions**

- **The product name.** "Rosetta" has live trademark and SEO conflicts.
- **`rule_while_true`** is unreachable — delete it, or reorder it ahead of
  `rule_while`.
- **Three unreachable branches in `references.py`**, found in phase 6 and pinned
  as unreachable rather than deleted. Same call as above.

**Work**

- **Phase 4b** — ~105 `isLight` uses across 15 screens still on hardcoded colors.
- **`stage_01_intent/detector.py`** is the one planned phase-6 target left
  untested. The largest remaining coverage gap.
- **Lesson schema tests** — deferred because phase 5 is unmerged.
- **Storage-key migration** and the **LLM prompt/tool-name rename** (the latter
  needs an eval set first), both deferred from phase 1.
- Two smaller findings: `routes/bugs.py` returns raw backend error text to the
  browser, and there are two different `BackendArtifact` types.

**Branches** — `ui-skeuomorphic`, `phase-5-lesson-content`, and phase 6 are all
unmerged. Phase 6's frontend work sits on top of `feat/localized-runtime-errors`
because the run-event extraction covers an event that exists only there.
