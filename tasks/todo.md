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
- [x] **T7** App base styles — body font joins the ramp (was system-ui); tables breathe
- [x] **T8** Pages — the nine-stop micro-size zoo quantized to label/label-small; kanji mark on the display bundle; inline code relative (Prose mechanism); tracked-caps manner allowlisted pending Eyebrow

## Phase 4 — The gate
- [x] **T9** `apps/docs/tests/typography-gate.test.ts` — declaration-level census (line-based grep undercounted!), explicit allowlist WITH counts; break-tested: an injected 0.8rem fails the build

### ✅ Checkpoint 3 — census 0 outside the argued allowlist in both workspaces; 226+414+8 tests green; parking lot recorded (`tasks/parking-lot.md`)

## Parked (own scopes, not this sweep)
- Typography components *inside* the ref-comps field family — feasibility study; evidence = T1's class-D field rows
- Non-typography raw values (spacing/radius/color) → `tasks/parking-lot.md`
