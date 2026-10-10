# Drift survey 02: package source (packages/tsugite, excluding tests/ and docs/)

Scope: `bench/ components/ engine/ fixtures/ kernel/ lib/ recipes/ styles/ theme-default/`, plus `CLAUDE.md` and `playwright.config.ts` at the package root. Skipped: node_modules, dist, .astro, `*.generated.*`. `styles/ui-tokens.css` is generated, so its findings are filed against the generator (`engine/collector.js`). Branch: feat/appearance-guard (785c1ec). The external ledger was checked at `~/Documents/Projects/Designsystem/reference-components/docs/adr/` (0001–0032), which confirmed every WRONG-LEDGER number below by title.

## Summary

ADR-NNNN references in scope: **323**. 7 of them are already qualified (`ref-lib ADR-0021` ×6, `reference-components ADR-0010` ×1).

| Category | Findings | Refs involved |
|---|---|---|
| OK | — | ~257 |
| WRONG-LEDGER | 35 | 35 |
| WRONG-NUMBER | 2 | 2 |
| STALE-PARAPHRASE | 5 | 4 numbered + 1 unnumbered |
| FLUFF | 19 | ~25 |
| Stale, not tied to an ADR (deleted things, wrong paths, task ids, language) | 17 findings (≈ 45 lines, plus 34 fixture class uses) | — |
| Provenance (CSS: forbidden; elsewhere: stale) | 4 groups (9 CSS + 8 TS + 20 component + 22 fixture lines) | — |

Non-OK by directory (ADR categories only):

| Dir | refs | WRONG-LEDGER | WRONG-NUMBER | STALE | FLUFF |
|---|---|---|---|---|---|
| components/primitives/fields | 72 | 31 | – | – | 14 |
| components/primitives/typography | 25 | – | – | 3 | – |
| components/regions | 12 | 3 | – | – | 2 |
| components/compositions | 8 | – | 1 | – | – |
| components/primitives (other) | 15 | – | – | – | 1 |
| components/primitives/buttons | 14 | – | – | – | – |
| engine | 49 | – | – | 1 | 1 |
| lib | 39 | – | – | 1 | 1 |
| kernel | 3 | 1 | – | – | – |
| recipes | 40 | – | – | – | – |
| theme-default | 29 | – | – | – | – |
| fixtures / bench / playwright | 14 | – | – | – | – |
| CLAUDE.md (package) | 3 | – | 1 | – | – |

Worst offenders: `Picklist.astro` (12 unqualified ref-lib numbers in one file), the field family as a whole (31), `MotionRegion.astro`, which cites both ledgers' ADR-0010 in one file (l.3 ref-lib unqualified, l.50 qualified, l.58 ours), and `engine/collector.js`, which writes stale `src/lib/tokens/…` source paths and `npm run tokens` into the generated CSS headers.

---

## 1. WRONG-LEDGER (35)

Each of these means reference-components' ledger ("ref-lib") but carries no qualifier. Our ledger has a different ADR at every one of these numbers. **Fix for all:** write `ref-lib ADR-NNNN`, the form the appearance sweep chose. Where Tsugite has its own ruling, cite that instead (noted per row).

| file:line | quote | ref-lib means | ours means |
|---|---|---|---|
| components/primitives/fields/ThemeSwitch/ThemeSwitch.astro:168 | `the family field-height contract (ADR-0008)` | 0008 family-wide field-height contract | resolution chain |
| ThemeSwitch.astro:180 | `Legend hygiene — the documented cost of <fieldset> (ADR-0013)` | 0013 native radio/checkbox + fieldset | slot grammar |
| ThemeSwitch/ThemeSwitch.ts:25 | `same end-state contract (ADR-0009)` | 0009 end-state contract specifies DOM | deletability |
| TimeField/TimeField.ts:878 | `commits and closes (ADR-0029)` | 0029 footer actions close the popup | (does not exist) |
| TimeField/TimeField.ts:915 | same | 0029 | – |
| WeekField/WeekField.ts:149 | `Raw locale tag as authored … See ADR-0011.` | 0011 demos default to English | Sass retires / base tables |
| WeekField/WeekField.ts:1140 | `(ADR-0029)` | 0029 | – |
| MonthField/MonthField.ts:113 | `See ADR-0011.` | 0011 | base tables |
| MonthField/MonthField.ts:849 | `(ADR-0029)` | 0029 | – |
| MonthField/MonthField.ts:876 | `(ADR-0029)` | 0029 | – |
| ChoiceField/ChoiceField.astro:3 | `keyed on the native type attribute (ADR-0015)` | 0015 ChoiceField one component keyed on type | footprint |
| ChoiceField.astro:55 | same, CSS header | 0015 | footprint |
| ChoiceField.astro:62 | `No JS: the native input is the single source of truth (ADR-0013)` | 0013 | slots |
| ChoiceField.astro:184 | `data-* on the root is the API (ADR-0002)` | 0002 data attributes are the public API | seam adapter |
| ChoiceGroup/ChoiceGroup.astro:5 | `it never draws the fields (ADR-0013)` | 0013 | slots |
| ChoiceGroup.astro:61 | `groups ChoiceFields (ADR-0013)` | 0013 | slots |
| ChoiceGroup.astro:66 | `Cardinality is IMPLICIT … (ADR-0015)` | 0015 | footprint |
| ChoiceGroup.astro:91 | `Legend hygiene … (ADR-0013)` | 0013 | slots |
| Picklist/Picklist.astro:3 | `native radio/checkbox cores, ADR-0014` | 0014 picklist vs toggle | token registry |
| Picklist.astro:60 | `set of CHIPS the user picks from (ADR-0014)` | 0014 | registry |
| Picklist.astro:67 | `distinct usage context (ADR-0014 condition 3)` | 0014 | registry |
| Picklist.astro:69 | `(clarity over DRY, ADR-0004)` | 0004 clarity over DRY | token grammar |
| Picklist.astro:73 | `Cardinality is implicit … (ADR-0015)` | 0015 | footprint |
| Picklist.astro:79 | `:has() is progressive enhancement only (ADR-0005)` | 0005 feature detection is PE only | ownership chain (ours is ADR-0009 for PE) |
| Picklist.astro:94 | `field-height contract (ADR-0008)` | 0008 | resolution chain |
| Picklist.astro:110 | `Legend hygiene … (ADR-0013)` | 0013 | slots |
| Picklist.astro:133 | `Chips wrap — that is the shape of a picklist (ADR-0014)` | 0014 | registry |
| Picklist.astro:141 | `the Notice component, ADR-0016` | 0016 notice + separate live region | Surface |
| Picklist.astro:173 | `ADR-0008 is a total-height contract` | 0008 | resolution chain |
| Picklist.astro:248 | `data-* on the root is the API (ADR-0002)` | 0002 | seam adapter |
| RangeField/RangeField.astro:5 | `(ADR-0023: the range family splits three ways)` | 0023 range family splits | Heading loud voices only |
| components/regions/MotionRegion/MotionRegion.ts:2 | `governed for accessibility and performance (ADR-0010)` | 0010 decorative motion region | nesting |
| MotionRegion.ts:4 | `projects it onto the root as data-motion (ADR-0002)` | 0002 | seam adapter |
| MotionRegion/MotionRegion.astro:3 | `(ADR-0010)` | 0010 | nesting. Line 50 of the same file says `reference-components ADR-0010` and line 58 cites our ADR-0010 |
| kernel/js/motion-policy.ts:2 | `the MotionRegion component (ADR-0010)` | 0010 | nesting |

Style note (OK, not counted): `MotionRegion.astro:50` writes `reference-components ADR-0010`. Every other qualified reference uses `ref-lib ADR-NNNN`, so this one should be aligned.

## 2. WRONG-NUMBER (2)

- **components/compositions/Quote/Quote.css:120**: `Fallback first (ADR-0013's gate order applied to feature queries)`. ADR-0013 is the slot grammar and says nothing about gate order. The happy-path-last rule for feature queries is ADR-0009 §3 (doctrine §5). **Fix:** cite ADR-0009. (ADR-0015 §2's own phrase "ADR-0013's gate rule" has the same mis-attribution; that is outside this scope.)
- **packages/tsugite/CLAUDE.md:25**: `compositions own no vocabulary (ADR-0005)`. ADR-0005 is the colour ownership chain. "A composition styles its own parts" is ADR-0015 §3, and "a composition never writes another component's class or data-*" is ADR-0017 §6. **Fix:** cite ADR-0015 §3 / ADR-0017 §6.

## 3. STALE-PARAPHRASE (5)

- **components/primitives/typography/Heading/Heading.css:129**, **Text/Text.css:75**, **TextBlock/TextBlock.css:77**: `ADR-0021's custom level: a project's ceiling for every Heading, or the stop's own.` ADR-0021 §3 says something else: *"An instance claims by setting the variable in its `style` attribute"*. That is the instance level of ADR-0005, and the component and theme levels stay dormant. The docs example (`apps/docs/src/examples/heading/LineLength.astro:10`) uses it per instance. "A project's ceiling for every Heading" describes an unsanctioned use. The wording arrived with the text-box engine commits (83aab61, 5b69fe3, 21ee303). `Prose.astro:103` has it right ("the instance's --custom-prose-lineLength first"). **Fix:** "ADR-0021 §3: an instance's claim, or the stop's own."
- **lib/typographyFamily.ts:66–67** (law (b) in the "run engine laws" block, unnumbered): `quiet voices keep the semantics (strong → the F2 strong-weight convention, em italic)`. "F2" is an old task id. The current law is "strong asks for the voice's bold weight with one fallback to the voice's own" (ADR-0008 amendment 2026-09-25; ADR-0023 §3: the law travels with the voice). The same file's own header (l.19–21) already states it correctly. The block's line 62, "(enforced in the components' shared engine CSS)", is also stale: laws (a) and (c) now live in the generated kernel file (ADR-0024 §2). **Fix:** make the block a pointer (see FLUFF), or rewrite (b) to match the header.
- **engine/registry.js:212** (emitted into `docs/tokens.generated.md`): `Declared by the component that owns them, on its root (ADR-0013).` ADR-0013 §3 has two kinds of slot. Only *knobs* are declared on the root; *axis carriers* "have no root default" and are set by gates. **Fix:** "Owned by one component (ADR-0013): knobs on its root, carriers in its gates."

## 4. FLUFF (19)

- **The "One root, one tree (ADR-0010): tokens + root props on the root; every part, state, variant and gate is a nested `&` rule below, in cascade order" boilerplate (17).** Each copy restates ADR-0010 and doctrine §7. The writing-css header rule is "promise, one line per gate, nothing else". Locations: FileUpload.astro:66, ThemeSwitch.astro:160, ChoiceField.astro:69, ChoiceGroup.astro:78, AffixField.astro:76, TimeField.astro:113, WeekField.astro:128, Picklist.astro:81, DateField.astro:131, RangeScale.css:43, MonthField.astro:121, RangeField.css:49, DateTimeField.astro:125, RangeGroup.astro:126 (all under components/primitives/fields), ScrollArea.astro:51, MotionRegion.astro:58, ToggleTip.astro:90. **Fix:** delete, or keep only the local half where there is one (ThemeSwitch.astro:161 "the forced-colors block stays last because…" is real local info). Kept as OK: Wheel.css:4 ("two roots, two trees", which is local) and CoverComposition.astro:160 (explains a scoping consequence).
- **lib/typographyFamily.ts:62–75**: the laws (a)–(d) block restates ADR-0012 and ADR-0024 nearly verbatim, and it has already drifted (see §3). **Fix:** a pointer: "The run engine laws: ADR-0012 (a, b, d; voice attribute per ADR-0024 amendment) and ADR-0024 §4 (c)."
- **engine/generate-tokens.mjs:1–3**: `(ADR-0003, T7; ADR-0011 adds the base tables; ADR-0014 adds the token registry; ADR-0016 …; ADR-0024 …; ADR-0027 …)`. This is a changelog of ADRs in a file header. It grows with each ADR and duplicates collector.js. **Fix:** "Emits every token artifact; the list is in collector.js."

## 5. Stale comments not tied to an ADR

**Generator output (lands in generated files):**
1. **engine/collector.js:133, 179, 302, 629**: `GENERATED — do not edit. Source: src/lib/tokens/<x>.tokens.js` (also `src/lib/tokens/*.tokens.js`). That path does not exist; the sources are `theme-default/`. These lines are emitted verbatim; for example `styles/ui-tokens.css:1` carries it today. **Fix:** `theme-default/<x>.tokens.js`, as l.511/594/779 already do.
2. **engine/collector.js:137, 180, 308, 514, 598, 632, 783; engine/generate-tokens.mjs:4**: `Regenerate: npm run tokens`. The repo uses `pnpm tokens` (the registry header at registry.js:203 already says so). **Fix:** `pnpm tokens`.
3. **engine/collector.js:3**: `Three emitted artifacts from one JS source:` is followed by a list of five, and it omits themes, typography, the registry, Surface and text-box. **Fix:** drop the count, or point at generate-tokens.mjs.
4. **engine/collector.js:276**: `(kombinationslagen, ADR-0006 §6)`. This is Swedish in a code comment (hard rule 1). **Fix:** "(the combination law, ADR-0006 §6)".
5. **"T7" task ids**: engine/collector.js:1 `T7 adds the support axis`, engine/generate-tokens.mjs:1 `ADR-0003, T7`, engine/color-engine.js:1 `COLOR ENGINE (T7)`, theme-default/seam.ui.tokens.js:15 `light-dark() no longer ships (T7)`. These are ids from an old plan that no longer exists. **Fix:** drop them, or name the decision.
6. **theme-default/seam.ui.tokens.js:6**: `GENERATES src/styles/ui-tokens.css`. The real path is `styles/ui-tokens.css`.

**Kitchen sink (deleted by ADR-0026):**
7. **Field benches, "holding form" header**: `it mounts the kitchen-sink section as it is`. Found in FileUpload.bench.astro:2, TimeField.bench.astro:2, AffixField.bench.astro:2, WeekField.bench.astro:2, Picklist.bench.astro:2, DateField.bench.astro:2, MonthField.bench.astro:2, DateTimeField.bench.astro:2 (8). Also `the kitchen-sink section's instances moved as they were` in RangeScale/RangeField/RangeGroup .bench.astro:2 (3). The page is gone; what is mounted is `fixtures/<Name>Section.astro`. **Fix:** "mounts fixtures/<Name>Section.astro as it is".
8. **RangeField.css:154**: `Simulated states for the kitchensink`. These are the test twins for benches and tests (ADR-0025 §5). **Fix:** "Test twins (ADR-0025), paired with the real pseudo-classes."
9. **MotionRegion.astro:56**: `(zero JS; see the kitchensink)`. **Fix:** see MotionRegion.bench.astro, which carries the CSS backend.
10. **FileUpload.ts:135**: `kitchensink states use this for visual-only states`. **Fix:** "fixture/bench states".
11. **ThemeSwitch.ts:48**: `With a switch in the site header AND the kitchen-sink demo, two live instances`. The rationale still holds, but the example names a deleted page. **Fix:** "a header switch and a page demo".
12. **ScrollArea.ts:23**: `which is exactly what the kitchensink's ToggleTip demo shows`. This is ambiguous: it is probably the reference library's kitchen sink. Either qualify it ("ref-lib's kitchensink", or cite ref-lib ADR-0012, popover clipping) or point at a bench.
13. **fixtures/*.astro, 34 files**: `<section class="KitchenSink-section" …>` (plus `KitchenSink-group` in Misc.astro). The class is still styled by `apps/docs/src/styles/templates/kitchenSink.css` and used by `control-room.astro`, so it is code, not a comment. It names a deleted page, and it is a prefixed part (class-naming drift). **Fix:** rename in its own pass, docs-side CSS included. Not a comment fix.

**Lab (deleted, PR #93) and other dead pointers:**
14. **kernel/css/debug.css:17**: `the lab's and the bench's ruler`. `/lab/run` is deleted. **Fix:** "the bench's ruler".
15. **components/compositions/Quote/Quote.css:20**: `(lab TextWithMedia is the other)`. No TextWithMedia exists anywhere in the repo. Remaining labs are `apps/docs/src/pages/lab/{grid,field-states}.astro`. **Fix:** drop the parenthesis, or name the real second consumer.
16. **components/primitives/Notice/Notice.css:168**: `TODO(dead): variant defaults to "neutral" in the frontmatter`. The default now lives in `recipes/notice.recipe.ts:29` (ADR-0018), not in frontmatter. The TODO is still true and can be acted on: `&:not([data-variant])` can never match. **Fix:** delete the `:not()` arm and the TODO.
17. **fixtures/Typography.astro:5–6**: `sits on the Text bench (TextSection)`. Since ADR-0026, a bench is `<Name>.bench.astro` and "a bench is not a section". **Fix:** "in the Text section (fixtures/TextSection.astro)".

Minor (history narration, low priority): `ToggleTip.astro:93` `the former :root block is gone`, a past-tense note that tells the reader nothing about the current file.

## 6. Provenance

The writing-css comparison forbids provenance in CSS ("Form … no rulers, no provenance").

- **In CSS (forbidden), 9:** `/* src/partials/components/<X>/<X>.css */` at FileUpload.astro:65, ThemeSwitch.astro:135, ChoiceGroup.astro:58, AffixField.astro:63, ChoiceField.astro:51, Picklist.astro:58, RangeGroup.astro:108, RangeScale.css:4, RangeField.css:4. **Fix:** delete.
- **In TS, 8 (wrong path, no information):** `// src/partials/components/<X>/<X>.ts` as line 1 of ScrollArea.ts, FileUpload.ts, AffixField.ts, TimeField.ts, WeekField.ts, MonthField.ts, DateField.ts, DateTimeField.ts. **Fix:** delete.
- **"Port of …" frontmatter headers in components, 20:** ScrollArea, MotionRegion, CoverComposition (+ CoverCompositionVideo.ts `Port of AiPoc … (verbatim)`), FileUpload, ThemeSwitch, ChoiceGroup, AffixField, TimeField, ChoiceField, WeekField, Picklist, DateField, RangeScale, MonthField, DateTimeField, RangeField, RangeGroup, Prose (`Port of AiPoc TagHelpers/ProseTagHelper.cs`), ToggleTip. These are not CSS, but they are the same kind of comment. The porting log (`../AstroRefComp/tasks/porting-log.md`) is where provenance lives. **Fix:** replace each with the component's promise, as the recipe-era renderers do.
- **"Port of …" in fixtures, 22** (`Port of reference-components X.html`, `Port of AiPoc …/KitchenSink/_X.cshtml`): this is lowest priority, since the fixtures are host markup mirrored on purpose for the suites. Delete them when each field moves off its holding-form bench.

## 7. Checked and OK (not exhaustive)

- No stale `data-run`, `runOf`, `data-variant`-as-voice, `data-test-state="…"` token lists, or old container classes (`heading-text`, `text-content`, `Button-text`) anywhere in scope. ADR-0024, its amendment and ADR-0025 landed cleanly.
- The renderer headers (`The table is recipes/X.recipe.ts, read by lib/recipe.ts (ADR-0018)`, ~15 files) are pointers with local information. OK.
- The `ADR-0024 §6: the leading is the voice cell's` lines in Caption, Heading, Text, TextBlock, Input and Button are "why this line" comments. OK.
- Recipes (40 refs): all OK. ADR-0021/0024 `when`/`absent` paraphrases match the current text, including ADR-0024 §4's closed `inline` × `cap-inline` cell.
- theme-default (29 refs): all OK. `typography.tokens.js:262–272` restates ADR-0021 at length, but it is the authoring site and carries the draft values, so it is left as OK.
- `ref-lib ADR-0021` in ThemeSwitch.astro:6/139, ThemeSwitch.ts:9, kernel/js/theme-preference.ts:2 and collector.js:635/643 is correct (ref-lib 0021 is "appearance is a color-scheme switch").
- The paths cited in comments resolve: `tasks/parking-lot.md` (grid ladder, Picture rows present), `tasks/plan-prose.md`, `tasks/plan-fields.md`, `lib/media.astro.ts`, `apps/docs/src/components/TextBoxBench`.
