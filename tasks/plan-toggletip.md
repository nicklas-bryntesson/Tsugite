# Implementation Plan: ToggleTip joins the house structure

Status: DRAFT for review (2026-09-09, revised same day). Nothing below is
built. Settled with Nicklas: this repo owns its code and does not run the
Popover API yet, so ToggleTip is converted to the house structure as it
stands (the rail variant). Root, content model and the popover track are
all five open questions are decided (see the end); building starts with T1.

## Overview

ToggleTip is the one component in the package that still renders itself
client-side: fixtures author a bare `<toggle-tip>` custom element, and the
verbatim `ToggleTip.ts` builds the button, rail and popup with `innerHTML`
on `DOMContentLoaded`. Every other component — including the five date
fields that share its popup mechanics — is an `.astro` file that renders
the DOM end-state on the server, carries its tokens and CSS on its own
root, and is hydrated by a `static attach()` behind an init gate. This
plan moves ToggleTip onto that structure with the eleven-test e2e suite as
the contract, and uses it as the first consumer of a shared popup-anchor
module extracted from the six copies of the same wiring.

## Findings

### 1. How far from the house structure (the gap, itemised)

| House pattern (fields, ThemeSwitch, Notice) | ToggleTip today | Gap |
|---|---|---|
| `.astro` renders the DOM end-state; markup is the contract (INTAKE §1) | No `.astro`. `_buildDOM()` writes button + rail + popup via `innerHTML` at runtime | **Structural.** No server end-state, no no-JS rendering; content hidden with `opacity: 0` until JS runs |
| Root is a class + `data-component="Name"`, `data-id` as the e2e anchor | Root is the custom-element tag `toggle-tip`; `data-id` already used | Root selector changes once; tests key on the tag |
| `static attach(parent)` + `__instance` guard + `data-initialized="true"` | Module side-effect: `document.addEventListener('DOMContentLoaded', …)`; bare `initialized` attribute; no guard, no re-attach | Init pattern |
| `data-*` vocabulary (component-model §2.5 dictionary) | `icon`, `title`, `heading-level` as bare attributes. `title` collides with the global HTML attribute (native tooltip on hover — noted in the source) | Vocabulary; the `title` clash is a real bug |
| Public tokens on the component root (`--_df-*`, `--_ts-*` on `.DateField` / `.ThemeSwitch`) | `--_toggletip-*` declared on `:root`, then re-mapped to `--_tt-*` on the element (two layers, one component) | Parked in `tasks/parking-lot.md` since the nesting sweep; ADR-0004 says `--_` is component-private, so a `--_` token on `:root` is grammar-off |
| Colours through the `--ui-*` seam (ADR-0002) | Surface, border, shadow, font via `--ui-*`; button and text colour are hard `CanvasText` values, not fallbacks | Partial seam bypass (house-wide habit for *fallbacks*; here they are the values) |
| CSS in `<style is:global>` inside the `.astro` | `ToggleTip.css` file, imported by two fixtures | Follows from having no `.astro` |
| `id`s authored server-side (fields take a required `id` prop) | `crypto.randomUUID()` per instance for `aria-controls` | Follows from client rendering |
| Icons via sprite `<use>` (Button) or inline SVG in the `.astro` (DateField) | SVG strings generated in TS | Minor |

What is already in house form: the CSS is one nested tree (ADR-0010,
nesting sweep), the pure position math is in `kernel/js/popup-position.ts`
with 11 unit tests, the TS is byte-identical to upstream reference-
components, and the e2e suite (11 tests, axe on both states) is green.

### 2. The popup mechanics are copy-pasted six times

The *math* is shared (`calculatePopupOffset`, `calculateArrowOffset`,
`detectDirection`). The *wiring around it* is not. Each of ToggleTip,
DateField, DateTimeField, TimeField, MonthField and WeekField carries its
own copy of:

- `_updateDirection()` → `data-direction` on the root
- `_updateLayout()` → measures rail/popup/trigger, sets
  `--_<prefix>-popup-offset` and `--_<prefix>-arrow-offset`
- `_getCSSPx()` → the probe-div trick to resolve a custom property to px
- rAF-throttled `resize` handler
- outside-click / focusout close
- ~12–15 lines of rail / popup-offset / arrow / `[data-direction]` CSS,
  identical except for the token prefix (`--_tt-`, `--_df-`, `--_dtf-`, …)

Roughly 20 JS lines and 15 CSS lines per component, six components. The
date fields' copies also include what ToggleTip lacks: Escape handling and
`trapPopupInteraction` (the latter is dialog-only and does not apply to a
non-modal tooltip).

ToggleTip is the smallest consumer and the only one without upstream
diffability concerns once it is re-authored anyway — so it is the natural
first consumer of an extracted `kernel/js/popup-anchor.ts`. Migrating the
five date fields onto it is **out of scope here**: they are verbatim
upstream files (ADR-0002 diffability) and their adoption is a separate
pass, fed back upstream as a finding (INTAKE §7).

### 3. Test coverage to preserve

`tests/e2e/toggletip.e2e.test.js` — 11 tests, all green today against
`/kitchen-sink`:

- open / close / click-outside (3)
- keyboard: Enter opens, focusout closes (2)
- positioning: above by default, flips below near top, no overflow left,
  no overflow right (4)
- axe: closed and open state (2)

They key on: `toggle-tip[data-id="…"]` (root), `button`, `.popup`,
`aria-expanded`, `aria-hidden`, `data-direction`, and bounding boxes.
Everything but the root selector survives untouched if the new markup
keeps `.popup`, the single `button`, and the two aria attributes. The root
selector change is a mechanical adaptation (INTAKE §3) and a new
`DEFAULT_TARGET.ToggleTip` row in `tests/e2e/helpers/target.js`.

Not covered today, worth adding: Escape closes and returns focus to the
trigger (WAI-ARIA APG toggletip pattern); the server end-state renders
without JS (a unit test through `AstroContainer`, the way `buttons.test.ts`
works); `attach()` is idempotent.

### 4. Consumers that move with it

- `fixtures/ToggleTipSection.astro` — five `<toggle-tip>` instances (the
  suite's host markup; `data-id`s must survive)
- `fixtures/ScrollAreaSection.astro` — one instance in the "popover
  clipping" demo, imports `ToggleTip.css`
- `apps/docs/src/pages/kitchen-sink.astro`, `lib/sections.ts`,
  `lib/manifest.ts` — mounting only; no change beyond the CSS import
  disappearing
- No `/docs/toggletip` page yet (fallback). Not part of this plan; a
  natural follow-up once the component is in house form.

### 5. Size

ToggleTip itself is small: 177 TS + 202 CSS lines today. After the move,
expect one `ToggleTip.astro` of ~220 lines (markup + nested CSS) and a
`ToggleTip.ts` of ~90 lines (behaviour only, no DOM building), plus a
~120-line kernel module with its own unit test. **Medium: one PR, six
tasks, two checkpoints.** The kernel extraction is what makes it more than
a rename; without it the component still carries its private copy of the
popup wiring and the sixfold duplication stays at six.

## Architecture Decisions (proposed — confirmed at Checkpoint 0)

- **The `.astro` is the end-state.** Button, rail, popup, arrow and the
  optional heading are authored server-side. JS only toggles attributes
  and sets two custom properties. No `innerHTML`, no `opacity: 0` gate.
- **Root: `<div class="ToggleTip" data-component="ToggleTip" data-id>`,
  flow content — never inside a `<p>`.** ToggleTip takes rich text
  (paragraphs, lists, links), so it cannot be phrasing content. Measured
  2026-09-09 on `/kitchen-sink`: the fixture's "Inline with text" demo
  puts a `<p>` inside a `<toggle-tip>` inside a `<p>`; the HTML parser
  closes the outer paragraph at the inner one, the content lands as a
  sibling paragraph in the section, and the bubble renders empty. The
  suite is green because it checks visibility, not content. The demo
  described a use the markup cannot carry — the contract now says so.
  Placement next to text is by siblings (flex row, or the tip as a
  sibling of the paragraph), the shape the other four demos already use.
  The custom element tag is dropped; nothing used custom-element
  semantics (no lifecycle callbacks — the class was a plain wrapper found
  by `querySelectorAll`). The header comment names the variant: "ToggleTip,
  rail variant".
- **Props become the vocabulary:** `id` (required, drives `aria-controls`
  and the popup id — no `randomUUID`), `icon: "info" | "question"`,
  `heading?: string`, `headingLevel?: 2..6`, default slot = popup content.
  `title` disappears as an attribute name; the global-attribute clash is
  gone.
- **Tokens move onto the root** as `--_tt-*` in one layer, following the
  field family (`--_df-*` "Public API" block on `.DateField`). The `:root`
  block and the second mapping layer are deleted. Button and text colour
  read `--ui-surface-foreground` through the seam; `CanvasText` remains
  only as a fallback where the seam is absent.
- **Role follows the content.** `role="tooltip"` is for short text; rich
  content points to a non-modal `role="dialog"` with `aria-expanded` on
  the trigger (the disclosure shape). Keep the `aria-hidden` toggling the
  suite asserts, change the role in T2, let axe decide on both states.
- **`kernel/js/popup-anchor.ts`** owns direction detection, layout
  (offset + arrow) into caller-named custom properties, the px probe, the
  rAF resize handler and light dismiss (outside click, focusout, Escape).
  It composes with `popup-position.ts` (math) and stays independent of
  `popup-interaction.ts` (dialog trap). API sketch:

  ```ts
  anchorPopup({ root, trigger, rail, popup, tokens: { offset, arrow,
    arrowSize, radius, inset }, onDismiss, signal })
  ```

  ToggleTip is consumer one. Date fields: later, separately.
- **e2e suite is the contract.** Only the root selector adapts; the
  adaptation is logged as upstream feedback along with the structural
  finding itself (upstream ToggleTip has the same shape).
- **No ADR unless a decision falls out.** The moves above apply existing
  decisions (ADR-0002, 0004, 0010; INTAKE §1–§3). If the `:root`-token
  question turns out to need a general rule ("may a component ever claim
  document-global names?"), that becomes an ADR in the same branch.

## Task List

### Phase 0 — Confirm

- [ ] **Checkpoint 0 — human review of this plan.** Open questions below
  answered; branch `feat/toggletip-house-structure` created from `main`.

### Phase 1 — Kernel first (risk first)

- [ ] **T1** `kernel/js/popup-anchor.ts` + `tests/kernel/popup-anchor.unit.test.ts`
  (jsdom: direction attribute set, custom properties written, dismiss on
  outside click / focusout / Escape, teardown via `AbortSignal`). No
  consumer yet; `pnpm --filter tsugite test` green.

### Phase 2 — The component

- [ ] **T2** `components/ToggleTip/ToggleTip.astro` — server end-state
  (`div` root), props, nested CSS moved in from `ToggleTip.css`, tokens on
  the root, seam colours, role per the decision above. `ToggleTip.css`
  deleted. Unit test via `AstroContainer`: renders button + popup with
  `aria-controls` = popup id, heading only when given, `data-icon` value,
  no `title` attribute, and **slotted rich content (a `<p>`) lands inside
  `.popup`** — the assertion the empty-bubble bug would have failed.
- [ ] **T3** `components/ToggleTip/ToggleTip.ts` rewritten: `static
  attach()`, `__toggleTipInstance` guard, `data-initialized`, behaviour
  through `anchorPopup()`. No DOM building.

### Checkpoint 1 — component renders and behaves in isolation

- [ ] Unit tests green; a scratch page with one instance opens, closes,
  flips and clamps in the browser.

### Phase 3 — Consumers and the contract

- [ ] **T4** Fixtures: `ToggleTipSection.astro` and `ScrollAreaSection.astro`
  author `<ToggleTip id=… data-id=…>` with slot content; CSS imports
  removed. The five `data-id`s survive. The "Inline with text" demo is
  re-authored as siblings (text span + tip in a flex row, the shape the
  edge demos use) and its rich content becomes visible for the first time;
  the other placements are unchanged. Every `<toggle-tip>` inside a `<p>`
  goes.
- [ ] **T5** `tests/e2e/toggletip.e2e.test.js`: root selector via
  `targetId('ToggleTip')`; new `DEFAULT_TARGET.ToggleTip` in
  `helpers/target.js`. Add: Escape closes and refocuses the trigger. Log
  the adaptation in the porting log (`../AstroRefComp/tasks/porting-log.md`).
- [ ] **T6** Docs housekeeping: `component-model.md` still lists ToggleTip
  as a primitive — unchanged. `tasks/parking-lot.md`: remove the
  `:root`-token entry (resolved); add the date-field adoption of
  `popup-anchor` with the measured duplication; add the **popover track**:
  reference-components may carry two variants of the same verb — rail
  (portable, this port) and Popover API + top layer (escapes overflow
  clipping, retires the z-index rail; positioning still from the shared
  kernel math since anchor positioning lacks Firefox). The consuming
  library picks by its support contract. Tsugite's browserslist pins
  Chrome 109 (Popover is 114, anchor positioning 125), so the swap here is
  a deletion-day event under ADR-0009, not an overlay. Upstream feedback
  (INTAKE §7) carries the empty-bubble finding too.

### Checkpoint 2 — contract preserved

- [ ] `pnpm --filter tsugite test` green (unit + kernel)
- [ ] `pnpm --filter tsugite test:e2e -- toggletip scrollarea` green (12 + ScrollArea suite)
- [ ] Full e2e run once before the PR (the date fields are untouched, but
  the kitchen-sink page changed)
- [ ] `pnpm build` in `apps/docs` succeeds
- [ ] PR opened; body carries the gap table and the deferred date-field pass

## Verification per task

| Task | Verification |
|---|---|
| T1 | `pnpm --filter tsugite test -- popup-anchor` |
| T2 | `pnpm --filter tsugite test -- toggletip`; render one instance, view source: full DOM present without JS |
| T3 | Browser: open/close/outside/focusout/Escape; `data-initialized="true"`; calling `attach()` twice creates one instance |
| T4 | Kitchen-sink page renders five tips + ScrollArea clip demo; no console errors |
| T5 | `BASE_URL=http://localhost:4321 pnpm exec playwright test toggletip` — 12 passed |
| T6 | Files read as intended; nothing else changes |

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Positioning tests are geometry-sensitive (viewport 100px tall in one) | Med | Keep rail/popup/arrow CSS values identical; only the selector and token layer change. Run the suite after T4 before touching anything else |
| `overflow: hidden` until initialised was hiding the raw slot content; without it, server-rendered popup content must be hidden by `aria-hidden` alone | Med | `.popup[aria-hidden="true"] { display: none }` already exists; keep it and drop the opacity gate |
| A consumer places the `div` root inside a `<p>` anyway — the parser splits the paragraph, exactly today's bug | Med | The contract says never-in-`<p>`; the T2 unit test asserts rich content lands in `.popup`; the fixture shows the sibling placement so the copyable example is the valid one |
| Extracting kernel wiring changes behaviour subtly (event order, rAF) | Med | Unit test the module first (T1), then run the ToggleTip suite as the integration test before any date field ever sees it |
| Upstream drift: Tsugite's ToggleTip stops matching reference-components | Low | It was going to: the structural finding itself is the upstream feedback. Log it (INTAKE §7) |

## Open Questions (answer before Task 1)

1. ~~Root element~~ — **decided 2026-09-09:** `div` root, flow content,
   never inside `<p>`; rich content is the point of the component.
2. ~~Kernel extraction~~ — **decided 2026-09-09: in this pass.** T1 first,
   ToggleTip is consumer one; date fields later.
3. ~~Prop names~~ — **decided 2026-09-09:** `heading` / `headingLevel`; `icon` stays.
4. ~~Popup role~~ — resolved by the role decision above: keep the `aria-hidden` mechanics the suite asserts, change the role to a non-modal dialog, axe decides.
5. ~~Escape~~ — **decided 2026-09-09:** added as the twelfth test.

