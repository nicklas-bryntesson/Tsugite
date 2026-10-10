# 05 — Conformance gates: mechanically checking the written rules (ratchet design)

Survey date 2026-10-10, branch `feat/appearance-guard` (clean). Read-only on the repo.
Scan script: `scan.mjs` next to this file (`node scan.mjs [--samples] [--prose] [--json out.json]`, ~0.12 s wall).
Raw baseline dump: `a baseline JSON (regenerate with `node scan.mjs --json out.json`)` (every violation with file, line, text).

---

## 1. Existing gates — inventory

| Gate | Where | What it checks | When it runs | Kind |
|---|---|---|---|---|
| `protect-generated.py` | `.claude/hooks/`, PreToolUse `Edit\|Write` | Blocks edits to `*.generated.css`, `*.generated.md`, `styles/ui-tokens.css` | Every agent Edit/Write | Hard block. **Gap:** a Bash `sed -i`/heredoc bypasses it (CI freshness check catches it later). |
| `protect-git.py` | `.claude/hooks/`, PreToolUse `Bash` | No commit/merge on `main`, no force-push | Every agent Bash | Hard block |
| `typography-gate.test.ts` | `apps/docs/tests/` (vitest) | Raw `font-*`/`line-height`/`letter-spacing`/`text-transform` declarations across both workspaces | `pnpm test`, CI `test` (required) | **Allowlist with counts** per file per normalized declaration. Ratchet-shaped, but only fails on *more*; a count that drops passes silently and the stale allowance stays forever (no tightening). |
| `css-nesting-gate.test.ts` | `apps/docs/tests/` | Every sheet lowers to `&`-free CSS via Lightning CSS; probe that the browserslist still needs lowering (ADR-0009 deletion day) | `pnpm test`, CI | Absolute (no allowlist) |
| `tokens.test.ts` | `packages/tsugite/tests/` | Generated artifacts fresh vs factories (incl. `tokens.generated.md`, `Surface.generated.css`, `text-box.generated.css`); semantic-token grammar (ADR-0004); RAW only in factories; voice cells complete; WCAG contrast per cell; oklch single-sourcing | `pnpm test`, CI | Absolute |
| `typographyTokens.test.ts`, `baseTokens.test.ts` | same | Tables complete (refusal rule), artifact freshness, tier ladder bounded with no gap/overlap (ADR-0001) | same | Absolute |
| `button-slots.test.ts` | same | `Button.css`: every `data-emphasis` gate writes every colour slot the states read (doctrine §1, ADR-0013 §3); text-level, no parser | same | Absolute + one hard-coded parked value (`tertiary`) |
| `*-renderers.test.ts` + `tests/fixtures/*.json` (13 files) | same | Recipe resolution vs language-neutral fixture; Astro/React/Vue byte-identical markup (ADR-0017/0018) | same | Absolute |
| `typographyFamily.test.ts`, `state-maps.test.ts` | same | Recipe tables vs family matrix; state maps cover every pair | same | Absolute |
| `components-tree.test.ts` | same | Component folders ↔ `package.json` exports | same | Absolute |
| `docs-manifest.test.ts`, `manifest-tree.test.ts` | `apps/docs/tests/` | Docs map ↔ pages | same | Absolute |
| CI `test` job | `.github/workflows/ci.yml` | `pnpm tokens` + `git diff --exit-code` on generated output, then `pnpm test` | Every PR, **required** by ruleset | — |
| CI `e2e*` jobs | same | Playwright conformance suites (computed style, axe) | Every PR, reporting only | — |
| `writing-css` skill | `.claude/skills/writing-css/` | Manual point-by-point comparison against `example.css` | When the agent remembers to invoke it | Self-check, not enforced |

**Not present:** stylelint, eslint, prettier, any git pre-commit hook (no `.husky`, no `core.hooksPath`), any PostToolUse hook. `postcss@8.5.26` exists only transitively (`node_modules/.pnpm`); `lightningcss` is a direct devDependency of both workspaces.

**The headline gap:** ADR-0014 says "a name not on this page does not exist", and nothing checks it. The same goes for the ADR-0013 prefix register, recipe↔gate coverage, logical properties, the fallback seam rule, and the form rules. Every rule in the skill's "After writing" checklist is enforced only by the agent re-reading its own work.

---

## 2. Rule-by-rule: can it be checked mechanically?

FP = estimated false-positive risk of the heuristic as written in `scan.mjs`.

| # | Rule (source) | Checkable? | How | FP |
|---|---|---|---|---|
| 1 | Every `var(--x)` is in the registry (doctrine §2, ADR-0014) | **yes** | PostCSS decl walk + parse registry names out of `tokens.generated.md` (backticked names + `<voice>` rows expanded). Better: export the name set from `engine/registry.js` | low (allow `--custom-*` ADR-0021 hooks, kernel `debug.css` names, `-bold` voice stop when it has a fallback) |
| 2 | No RAW (`--UPPERCASE`) in a component; no `--theme-cell-*` (ADR-0004) | **yes** | same walk, regex on name | very low |
| 3 | At most one fallback per expression (ADR-0008) | **yes** | var() parser: a fallback that itself contains a var() with a fallback | very low |
| 4 | Fallback only at a seam: theme claim or a voice's optional stop | **yes** | outer name must be `--theme-*` or `--fontWeight-*-bold` | low (catches `var(--_bt-x, auto)` and `var(--ui-*, #c00)`, both real drift) |
| 5 | No empty slot `--_x: ;` (doctrine §1, ADR-0013 §3) | **yes** | decl with `--_` prop and blank value | none |
| 6 | No `!important`, no `@layer` (doctrine §3) | **yes** | `decl.important`, at-rule name | none |
| 7 | Slot form `--_<prefix>-…`, prefix from the ADR-0013 register, owned by this component | **yes** | parse the register table from ADR-0013; map folder name → prefix; `tbx` allowed everywhere (ADR-0024 carriers) | low |
| 8 | Slot property word camelCase, spelled out (no kebab, no `bg`/`fg`) | **partially** | kebab = a known hyphenated CSS property inside the name; abbreviations by list | medium |
| 9 | Logical properties only (ADR-0022, example.css) | **yes** | prop regex `(margin\|padding\|border)-(left\|right\|top\|bottom)`, `top/left/…`, `width/height`; `text-align/float: left\|right` | low for edges; medium for `width/height` (`max-width` in a media feature is excluded) |
| 10 | Axis word with a logical pair + logical values (ADR-0022) | **yes** | recipe values ∈ {left,right,top,bottom}; bare `data-align`; CSS gates `[data-*="left"…]` | low |
| 11 | Every recipe axis value has a gate; nothing gated outside the table (skill step 3) | **yes** | import the `.recipe.ts` files directly (Node 24 strips types), skip `unwritten`/`maps` axes, union `valuesBy`; regex `[data-x="v"]` over the component's CSS | low |
| 12 | Off value first | **partially** | source order of the two gates per boolean axis | low, but needs a decision on enums |
| 13 | Gate writes the same carriers for every value | **partially** | set equality of `--_*` declared per gate of one axis (generalizes `button-slots.test.ts`) | medium (shared gates, combined selectors) |
| 14 | No absence guard `:not([data-x])` (doctrine §1) | **yes** | selector regex | low |
| 15 | Raw value only with a `TODO(token)` above it (doctrine §2) | **partially** | raw length in spacing props (`--size-*` exists) without a preceding `TODO(token)` comment | medium (Prose's `em` rhythm is deliberate; knob defaults like `1px` borders have no token ramp yet) |
| 16 | Parts bare lowercase; no `Name-part` / `name-part` | **yes** | class tokens with a hyphen in selectors | low–medium (kernel classes like `.Wheel`) |
| 17 | No rule on another component's class (ADR-0015) | **partially** | PascalCase class ≠ own root | medium (Teaser's `.LayoutContainer` etc. are its own parts written PascalCase, which is also drift) |
| 18 | One root rule per file; `&` first; never nest into a selector list (doctrine §7, ADR-0010) | **yes** | top-level rule count; nested selector pieces start with `&`; parent selector has a comma | low |
| 19 | Tier queries on tier boundaries, bounded at both ends (ADR-0001) | **yes** | `@media` width values ∈ the six boundary values; open `min-width` only at 48.75rem/90rem | low |
| 20 | `@supports` is a pair, fallback first; nothing declared in both branches (doctrine §5) | **yes / partially** | sibling lookup + order (yes); property overlap between branches and with base (partially) | low / medium |
| 21 | One declaration per line | **yes** | two decls with the same start line | none |
| 22 | Typed TODOs `TODO(decide\|token\|markup\|dead\|ref\|investigate)` | **yes** | comment regex | none |
| 23 | No rulers, no provenance in comments | **partially** | rulers: `─{4,}`/`={8,}` (yes). Provenance: word list (`reference-components`, `Port of`, `AiPoc`, `predecessor`…) | rulers none; provenance medium |
| 24 | Header = promise + one line per gate | **partially** | cross-check header gate lines against recipe axes | medium |
| 25 | Base holds only unconditional properties; no base value overridden by a gate (doctrine §1/§3) | **partially** | property set in root rule ∩ properties set in any gate of that root (static); real proof = inspector test | medium–high statically |
| 26 | Inspector test: one active rule per property (doctrine §6) | **e2e only** | computed-style / CDP `CSS.getMatchedStylesForNode` on bench pages: count non-overridden matched declarations per property | low, but slow |
| 27 | No utility classes; no specificity escalation; cascade used intentionally (§3, §4) | **no — judgment** | (proxy: max selector specificity per file ratchet) | high |
| 28 | `:where` only in the run-engine law (d) exemption | **partially** | `:where` allowed only in the exact law-(d) shape | low with a shape match |
| 29 | Enhancement deletable (ADR-0009) | **no — judgment** (proof by running suites with the branch removed) | — | — |

---

## 3. Measured baseline (current violations)

Corpus: 38 stylesheets = every `.css` under `packages/tsugite/components` + `kernel/css` (generated excluded) and every `<style>` block in their `.astro` files; 2 bench sheets reported separately (9 hits). Registry: 297 names. Register: 28 rows. Recipes: 14.

### By rule

| Rule | Count | Ratchet-ready? | Note |
|---|---|---|---|
| **unregistered-token** | **3** | yes | `--prose-flow` (Prose), `--p` (RangeScale), `--content-offset` (ScrollArea) |
| **raw-token-in-component** | **8** | yes | `--SITE--PADDING`, `--MAX--WIDTH--SITE` in the date fields and ToggleTip |
| fallback-pyramid | 0 | yes | keep at zero |
| **fallback-off-seam** | **44** | yes | e.g. `var(--_bt-gridTemplateColumns, auto)`, `var(--ui-destructive, #c00)`, `var(--SITE--PADDING, 1rem)` |
| empty-slot / `!important` / `@layer` | 0 / 0 / 0 | yes | zero-tolerance from day one |
| **slot-prefix-unregistered** | **55** (2 prefixes) | yes | NavItem `ni` (19), CtaButton `cta` (36): one ADR-0013 register row each takes this to 0 |
| slot-unprefixed | 21 (9 names) | yes | Prose `--_fontSize`, ToggleTip `--_click-area`/`--_offset`, CoverComposition/MotionRegion `--_size`, kernel Wheel `--_wheel-*` |
| slot-foreign-prefix | 0 | yes | (`tbx` exempt) |
| slot-kebab-form | 56 | yes (medium FP) | the reference-components lineage, which ADR-0013 already names as a pending pass |
| slot-abbreviation (`bg`/`fg`) | 39 | yes | same lineage |
| **physical-property** (edges) | **60** | yes | ToggleTip, date fields: `top/left: 50%`, `border-top`, … |
| physical-dimension (`width/height`) | 70 | yes (medium FP) | |
| physical-value (`text-align/float`) | 4 | yes | ChoiceGroup, Picklist |
| physical-axis-word (CSS gates) | 33 | yes | `data-icon-position="left\|right"`, `data-direction="top\|bottom"`, bare `data-align` (ToggleTip, AffixField) |
| recipe-physical-value | 6 | yes | `iconPosition: left\|right` in the button, ctabutton and navitem recipes: an ADR-0022 §2 violation in the table itself |
| **axis-value-ungated** | **4** | yes | Button `data-intent="neutral"`, CtaButton `data-reflection="true"`, NavItem `data-expanded="false"`, Teaser `data-button="true"` |
| gate-outside-recipe | 0 | yes | |
| absence-guard | 11 | yes | Notice, Button, ChoiceGroup, Picklist, RangeScale |
| **raw-spacing-no-todo** | **111** | partially | 14 of them are Prose's `em` rhythm (deliberate, pending the Prose plan) |
| raw-length-other | 225 | **no**: report only | borders, outlines, icon sizes: too noisy until radius/border ramps exist |
| **prefixed-part-class** | **116** (38 distinct) | yes | `.Button-icon`, `.NavItem-text`, `.CtaButton-icon`, `.Teaser-link`, `.calendar-header`, `.video-toggle`… |
| foreign-component-class | 41 | partially | Teaser (24: own parts written PascalCase), RangeScale→`.RangeField`, fields→`.Wheel` |
| second-root | 19 | yes | Prose (17, its `:where(.Prose[…])` form), Button 1, Wheel 1 |
| nested-into-list | 26 | yes | Prose 19, Button 6, CtaButton 1 |
| multi-decl-per-line | 13 | yes | ChoiceField 5, Prose 3, RangeScale 2, Wheel 2, ThemeSwitch 1 |
| media-not-tier-bound / open-ended-tier | 5 / 2 | yes | all in CoverComposition (40rem/48rem/80rem/95rem) |
| **ruler-comment** | **122** | yes | 14 files |
| provenance-comment | 1 (+31 provenance *paths*, see §4) | partially | MotionRegion "(reference-components ADR-0010)" |
| todo-untyped | 1 | yes | Prose |
| **Total** | **1096** in 35 files | | |

### By component (top rules; "all" = every rule)

| Component | unreg | RAW | fb | pfx? | pfx0 | kebab | phys | w/h | rawsp | part- | 2/ln | ruler | gate | all |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DateTimeField |  | 2 | 3 |  |  | 7 | 10 | 10 | 20 | 30 |  | 11 |  | 140 |
| DateField |  | 2 | 3 |  |  | 7 | 9 | 10 | 14 | 23 |  | 10 |  | 120 |
| WeekField |  | 1 | 2 |  |  | 5 | 9 | 7 | 18 | 27 |  | 11 |  | 119 |
| MonthField |  | 1 | 2 |  |  | 5 | 8 | 7 | 13 | 2 |  | 10 |  | 80 |
| Prose | 1 |  | 1 |  | 4 |  | 1 | 1 | 14 |  | 3 | 6 |  | 75 |
| TimeField |  | 1 | 2 |  |  | 5 | 8 | 6 | 13 | 1 |  | 10 |  | 75 |
| ToggleTip |  | 1 |  |  | 4 | 5 | 8 | 12 | 2 |  |  | 7 |  | 50 |
| RangeScale | 1 |  | 8 |  |  |  |  | 2 | 1 |  | 2 | 14 |  | 50 |
| FileUpload |  |  | 4 |  |  | 3 |  | 5 | 8 | 9 |  | 5 |  | 49 |
| CtaButton |  |  | 2 | 36 |  |  |  |  |  | 1 |  | 1 | 1 | 48 |
| CoverComposition |  |  |  |  | 2 |  |  |  | 3 | 15 |  | 3 |  | 37 |
| NavItem |  |  | 2 | 19 |  |  |  |  |  | 3 |  |  | 1 | 29 |
| Picklist |  |  | 2 |  |  | 7 |  |  |  | 1 |  | 6 |  | 29 |
| kernel:Wheel.css |  |  | 2 |  | 9 |  | 7 | 4 |  |  | 2 |  |  | 29 |
| Teaser |  |  |  |  |  |  |  |  |  | 2 |  |  | 1 | 27 |
| AffixField |  |  | 3 |  |  | 6 |  |  | 1 |  |  | 9 |  | 25 |
| Button |  |  | 2 |  |  |  |  | 4 |  | 1 |  |  | 1 | 23 |
| ChoiceField |  |  | 1 |  |  | 4 |  |  |  |  | 5 | 5 |  | 18 |
| ThemeSwitch |  |  |  |  |  | 1 |  |  |  |  | 1 | 4 |  | 17 |
| RangeField |  |  | 1 |  |  |  |  | 2 |  |  |  | 6 |  | 13 |
| ChoiceGroup |  |  | 1 |  |  | 1 |  |  |  | 1 |  | 3 |  | 12 |
| MotionRegion |  |  |  |  | 2 |  |  |  | 2 |  |  |  |  | 12 |
| ScrollArea | 1 |  | 2 |  |  |  |  |  |  |  |  |  |  | 5 |
| RangeGroup |  |  | 1 |  |  |  |  |  | 1 |  |  | 1 |  | 4 |
| Card / Heading / ScreenReaderText / Quote / Notice | | | | | | | | | 1 (Heading) | | | | | 3 / 3 / 2 / 1 / 1 |
| **total** | 3 | 8 | 44 | 55 | 21 | 56 | 60 | 70 | 111 | 116 | 13 | 122 | 4 | 1096 |

Clean on every rule: Text, TextBlock, Caption, Heading (except one raw spacing value), Input, Surface, Picture. The in-house lineage is close to clean. The drift sits in the ported reference-components fields (the date family alone has 534 of the 1096), Prose, CoverComposition and the kernel Wheel.

Spot checks: precision looks good for rules 1–7, 11, 14, 18, 21 and 22 (every sampled hit was real). The noisy ones are `raw-length-other` (left as report-only), `raw-spacing` in Prose (`em` by design), and `foreign-component-class`.

---

## 4. Non-CSS rules worth the same ratchet

Scanned 444 files (`packages/tsugite`, `apps/docs/src`, `apps/docs/tests`, `.claude/skills`, `.claude/hooks`, `CLAUDE.md`, `tasks/`).

| Rule | Checkable | Baseline | Notes |
|---|---|---|---|
| **ADR-NNNN exists in the ledger** | yes | 665 refs; **5 missing**: `ADR-0029` in `MonthField.ts:849,876`, `TimeField.ts:878,915`, `WeekField.ts:1140` | These are reference-components numbers. Zero FP. Gate it. |
| **External ledger qualified** ("reference-components' ADR-NNNN" / "ref-lib ADR-NNNN") | partially | 19 already qualified; **47 suspect**: unqualified refs inside files whose header says "Port of reference-components" (ToggleTip, AffixField, ChoiceField, ChoiceGroup…) | A number that exists here may still mean the other ledger (e.g. ChoiceField's "ADR-0015", or "flat, fully-qualified rule (ADR-0019)"). Fix by convention: a ref-lib ref MUST carry the qualifier, then gate on "unqualified ref in a ported file", a heuristic with a ratchet. Stronger option: a per-ADR keyword check (the line near `ADR-0013` should mention slots/prefix…) is fragile, so skip it. |
| **Dead paths in comments** | yes (scope it) | 73 raw; **~40 in source comments**, of which **31 are ref-lib provenance paths** (`src/partials/components/…`, `ClientApp/…`, `src/kernel/css/Wheel.css`); others: `.claude/philosophy.md`, `engine/collector.js → src/lib/tokens/*.js`, `kernel/utils/dates.ts → src/utils/dates.ts` | Exclude `docs/adr/**` (the ledger is history and names files that later moved, by design) and `tasks/**` (plans name files that do not exist yet). Resolve against file dir, package root, repo root, `apps/docs[/src]`. |
| **English everywhere** | partially | Non-JSON lines with å/ä/ö: 559, of which **ADR-0001, 0002, 0003, 0005, 0006 are written in Swedish** (41/31/36/32/82 lines) and `component-model.md` (309, the DRAFT, "UTKAST"). The rest is legitimate: the `sv` locale tables in the date fields and a demo string in `fixtures/TextSection.astro`. | Gate *markdown + comments* on Swedish characters/stopwords, with an allowlist of locale-table files. The 6 docs are a real hard-rule-1 violation, so record them as the baseline. Whether accepted ADRs get translated is a call to make. |
| **ADR-0025 old test-state form** (`data-test-state=`, `~=`) | yes | 0 outside the ADR's own text | Gate at zero (exclude `docs/adr/`). |
| **data-* field dictionary** | partially | 161 distinct `data-*` words in the corpus | Snapshot gate: commit the word list; a new word fails until added to the list in the diff (the "extends the dictionary deliberately" clause of ADR-0022). Cheap; makes every new word a reviewed line. The dictionary itself is in the DRAFT `component-model.md` §2.5, so the *list* is mechanical and the *meaning* is not. |
| Recipe values physical | yes | 6 (`iconPosition: left/right` ×3 recipes) | Already in the CSS scan. |
| Recipe ↔ header gate lines | partially | not measured | |

---

## 5. Recommended architecture: one ratchet runner, three entry points

### Shape

```
packages/tsugite/conformance/
  rules/*.mjs          one file per rule: { id, doc, severity, check(sheet|file) → hits[] }
  run.mjs              collects the corpus, runs rules, prints, compares to baseline
  baseline.json        { "<rule>": { "<repo-relative file>": <count> } }   (committed)
packages/tsugite/tests/conformance.test.ts   vitest wrapper: same runner, same baseline
```

- **Granularity = (rule, file) → count**, as the typography gate already does. Not line numbers, which churn on every edit. A file with no entry has an allowance of **zero**, so a new component must be clean from day one, and the big-bang cleanup never happens.
- **Two severities.** `ratchet` (high-precision rules: 1–7, 9–11, 14, 16, 18, 19, 21, 22 + ADR-exists, dead-path, test-state, data-word list) and `report` (raw-length-other, foreign-class, provenance words, base-vs-gate overlap): printed, never failing, so the heuristics can mature without blocking work.
- **The ratchet tightens itself, but only downward.**
  - count > baseline → **fail**: "new violation: `<rule>` in `<file>:<line>` `<text>`. Rule: css-doctrine §2 / ADR-0013 §2. See example.css block 'Chain'."
  - count < baseline → **fail too** with "improved: run `pnpm conformance --tighten`". Unlike the typography gate, a stale allowance cannot linger. `--tighten` rewrites `baseline.json` with `min(old, new)` and **refuses to raise anything**.
  - Raising a count = a hand edit to `baseline.json` in the PR diff, visible in review (optionally a sibling `reasons` map, rule → file → one line of why, mirroring the typography gate's argued allowlist).
- **Postcss as an explicit devDependency** of `tsugite` (it is only transitive today; pnpm's strict layout will bite). Not Lightning CSS: its AST drops comments, and three rules need them (TODO(token) above the line, rulers, provenance).

### Entry points

1. **Vitest (`tests/conformance.test.ts`)**: runs in `pnpm test`, so it is already in the **required CI `test` job**. Zero workflow change. This is the hard gate.
2. **PostToolUse hook on `Edit|Write`** (`.claude/hooks/conformance.py` → `node packages/tsugite/conformance/run.mjs --file <path>`), matching `packages/tsugite/(components|kernel|recipes)/**`. It checks only the touched file against its baseline row (~0.1 s) and exits 2 with the new hits on stderr. PostToolUse exit 2 hands the message back to the agent on the same turn: immediate feedback, but the edit already landed, so it is advisory and not blocking. That is the right trade-off: a PreToolUse version would have to simulate the edit. This is the "agents get the message" channel, and it carries the doc pointer per rule.
3. **The writing-css skill** gains one line in "After writing": run `pnpm conformance --file <path>` and paste the result into the comparison. The mechanical half of the checklist then becomes a command, and the comparison keeps only the judgment rules (§2 rows 25–29).

### Small-first order (each step one PR)

1. Runner + baseline + vitest wrapper with **rules 1–6** (registry, RAW, pyramid, seam, empty slot, `!important`/`@layer`). Baseline: 3 + 8 + 0 + 44 + 0 + 0. Smallest, highest value: it enforces ADR-0014, which today is enforced only by prose.
2. **Slot register (rule 7)**: add `ni` and `cta` rows to ADR-0013 (55 → 0), ratchet `unprefixed` (21), `kebab` (56), `abbrev` (39).
3. **Recipe ↔ gate coverage + ADR-0022** (4 + 6 + 33). Generalizes `button-slots.test.ts`.
4. **Logical properties** (60 + 4; `width/height` 70 as its own rule).
5. **Form**: one decl per line (13), typed TODO (1), rulers (122), one root / nest-into-list (19/26), absence guards (11), prefixed parts (116), tiers (7).
6. **Prose gates**: ADR-exists (5), dead paths in source comments (~40), old test-state (0), data-word snapshot (161), English (6 docs).
7. PostToolUse hook once steps 1–2 are steady.
8. Later, e2e: the inspector test (§6) on the benches (CDP matched styles, one active declaration per property). This is the only rule that truly needs a browser.

Fold the typography gate into the runner as one more rule when convenient. It is the same pattern with a tighter-on-improvement semantics.

### Versus stylelint with custom plugins

| | Own PostCSS runner | Stylelint + plugins |
|---|---|---|
| Built-in rules that fit | — | `declaration-no-important`, `at-rule-disallowed-list` (`@layer`), `custom-property-pattern`, `selector-class-pattern`, `declaration-block-single-line-max-declarations`; logical props via a plugin (`stylelint-use-logical`) |
| Project rules (registry, ADR-0013 register, recipe coverage, seam fallbacks) | the same code | the same code + plugin boilerplate |
| Astro `<style>` | 10-line extractor (already in the nesting gate) | `postcss-html` custom syntax |
| Ratchet | native, `baseline.json`, tighten-only | **not built in**: either `/* stylelint-disable */` comments in the files (exactly the comment noise the doctrine bans) or a third-party baseline tool |
| Editor squiggles | no | yes (VS Code extension) |
| Non-CSS rules (ADRs, paths, English, data words) | same runner | separate tool |
| New dependencies | `postcss` (already in the tree) | stylelint, config, postcss-html, plugins |

**Recommendation:** start with the own runner. The ratchet and the cross-file rules (registry, register, recipes, ADR ledger) are the point, and stylelint provides neither. Write each rule as a pure `(node) → report` function so it could be wrapped as a stylelint plugin later, if editor squiggles ever earn the dependency.
