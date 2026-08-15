# Product improvements — evidence-based

Investigated 2026-08-13. Everything below is reproduced, not suspected.

The three "known-failing tests" I have been carrying as a baseline since phase 1 are not flaky
tests. They are three real bugs in the core learning loop, and nobody had diagnosed them.

---

## 1. Loop bodies silently fall out of the loop — **critical**

A student writes this, indented exactly as you would expect:

```
make a list called test_list with 1, 2, 3, 4, 5
create an empty list called output
for each element in test_list
    store the product of the element and 3 in var_p
    print var_p
    append var_p to the end of output
print output
```

and gets this Python:

```python
test_list = [1, 2, 3, 4, 5]
output = []
for element in test_list:
    var_p = element * 3
print(var_p)              # ← outside the loop
output.append(var_p)      # ← outside the loop
print(output)
```

It runs. It prints one number instead of five and a one-item list instead of five.

**Cause.** `_heuristic_interpret_document` does `stripped = raw.strip()`, discarding the student's
indentation entirely, then infers block structure from `_should_dedent_for_line`. That function's
final fallback for a loop is: *does this line mention the loop variable?* If not — dedent.

So `print var_p` leaves the loop because it names `var_p` rather than `element`. Reproduced:

| line | mentions `element`? | indent |
|---|---|---|
| `print element` | yes | 1 ✅ |
| `print var_p` | no | 0 ❌ |

Any loop body line that works on a derived value falls out. That is most of them.

**Why this is the worst bug in the product.** The student gets a wrong answer with no error, and
cannot tell whether their reasoning was wrong or the tool was. For a product whose whole purpose is
teaching people to trust their own reasoning, silently producing a different program than the one
they described is the most damaging failure mode available.

**Fix.** Honour explicit indentation when the student provides it; keep the heuristic only for
documents written flat. Their formatting is the clearest statement of intent available and it is
currently thrown away.

---

## 2. Broken lines are reported as valid — **high**

```
sort the scores
print the scores
```

`scores` is never defined. Governance returns `execution_allowed: True` and marks **both lines
`status: valid`**, while simultaneously recording `unresolved_slots: ['scores', ...]` on them. The
run is only stopped later, by code generation, with:

> No deterministic lowering for line 1: unresolved sort target.

**The student sees a green line, presses Run, and gets an internal error message.** The diagnostic
told them the line was fine. The right moment to say "I don't know what `scores` is" is while they
are looking at the line.

**Fix.** Governance should mark a line with unresolved slots as blocked and give the reason in the
student's terms. The wording matters as much as the status.

---

## 3. Vaguer problem feedback than intended — **medium**

Problem-alignment reports `edge_case_risk` where it should report `logic_mismatch`, so a student who
has genuinely misunderstood the problem gets "watch out for edge cases" instead of "sorting does not
find the maximum". The severity ranking also means the wrong one wins the merge.

---

## 4. The editor loads from a CDN — **high, and separate**

`@monaco-editor/react` is used with no `loader.config()`, so Monaco is fetched from jsdelivr at
runtime; `monaco-editor` is not a direct dependency and nothing is bundled. In the preview browser
those requests failed outright.

Schools block CDNs routinely. When jsdelivr is unreachable the student gets a blank pane where the
editor should be — no error, no fallback, product unusable. Self-hosting is a dependency addition
and a bundle-size change, so it needs a deliberate decision.

---

## Plan

| | work | risk |
|---|---|---|
| **A** | Honour explicit indentation (bug 1) | Behaviour change. Guarded: only applies when the document actually contains indentation, so flat programs are untouched. Stress suite is the check. |
| **B** | Block lines with unresolved references, in plain language (bug 2) | Behaviour change. Will block programs that currently run and fail later — which is the point, but it moves where the failure appears. |
| **C** | Fix the alignment status ranking (bug 3) | Low. |
| **D** | Self-host Monaco (bug 4) | Adds `monaco-editor` as a direct dependency and grows the bundle. |

A and B both change interpreter/governance behaviour, which the phase rules say I must not do
without explicit approval — hence the questions.

Each fix ships with the failing test it repairs, verified against the stress suite (33/33 today) so
that a fix for one student's program does not break another's.
