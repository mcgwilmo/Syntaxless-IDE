# Phase 4 — Frontend: feature extraction and typed API client

## Context

A natural-language programming environment for **students learning to program**. Students write plain
English; the backend detects intent, generates governed Python, validates it against safety policy,
and runs it in a Docker sandbox.

- `/Users/danielleknutson/Syntaxless-IDE` — Next.js 16 / React 19 / TS / Tailwind v4 / Supabase / Monaco. ~20.5k lines.
- `/Users/danielleknutson/Syntaxless-IDE-Backend` — FastAPI. Not modified this phase; its Pydantic
  schemas are the source of truth for the client types you'll write.

Phase 4 of 6. Phases 1 (naming) and 2 (design tokens) should be merged first. Phase 3 (backend) is
independent — but if it's merged, mirror its final contracts. **This is a high-risk phase**: the IDE
is the product.

## Goal

`src/app/ide/page.tsx` is **6,267 lines** in a single client component — editor wiring, diagnostics,
run streaming, output panels, state management, and API calls all in one file. It's the single
biggest scaling and interpretability blocker in either repo. Break it up, and give the app a real
API layer while you're in there.

**Restructuring, not rewriting.** The IDE must behave identically when you're done.

## Current state

```
src/
  app/
    ide/page.tsx                        6267  ⚠️
    ide/BugReportModal.tsx               233
    home/page.tsx                       1665  ⚠️
    resources/                          ← feature code living in the routes dir
      lesson-browser-page.tsx            942
      radial-orbital-timeline.tsx        370
      use-learning-center-access.ts       80
      resource-routes.ts                   6
      tutorial-*.ts                     ~5200  ← phase 5, leave alone
    docs/page.tsx                        685
    dashboard/page.tsx                   685
    subscriptions/page.tsx               658
    about, faq, login, signup, closed-pre-alpha
  components/  site-shell 707, beams-background 207, site-footer 187, theme-provider 181, ui/*
  lib/  subscriptions 259, supabase/client 58, cn 3
```

Problems: routing and domain logic are indistinguishable; `fetch` calls to `NEXT_PUBLIC_BACKEND_URL`
are scattered inline with no typed contract; file naming is inconsistent (`BugReportModal.tsx`
Pascal vs `site-shell.tsx` kebab).

## Target

```
src/
  app/                     # routes ONLY — thin pages that compose features
    (marketing)/           # home, about, pricing, faq
    (learn)/               # resources / lessons
    (app)/                 # ide, dashboard
  features/
    ide/
      components/          # editor, diagnostics, output, panels, toolbar
      hooks/               # run streaming, diagnostics fetching, editor lifecycle
      state/
      types.ts
    lessons/
    auth/
    billing/
  lib/
    api/                   # one typed client per endpoint; types mirror Pydantic schemas
    supabase/
    utils/
  design/                  # from phase 2
```

Rules:

- A file in `src/app/` is short — it imports a feature and renders it.
- **No component over ~300 lines.** Past that it's doing more than one job.
- **Every backend call goes through `src/lib/api/`.** No bare `fetch` in a component.
- **No raw hex or `rgba()` in components** — phase 2 tokens only. Migrate styling as you touch files.
- Kebab-case filenames throughout.

## Order of work

Do the IDE **first**, while you have the most budget and attention for it. It's the hard one.

1. **`ide/page.tsx`** — decompose. Suggested seams, but read the file and follow what's actually
   there: Monaco setup and lifecycle; diagnostics rendering (glyph margin, line decorations —
   see the `.ide-validation-line--*` and `.ide-diagnostic-glyph--*` classes); run submission; the
   WebSocket run-event stream; output rendering (text, tables, plots, artifacts); the bug report
   modal; page-level state.
2. **`src/lib/api/`** — a typed function per endpoint: `POST /interpret`, `POST /run/start`,
   `WS /run/{run_id}/stream`, `GET /runs`, `GET /runs/{run_id}`,
   `GET /run/{run_id}/artifacts/{name}`, `POST /bugs/report`. Types mirror the backend Pydantic
   schemas — read them, don't guess.
3. **Route groups** — `(marketing)` / `(learn)` / `(app)`. Verify no URLs change; route groups are
   URL-invisible in Next.js, so confirm every path still resolves.
4. **`home/page.tsx`** (1,665 lines) — split into section components.
5. **Move feature code out of `src/app/`** — `lesson-browser-page.tsx`,
   `radial-orbital-timeline.tsx`, `use-learning-center-access.ts` into `features/lessons/`.
6. **Filename consistency** pass.

## Out of scope

Lesson *content* (`tutorial-*.ts`, ~5,200 lines) — that's phase 5. Move those files if the directory
layout demands it, but don't restructure their contents.

Test infrastructure is phase 6 — but see below.

## How to work

1. **Read `ide/page.tsx` in full before planning.** 6,267 lines is a lot; budget for it. Then write
   `restructure/phase-4-plan.md` with the decomposition map, the API client sketch, and the route
   group migration. **Stop for approval.**
2. Execute **one seam at a time**, verifying the IDE still works after each. Do not extract
   everything and then debug.
3. **Pure moves stay pure** — relocate unchanged, then edit separately.
4. As you extract each piece, note what a test for it would assert. Phase 6 will write them; you're
   making that possible.

## Verify (show me real output)

```bash
cd /Users/danielleknutson/Syntaxless-IDE && npm run build && npm run lint
```

Then **use the actual IDE** against a running backend and confirm, explicitly:

- A natural-language program generates code.
- Diagnostics appear on the right lines, with the right glyph, and the click behavior works.
- A run executes and streams output back live.
- Tables, plots, and artifacts render.
- The bug report modal submits.
- Every route still resolves at its original URL.
- Both themes still work.

Screenshot the IDE before and after and show me both. If something is broken, show me the failure.

## Ask me before

- Changing any user-visible IDE behavior, layout, or interaction — including improvements.
- Changing a URL.
- Adding a dependency, especially a state management or data fetching library. Name it, say why
  React and Next.js can't do it.
- Changing auth or Supabase usage.
- Deleting anything not provably dead.

## Done when

- No component over ~300 lines, `ide/page.tsx` included.
- Files in `src/app/` are thin route wrappers.
- Every backend call goes through `src/lib/api/` with types mirroring the Pydantic schemas.
- No bare `fetch` and no raw color values in components.
- Route groups in place with no URL changes.
- Filenames consistently kebab-case.
- Build and lint pass; the IDE verified working end to end, with evidence shown.

## Hand off

In the plan file, list what each extracted module should be tested on, for phase 6.
