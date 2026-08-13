# Phase 2 plan — design system

Surveyed 2026-08-12 on branch `phase-2-design-system`. **Awaiting approval and an accent pick —
nothing has been changed.**

## Headline: tokens alone will change nothing

The phase-2 prompt framed this as "tokens first, then primitives, then a pilot screen." The survey
says the ordering is right but the *blocker* is somewhere else:

**`isLight` appears 595 times across 17 files.**

| file | `isLight` | hardcoded colors |
|---|---|---|
| `src/app/ide/page.tsx` | 239 | 230 |
| `src/app/home/page.tsx` | 86 | 92 |
| `src/app/resources/lesson-browser-page.tsx` | 46 | 44 |
| `src/app/dashboard/page.tsx` | 45 | 56 |
| `src/components/site-shell.tsx` | 33 | 24 |
| `src/app/subscriptions/page.tsx` | 30 | 45 |
| `src/app/docs/page.tsx` | 26 | 27 |
| 10 more files | 90 | 120 |
| **total** | **595** | **638** |

Every component picks its own colors in JavaScript:

```tsx
className={isLight ? "border-slate-200 bg-white" : "border-neutral-800 bg-[#0b0b0b]"}
```

That is why there are 638 hardcoded color values — each ternary hardcodes two. A CSS variable that
swaps on `:root[data-theme="light"]` makes this branching unnecessary for color, but **nothing
improves until the call sites change**. I can ship a beautiful token file and the app will look
exactly the same.

So the deliverable that matters is the *pattern plus proof*, not the token file.

`isLight` does stay legitimately necessary for non-color decisions — swapping
`ide-window.png`/`ide-window-light.png`, and the Sun/Moon icons. Those keep the ternary.

## What else the survey found

**There is no accent color — there are five.** Roughly 380 usages spread across blue (107), cyan
(68), sky (56), emerald (60+), and violet (30+), with no rule about which means what. Emerald is
used both for "ran successfully" and as decoration.

**The `.theme-*` utility classes were an earlier attempt at this that never took hold** — 7 usages
total across the whole app (`theme-input` ×2, `theme-ghost-button` ×2, `theme-panel`,
`theme-page-surface`, `theme-overlay`). Worth folding into the new primitives rather than keeping
two competing systems.

**Tailwind is barely wired to the tokens.** `@theme inline` in `globals.css` maps only
`--color-background`, `--color-foreground`, and the two fonts. Every `bg-slate-200` in the codebase
is Tailwind's stock palette, not a token.

**An accessibility bug in the current light theme:** `--soft-foreground: #64748b` on `#eef3f9` is
**4.27:1** — below the 4.5:1 AA threshold for body text. It is used for input placeholders.

## Proposed token scale

`src/design/tokens.css`, semantic names rather than literal ones.

- **Color** — `--surface-page/raised/sunken`, `--text-primary/muted/soft/inverted`,
  `--border-subtle/strong`, `--accent-solid/hover/subtle/text`,
  `--state-success/warning/blocked` (+ `-subtle` backgrounds for each)
- **Spacing** — 4px base: `--space-1` (4) through `--space-16` (64)
- **Radius** — `--radius-sm` 6, `--radius-md` 10, `--radius-lg` 16, `--radius-xl` 24. Cards and
  panels take the generous end; inputs and small controls stay modest so they still read as controls
- **Type** — `--text-xs` 12 → `--text-3xl` 32, base **15px** (up from 14), line-height 1.6 body
- **Elevation** — `--shadow-sm/md/lg`, soft and diffuse rather than hard 1px outlines
- **Motion** — `--duration-fast` 150ms, `--duration-base` 200ms, `--ease-out`

Then expanded into `@theme` so Tailwind utilities resolve to tokens and `bg-surface-raised` works.

## Accent options — I need your pick

Both measured, both pass AA everywhere. Shared warm neutrals: page `#FAF9F7`, text `#1C1A17`, muted
`#57534E`. Dark stays warm too: page `#171614`, text `#F5F3F0`.

### A — warm teal (`#0F766E` light / `#5EEAD4` dark)

| | ratio | |
|---|---|---|
| body text | 16.50:1 | AA |
| muted text | 7.25:1 | AA |
| soft text `#78716C` | 4.56:1 | AA *(fixes the current 4.27:1 failure)* |
| accent text | 5.20:1 | AA |
| white on accent | 5.47:1 | AA |

Calmer and less corporate; reads as "workshop" more than "SaaS". Sits further from the blue that
every other dev tool uses, so it feels less like an IDE a student is being tested in. Risk: teal is
close to the existing cyan usage, so a half-done migration will look accidental rather than chosen.

### B — friendly indigo (`#4F46E5` light / `#A5B4FC` dark)

| | ratio | |
|---|---|---|
| accent text | 5.98:1 | AA |
| accent on white | 7.90:1 | AA |
| white on accent | 6.29:1 | AA |

Warmer and more inviting than the current blue while staying familiar; highest contrast of the two,
so it holds up best on a classroom projector. Risk: closer to the generic "developer tool" register,
and nearer the existing blue-400/blue-500 usage, which cuts both ways — easier migration, less of a
visible reset.

**Semantic colors are the same either way** and reserved for meaning only: success `#15803D`
(4.77:1), warning `#B45309` (4.77:1), blocked `#BE123C` (5.97:1).

## Scope

**In:**
1. `src/design/tokens.css` — full scale, both themes, wired into `@theme`
2. `src/design/primitives/` — `Button`, `Card`, `Panel`, `Callout`, `Badge`, `Field`. No raw color
   values inside a primitive. Built against real usage, not invented variants
3. Rewrite IDE diagnostic copy in plain, encouraging language — the highest-value text in the app.
   *"We're not sure what `total` refers to yet — try defining it first"* rather than
   *"undefined identifier: total"*. Never blame the student; every blocking message says what to try
   next
4. Migrate **one** pilot screen end to end, proving the `isLight` branching drops out
5. Measure and report every contrast ratio

**Out** — deliberately deferred to phase 4, when these files are being decomposed anyway:
migrating the remaining 16 files, and the 595 → ~10 `isLight` reduction. Doing it now means
migrating `ide/page.tsx` twice.

## Pilot screen

The prompt suggested `faq` (25 lines) as a warm-up then `login`/`signup` (~105 each). I'd rather use
**`login` + `signup`** as the real pilot and skip faq — they have forms, buttons, error states, and
inputs, so they exercise `Button`, `Field`, and `Callout` properly. faq is a heading and a list; it
would prove nothing about the primitives.

## Verification

- `npm run build`, `npm run lint` — baseline is 10 warnings / 0 errors, treat anything new as mine
- Report measured contrast for every token pair in both themes
- Screenshot the pilot in both themes
- Confirm `prefers-reduced-motion` still works (currently handled correctly in `globals.css`)

---

# Outcome (completed 2026-08-12)

Shipped: warm teal accent, Geist retained, `login` + `signup` as the pilot.

**Contrast: 20 of 20 token pairs pass AA in both themes.** Light: primary 16.50, muted 7.25, soft
4.56, accent 5.20, white-on-accent 5.47, success 4.77, warning 4.77, blocked 5.97. Dark: primary
16.33, muted 7.17, soft 4.90, accent 12.22, success 10.38, warning 10.83, blocked 6.72.

**The pilot has zero `isLight` and zero hardcoded colors**, and renders correctly in both themes from
the same markup. That is the pattern phase 4 replicates.

## Two bugs found and fixed while verifying

Both were pre-existing, and both were *invisible* while the app defaulted to dark. Flipping the
default to light exposed them.

1. **`<html>` had no background.** Only `body` was painted. Any area the body box did not cover fell
   through to the browser's default canvas — black on a machine set to `prefers-color-scheme: dark`,
   regardless of the app's own theme.
2. **`BeamsBackground` used `getContext("2d", { alpha: false })`.** That backing store is opaque
   **black**, so every moment the canvas was not painted — before the first frame, in a background
   tab, or if the loop never started — it covered the entire auth page in black. Confirmed by
   hiding the canvas, which restored the page. Now `alpha: true`, so an unpainted canvas is simply
   invisible. The offscreen buffer stays opaque since it is fully repainted each frame.

The second one is worth remembering: **an animated background that fails closed to black is a
theme-flip landmine.** Anything similar elsewhere in the app will surface during phase 4.

## Still on the old styling — phase 4 inherits this

`isLight` went 595 → 561. The remaining 15 files, in migration-cost order:

| file | `isLight` |
|---|---|
| `src/app/ide/page.tsx` | 239 |
| `src/app/home/page.tsx` | 86 |
| `src/app/resources/lesson-browser-page.tsx` | 46 |
| `src/app/dashboard/page.tsx` | 45 |
| `src/app/subscriptions/page.tsx` | 30 |
| `src/components/site-shell.tsx` | 26 (auth portion migrated) |
| `src/app/docs/page.tsx` | 26 |
| `src/app/ide/BugReportModal.tsx` | 20 |
| `src/app/resources/radial-orbital-timeline.tsx` | 16 |
| `src/app/about/page.tsx` | 12 |
| `src/components/ui/interactive-image-accordion.tsx` | 8 |
| `src/components/ui/testimonials-columns.tsx` | 7 |
| `src/components/theme-provider.tsx` | 7 (legitimate — icon swap) |
| `src/components/site-footer.tsx` | 5 |
| `src/app/resources/page.tsx` | 5 |

`getDiagnosticToneClasses` in `ide/page.tsx` (~60 lines of rose/amber ternaries) maps directly onto
`--state-*` tokens and should be among the first things phase 4 deletes.

The legacy `--background`/`--foreground`/`--surface-*` names in `globals.css` are now aliases onto
tokens, so unmigrated screens already inherit the warmer palette wherever they go through variables.
Their hardcoded Tailwind classes (`slate-200`, `neutral-800`) do not, which is why the app currently
looks half-migrated. That is expected and resolves in phase 4.

---

## Open question beyond the accent

**Typography.** The app uses Geist Sans / Geist Mono via `next/font/google`. Geist is competent but
cool and geometric — it reads "developer tool", which is the opposite of this phase's goal. A
humanist face would do more for the "invited, not tested" feeling than any color choice.

Changing it means a webfont swap (performance and privacy implications), so I have **not** assumed
it. Options: keep Geist; or move UI text to something warmer and keep Geist Mono for the editor.
Tell me if you want that explored, otherwise I'll keep Geist and spend the budget on size,
line-height, and spacing — which carry most of the legibility win anyway.
