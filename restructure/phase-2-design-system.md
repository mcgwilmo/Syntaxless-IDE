# Phase 2 — Design system: tokens and primitives

## Context

A natural-language programming environment for **students learning to program**, often in a
classroom, often intimidated by traditional IDEs. Students write plain English; the backend detects
intent, generates governed Python, validates it against safety policy, and runs it in a Docker
sandbox.

- `/Users/danielleknutson/Syntaxless-IDE` — Next.js 16 / React 19 / TS / Tailwind v4 / Supabase / Monaco.
- `/Users/danielleknutson/Syntaxless-IDE-Backend` — FastAPI (not touched this phase).

This is phase 2 of 6. Phase 1 (naming, branding, docs) should be merged first. **Re-skinning, not
rewriting** — no behavior or layout changes beyond what the new tokens imply.

## Goal

> A student opens this and feels invited, not tested. A teacher looks at it and sees a real tool.

Scratch-adjacent in *warmth*, not in *childishness*. Build the design system as **tokens first**,
then primitives, then migrate exactly **one** pilot screen to prove it. Do not migrate every screen
this phase — that's phase 4, when components are being decomposed anyway.

## Current state

`src/app/globals.css` defines ~20 CSS variables (`--background`, `--surface`, `--card-border`,
scrollbar colors, a few `.theme-*` utility classes). Everything else is ad-hoc Tailwind utilities
and inline `rgba()` in components. There is **no spacing, radius, typography, or elevation scale**.
Dark is the default at `#050505`; light is a cold slate `#eef3f9`.

`prefers-reduced-motion` is already handled correctly — keep that.

## Direction

**Do:**

- **Light-first.** Light becomes the default and the better-designed theme; classrooms are bright and
  projected. Dark stays available and fully correct.
- **Warm the neutrals.** Off cold slate/blue-grey, toward warm greys and a soft paper background —
  think `#FAF9F7`, not `#FFFFFF` and not the current `#EEF3F9`.
- **One accent + purposeful semantics.** Soft and saturated but not neon. **Propose two options —
  a warm teal and a friendly indigo — and stop for my pick.** Semantic colors mean something and are
  never decorative: green = ran successfully, amber = warning, rose = blocked.
- **Radius on a scale**, roughly `6 / 10 / 16 / 24`. Cards and panels get the generous end; inputs
  and small controls stay modest so they still read as controls.
- **Spacing on a 4px scale**, with more breathing room than now. Crowding reads as difficulty.
- **Typography.** Friendly humanist sans for UI (Inter is fine; a rounder face like Nunito Sans for
  headings only, if it doesn't fight the code font). Genuinely readable mono for the editor. Base
  size 15–16px — larger than typical dev tools. Generous line-height.
- **Softer depth.** Low-contrast borders and soft diffuse shadows instead of hard 1px outlines.
- **Motion 150–250ms, ease-out.** Keep the existing reduced-motion handling.
- **Icons:** one family, rounded, consistent stroke weight.

**Don't:**

- No mascots, cartoon illustrations, confetti, or emoji in product UI chrome.
- No bright primary red/yellow/blue playground palette.
- No comic or handwriting typefaces.
- Nothing that would embarrass a 16-year-old to have on screen next to a classmate.
- Don't reduce IDE information density to the point of hiding real capability — soften the
  presentation, not the tool.

## Scope

### 1. `src/design/tokens.css`

The full scale: color (both themes), spacing, radius, typography, elevation, motion. Semantic naming
(`--surface-raised`, `--text-muted`, `--state-blocked`) rather than literal (`--grey-200`). Wire into
Tailwind v4's `@theme` so utilities resolve to tokens.

### 2. `src/design/primitives/`

`Button`, `Card`, `Panel`, `Callout`, `Badge`, `Field`. Token-driven only — **no raw hex or `rgba()`
inside a primitive**. Each gets the variants the app actually needs; check real usage before
inventing variants nobody calls.

### 3. Copy tone

Rewrite user-facing diagnostic and error copy in plain, encouraging language. This matters more than
the color palette for whether a student feels capable.

> "We're not sure what `total` refers to yet — try defining it first"

beats

> "undefined identifier: total"

Never blame the student. Every blocking message says what to try next. The IDE diagnostics are the
highest-value target — see `globals.css` `.ide-validation-line--*` and `.ide-diagnostic-glyph--*`,
and the messages the backend returns.

### 4. One pilot screen

Migrate a single screen end to end to prove the system. Suggest `src/app/faq/page.tsx` (25 lines) as
a warm-up and then something real like `login` or `signup` (~105 lines each). **Not** the IDE and
**not** home — those get decomposed in phase 4 and would double the work.

## Out of scope

Migrating every screen. Restructuring directories. Touching the backend. Component decomposition.

## How to work

1. Survey current styling — what's in `globals.css`, what's inline, what `.theme-*` classes exist and
   where they're used. Then write `restructure/phase-2-plan.md` with the token scale, the two accent
   proposals, and the primitive API sketches. **Stop for my approval and my accent pick.**
2. Execute on a branch.
3. Both themes complete and correct at every step — never leave dark broken "to fix later."

## Verify (show me real output)

```bash
cd /Users/danielleknutson/Syntaxless-IDE && npm run build && npm run lint
```

- **Measure and report actual WCAG contrast ratios** for body text, muted text, and each semantic
  color, in both themes. AA minimum (4.5:1 body, 3:1 large). Don't assert it passes — give numbers.
- Screenshot the pilot screen in both themes and show me.
- Confirm reduced-motion still works.

## Ask me before

- Adding any dependency — especially a UI kit, icon library, or animation library. Name it and say
  why the platform can't do it.
- Adding a webfont (it's a performance and privacy call).
- Changing layout or information architecture on any screen.

## Done when

- `tokens.css` covers color, spacing, radius, type, elevation, and motion, in both themes.
- Primitives exist, contain no raw color values, and are used by the pilot screen.
- Contrast ratios measured and reported, all AA or better.
- The pilot screen looks calm, warm, and legible in both themes.
- Build and lint pass, with output shown.

## Hand off

List in the plan file every screen still on the old styling, so phase 4 knows what it's inheriting.
