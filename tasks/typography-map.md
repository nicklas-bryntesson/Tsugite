# Typography Map (T1) — every raw hit, classified

Census 2026-09-02 · 118 raw declarations / 30 files. Classes:
**A** legitimate infrastructure (allowlist) · **B** token exists → swap ·
**C** tool gap → feeds T2 · **D** should pass through a typography
component. Field-family rows carry **Seam/Comp**: whether the fix
belongs in the `--ui-*` seam or the component file (ADR-0002).

## ⚠️ The central finding: static values vs a breathing ramp

Every raw size is static; every size token is **tier-responsive**
(`--fontSize-label`: 0.9375 → 1 → 1.125rem across tiers, ×TYPE-SCALE).
Strict value preservation is therefore impossible for size swaps — the
FLOOR tier can match, but desktop rendering changes *by design*. That IS
the drift being healed, but it means: (1) e2e computed-style suites will
need value updates, logged as test adaptations; (2) Checkpoint 1
approves this principle once, not per-swap. Weight/family/tracking swaps
are tier-static and truly value-preserving.

Telling evidence: raw `0.85rem` in the docs pages equals
`--FONTSIZE-LABEL-SMALL-DESKTOP` exactly — the old system's static label
size, frozen at one tier.

## Package components — field family (ref-comps; Seam/Comp per row)

| Loc | Declaration | Class | Seam/Comp | Target / note |
|---|---|---|---|---|
| AffixField:117 | `line-height: 1` | A? | comp | mechanical trim (affix alignment) — confirm at CP1 |
| FileUpload:133,145,166,224 | `font-size: 0.875rem` ×4 | B | seam | the 0.875 cluster → `--fontSize-label` (F1) |
| FileUpload:146 | `font-weight: 600` | B | seam | weight-600 cluster (F2) |
| FileUpload:188 | `font-size: 0.75rem` | B | seam | `--fontSize-label-small` / `body-small` |
| FileUpload:198 | `line-height: 1` | A? | comp | mechanical trim |
| TimeField:312 | `font-size: 1rem` | B | seam | `--fontSize-label`? (1rem = label-MOBILE; F1) |
| WeekField:337,360 | `font-size: 1rem` ×2 | B | seam | as above |
| WeekField:361 | `line-height: 1` | A? | comp | mechanical trim |
| WeekField:368,388,398,403 | `font-weight: bold` ×4 | B | seam | `bold` keyword → weight token (F2) |
| WeekField:383 | `font-weight: normal` | B | seam | F2 |
| DateField:298,317 | `font-size: 1rem` ×2 | B | seam | F1 |
| DateField:318 | `line-height: 1` | A? | comp | mechanical trim |
| DateField:325,362 | `font-weight: bold` ×2 | B | seam | F2 |
| DateField:339 | `font-weight: normal` | B | seam | F2 |
| MonthField:323 | `font-size: 1rem` | B | seam | F1 |
| DateTimeField:299,318 | `font-size: 1rem` ×2 | B | seam | F1 |
| DateTimeField:319 | `line-height: 1` | A? | comp | mechanical trim |
| DateTimeField:326,340 | `font-weight: normal` ×2 | B | seam | F2 |
| DateTimeField:363,540 | `font-weight: bold` ×2 | B | seam | F2 |
| RangeGroup:163 | `font-weight: 600` | B | seam | F2 |
| ToggleTip.css:141 | `font-size: 1rem` | B | seam | F1 (ToggleTip is ref-comps) |
| ToggleTip.css:166 | `font-weight: bold` | B | seam | F2 |

Field-family line: **size/weight values route through the seam** (new
`--ui-*` rows mapped to label-role tokens) so component files stay
textually near upstream; the `line-height: 1` trims look mechanical
(icon/glyph alignment), proposed class A. Component-side edits, if any,
get logged upstream (INTAKE §7).

## Package components — own primitives

| Loc | Declaration | Class | Target / note |
|---|---|---|---|
| Heading:202–203 | `line-height/letter-spacing: inherit` | A | deliberate pass-through in inner element |
| Notice:156 | `font-weight: 600` | B | F2 → `--fontWeight-label`? role decision |
| CtaLinkButton:76 | `font-weight: 600` | B | F2 — CTA uses label role; label weight is 400 → finding |
| CtaLinkButton:77 | `line-height: 1.2` | B | `--lineHeight-label` is 1.3 → mismatch finding (F3) |
| Prose:181,199,232 | `font-size: 0.875em` ×3 | B? | em-relative inline (small/code in flow) — tokenize the ratio or accept as mechanism; CP1 |
| Prose:206 | `font-size: 1em` reset | A | pre already scales — mechanical |
| Prose:263 | `line-height: 1.7` | B | `--lineHeight-body` is 1.5 → mismatch finding (F3) |
| Prose:267–269 | h3: `1.75rem/600/1.2` | B | should be `--fontSize-h3` + heading bundle; 1.75 = h2-FLOOR → finding (F4) |
| Prose:273–274 | h4: `1.4rem/600` | B | 1.4rem matches no stop → finding (F4) |

## Package fixtures + base

| Loc | Declaration | Class | Target / note |
|---|---|---|---|
| RangeFieldSection:99 | inline `font-size: 1.5rem` | A | deliberate test stimulus (text-scaled case) |
| RangeScaleSection:151 | inline `font-size: 1.5rem` | A | same |
| Components:150,236,241,253 | inline `font-size: 0.875rem` ×4 | D | authored note text → `Text` component, body/label-small voice (F1) |
| ThemesSection:89 | `font-size: 0.75rem` (.cell-label) | C/D | label/kicker role → `Label` (pill-tagged) |
| ThemesSection:95 | `font-weight: 600` | C/D | with above (F2) |
| ThemesSection:107 | `font-size: 0.875rem` (.cell-text) | D | `Text`, F1 |
| styles/base/reset.css:20 | `line-height: 1.5` | A? | base reset = `--lineHeight-body` value; token-ify or allowlist, CP1 |

## Docs app — base styles

| Loc | Declaration | Class | Target / note |
|---|---|---|---|
| font.css:3–78 | @font-face blocks (16 decls) | A | font loading infrastructure |
| Layout.css:2 | `font-family: system-ui, …` | B | **the app body font ignores the ramp** → `--fontFamily-body` (big win) |
| global.css:86 | `font-family: monospace` | B | `--fontFamily-code` (`--MONOSPACE`) |
| global.css:93 | Hiragino/Yu Gothic stack | C? | ja-fallback for the logo — token gap `--fontFamily-ja`? CP1 |
| Tables.css:43,51 | `font-size: 1rem` ×2 | B | `--fontSize-body` (breathes at desktop — F0 principle) |
| kitchenSink.css:151,155 | `line-height: 1cap` ×2 | A | bench instrument (cap-height probe) |
| kitchenSink.css:197–199 | monospace/normal/lowercase | B | code voice: `--fontFamily-code` + `--fontWeight-code`; lowercase deliberate → A |

## Docs app — pages

| Loc | Declaration | Class | Target / note |
|---|---|---|---|
| index.astro:101–102 | `2.5rem` / `line-height: 1` hero | D | Heading display voice; 2.5rem vs display ramp → F5 zoo |
| index.astro:130 | `font-size: 0.95rem` | D | F5 zoo |
| color.astro:144 | `0.85rem` | D | = label-small-DESKTOP frozen → `--fontSize-label-small` (F5) |
| color.astro:182,190,209 | `0.82` / `0.78` / `0.8rem` | D | F5 zoo — quantize to ramp stops |
| color.astro:210 | `font-weight: 600` | D | F2 |
| control-room.astro:128 | `0.85rem` breadcrumb | D | `--fontSize-label-small` (F5) |
| control-room.astro:158–159 | monospace `0.8rem` (.res-value) | C | **pill value style** — pill component evidence |
| control-room.astro:196–199 | `0.75rem/600/0.08em/uppercase` (.guide-label) | C | **the kicker role** — gap G2 |
| [slug].astro:64,80,91 | `0.85` / `0.75` / `0.72rem` | D | F5 zoo |
| map.astro:137–139 | `0.75/600/0.1em` | C | kicker (G2) |
| map.astro:142 | `letter-spacing: 0` [lang=ja] | A | mechanical ja-correction |
| map.astro:147,171,223,229 | `0.85/0.95/0.8/0.9rem` | D | F5 zoo |
| map.astro:183–186 | `0.68rem/600/0.08em/uppercase` | C | kicker (G2), smallest zoo member |
| tiers.astro:46 | `font-size: var(${token})` specimen | A | renders the token itself — instrument |
| tiers.astro:107 | `0.85rem` | D | F5 |
| tiers.astro:139 | `line-height: 1.1` | D | F3 |

## Findings (Checkpoint 1 decides)

- **F0 — The breathing-ramp principle** (see top). Approve once.
- **F1 — The 0.875rem/1rem cluster** (fields, fixtures): the old static
  label size. Target `--fontSize-label` (0.9375→1.125 by tier)? Or does
  the label ramp need adjusting? One decision covers ~15 rows.
- **F2 — Weight drift**: `600`/`bold`/`normal` keywords everywhere.
  Label role weight is 400 (INTER-400) but UI text is set 600/bold in
  practice — does the label role need a bold stop
  (`--fontWeight-label-strong`?) or is `--fontWeight-body-bold` (Noto
  700) ever right for UI? Role decision, ~20 rows.
- **F3 — line-height mismatches**: 1.2 vs label 1.3; 1.7 vs body 1.5;
  1.1 hero. Which is the truth, code or token?
- **F4 — Prose's internal heading scale** (1.75/1.4rem) matches no ramp
  stop. Adopt h3/h4 tokens (renders bigger) or is prose meant to run a
  quieter heading scale (→ ramp stops for prose)?
- **F5 — The micro-size zoo**: 0.68, 0.72, 0.75, 0.78, 0.8, 0.82, 0.85,
  0.9, 0.95rem across docs pages — nine ad-hoc stops where the ramp
  offers label-small/body-small. Quantize hard (visual change, docs-only)
  or extend the ramp? Recommend: quantize.

## Checkpoint 1 — decisions (Nicklas, 2026-09-02)

- **F0 APPROVED** — the docs site uses components/tokens, never fixed
  values; the breathing ramp is the point. e2e value updates are logged
  adaptations.
- **F1 DECIDED** — the 0.875/1rem cluster maps to `--fontSize-label`.
- **F2 DECIDED** — the 600/bold keywords ARE the drift; swap to role
  weight tokens as they stand (no new strong stop). Visual change
  expected and wanted; anything that looks broken in review is a finding.
- **F3 DECIDED** — the token is the truth (label 1.3, body 1.5).
- **F4 DECIDED** — Prose adopts the Heading scale (h3/h4 tokens).
- **F5 DECIDED** — hard quantization of the micro-size zoo to ramp stops.
- **G1 DECIDED** — `Text` becomes its own component.
- **G2 DECIDED** — eyebrow: NOW swept via `Text` + quantization; LATER a
  likely own `Eyebrow` primitive (graphic manner, dot/icon slot = the
  technical axis). Semantics fixed either way: a `p`, in a
  `HeadingGroup`/`<hgroup>` composition when grouped. See
  `notes-typography-components.md`.
- **G3/G4 DECIDED (revised)** — `legend`/`figcaption` join **Heading's
  element farm** (no own props → no own components; root-IS-element
  satisfies the placement constraints). **`Label` IS its own technical
  component** (`for`, `id`, aria) wearing the full visual grammar.
  `Text` = p/span/div, default body.
- **G7 NEW** — the `caption` style: a visual voice that doesn't exist
  yet; token-bundle work in theme-default, wearable family-wide.
  Defined when designed — not blocking the sweep.
- **G6 DECIDED (by default, low stakes)** — the ja stack stays an
  allowlisted one-off; becomes `--fontFamily-ja` the day Japanese text
  spreads beyond the logo.

## Sweep log — correction (2026-09-03)

- **Tables.css td font-size was a BENCH ANCHOR, misclassified B.** The
  T7 swap to `--fontSize-body` let the breathing ramp reach INTO
  embedded component demos through table-cell inheritance — the Range
  geometry suites (em-based marks) went red at desktop (6px → 7.5px).
  Reverted to an anchored `1rem` with an argued gate-allowlist entry:
  cells that host component demos are instruments and must not breathe.
  Found because the run-engine branch ran the full e2e net; PR #7 only
  ran docs tests — lesson: any change under `apps/docs/src/styles` that
  tables/fixtures inherit needs the package e2e run too.

## Sweep log (Phase 2, 2026-09-02)

- Package swept: census 11 remaining, all class A. 226 vitest + 414 e2e
  green with **zero test adaptations** (the bold→body-bold swap was
  value-identical at 700; suites held through the size breathing).
- **New finding (parked):** CtaLinkButton reads ghost tokens —
  `--fontSize-cta` and `--fontFamily-button` don't exist in the semantic
  layer, so its defensive fallbacks are the actual values (ADR-0008
  violation outside the census regex). Needs a role decision (is CTA
  label-voice at a bigger stop, or its own voice?).
- **Upstream feedback (INTAKE §7), for reference-components:** the field
  family's raw font-size/weight values became one-line substitutions
  against four new seam tokens (--ui-font-size, --ui-font-size-small,
  --ui-font-weight, --ui-font-weight-strong). Upstream should consider
  adopting typography seam tokens so ports need no substitutions at all;
  also: whether the label role wants an own strong weight stop instead
  of borrowing body-bold.

## Gaps (T2) — roles without a reachable tool

Family model per `notes-typography-components.md`: per-element components
(technical axis) sharing one visual grammar (voice × size). ▸ =
component-level = new vocabulary = explicit CP1 yes/no.

- **G1 ▸ `Text`** — authored single-run UI text (p/span/div, default
  voice body). Evidence: Components fixture ×4, most D-rows in docs
  pages. Smallest tool: one component, no new CSS voice (reuses body/
  label bundles).
- **G2 — the kicker** — uppercase + 600 + tracking + small size.
  Evidence: control-room guide-label, map ×2 (0.68–0.75rem). Smallest
  tool: a *style stop within the label voice* (e.g. `data-style="kicker"`
  in the shared grammar), not a new component — reachable from Text/
  Label/Heading alike.
- **G3 ▸ `Label`** — label element farm + `for`; default voice label.
  Evidence: ThemesSection cell-labels; field labels today live in
  ref-comps markup (the parked mechanism study).
- **G4 ▸ `Legend` / `Figcaption`** — no census evidence (the elements
  barely exist in the code yet); prospective, from nested-form practice.
  Proposal: define with the family so the grammar is complete, implement
  when first needed.
- **G5 — the pill** — name/value chip (res-name/res-value, cell-label
  frames). Parked per Nicklas: own component defined after the sweep
  passes; map rows are tagged.
- **G6 — ja type stack** — global.css:93's Hiragino/Yu Gothic fallback
  is a token gap (`--fontFamily-ja`?) or an accepted one-off. Token-level.

## Stats

- Total: 118 · **A** 27 (incl. 16 @font-face) · **B** ~52 · **C** 9 · **D** ~30
- Field family: 32 rows → seam-routed except 5 mechanical trims (A?)
- One-decision leverage: F1+F2+F5 together cover ~60 of the 91 non-A rows
