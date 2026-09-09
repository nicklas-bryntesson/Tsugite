# Date fields adopt popup-anchor — task list

Plan: [plan-datefields-popup-anchor.md](plan-datefields-popup-anchor.md) · Baseline 2026-09-09: field scripts byte-identical to upstream (closed); full e2e 414/415 (one dev-server ECONNRESET)

## Phase 0 — Confirm
- [x] **Checkpoint 0** — plan reviewed 2026-09-09, decided: no ADR, gate wanted, TimeField first; branch `feat/datefields-popup-anchor` from `main`

## Phase 1 — Prove the transformation
- [x] **T1 TimeField** — `--_tf-*` tokens; `layoutPopup` / `watchResize` / `lightDismiss({ pointer: 'click', focusout: false, escape: false })`; probe, rAF, outside-click copies removed · 40/40

### Checkpoint 1
- [x] timefield 40/40 · unit suite green · by-hand: open, resize relayout, outside click close on /kitchen-sink

## Phase 2 — Same shape, twice
- [x] **T2 MonthField** — `--_mf-*` · 35/35
- [x] **T3 WeekField** — `--_wf-*`, dismiss `_closePopup(false)` · 38/38

### Checkpoint 2
- [x] monthfield + weekfield 73/73 in one run

## Phase 3 — The calendars
- [x] **T4 DateField** — `--_df-*`, dismiss `_closeCalendar(false)` · 51/51 incl. data-direction on open
- [x] **T5 DateTimeField** — `--_dtf-*`, lazy rail kept · 42/42

## Phase 4 — Make it stick
- [x] **T6 Gate** — `tests/kernel/popup-anchor-adoption.test.ts`; break-tested
- [x] **T7 Docs** — INTAKE §2 sentence · parking-lot item closed · porting-log entry

### Checkpoint 3 — contract preserved
- [x] `pnpm --filter tsugite test` green (283, gate break-tested)
- [x] full e2e run 415/415
- [x] docs tests 64/64 + build clean
- [x] PR opened against `main`

## Out of scope
- The `, 50%` / `, 0px` fallbacks on the offset/arrow tokens in the fields' CSS (defaults in CSS, ADR-0007) — a CSS pass of its own
- The Popover / top-layer variant (parked in `parking-lot.md`)
