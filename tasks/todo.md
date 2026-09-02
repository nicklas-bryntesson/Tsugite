# The Typography Sweep — task list

Plan: [plan.md](plan.md) · Baseline census: 118 raw hits / 30 files (2026-09-02)

## Phase 0 — The Map (read-only)
- [x] **T1** Classify every raw hit → `tasks/typography-map.md` (class A/B/C/D, target, seam-vs-component for the field family)
- [x] **T2** Gap analysis: roles without tools → map §Gaps (G1–G6) + `notes-typography-components.md`

### ⛔ Checkpoint 1 — human review of map + gap proposals (vocabulary decisions live here)

## Phase 1 — Tools
- [ ] **T3** Fill approved gaps only (one tool per commit, doctrine-compliant)

## Phase 2 — Package sweep (bottom-up)
- [ ] **T4** Prose + Heading (the tools themselves: 12 hits)
- [ ] **T5** Field family via the seam split (~32 hits; upstream feedback logged)
- [ ] **T6** Remaining components + fixtures + styles/base (package census → 0)

### ⛔ Checkpoint 2 — package clean: census 0 (minus allowlist), 226 vitest + 403 e2e green

## Phase 3 — Docs app sweep
- [ ] **T7** App base styles (font.css, global, Layout, Tables, kitchenSink)
- [ ] **T8** App pages (map, control-room, docs/*, index)

## Phase 4 — The gate
- [ ] **T9** Census-as-test with explicit class-A allowlist (drift fails the build)

### ⛔ Checkpoint 3 — full census 0, all green, parking lot recorded

## Parked (own scopes, not this sweep)
- Typography components *inside* the ref-comps field family — feasibility study; evidence = T1's class-D field rows
- Non-typography raw values (spacing/radius/color) → `tasks/parking-lot.md`
