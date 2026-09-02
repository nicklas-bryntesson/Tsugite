# The Typography Sweep — task list

Plan: [plan.md](plan.md) · Baseline census: 118 raw hits / 30 files (2026-09-02)

## Phase 0 — The Map (read-only)
- [x] **T1** Classify every raw hit → `tasks/typography-map.md` (class A/B/C/D, target, seam-vs-component for the field family)
- [x] **T2** Gap analysis: roles without tools → map §Gaps (G1–G6) + `notes-typography-components.md`

### ⛔ Checkpoint 1 — human review of map + gap proposals (vocabulary decisions live here)

## Phase 1 — Tools
- [x] **T3** Text component (PR #5) — body+label voices, one door per look; Heading's farm gains legend/figcaption

## Phase 2 — Package sweep (bottom-up)
- [x] **T4** Prose adopts the ramp (F3/F4); Heading's two hits were class A
- [x] **T5** Field family via four new seam pointers (--ui-font-size/-small, --ui-font-weight/-strong); 414/414 e2e green, zero adaptations
- [x] **T6** Fixtures use Text / tokens; reset names --lineHeight-body

### ✅ Checkpoint 2 — package census: 11 raw hits remain, ALL class A (5 mechanical trims, 4 Prose em-mechanism, 2 test stimuli); 226 vitest + 414 e2e green

## Phase 3 — Docs app sweep
- [ ] **T7** App base styles (font.css, global, Layout, Tables, kitchenSink)
- [ ] **T8** App pages (map, control-room, docs/*, index)

## Phase 4 — The gate
- [ ] **T9** Census-as-test with explicit class-A allowlist (drift fails the build)

### ⛔ Checkpoint 3 — full census 0, all green, parking lot recorded

## Parked (own scopes, not this sweep)
- Typography components *inside* the ref-comps field family — feasibility study; evidence = T1's class-D field rows
- Non-typography raw values (spacing/radius/color) → `tasks/parking-lot.md`
