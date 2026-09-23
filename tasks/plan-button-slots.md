# Implementation Plan: The Button slots pass

Queued 2026-09-21 (tasks/parking-lot.md, "From the lab cleanup"); planned
2026-09-23. Own PR from `main`, branch `fix/button-slots`.

## Overview

`Button.css` is the last component on the interpreter whose private slots
carry no prefix, and the only one whose slots are declared *empty* on the
root (`--_color: ;` × 15). An empty custom property is not documentation:
`color: var(--_color)` turns invalid at computed-value time and falls to
`inherit`, `background-color` to `transparent`, `border-color` to
`currentColor`. That silent default is what lets a gate be partial, and
tertiary is partial — it writes none of the fifteen. The pass gives Button
its prefix (`--_bt-`), deletes the empties, makes every emphasis gate write
every slot it consumes, and leaves a test that keeps it so. Header and
comments move to the Card format on the way.

**Census (2026-09-23, Button.css @ 335787f):**

| Gate | Colour slots written / consumed |
|---|---|
| primary, secondary | 14 / 14 |
| primary + destructive/success | 11 / 14 (rest from the emphasis gate) |
| secondary/tertiary + intent | 7 / 14 (rest from the emphasis gate) |
| **tertiary** | **0 / 14** — `--_borderWidth: 0`, `background: transparent` on the element, everything else from the empties |

Dead: `--_color-hover` (declared, never written, never read — hover blocks
re-write `--_color` instead); `--_borderRadius: ;` (both `data-pill`
values overwrite it); `--_marginAdjustment` (read by the debug overlay,
set nowhere — the overlay's measure box has never had a height);
`--_boxShadow: none;` immediately followed by `--_boxShadow: 0 0 0 4px
transparent;` in both focus blocks.

**Nobody outside `Button.css` reads Button's private slot names.** Checked:
CtaButton (own `.CtaButton` root and `--_cta-*`), Teaser, NavItem, all
vitest and e2e suites, `apps/docs`. The docs app's own `--_paddingBlock` /
`--_borderRadius` hits are unrelated page slots. Public names that keep
their spelling: `--button--baselineOffset` (knob), `--theme-button-*`
(theme claims, ADR-0005/0008), `data-test-state` (e2e).

## Architecture decisions

- **Prefix `bt`**, claimed by a row in ADR-0013 §2's register (the ADR
  says a component claims its prefix by adding a row — no new ADR).
  Slot names keep their propertyCamel form; the two grid carriers are
  spelled out on the way (`--_buttonColumns` → `--_bt-gridTemplateColumns`,
  `--_buttonAreas` → `--_bt-gridTemplateAreas`) — ADR-0013 §1 forbids
  abbreviations.
- **Deleting the empties is a visual no-op.** An undeclared custom property
  and an empty one both make the reading declaration invalid at
  computed-value time. So the rename (T1) and the deletion (T2) are each
  provable with a computed-style snapshot: before = after, to the pixel,
  on every cell. Only T3 (tertiary) is allowed to change what renders.
- **Intent stays a delta on a complete emphasis cell.** Today intent gates
  already override a subset of what the emphasis gate wrote (primary +
  destructive = 11 of 14). That is two complete gates on two axes
  cascading, not a partial gate — the emphasis gate owns the full row,
  intent owns the ink/surface/border it changes. This pass does not
  make intent write all 14; it makes emphasis write all 14.
- **The rule goes into doctrine, not a new ADR:** one sentence in
  `css-doctrine.md` §1 — a slot is never declared empty; a gate that
  consumes a slot writes it. (Sits next to the existing "slots carry no
  value in the base".) The parking-lot's other doctrine sentence
  (fallback-first `@supports` order) is NOT in this PR.
- **Dev server discipline:** the working copy on `main` serves
  Nicklas's dev on 4321. The branch lives in a worktree
  (`scratchpad/wt-button`), served programmatically on 4322 for the
  snapshots. Never switch branches under 4321.

## Dependency graph

```
T0 instrument (snapshot script, baseline from main)
 └── T1 prefix --_bt-  ─┐  proven no-op by T0
      └── T2 delete empties + dead ─┘  proven no-op by T0
           └── ⛔ Checkpoint 1: tertiary design decision (Nicklas)
                └── T3 tertiary writes all 14 (+ intent backgrounds)
                     └── T4 slot-completeness test (locks T3)
                          └── T5 header, comments, doctrine sentence, docs copy
                               └── PR
```

## Task list

### Phase 0 — Instrument

## Task 0: Computed-style snapshot of every Button cell

**Description:** A Playwright script (scratchpad, not committed) that
opens `/docs/button` on the worktree's dev server, injects one
`<button class="Button">` per cell — emphasis {primary, secondary,
tertiary} × intent {neutral, destructive, success} × `data-test-state`
{none, hover, active, focus, disabled} × pill {false, true} — plus the
three `<a>` emphases, and writes the computed `color`,
`background-color`, `border-color`, `border-width`, `border-radius`,
`box-shadow`, `outline-*`, `padding-*`, and the `.Button-text` /
`.Button-icon` box sizes to JSON. Run once on `main` for the baseline.

**Acceptance criteria:**
- [ ] One JSON row per cell (≈ 93), deterministic across two runs on `main`.
- [ ] A diff command that prints changed cells with property and both values.

**Verification:**
- [ ] Two consecutive runs on `main` diff empty.

**Dependencies:** None. **Files:** scratchpad only. **Scope:** S.

### Phase 1 — Mechanical, provably no-op

## Task 1: Prefix every private slot `--_bt-`

**Description:** Rename every `--_*` Button.css declares or reads to
`--_bt-*`; spell out the two grid carriers. Add the `bt | Button` row to
ADR-0013 §2's register. Delete the `TODO(decide): unprefixed slots`. The
public knob `--button--baselineOffset` and the theme claims are untouched.

**Acceptance criteria:**
- [ ] `grep -E '\-\-_[a-z]' Button.css` returns only `--_bt-` names and the
      kernel's `--debug-*` reads.
- [ ] ADR-0013 register has the `bt` row.
- [ ] Snapshot diff against baseline: empty.

**Verification:**
- [ ] `pnpm --filter tsugite test` green (`buttons`, `button-renderers`,
      `teaser`, `navitem-renderers`, `typographyFamily`).
- [ ] `pnpm --filter tsugite test:e2e -- themes` green (reads
      `.Button[data-emphasis="primary"]` background on two voices).
- [ ] T0 diff empty.

**Dependencies:** T0. **Files:** `components/Button/Button.css`,
`docs/adr/0013-….md`. **Scope:** S.

## Task 2: Delete the empties and the dead slots

**Description:** Remove the fifteen `--_bt-…: ;` root declarations and the
"own by tone axis" banner, `--_bt-borderRadius: ;`, `--_bt-color-hover`,
the duplicate `--_bt-boxShadow: none;` lines, and the `TODO(dead)` that
announced this pass. The debug overlay's `--_marginAdjustment` read is
replaced by the slot that exists (`--_bt-marginBlock`), so the measure box
gets a height for the first time — debug-only, outside the snapshot.

**Acceptance criteria:**
- [ ] No `: ;` declaration in Button.css.
- [ ] The root declares only knobs with values (fonts, widths, offsets,
      ring colour) — ADR-0013 §3's design-knob form.
- [ ] Snapshot diff against baseline: empty (tertiary still renders on
      inherit/transparent, now from *undeclared* rather than empty).

**Verification:**
- [ ] vitest green; T0 diff empty.

**Dependencies:** T1. **Files:** `Button.css`. **Scope:** XS.

### ⛔ Checkpoint 1 — tertiary's look (human decision)

- [ ] T0 diff empty after T1 and T2 (the pass has changed nothing visible yet).
- [ ] Nicklas decides the tertiary cell — see Open questions. Nothing in
      Phase 2 starts before this.

### Phase 2 — Complete the gate

## Task 3: Tertiary writes all fourteen

**Description:** The tertiary gate sets every slot the states read, with
explicit `transparent` where there is no surface and the decided ink,
hover surface, ring and disabled treatment. `background: transparent` on
the element goes (the slot carries it). Border width stays `0` and the
border-colour slots are written `transparent` so the gate is complete on
paper as well as on screen. Tertiary + intent gates get the backgrounds
they need (per the decision: probably none beyond the emphasis gate's).
`Emphasis.astro`'s comment and `button.astro`'s "Tertiary is unfinished"
lead change to describe the finished cell.

**Acceptance criteria:**
- [ ] Tertiary gate writes the same 14 slot names primary does.
- [ ] Snapshot diff: only `data-emphasis="tertiary"` rows change, and
      each change matches the decided values.
- [ ] Docs copy no longer calls tertiary unfinished.

**Verification:**
- [ ] vitest + e2e themes green; T0 diff limited to tertiary rows.
- [ ] Manual: `/docs/button` → Emphasis, Intent rows on 4322 in light,
      dark, forced-colors.

**Dependencies:** Checkpoint 1. **Files:** `Button.css`,
`apps/docs/src/examples/button/Emphasis.astro`,
`apps/docs/src/pages/docs/button.astro`. **Scope:** S.

## Task 4: A test that keeps every emphasis gate complete

**Description:** A vitest that reads `Button.css` as text, collects the
set of `--_bt-*` names read inside state rules (`var(--_bt-…)`), and
asserts that each `&[data-emphasis="…"]` gate block writes every colour
slot in that set. Also asserts no `: ;` declaration and no root
declaration of an axis carrier. Small, regex-based, Button-only; if it
earns its keep it can become a family test later.

**Acceptance criteria:**
- [ ] Test fails on `main`'s Button.css (tertiary 0/14) and passes after T3.
- [ ] Under ~60 lines, no CSS parser dependency.

**Verification:**
- [ ] `pnpm --filter tsugite test -- button-slots` green; temporarily
      deleting one tertiary line makes it red.

**Dependencies:** T3. **Files:** `packages/tsugite/tests/button-slots.test.ts`.
**Scope:** S.

### Phase 3 — Words

## Task 5: Header in Card's format, comment policy, doctrine sentence

**Description:** Replace the file-level comment and the `/* generic styles */`,
`/* ── Intent ── */` banners with Card's header form (purpose, then one
line per gate: emphasis, intent, size, pill, grow-inline, icon-position,
icon-only). Apply the comment policy: drop upstream provenance ("Upstream
had `color: var();`…"), turn the two `/* tbd: … */` into
`TODO(decide): …` above the line, keep the local whys (icon-only order,
srText ownership, icon sizing). One sentence in `css-doctrine.md` §1:
a slot is never declared empty; the gate that consumes a slot writes it.
Update the parking-lot entry to "resolved" with the PR number, and the
`button-slots-pass` memory.

**Acceptance criteria:**
- [ ] No provenance comment, no banner, every TODO in the taxonomy.
- [ ] Doctrine sentence present; parking-lot row struck through.
- [ ] Snapshot diff unchanged from after T3.

**Verification:**
- [ ] vitest green; `grep -n 'TODO(' Button.css` lists only typed TODOs.

**Dependencies:** T4. **Files:** `Button.css`, `docs/css-doctrine.md`,
`tasks/parking-lot.md`. **Scope:** S.

### ✅ Checkpoint 2 — PR

- [ ] All vitest green in both workspaces; e2e themes green.
- [ ] T0 diff: only tertiary rows, matching the decision.
- [ ] Commits: one argument step each (T1 | T2 | T3 | T4 | T5), no
      people, no first person (git-flow skill).
- [ ] PR body carries the census table and the "deletion is a no-op"
      argument.

## Explicitly not in this pass

- **The dead text engine** (`calc(<length> + 0)` in `.Button-text`,
  parking-lot top item). Fixing it moves every button's geometry; it
  needs the field × button alignment bench as its instrument. Own pass.
  T1 renames those slots without touching the formula.
- `quiet` emphasis, the `<strong>` bold door, jumbo/`--fontSize-h3`
  (CtaButton) — separate rows in memory.
- Raw `rem`/`em` paddings and icon sizes in the size gates
  (`--size-sm` exists for two of six) — spacing-drift diagnosis, not
  this pass.
- Making the intent gates write all 14 (see Architecture decisions).

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| A rename misses one read → a state silently falls to inherit | Med | T0 snapshot on every cell × state; grep for unprefixed `--_` |
| Tertiary decision drags | Low | T1–T2 land as their own provable commits first; the branch can wait at Checkpoint 1 |
| e2e `themes` couples to Button's background | Low | It reads computed colour by attribute, not slot names; run it after T1 and T3 |
| Fixing `--_marginAdjustment` changes the debug overlay | None | Debug-only (`data-test-state="debug"`), not a shipped state |

## Open questions (for Checkpoint 1)

1. **Tertiary's cell.** Recommendation: secondary without the border —
   ink `--color-interactive-secondary-text`, surface `transparent`,
   hover surface `--color-interactive-secondary-hoverSurface` with the
   hover ring, active/focus as secondary's, disabled ink from
   `--color-disabled-text` on a transparent surface with **no stripe
   gradient** (the stripe reads as a disabled surface; tertiary has
   none). Theme claims: reuse `--theme-button-*-secondary*` rather than
   mint tertiary channels in `theme.voices.tokens.js` — a new channel is
   a token decision, not a CSS one. Alternative: mint
   `--theme-button-color-tertiary` etc. now (six voice tokens, `pnpm
   tokens`, three voices to fill).
2. **Tertiary + intent hover.** Keep the secondary hover surface under
   the feedback ink (as secondary + intent does today), or no surface at
   all on hover? Recommendation: same as secondary + intent.
3. **The doctrine sentence vs. an ADR-0013 amendment.** Recommendation:
   doctrine sentence; ADR-0013 §3 already says a carrier "has no root
   default", the empties were a violation, not an undecided case.
