# Writing lessons

Lessons live here as YAML — one file per lesson. **Adding a lesson means adding one file.** No
TypeScript, no imports, no registering it anywhere.

```
operators/                     the first track: variables through functions
data-structures-algorithms/    the second track: linked lists through graphs
```

## Add a lesson in three steps

1. Copy an existing file in the track you want, e.g. `operators/01-variables.yaml`.
2. Rename it `NN-slug.yaml`, where `NN` is the lesson number, zero-padded.
3. Edit the content and run `npm run build:lessons`.

The build tells you if anything is wrong, naming the file and the field:

```
src/content/lessons/operators/20-recursion.yaml is not a valid lesson:
  - topics[0].examples[0].pseudocode must have at least one line
  - topics[1].id must be lowercase words joined by hyphens (got "Base Case")
```

Nothing malformed can reach a student — `npm run build` fails first.

## What a lesson looks like

```yaml
id: variables              # lowercase-with-hyphens, unique across the whole track
number: 1                  # position in the track; this is what orders lessons
title: Variables
overview: >
  One or two sentences on what this lesson is for. Shown before the topics.

topics:
  - id: variable-names     # unique across the WHOLE app -- topic ids are deep links
    title: Variable names
    definition: What the concept is, in a sentence or two.
    howAndWhy: When to reach for it, and why it helps.

    examples:
      - id: variable-names-example
        strict:
          - Initialize a variable called score.
          - Make score equal 95.
          - Print score.
        standard:
          - Set a variable called score to 95.
          - Print score.
        abstraction:
          - Print a variable score that equals 95.
        pseudocode:
          - SET score TO 95
          - PRINT score
```

### Fields

| field | what it is |
|---|---|
| `id` | Stable identifier. Lowercase words joined by hyphens. Changing it breaks saved links. |
| `number` | Position in the track. Ordering comes from here, **not** the filename. |
| `title` | Shown in the lesson list. |
| `overview` | A sentence or two introducing the lesson. |
| `topics[].definition` | What the concept *is*. |
| `topics[].howAndWhy` | When to use it and why — the part students actually need. |
| `examples[]` | The same program written four ways. |

### The four modes

Every example must have all four. The comparison between them **is** the lesson — a student sees one
idea expressed with different amounts of precision, and learns what the system infers at each level.

| mode | how it reads |
|---|---|
| `strict` | Every step spelled out. Nothing inferred. |
| `standard` | Natural phrasing, some inference. |
| `abstraction` | Says the goal; lets the system work out the steps. |
| `pseudocode` | Conventional pseudocode, `SET x TO 5` style. |

## Two ways to write lines

A list, when lines are short:

```yaml
strict:
  - Set total to 0.
  - Print total.
```

Or a block, when they are long or you want to see them as a program. `|` keeps the line breaks:

```yaml
strict: |
  Create an empty list called visited.
  For each node in the graph:
    If the node is not in visited:
      Add the node to visited.
```

Both produce the same thing. Use whichever reads better for the example in front of you.

## Rules the build enforces

- `id` is lowercase words joined by hyphens
- `number` is a whole number, 1 or more, unique within its track
- every lesson has at least one topic; every topic at least one example
- every example has all four modes, each with at least one line
- **topic and example ids are unique across the whole app** — they address deep links, so a
  collision silently sends a student to the wrong place

## How it reaches the app

`scripts/build-lessons.mjs` reads this directory, validates it, and writes `generated.ts`, which the
Learning Center imports. It runs automatically before `npm run dev` and `npm run build`.

`generated.ts` is committed so a fresh clone typechecks without running anything, but it **is**
generated — edit the YAML, never that file.

One thing worth knowing: the app runs authored text through a normaliser (`tutorial-data.ts`) before
displaying it, which tidies whitespace and rewrites some phrasing for consistency. If displayed text
differs slightly from what you wrote, that is why.
