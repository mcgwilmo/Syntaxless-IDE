# Phase 4 plan — frontend feature extraction

Surveyed 2026-08-13 on branch `phase-4-frontend-features`.
**Awaiting approval — nothing has been changed.**

## Anatomy of `ide/page.tsx` (6,270 lines)

| lines | what | size |
|---|---|---|
| 27–505 | 25+ type definitions | ~480 |
| 506–1678 | pure helpers — formatting, diagnostics, tree ops, tier/mode rules | ~1,170 |
| 1679–2269 | four inline components: `InfoTooltip`, `ExplorerTree`, `BugReportModal`, `ArtifactPreview` | ~590 |
| **2270–6257** | **`IdePageContent`** | **3,988** |
| 6258 | `IdePage` — thin `<Suspense>` wrapper | 12 |

`IdePageContent` splits roughly in half: **~1,772 lines of logic** then **~2,216 lines of JSX**.

Inside it: **51 `useState`**, 13 `useEffect`, 21 `useMemo`, 13 handlers, 5 `fetch` calls and one
`WebSocket`. The 51 pieces of state are the reason this file resists splitting — see below.

## The finding that shapes the phase

**You cannot extract components from `IdePageContent` without first deciding how they get state.**

51 `useState` calls in one function, consumed by 2,216 lines of JSX. Pull out a run-history panel
and it needs `runs`, `activeRunId`, `showRunsSection`, plus four setters. Pull out the terminal and
it needs `terminalEntries`, `terminalInput`, `inputPrompt`, `terminalHeight`, `isResizingTerminal`,
`activeBottomTab`, and their setters. Prop-drilling that is how a 4,000-line component becomes eight
files that are each unreadable for a different reason.

So phase 4's real first move is a state decision, not a file move. Options in **D3** below.

## Other findings

**`src/app/ide/BugReportModal.tsx` is dead code.** 234 lines, imported by nothing; the live modal is
inlined at `page.tsx:2006`. I edited this file during phase 1 (rebranding a "CodeLess" string) — that
edit changed nothing, because nothing loads it.

**Five `fetch` calls and one `WebSocket`, all inline**, hitting `/bugs/report`, `/runs`,
`/runs/{id}`, `/interpret`, `/run/start`, and `WS /run/{id}/stream`. Backend phase 3 fixed the
response shapes and `scripts/capture_api_shapes.py` now records them — so the typed client can be
generated against something verified rather than guessed.

**Styling debt is concentrated but not confined.** 570 `isLight` across 16 files; the IDE is 238 of
them (42%) and 682 hardcoded colours.

| file | `isLight` | hardcoded |
|---|---|---|
| `app/ide/page.tsx` | 238 | 682 |
| `app/home/page.tsx` | 81 | 158 |
| `app/resources/lesson-browser-page.tsx` | 46 | 137 |
| `app/dashboard/page.tsx` | 45 | 139 |
| `app/subscriptions/page.tsx` | 30 | 87 |
| `components/site-shell.tsx` | 26 | 58 |
| `app/docs/page.tsx` | 25 | 53 |
| 9 more files | 79 | 193 |

`getDiagnosticToneClasses` (`page.tsx:1328`, ~54 lines of rose/amber `isLight` ternaries) maps
directly onto the `--state-*` tokens from phase 2 and should be among the first things deleted.

## Proposed sequence

Each step ends with `npm run build` and `npm run lint` green at the 10-warning baseline, and the IDE
verified working against a live backend.

1. **Delete the dead `BugReportModal.tsx`** (pending D2).
2. **`src/lib/api/`** — one typed function per endpoint, types mirroring the backend Pydantic
   schemas. Verifiable against the shape capture. Lowest risk, immediately useful.
3. **Lift types and pure helpers out** — `features/ide/types.ts` and `features/ide/lib/`. ~1,650
   lines that move with no state involved at all. This alone takes `page.tsx` under 4,600.
4. **Extract the four inline components** into `features/ide/components/`.
5. **State decision (D3), then split `IdePageContent`** — panels, editor, diagnostics, run stream.
6. **Migrate styling to tokens**, IDE first (it is the biggest and the one students look at).
7. **Route groups** `(marketing)` / `(learn)` / `(app)` — pending D4.
8. **The other 15 screens** — mechanical once the IDE proves the pattern.

## Risks

- **The IDE is the product.** Every step needs a real run verified in the browser, not just a build.
- **`isLight` is not always about colour.** It also picks between two *images*
  (`ide-window.png` / `ide-window-light.png`) and swaps icons. Those uses stay.
- **51 state variables mean subtle coupling.** Effects fire on each other's state; a wrong split
  changes render order and produces bugs that only appear during a live run.
- **No frontend tests exist**, so there is no safety net at all here. Phase 6 adds them. Until then
  verification is the browser and nothing else. This is the weakest-net phase of the whole
  restructure — weaker than backend 3c, which at least had 48 tests and a stress suite.

## Decisions I need

| | question | my recommendation |
|---|---|---|
| **D1** | Scope. Decomposing the IDE *and* migrating 15 screens is far more than phases 1–3 each were. Split it? | **Yes — 4a and 4b.** 4a = steps 1–5 (the IDE decomposition, the hard part). 4b = steps 6–8 (styling and routes, mechanical). Ship and verify 4a before starting 4b. |
| **D2** | Delete the dead `BugReportModal.tsx`? | **Delete.** Provably unimported, and it is a trap: I already wasted an edit on it, and the next person will too. Recoverable from git. |
| **D3** | How do extracted components get state? | **React Context, one `IdeProvider`, no new dependency.** Prop-drilling 51 values is unreadable; a state library is a dependency decision and a bigger rewrite than this phase should carry. Context is built in, and the grouping (editor / run / diagnostics / explorer / ui-chrome) is the same grouping the components need. |
| **D4** | Do the `(marketing)` / `(learn)` / `(app)` route groups? | **Yes, but in 4b.** Route groups are URL-invisible, so the risk is low — but it touches every page file, and doing it while the IDE is half-split would make both diffs unreadable. |
| **D5** | `getDiagnosticToneClasses` and friends map onto phase-2 tokens. Migrate the IDE's styling during the split, or after? | **After (4b).** Doing both at once means every diff is "moved and restyled" and a visual regression cannot be attributed. Move first, restyle second. |
