# Implementation Plan: the date fields adopt popup-anchor

Status: APPROVED 2026-09-09 (no ADR; gate wanted; TimeField first). Building. Follows
`tasks/plan-toggletip.md` (PR #32), which extracted
`kernel/js/popup-anchor.ts` with ToggleTip as consumer one and parked
this pass.

## Overview

Five fields — TimeField, MonthField, WeekField, DateField, DateTimeField —
each carry a private copy of the popup wiring that `popup-anchor` now
owns: the layout routine, the px probe, the rAF resize handler and the
outside-click dismiss. The copies differ only in token prefix and in the
small habits of whoever wrote each one. This pass replaces the five
copies with five calls, one field per commit, with each field's e2e
suite as the contract and no change to markup, CSS or behaviour.

## Findings

### 1. What each field duplicates (measured)

| Piece | Lines per field | Fields | In popup-anchor as |
|---|---|---|---|
| `_updateLayout()` — measure rail/popup/trigger, direction, offset %, arrow px | ~30 | all 5 | `layoutPopup()` |
| `_getCSSPx()` — probe div | ~8 | all 5 | `readCssPx()` |
| `_handleResize` + `_rafHandle` + `resize` add/remove + cancel on close/destroy | ~12 | all 5 | `watchResize()` |
| `_outsideClickHandler` + `setTimeout` registration + removal on close | ~10 | all 5 | `lightDismiss({ pointer: 'click' })` |

About 60 lines per field, 300 in total, become ~15 per field: a token map,
one `layoutPopup` call, one `watchResize` call, one `lightDismiss` call.

### 2. The per-field habits that must survive unchanged

- **Escape and focus stay local.** Every field handles Escape in its own
  keydown routing (calendar grid, picker panel, wheels) and decides
  itself whether closing refocuses the trigger. `lightDismiss` is called
  with `escape: false`; `onDismiss` maps to the field's existing
  "close without refocus" path (`_closeCalendar(false)` /
  `_closePopup(false)` / `_closePopup()` where that already means no
  refocus).
- **`focusout` never dismisses a field popup.** Focus moves from the
  trigger into the modal surface on open; `focusout: false`.
- **Pointer is `click`, not `mousedown`** (ToggleTip's choice), and the
  fields register it on `setTimeout(…, 0)`. `lightDismiss` registers
  synchronously. The opening click's target is the trigger, inside the
  root, so it can never dismiss — the deferral was belt and braces. The
  field suites' "closes on outside click" tests are the proof; if one
  fails, the module gets a `defer` option rather than the field a
  workaround.
- **Direction.** Fields write `root.dataset.direction` on every layout;
  `updateDirection` writes only on change. Same attribute, same value.
  DateField's suite asserts "data-direction is set on root when calendar
  opens" — satisfied.
- **The arrow radius token differs from ToggleTip's.** Fields clamp the
  arrow by `--_xx-arrow-corner-radius`; ToggleTip by its bubble radius.
  `tokens.arrowRadius` is the caller's choice — pass the field's.
- **DateTimeField builds its rail lazily** (`_buildSlideContainer`).
  Keep it; pass `this._rail` to `layoutPopup`.
- **Resize only relayouts an open popup.** `watchResize(() => { if
  (open) layoutPopup(…) }, lifetime.signal)`. Fields have `destroy()`;
  a lifetime `AbortController` created in the constructor and aborted
  in `destroy()` replaces the paired add/remove listener calls.
- **The popup's own abort controller already exists** (`_popupAbort`,
  for `trapPopupInteraction`). `lightDismiss` rides the same signal —
  one teardown on close.

### 3. CSS does not change

The rail / `.popup { left: var(--_xx-popup-offset, 50%) }` / arrow /
`[data-direction]` blocks read the same tokens the module writes. The
`, 50%` and `, 0px` fallbacks on those two tokens are a pre-existing
doctrine deviation (defaults in CSS, ADR-0007) shared by all five fields
— noted, not touched here; it is a CSS pass, not this one.

### 4. Upstream

All five `.ts` files are byte-identical to `../AstroRefComp`, whose last
commit reads "Closing pointer: development continues in the Tsugite
monorepo". The kernel modules are identical in both repos too. INTAKE §2
("the TS travels verbatim where possible") is an *intake* rule for
bringing a component in; it does not freeze a component after intake,
and the upstream it would diff against is closed. The pass is logged in
the porting log for the record (INTAKE §7), and INTAKE gets one sentence
saying so.

### 5. Test coverage that guards the wiring

| Suite | Tests | Directly on the wiring |
|---|---|---|
| timefield | 40 | outside click, Escape + refocus, mouse-opened focus |
| monthfield | 35 | outside click, Escape + refocus, mouse-opened focus |
| weekfield | 38 | outside click, Escape + refocus, mouse-opened focus |
| datefield | 51 | outside click, Escape × 3 paths, `data-direction` on open, mouse-opened focus |
| datetimefield | 42 | Escape + refocus, picker Escape × 2, mouse-opened focus |

Positioning (offset/arrow values) is asserted only by ToggleTip's suite
and the kernel unit tests; the fields' suites assert direction and
dismissal. That is enough: the math and its wiring are the same code
ToggleTip already runs against edge and viewport cases.

### 6. Size

Five S tasks (one file each, ~60 lines out, ~15 in) plus a docs task
and an optional gate. **Medium overall: one PR, seven commits, three
checkpoints.**

## Architecture Decisions

- **One field per commit, smallest first.** TimeField (single wheel
  popup) proves the transformation; MonthField and WeekField are the
  same shape; DateField and DateTimeField add the calendar/picker
  complexity but the wiring is identical.
- **Behaviour-preserving by construction.** Each replacement maps one
  removed method to one module call with the field's own tokens and its
  own dismiss path. No field changes what it does, only who does it.
- **`popup-anchor` does not grow unless a suite says so.** The only
  candidate is a `defer` flag for the click registration; add it only
  if a "closes on outside click" test fails without it.
- **A gate makes the deduplication stick.** A unit test scans
  `components/*/*.ts` and fails if any component defines `_getCSSPx`,
  imports `calculatePopupOffset`/`calculateArrowOffset`/`detectDirection`
  directly, or adds a bare `window.addEventListener('resize'`. The
  wiring is written once — this is how it stays written once. (ADR-0009
  spirit: the gate is deletable the day the fields move to the Popover
  variant, together with the rail.)
- **No ADR.** Applies ADR-0002 (seam unchanged), ADR-0009 (gate), and
  the closed-upstream fact; INTAKE §2 gets a sentence.

## Task List

### Phase 0 — Confirm
- [ ] **Checkpoint 0** — plan reviewed, open questions answered, branch
  `feat/datefields-popup-anchor` from `main`. Baseline: full e2e 414/415
  on 2026-09-09 (one dev-server ECONNRESET), field suites green.

### Phase 1 — Prove the transformation
- [ ] **T1 TimeField** — `TimeField.ts`: `TOKENS` map (`--_tf-*`),
  `_updateLayout` → `layoutPopup`, `_getCSSPx` / `_handleResize` /
  `_rafHandle` / `_outsideClickHandler` removed, `watchResize` on a
  lifetime signal, `lightDismiss({ pointer: 'click', focusout: false,
  escape: false })` on `_popupAbort.signal`. Suite 40/40.

### Checkpoint 1 — the shape is right
- [ ] timefield 40/40 · unit suite green · open/close/outside/Escape/resize
  by hand on /kitchen-sink

### Phase 2 — Same shape, twice
- [ ] **T2 MonthField** — as T1 with `--_mf-*`. Suite 35/35.
- [ ] **T3 WeekField** — as T1 with `--_wf-*`; `_closePopup(false)` is
  the dismiss path. Suite 38/38.

### Checkpoint 2
- [ ] three field suites green in one run

### Phase 3 — The calendars
- [ ] **T4 DateField** — as T1 with `--_df-*`; dismiss path
  `_closeCalendar(false)`; `_updateLayout` guard `if (!this.calendarEl)`
  stays. Suite 51/51 incl. `data-direction` on open.
- [ ] **T5 DateTimeField** — as T1 with `--_dtf-*`; `_buildSlideContainer`
  stays, `_rail` passed. Suite 42/42.

### Phase 4 — Make it stick
- [ ] **T6 Gate** — `tests/kernel/popup-anchor-adoption.test.ts`: no
  component file defines the px probe, imports popup-position directly,
  or adds its own `resize` listener. Break-tested: re-adding one line to
  a field fails it.
- [ ] **T7 Docs** — `docs/INTAKE.md` §2: one sentence — after intake a
  component's script is Tsugite's to refactor; upstream is closed.
  `tasks/parking-lot.md`: close the "date fields still carry their
  private popup wiring" item. `../AstroRefComp/tasks/porting-log.md`:
  the pass, for the record.

### Checkpoint 3 — contract preserved
- [ ] `pnpm --filter tsugite test` green (incl. the gate)
- [ ] the five field suites + toggletip in one run; then one full e2e run
- [ ] `pnpm --filter docs test` and `pnpm --filter docs build` clean
- [ ] PR opened

## Verification per task

| Task | Command |
|---|---|
| T1–T5 | `BASE_URL=http://localhost:4321 pnpm exec playwright test <field>` in `packages/tsugite`; `pnpm --filter tsugite test` |
| T6 | `pnpm --filter tsugite test -- popup-anchor-adoption`, then a deliberate re-insertion fails it |
| T7 | read-through |

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Synchronous click registration dismisses on the opening click in some path (label click, footer button) | Med | The five "outside click" / "Now" / "This month" tests cover it; if one fails, add `defer` to `lightDismiss`, not a workaround in the field |
| A field's `_updateLayout` had a subtle difference I missed (e.g. `\|\| 0` on the probe) | Low | `readCssPx` returns 0 for unset; the measured diff of the five copies is prefix-only |
| Removing `_getCSSPx` from DateTimeField, where it is not `private`, breaks an external caller | Low | grep shows the only caller is `_updateLayout` |
| A dev-server ECONNRESET flake during the full run reads as a regression | Low | Rerun the failing suite in isolation, as done for PR #32 |

## Open Questions

All three decided 2026-09-09: INTAKE sentence, no ADR · the adoption gate
is wanted · TimeField first, calendars last.
