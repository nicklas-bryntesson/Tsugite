# ToggleTip → house structure — task list

Plan: [plan-toggletip.md](plan-toggletip.md) · Baseline: 11/11 e2e green on `/kitchen-sink` (2026-09-09) · TS byte-identical to upstream

## Phase 0 — Confirm
- [x] **Checkpoint 0** — plan reviewed 2026-09-09, all five questions decided (`div` root never in `<p>`; kernel first; `heading`/`headingLevel`; role → non-modal dialog; Escape as test 12), branch `feat/toggletip-house-structure` from `main`

## Phase 1 — Kernel first
- [ ] **T1** `kernel/js/popup-anchor.ts` (direction, offset + arrow into caller-named tokens, px probe, rAF resize, light dismiss incl. Escape, `AbortSignal` teardown) + jsdom unit test

## Phase 2 — The component
- [ ] **T2** `ToggleTip.astro` — `div` root, server end-state (button, rail, popup, arrow, optional heading), props `id` / `icon` / `heading` / `headingLevel`, rich slot content, role per plan, CSS moved in as one nested tree, tokens on the root in one layer, seam colours; `ToggleTip.css` deleted; AstroContainer unit test incl. "slotted `<p>` lands in `.popup`"
- [ ] **T3** `ToggleTip.ts` — `static attach()`, instance guard, `data-initialized`, behaviour via `anchorPopup()`; no DOM building

### Checkpoint 1 — renders and behaves in isolation
- [ ] unit tests green · one instance opens / closes / flips / clamps in the browser

## Phase 3 — Consumers and the contract
- [ ] **T4** Fixtures `ToggleTipSection` + `ScrollAreaSection` author `<ToggleTip>`; CSS imports gone; the five `data-id`s survive; "Inline with text" re-authored as siblings — no tip inside a `<p>` anywhere
- [ ] **T5** e2e: root via `targetId('ToggleTip')` + `DEFAULT_TARGET` row; add Escape test; log the adaptation in `../AstroRefComp/tasks/porting-log.md`
- [ ] **T6** `parking-lot.md`: close the `:root`-tokens item; park "date fields adopt popup-anchor" (6× duplication) and the popover track (two upstream variants, consumer picks; Tsugite swaps on deletion day when Chrome 109 leaves browserslist)

### Checkpoint 2 — contract preserved
- [ ] `pnpm --filter tsugite test` green
- [ ] `pnpm --filter tsugite test:e2e` — toggletip 12/12, scrollarea green, then one full run
- [ ] `pnpm build` (apps/docs) succeeds
- [ ] PR opened against `main`

## Out of scope (own passes)
- Date fields (DateField, DateTimeField, TimeField, MonthField, WeekField) adopting `popup-anchor` — verbatim upstream files, ADR-0002
- `/docs/toggletip` explicit page — after the component is in house form
