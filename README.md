# TRACE — Frontend

Next.js web app for a natural-language programming environment. Students write program intent in
plain English; the backend analyzes it, generates governed Python, runs it in a sandbox, and streams
results back here.

> **Rebrand in progress.** The product has been called "Syntaxless IDE", "TRACE", and "CodeLess".
> The final name is undecided. All display strings come from `src/config/brand.ts` — change them
> there, never inline. Storage keys in that same file are **not** display strings; see
> [Naming](#naming).

The backend lives in the separate `Syntaxless-IDE-Backend` repository. There is no monorepo.

---

## Quick start

Requires Node 18+.

```bash
npm install
```

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key |
| `NEXT_PUBLIC_BACKEND_URL` | Backend API, `http://127.0.0.1:8000` locally |

All three are required — the build fails at prerender without the Supabase values.

```bash
npm run dev
```

Open http://localhost:3000. For anything beyond the marketing pages, run the backend too.

---

## Layout

```
src/
  app/            routes (App Router)
    ide/          the editor — 6,267 lines in one component today; phase 4 splits it
    dashboard/    projects
    resources/    Learning Center; lesson content is in tutorial-*.ts
    docs/ about/ faq/ home/ subscriptions/ login/ signup/
  components/     shared UI (site-shell, theme-provider, ui/)
  config/
    brand.ts      product name, logo paths, storage keys
  lib/            supabase client, subscriptions, utils
```

A restructure is under way — see `restructure/README.md` for the six phases and what each changes.
Treat this layout as accurate today, not as a stable contract.

---

## Scripts

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run lint
```

There is no test suite yet; it arrives in phase 6.

**Lint baseline as of 2026-08-12: 10 warnings, 0 errors.** All are pre-existing (unused variables,
`react-hooks/exhaustive-deps`, one `<img>`). Treat any *new* warning as yours.

---

## Naming

`src/config/brand.ts` holds two different kinds of value, and the distinction matters:

- **`BRAND`** — display strings and logo paths. Safe to change; that is the point of the file.
- **`STORAGE_KEYS`** — persisted in the user's browser. **Changing a value silently discards what is
  already stored under the old key.** `theme` resets everyone's light/dark preference; `problem`
  orphans saved problem state. A rename needs migration code that reads the old key, writes the new
  one, and removes the old — kept for a release or two before dropping it.

The backend has equivalent constraints of its own (a sandbox wire protocol, a persisted IR version,
and OpenAI tool names). See the Naming section of the backend README before renaming anything there.

---

## Deployment

Vercel, from this repository. Set the same three `NEXT_PUBLIC_*` variables in the Vercel project
settings — they are build-time values, so a missing one fails the build rather than degrading at
runtime.
