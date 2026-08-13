# Phase 5 — Lesson content out of code

## Context

A natural-language programming environment for **students learning to program**, often in a
classroom. It ships a Learning Center: tutorials, concept browsers, progressive lessons.

- `/Users/danielleknutson/Syntaxless-IDE` — Next.js 16 / React 19 / TS / Tailwind v4.
- `/Users/danielleknutson/Syntaxless-IDE-Backend` — FastAPI. Has its own
  `learning_center_examples.py` (~85 lines) — check whether it overlaps with the frontend lesson
  data and tell me if it does.

Phase 5 of 6. Phases 1, 2, and 4 should be merged first (phase 4 establishes `features/lessons/`).

## Goal

Lesson content currently lives in **code**, split across numbered TypeScript files by arbitrary
"part" boundaries:

| file | lines |
|---|---|
| `src/app/resources/tutorial-lessons-tab2.ts` | 2,071 |
| `src/app/resources/tutorial-lessons-part2.ts` | 1,082 |
| `src/app/resources/tutorial-lessons-part1.ts` | 699 |
| `src/app/resources/tutorial-lessons-part3.ts` | 681 |
| `src/app/resources/tutorial-lessons-part4.ts` | 676 |
| `src/app/resources/tutorial-data.ts` | 544 |
| `src/app/resources/tutorial-types.ts` | 63 |
| | **~5,800** |

Adding a lesson means editing a numbered code file and knowing which "part" it belongs to. That
doesn't scale, and it locks content authoring to people who write TypeScript.

**After this phase, adding a lesson is adding one content file — no code edits.** That's the whole
point: this is the thing you'll do most often as the product grows, and it should be the easiest.

## Scope

### 1. Understand the existing shape first

`tutorial-types.ts` (63 lines) already defines the types. Read it and the data files before designing
anything — the schema should describe the content that *exists*, not an idealized version that
forces a rewrite of 5,800 lines of authored material. Note where the current data is inconsistent
(optional fields used sometimes, shapes that drift between "parts") and tell me before normalizing.

Also work out what the "part" and "tab2" split actually means. It may encode something real —
curriculum tracks, tabs in the UI, difficulty tiers — or it may be pure file-size management.
The answer changes the target layout.

### 2. Schema

`src/content/lesson-schema.ts` — a validated schema (Zod is the obvious fit; **ask before adding
it**, and check whether the repo already has a validation library). It should:

- Validate at build time, not just runtime — a malformed lesson should fail `npm run build`, not
  reach a student.
- Produce a clear error naming the file and field. Content authors are the audience for these
  messages; write them accordingly.
- Derive TypeScript types from the schema so there's one source of truth.

### 3. Content files

`src/content/lessons/` — one file per lesson. Decide with me between:

- **TypeScript data files** — keeps type-checking and editor autocomplete, still requires TS syntax.
- **MDX** — best authoring experience for prose-heavy lessons with embedded code, more tooling.
- **JSON/YAML + schema** — most accessible to non-developers, loses inline type-checking.

Recommend one based on what the content actually looks like and who you think will author it, and
say why. Don't split the difference.

Naming and ordering must be explicit in the content (an `order` or `slug` field), not implied by
filename or directory listing.

### 4. Loader

An index that discovers and validates content, replacing the current static imports. Keep it
compatible with static generation — lessons should not require a runtime fetch.

### 5. Authoring guide

`src/content/lessons/README.md`: how to add a lesson, every field explained, a complete worked
example to copy. Written for someone comfortable with Markdown but not necessarily with React.
This is the deliverable that makes the phase pay off.

## Hard constraints

- **No lesson content is lost or altered.** This is a migration, not an edit. Content changes are a
  separate task.
- **The Learning Center behaves identically** — same lessons, same order, same URLs, same gating.
- `use-learning-center-access.ts` gates access by subscription. Preserve that exactly.

## How to work

1. Read the existing data files and `tutorial-types.ts`. Work out the real structure and what the
   "part" split means. Then write `restructure/phase-5-plan.md`: the schema, your format
   recommendation with reasoning, the migration approach, and any content inconsistencies you found.
   **Stop for approval.**
2. **Migrate mechanically, ideally with a script** — 5,800 lines is too much to hand-transcribe
   reliably. Write a one-off conversion script, run it, then diff the rendered output.
3. Verify content equivalence **before** deleting the old files. Keep them until the new path is
   proven.

## Verify (show me real output)

```bash
cd /Users/danielleknutson/Syntaxless-IDE && npm run build && npm run lint
```

- **Prove content equivalence.** Every lesson that existed before exists after, with identical text,
  code samples, and ordering. Do this by comparison, not inspection — dump the lesson set before and
  after and diff them.
- Walk the Learning Center in the browser: every lesson opens, renders, and is in the right order.
- Confirm subscription gating still blocks what it blocked.
- Add a deliberately malformed lesson and confirm the build fails with a useful message. Then remove it.

## Ask me before

- Adding a validation library or MDX tooling.
- Changing any lesson's text, code, order, or URL.
- Changing the access-gating logic.
- Deleting the original data files (do this only after equivalence is proven).

## Done when

- Adding a lesson is adding one content file, validated by schema, with no code edits.
- All existing lessons migrated with content proven identical.
- Malformed content fails the build with a message naming the file and field.
- `src/content/lessons/README.md` lets a non-developer add a lesson from the worked example.
- The Learning Center behaves identically, gating included.
- Build and lint pass, with output shown.

## Hand off

Note in the plan file what the schema validation should be tested on, for phase 6.
