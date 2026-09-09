# Date fields adopt popup-anchor — task list

Plan: [plan-datefields-popup-anchor.md](plan-datefields-popup-anchor.md) · Baseline 2026-09-09: field scripts byte-identical to upstream (closed); full e2e 414/415 (one dev-server ECONNRESET)

## Phase 0 — Confirm
- [x] **Checkpoint 0** — plan reviewed 2026-09-09, decided: no ADR, gate wanted, TimeField first; branch `feat/datefields-popup-anchor` from `main`

## Phase 1 — Prove the transformation
- [ ] **T1 TimeField** — `--_tf-*` tokens; `layoutPopup` / `watchResize` / `lightDismiss({ pointer: 'click', focusout: false, escape: false })`; probe, rAF, outside-click copies removed · 40/40

### Checkpoint 1
- [ ] timefield green · unit suite green · by-hand check on /kitchen-sink

## Phase 2 — Same shape, twice
- [ ] **T2 MonthField** — `--_mf-*` · 35/35
- [ ] **T3 WeekField** — `--_wf-*`, dismiss `_closePopup(false)` · 38/38

### Checkpoint 2
- [ ] three suites green in one run

## Phase 3 — The calendars
- [ ] **T4 DateField** — `--_df-*`, dismiss `_closeCalendar(false)` · 51/51 incl. data-direction on open
- [ ] **T5 DateTimeField** — `--_dtf-*`, lazy rail kept · 42/42

## Phase 4 — Make it stick
- [ ] **T6 Gate** — `tests/kernel/popup-anchor-adoption.test.ts`; break-tested
- [ ] **T7 Docs** — INTAKE §2 sentence · parking-lot item closed · porting-log entry

### Checkpoint 3 — contract preserved
- [ ] `pnpm --filter tsugite test` green
- [ ] five field suites + toggletip in one run · one full e2e run
- [ ] docs tests + build clean
- [ ] PR opened against `main`

## Out of scope
- The `, 50%` / `, 0px` fallbacks on the offset/arrow tokens in the fields' CSS (defaults in CSS, ADR-0007) — a CSS pass of its own
- The Popover / top-layer variant (parked in `parking-lot.md`)
