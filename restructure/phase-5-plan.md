# Phase 5 plan — lesson content out of code

Surveyed 2026-08-13 on branch `phase-5-lesson-content`.
**Awaiting approval — nothing has been changed.**

## What the content actually is

| | |
|---|---|
| lessons | **29** |
| topics | **135** |
| examples | **157** |
| lines of TypeScript holding them | **5,816** |

Two tabs, from `TabId`:

- **`operators`** — 19 lessons, split across `part1`–`part4`
- **`data-structures-algorithms`** — 10 lessons, in `tab2`

**The "part" split encodes nothing.** Tab one's lesson numbers run contiguously 1–19 across the four
files (1–4, 5–7, 8–11, 12–19). It is file-size management, not curriculum structure. `tab2` is the
second tab, which *is* meaningful.

The shape is three nested records, and it is genuinely uniform:

```
lesson(id, number, title, overview, [
  topic(id, title, definition, howAndWhy, [
    example(id, strict[], standard[], abstraction[], pseudocode[])
  ])
])
```

Each example gives the same program written four ways — strict, standard, abstraction, pseudocode —
which is the heart of the teaching idea and the reason the format matters.

## The content is in good shape. The authoring is not.

Audited by evaluating the real data rather than pattern-matching it:

| check | result |
|---|---|
| examples missing one of the four modes | **0** |
| duplicate topic ids | **0** |
| duplicate example ids | **0** |
| topics with no examples | **0** |
| lesson ids unique across both tabs | **yes** |
| lesson numbers contiguous per tab | **yes** |
| examples per topic | 1–7 |
| longest example | 24 lines |

Nothing needs cleaning. This migration is a move, not a repair.

**But the two tabs are authored in completely different styles.** Tab one writes examples as arrays
of quoted strings. Tab two writes them as multi-line template literals passed through a local
`block()` helper that dedents and splits them — used **173 times**, and absent from tab one entirely.

Same data structure, two ways of typing it, in one product. Whoever wrote tab two clearly preferred
writing a block of lines over a list of quoted strings, and invented a helper to get it.

## The other finding: `tutorial-data.ts` is mostly not data

Of its 544 lines, roughly **460 are content normalisation** — `normalizeWhitespace`,
`lowerStrictAllCaps`, `inferInitializationKind`, `makeInitializationLine`,
`normalizeNonStrictAssignment`, `normalizeStrictLines`. Only ~30 lines assemble the data and ~35 are
lookups.

So the stored content is **not** what a student sees; it is rewritten on load. That has to survive
the migration untouched, or every lesson changes wording at once. It also means the file is
misnamed: it is a normaliser, not data.

## Recommended format: YAML

The three candidates, judged against what this content actually looks like:

- **MDX** — wrong. This is not prose with embedded code; it is a rigid record with four parallel
  lists. MDX would add tooling and buy nothing.
- **JSON** — workable, but every instruction line becomes a quoted, comma-separated string. Tab two's
  content is 173 multi-line blocks; JSON is the most hostile possible format for that, and a missing
  comma is a syntax error a teacher cannot debug.
- **YAML** — fits both existing styles natively. A list of lines is a list; a block of lines is a
  block scalar. No quotes, no commas, comments allowed.

The deciding evidence is `block()`: someone wanted YAML's block scalars badly enough to write a
helper for them in TypeScript.

```yaml
id: variables
number: 1
title: Variables
overview: >
  Variables let a program keep track of information by giving it a name.
topics:
  - id: variable-names
    title: Variable names
    definition: A variable name is the label used to refer to stored information.
    howAndWhy: Use variable names when you want instructions to stay understandable.
    examples:
      - id: variable-names-example
        strict:
          - Initialize a variable called score.
          - Make score equal 95.
          - Print score.
        pseudocode:
          - SET score TO 95
          - PRINT score
```

**This needs a YAML parser** — `yaml` (~1 dependency, no transitive deps). That is the one dependency
decision in this phase.

## Proposed layout

```
src/content/lessons/
  operators/                     01-variables.yaml … 19-*.yaml
  data-structures-algorithms/    01-linked-list.yaml … 10-*.yaml
  lesson-schema.ts               the validated shape + inferred types
  index.ts                       discovery, validation, ordering
```

Order comes from the `number` field, not the filename — the filename prefix is a convenience for
humans scanning the directory.

## Validation

Schema validation at **build time**, so malformed content fails `npm run build` rather than reaching
a student. Errors name the file and the field.

Zod is the obvious tool and would be a second dependency. A hand-written validator is perhaps 80
lines for this shape and adds none — see D2.

## Sequence

1. `lesson-schema.ts` + loader, validated against the current data in memory (proves the schema
   before any content moves)
2. A conversion script emitting YAML from the existing modules
3. **Prove equivalence**: load both, deep-compare all 29 lessons / 135 topics / 157 examples, byte
   for byte, *before* deleting anything
4. Point `tutorial-data.ts` at the loader, keep the normaliser exactly as it is
5. Delete the five TypeScript modules only once equivalence passes
6. `README.md` in the content directory: how to add a lesson, every field, a worked example

## Risks

- **The normaliser must not change.** It rewrites content on load; touching it changes every lesson's
  wording. It stays byte-identical and moves nowhere.
- **Equivalence must be proven, not eyeballed.** 157 examples × 4 modes is 628 string arrays.
- **Access gating** (`use-learning-center-access.ts`) must keep working untouched.
- Still no frontend tests, so the deep-compare *is* the safety net.

## Decisions I need

| | question | recommendation |
|---|---|---|
| **D1** | Add the `yaml` dependency? | **Yes.** JSON makes tab two's 173 multi-line blocks painful and puts syntax errors in a teacher's way. `yaml` is small and has no transitive dependencies. If you would rather add nothing, JSON works and I will say so in the authoring guide. |
| **D2** | Zod for validation, or a hand-written validator? | **Hand-written.** The shape is three nested records with fixed fields; a validator is ~80 lines and produces better messages for this specific content than a generic one. Zod is the right call if the schema is going to grow, and the wrong one if it stays this size. |
| **D3** | One file per lesson (29 files), or one per tab (2 files)? | **Per lesson.** The stated goal is that adding a lesson is adding a file. 29 files of 30–70 lines each beats two files of 2,000. |
| **D4** | Convert tab two's `block()` style to plain YAML lists, or keep block scalars? | **Block scalars.** It preserves the author's intent and is the reason for choosing YAML. The loader normalises both to `string[]`, so downstream code cannot tell the difference. |
