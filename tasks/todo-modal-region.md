# Todo — the modal region

Task list for `plan-modal-region.md`. One task per PR unless noted. Deleted with the plan.

## Phase 1 — Spikes (fail fast)

### Task 1: Platform probe page — DONE 2026-10-15 (results in the plan)
**Description:** A throwaway HTML probe (not shipped) with a `<dialog>`, invoker commands,
`closedby`, `@starting-style`, `overlay`, and the `:root:has(dialog:modal)` scroll lock. Run in
Chromium, Firefox and WebKit via Playwright locally.
**Acceptance:**
- [ ] Each feature's native behaviour and the planned fallback are observed in all three engines
- [ ] A child mounted *after* `showModal()` is tested: wiring on open is or is not enough
**Verification:** findings written into the plan's Platform/Risks sections
**Dependencies:** none · **Scope:** S

### Task 2: Region-recognition stress test — DONE 2026-10-15: the rule fails, alternatives in the plan
**Description:** Test `closest('dialog, [popover]')` against ToggleTip (rail, no Popover API), a
mega-menu sketch, and a popover inside a dialog.
**Acceptance:**
- [ ] Each case is classified: holds / fails
- [ ] If any fails, a region-marker alternative is written up for discussion
**Verification:** result recorded in the plan; decision taken in discussion
**Dependencies:** none · **Scope:** S

### Checkpoint A — review with the human before the ADR

## Phase 2 — Contract

### Task 3: ADR-0029 — a region hears its children through channels — DONE 2026-10-15
**Description:** The settled decisions plus the spike outcomes: the region contract, the three
channels, nearest-region ownership, zero strings, DOM over props, exit motion scope.
**Acceptance:**
- [ ] Attribute name passes the field dictionary
- [ ] Every settled bullet in the plan is in the ADR or explicitly left out
**Verification:** human sign-off; `pnpm test` (ADR-reference gates) green
**Dependencies:** 1, 2 · **Scope:** XS

## Phase 3 — The region, one vertical slice at a time

### Task 4: Modal opens and closes — DONE 2026-10-15
**Description:** `components/regions/Modal/` (Astro + CSS + attach script) and
`kernel/js/region-channels.ts` with the feature-detected `command` fallback. `dismiss` prop with
`request` default and the `closedby` fallback.
**Acceptance:**
- [ ] A `command="show-modal"` button opens it; Esc closes it; focus returns to the opener
- [ ] `dismiss="none"` blocks Esc, `dismiss="any"` closes on backdrop click, in every engine
- [ ] Bench page per ADR-0026
**Verification:** unit tests for the kernel resolution; `modal.e2e.test.js`; `pnpm test`
**Dependencies:** 3 · **Scope:** M

### Task 5: The close channel
**Description:** `data-channel="close"` on any descendant gets `command="close"` + `commandfor`
from the kernel; the button's `value` is the `returnValue`.
**Acceptance:**
- [ ] A close button deep in a nested tree (grid > Card > form) closes its nearest region only
- [ ] `returnValue` reaches the opener
**Verification:** e2e cases; unit test for nearest-region resolution
**Dependencies:** 4 · **Scope:** S

### Task 6: Title, description, label, role
**Description:** `title` → `aria-labelledby` (id generated if missing), `description` →
`aria-describedby`, `label` prop → `aria-label`, `role` prop (`dialog` default). DevError when
neither title nor label is present.
**Acceptance:**
- [ ] Accessible name and description are correct in the a11y tree for each case
- [ ] Content in another `lang` keeps its language in the name
- [ ] DevError fires on an unnamed modal
**Verification:** e2e with accessibility snapshots; renderer test
**Dependencies:** 5 · **Scope:** S

### Checkpoint B — the region works end to end without styling decisions

### Task 7: Placement, scroll, viewport cap
**Description:** Placement prop (closed set, e.g. `center | start | end | full`, confirmed in
discussion first), inner scroll, page lock via `:root:has(dialog:modal)`.
**Acceptance:**
- [ ] Long content scrolls inside; the page behind does not move
- [ ] The box never exceeds the viewport in any placement
**Verification:** `writing-css` routine against `example.css`; e2e; manual on :4325
**Dependencies:** 4 · **Scope:** S

### Task 8: Backdrop and motion slots
**Description:** `--_mo-` slots for backdrop and the enter/exit/backdrop timelines;
`@starting-style` enter; exit gated on `overlay`; reduced motion turns both off.
**Acceptance:**
- [ ] Enter motion where `@starting-style` exists; exit only in Chromium; none under reduced motion
- [ ] Every `var()` exists in the registry or is a `TODO(token)`
**Verification:** `writing-css` routine; e2e with reduced-motion emulation; manual on :4325
**Dependencies:** 4 · **Scope:** S

### Task 9: Docs page
**Description:** `/docs/modal` with the three use cases (signup popup, type-to-confirm alert,
banner sketch without consent logic) and the channel contract documented; manifest entry.
**Acceptance:**
- [ ] Channels and their language rule are documented
- [ ] Manifest row points at the e2e suite
**Verification:** `pnpm build`; manual on :4325
**Dependencies:** 6, 7, 8 · **Scope:** S

### Checkpoint C — ready for the next job

## Next job (not in this plan)

- Consent banner: `consent-preference.ts` + head guard + composition (ThemeSwitch pattern).
- React and Vue adapters for Modal.
