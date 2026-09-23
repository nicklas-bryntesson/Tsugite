# The Button slots pass — task list

Plan: [plan-button-slots.md](plan-button-slots.md) · Branch `fix/button-slots`
(worktree, dev on 4322) · Census: tertiary writes 0 of 14 colour slots (2026-09-23)

## Phase 0 — Instrument
- [x] **T0** Snapshot script: every emphasis × intent × test-state × pill cell → JSON; baseline from `main`; two runs diff empty

## Phase 1 — Mechanical, provably no-op
- [x] **T1** Prefix `--_bt-` on every private slot; spell out the grid carriers; `bt` row in ADR-0013 §2; drop the TODO(decide) — snapshot diff empty
- [x] **T2** Delete the 15 empties, `--_bt-borderRadius: ;`, `--_bt-color-hover`, duplicate `boxShadow: none`; debug overlay reads `--_bt-marginBlock` — snapshot diff empty

### ⛔ Checkpoint 1 — tertiary's look (Nicklas decides; see plan §Open questions)

## Phase 2 — Complete the gate
- [x] **T3** Tertiary PARKED (no design or use yet) — `TODO(decide)` above the gate, docs copy still says unfinished; snapshot identical
- [x] **T4** `tests/button-slots.test.ts`: every emphasis gate writes every colour slot the states read; no `: ;`; no colour slot on the root; tertiary exempt by name (14/14 missing if unparked)

## Phase 3 — Words
- [x] **T5** Header in Card's format; provenance and banners out; `tbd` → `TODO(decide)`; doctrine sentence in css-doctrine §1; parking-lot row resolved

### ✅ Checkpoint 2 — PR
- [ ] vitest both workspaces + e2e themes green; five argument-step commits; PR body = census + no-op argument
