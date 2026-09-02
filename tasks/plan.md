# Implementation Plan: The Typography Sweep

## Overview

Remnants of three systems — plus AI sessions that predate the governance
structure — have left typography drift across the solution. The goal:
**no text anywhere (package or docs app) renders without passing through
the typography token system** — weight, size, family, line-height,
tracking, alignment all owned by tokens or typography components. This
plan is cleanup prep: first the map, then the sweep. No ADRs; findings
that turn out to be decision-shaped are parked for the user, not decided
mid-sweep.

**Census (2026-09-02, baseline):** 118 raw typography declarations
(`font-size|font-weight|font-family|line-height|letter-spacing|text-transform`
without `var(--…)`) in 30 files:

| Area | Raw / total | Heaviest files |
|---|---|---|
| `packages/tsugite/components` | 49 / 99 | Prose 10, WeekField 8, FileUpload 7, DateTimeField 7, DateField 6 |
| `packages/tsugite/fixtures` | 9 / 9 | Components 4, ThemesSection 3 |
| `packages/tsugite/styles` | 1 / 1 | reset.css |
| `apps/docs/src` | 59 / 81 | font.css 16, map.astro 12, control-room 7, kitchenSink.css 5, color.astro 5 |

Census command (the drift gate candidate, Phase 4):

```sh
grep -rn --include="*.css" --include="*.scss" --include="*.astro" \
  -E "(font-size|font-weight|font-family|line-height|letter-spacing|text-transform):" \
  packages/tsugite/components packages/tsugite/fixtures packages/tsugite/styles apps/docs/src \
  | grep -v "var(--" | grep -v generated
```

## Architecture Decisions (working assumptions — confirmed at Checkpoint 1)

- **Value-preserving by default.** A sweep swap replaces a raw value with
  the token that computes to the same result. Where no token matches the
  rendered value, that is a *finding* on the map (was the raw value the
  drift, or is the ramp missing a stop?) — logged, not silently changed.
- **Swap roles, not properties.** Typography tokens travel as role
  bundles (family + size + weight + lineHeight + tracking +
  featureSettings). When a raw `font-size` maps to `--fontSize-label`,
  the map records the *role adoption* and the swap brings the whole
  bundle — a half-ported role is exactly how "wrong kerning on one
  heading out of ten" happens. T1 marks bundle-incomplete spots.
- **Classification before touching anything.** Every hit gets a class:
  - **A — legitimate infrastructure**: @font-face declarations, reset
    normalization. Stays raw, goes on the gate's allowlist.
  - **B — token exists**: swap to the existing token.
  - **C — tool gap**: no token/component covers the role (e.g. label,
    uppercase kicker, inline code). Feeds Phase 1.
  - **D — component-shaped**: the text should go through a typography
    component (Heading/Prose/…), not own declarations at all.
- **The ref-comps tension (ADR-0002).** The field family (WeekField,
  DateField, FileUpload, …) is ported from reference-components, and
  ADR-0002 wants those files textually close to upstream for diffability.
  Editing their typography in place diverges them; the sanctioned wiring
  point is the `--ui-*` seam. The map must say, per field-family hit,
  whether the fix belongs in the seam file or in the component — and
  component-side fixes are also logged as upstream feedback (INTAKE §7).
- **The e2e suites are the net.** Conformance suites assert computed
  styles, so a value-preserving swap keeps them green — a red suite
  during the sweep is a real finding, never something to "adapt away".

## Task List

### Phase 0: The Map (read-only — no style changes)

#### Task 1: Classify every raw hit
**Description:** Walk all 118 census hits; record file, line, property,
raw value, class (A/B/C/D), target token/component, and for field-family
hits: seam vs component. Output: `tasks/typography-map.md` (one table
per area).
**Acceptance criteria:**
- [ ] Every census hit has a class and a target (or a named gap)
- [ ] Field-family hits carry a seam/component recommendation
- [ ] Value mismatches (raw value ≠ any token) listed as findings
**Verification:** map row count == census hit count; census re-run
matches the baseline.
**Dependencies:** None. **Scope:** M (one output file).

#### Task 2: Gap analysis — the missing tools
**Description:** From the class-C rows, name the typographic roles that
lack a reachable tool (label text, uppercase kicker/guide-label, inline
code, small print, …). For each: does the token exist but no component,
or is the ramp itself missing a stop? Propose the smallest tool per gap.
**Acceptance criteria:**
- [ ] Each gap has a named role, evidence rows, and a smallest-tool proposal
- [ ] Proposals marked token-level vs component-level (component-level =
      new vocabulary = user decision per the litmus test)
**Verification:** every class-C row maps to exactly one gap entry.
**Dependencies:** Task 1. **Scope:** S.

### Checkpoint 1: Map review (human)
- [ ] User reviews the map and the gap proposals
- [ ] Seam-vs-component line for the field family confirmed
- [ ] Gap tools approved (or cut) — anything vocabulary-shaped gets an
      explicit yes/no here
- [ ] Findings triaged: which value mismatches are drift (fix to token)
      vs intentional (needs a ramp stop)

### Phase 1: Tools (only what Checkpoint 1 approved)

#### Task 3: Fill the approved gaps
**Description:** Implement the approved smallest tools (e.g. a label/
text utility or primitive). One tool per commit; each follows the
doctrine (gate pattern, no defaults in CSS).
**Acceptance criteria:**
- [ ] Every approved gap has its tool, exercised by at least one fixture row
- [ ] No unapproved vocabulary introduced
**Verification:** `pnpm --filter tsugite test` green; census unchanged
(tools add, sweeps come later).
**Dependencies:** Checkpoint 1. **Scope:** S–M per tool.

### Phase 2: Package sweep (bottom-up)

#### Task 4: The typography components themselves
**Description:** Sweep Prose (10) and Heading (2) — the tools everything
else passes through must be clean first.
**Acceptance criteria:**
- [ ] Zero class-B/D raw hits remain in Prose/Heading
- [ ] Rendered output value-identical (e2e computed styles green)
**Verification:** `pnpm --filter tsugite test && pnpm --filter tsugite test:e2e`
**Dependencies:** Task 3. **Scope:** S.

#### Task 5: The field family — via the seam where the map says so
**Description:** Sweep WeekField, FileUpload, DateTimeField, DateField,
TimeField, MonthField, AffixField, RangeGroup (~32 hits) along the
seam/component split confirmed at Checkpoint 1; component-side edits
logged as upstream feedback.
**Acceptance criteria:**
- [ ] Zero class-B/D hits remain in the field family
- [ ] Seam-routed fixes live in `ui-tokens` source, not component files
- [ ] Upstream feedback log updated for any component-side edit
**Verification:** package vitest + full e2e (the 403-test net).
**Dependencies:** Task 4, Checkpoint 1. **Scope:** M.

#### Task 6: Remaining package surface
**Description:** ToggleTip, CtaLinkButton, Notice, styles/base/reset
(classify-A confirmed or fixed) + all fixtures (9 hits, 100% raw today).
**Acceptance criteria:**
- [ ] Package census = 0 outside the class-A allowlist
**Verification:** package vitest + e2e; census grep scoped to packages/.
**Dependencies:** Task 4. **Scope:** M.

### Checkpoint 2: Package clean
- [ ] Package census = 0 (minus allowlist), all suites green
- [ ] Findings list reviewed — anything that changed a rendered value
      was user-approved, not adapted away

### Phase 3: Docs app sweep

#### Task 7: App base styles
**Description:** font.css (16 — likely mostly class-A @font-face),
global.css, Layout.css, Tables.css, kitchenSink.css.
**Acceptance criteria:**
- [ ] Zero class-B/D hits in `apps/docs/src/styles`
**Verification:** `pnpm --filter docs test && pnpm build`; visual spot-check
of kitchen-sink and one docs page.
**Dependencies:** Task 3. **Scope:** M.

#### Task 8: App pages
**Description:** map.astro (12), control-room (7), docs/color (5),
docs/tiers, docs/[slug], index — replacing page-local text styling with
typography components/tokens (class-D rows become Heading/Prose/label
tool usage).
**Acceptance criteria:**
- [ ] Zero class-B/D hits in `apps/docs/src/pages`
**Verification:** docs vitest + e2e; visual spot-check map + control-room.
**Dependencies:** Task 7. **Scope:** M.

### Phase 4: The gate (drift must not return)

#### Task 9: Census as a test
**Description:** Turn the census grep into a vitest (package + app):
raw typography declarations outside the class-A allowlist fail the
build. The allowlist is explicit and reviewed — additions are a diff,
not a habit.
**Acceptance criteria:**
- [ ] Test fails when a raw `font-size: 0.8rem` is introduced anywhere swept
- [ ] Allowlist contains exactly the Checkpoint-reviewed class-A rows
**Verification:** deliberately break it, watch it fail, revert.
**Dependencies:** Checkpoint 2 + Task 8. **Scope:** S.

### Checkpoint 3: Done
- [ ] Full census = 0 outside allowlist, both workspaces
- [ ] All suites green, docs build green, Vercel green
- [ ] Non-typography raw values noticed during the sweep are parked in
      `tasks/parking-lot.md` (spacing/radius sweep is a later, separate job)

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Token swap changes a computed value → e2e red | Med | Value-preserving rule; mismatches are Checkpoint findings, never silent adaptations |
| Sweeping ref-comps field files diverges them from upstream (ADR-0002) | High | Seam-vs-component call made on the map, confirmed at Checkpoint 1; component edits logged upstream |
| Gap tools become new vocabulary without samsyn | Med | Component-shaped proposals require explicit user yes at Checkpoint 1 (litmus test) |
| Sweep scope creeps into spacing/radius/color | Low | Parking lot; typography only |

## Parked: separate scopes (not this sweep)

- **Typography components inside the ref-comps field family.** The sweep
  gives the fields the same *values* (tokens via the seam — same ramp,
  same stops as the rest of the site). Whether they should also share the
  *mechanism* — Heading/Prose/label components inside their markup — is a
  structural refactor watched by four eyes at once: design parity, HTML
  structure (typography components wrap text in their own elements),
  conformance suites that expect specific markup, and upstream
  diffability (ADR-0002). Own scope, own plan. The T1 map's class-D rows
  in the field family are its evidence base — collected for free.
- **Non-typography raw values** (spacing, radius, color one-offs) →
  `tasks/parking-lot.md`, a later sweep.
- **The "pill" pattern** (resolution-list items, badge-like name/value
  chips) — recurring shape, likely its own component. Defined *after*
  the sweep passes; the map just tags pill-shaped hits so the evidence
  is ready.

## Open Questions (for Checkpoint 1)

- Should `text-align` join the swept property set? (Not in the census
  today; Heading owns alignment via `data-align` — page-local
  `text-align` on text is arguably the same drift.)
- Does the label gap warrant a primitive (new vocabulary) or is a token
  bundle enough? Decided on evidence from Task 2.
