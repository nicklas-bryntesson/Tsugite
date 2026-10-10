# Drift survey 03: docs app + all test code

Scope: `apps/docs` (src, tests, configs, CLAUDE.md) and `packages/tsugite/tests/**` (unit, e2e, fixture JSON).
The survey was read-only. The reference-components ledger was checked at `~/Documents/Projects/Designsystem/reference-components/docs/adr/` to settle wrong-ledger cases.

**Note on user-facing text:** the example files under `apps/docs/src/examples/` appear on the docs pages twice: once as the rendered Figure and once as raw source in the Code panel (`?raw`). Their `{/* … */}` comments are therefore **user-facing**, just like the `lead=` strings.

## Counts

Every `ADR-NNNN` occurrence was classified (grep -o, so one hit per occurrence). "Other" counts staleness that is not an ADR citation (see section B).

| Area | ADR refs | OK | WRONG-LEDGER | WRONG-NUMBER | STALE-PARAPHRASE | FLUFF | Other staleness |
|---|---:|---:|---:|---:|---:|---:|---:|
| apps/docs/src + config | 43 | 24 | 2 | 0 | 3 | 14 | 24 |
| apps/docs/tests | 8 | 6 | 0 | 0 | 2 | 0 | 5 |
| packages/tsugite/tests (unit + fixture JSON) | 57 | 54 | 0 | 0 | 3 | 0 | 4 |
| packages/tsugite/tests/e2e | 12 | 10 | 2 | 0 | 0 | 0 | 11 |
| **Total** | **120** | **94** | **4** | **0** | **8** | **14** | **44** |

FLUFF here means an ADR number in **reader-facing** prose (page leads, example comments shown in the Code panel). The docs app's own policy forbids these. `DocPage.astro:17` says: *"ADR numbers are the repo's record, not the reader's, and stay off."* Fourteen citations break that rule.

Manifest pointer check (`apps/docs/src/lib/manifest.ts`):
- All 33 `section` files exist.
- All 18 `suite` files exist.
- One pointer is semantically wrong (cover-composition).
- One pointer is missing (button).

---

## A. ADR citations that are not OK

### WRONG-LEDGER (4): reference-components numbers cited bare
| File:line | Quote | Why | Fix |
|---|---|---|---|
| apps/docs/src/styles/global.css:13 | `--ui-* — the reference-components theming seam (ADR-0018)` | Our 0018 is "the recipe is data". The ui-token theming seam is ref-lib ADR-0018. | `ref-lib ADR-0018`. Also fix the stale "Copied verbatim" line (B-A14). |
| apps/docs/src/styles/templates/kitchenSink.css:12 | `an overflow on one axis computes the other to auto — the ADR-0012 limitation` | Our 0012 is the run engine laws. Popover clipping is ref-lib ADR-0012. | `ref-lib ADR-0012`. |
| packages/tsugite/tests/e2e/motionregion.e2e.test.js:5 | `Assertions key on data-motion (ADR-0002)` | Our 0002 is "the component seam is an adapter". Data attributes as public API is ref-lib 0002, and the motion region is ref-lib 0010. | `ref-lib ADR-0002 / ADR-0010`. |
| packages/tsugite/tests/e2e/notice.e2e.test.js:21 | `── Separation of concerns (ADR-0016) ──` | Our 0016 is Surface. "Notice message and separate live region" is ref-lib ADR-0016. | `ref-lib ADR-0016`. |

### STALE-PARAPHRASE (8)
| File:line | Quote | Current rule | Fix |
|---|---|---|---|
| apps/docs/src/examples/nav-item/Refusals.astro:5-7 (**user-facing**) | `The element is the gate (ADR-0019) … Both show in development and render nothing in production.` | ADR-0019 §5: "In production an Astro static build fails, so the error never ships." The code (DevError.astro: "nothing in production") agrees with the comment, not with the ADR. | Decide which is the truth. Either amend ADR-0019 §5 or make the build fail. Then align this comment and `screen-reader-text/Refusals.astro:2` ("nothing in production"). |
| apps/docs/src/pages/docs/heading.astro:63 (**user-facing**) | `…on by default (ADR-0021). capInline turns the ceiling off; align moves the capped box…` | ADR-0022 renamed `align` to `alignInline`. The example itself uses `alignInline="center"`. | Change "align" to "alignInline" and drop the ADR number. |
| apps/docs/src/styles/global.css:18-19 | `Color artifacts — GENERATED from src/lib/tokens/ (ADR-0003, T7). Regenerate with npm run tokens.` | The source is `packages/tsugite/theme-default/*.tokens.js` and the command is `pnpm tokens` (root CLAUDE.md). `apps/docs/src/lib/tokens/` does not exist. | Correct the path and the command. Drop "T7". |
| apps/docs/tests/css-nesting-gate.test.ts:9 | `remove the transform from apps/docs/astro.config.mjs and this test, per ADR-0009` | The bench app (`packages/tsugite/bench/astro.config.mjs`, ADR-0026) carries the same Lightning CSS lowering. On deletion day there are two configs. | Name both configs. |
| apps/docs/tests/css-nesting-gate.test.ts:73 | `"nesting transform (astro.config.mjs) and this test — ADR-0009…"` | Same as the line above. | Same fix. |
| packages/tsugite/tests/typographyFamily.test.ts:56-58 | `ADR-0018: Heading's table … and the cells the body voice does not reach, declared as absences.` | ADR-0023 removed body from Heading. Heading and display share one farm, so there are no voice/element absences left. The test still runs (it compares two empty lists) but the comment describes a removed cell. | Rewrite: "and any voice/element cell a voice does not reach, declared as an absence (none today)". |
| packages/tsugite/tests/fixtures/caption.json:2 (`$comment`) | `…span by default (an inline run) … Attribute order: the axes in table order, the derived run last. The mode is intent (ADR-0024): a Caption is a block, a p by default…` | The comment contradicts itself. The first half is pre-ADR-0024 (span default, "derived run"). The recipe says `default: { hole: true }`, "a span when inline, a p otherwise". | Delete "span by default (an inline run)" and "the derived run last". |
| packages/tsugite/tests/fixtures/textblock.json:2 (`$comment`) | `Attribute order: the axes in table order, the derived run last. TextBlock is always a block (ADR-0024 §5)…` | `data-run` is gone (ADR-0024). The derived attribute is `data-text-box`. | Change "the derived run last" to "the derived data-text-box last" (the sentence already follows). |

### FLUFF (14): ADR numbers in reader-facing prose
These all contradict `apps/docs/src/components/DocPage/DocPage.astro:17`. The numbers are correct, but the reader cannot follow them and each one is a further spot that can drift. Fix: remove the parenthetical and keep the rule in words. The page source can keep the number in an HTML/JSX comment if wanted.

- apps/docs/src/pages/docs/heading.astro:36 `(ADR-0023)`, :51 `(ADR-0012)`, :67 `(ADR-0012)`. (:63 is listed under STALE above.)
- apps/docs/src/pages/docs/text.astro:42 `(ADR-0024)`, :46 `(ADR-0023)`, :49 `(ADR-0012, law b)`, :57 `(ADR-0012, law d)`, :65 `(ADR-0021)`
- apps/docs/src/pages/docs/text-block.astro:55 `(ADR-0021)`
- apps/docs/src/pages/docs/nav-item.astro:42 `(ADR-0019)`
- apps/docs/src/pages/docs/color.astro:79 `Authored in oklch, as families (ADR-0020).`
- apps/docs/src/examples/heading/Emphasis.astro:6 `(ADR-0012, law b)` (Code panel)
- apps/docs/src/examples/notice/Footprint.astro:4 `(ADR-0015)` (Code panel)
- apps/docs/src/examples/text/InlineAndBlock.astro:5 `intent (ADR-0024)` (Code panel)

No WRONG-NUMBER cases were found. Every unprefixed number that did not fit was a ref-lib number (listed above).

---

## B. Other staleness

### B-A. Docs app (24)

**User-facing (fix first)**
1. **apps/docs/src/pages/docs/notice.astro:94** (and its header comment :6-7): `The package fixture the conformance suite runs against — every variant and state, mounted unchanged.` This is false. `notice.e2e.test.js` runs on the plain `Notice.bench.astro`, which does not mount NoticeSection. Fix: "Every variant and state (the package fixture). The suite runs on Notice's own bench."
2. **apps/docs/src/examples/heading/AlignWrap.astro:1**: `align: left | center | right.` This contradicts ADR-0022 (`alignInline: start | center | end`), and the markup beneath it uses `alignInline="center"` / `"end"`. It is shown in the Code panel. Fix: `alignInline: start | center | end`.
3. **apps/docs/src/examples/text/AlignWrap.astro:1**: same problem, same fix.
4. **apps/docs/src/examples/text-block/AlignWrap.astro:1**: same problem, same fix.
5. **apps/docs/src/examples/card/Renderers.astro:7**: `One recipe (lib/card.ts), three renderers. Both write…`. `lib/card.ts` no longer exists. Card is `recipes/card.recipe.ts`, read by `lib/recipe.ts` (ADR-0018). "Both" should be "All three". Shown in the Code panel.
6. **apps/docs/src/pages/docs/card.astro:60** lead: `lib/card.ts resolves the props`. Same dead path. Fix: "the recipe (recipes/card.recipe.ts) resolves the props".
7. **apps/docs/src/pages/docs/button.astro:36** lead: `Button is the class and its four axes — emphasis, intent, size, pill`. The recipe also has `growInline` (ADR-0015) and `iconPosition`. Fix: drop the count, or list all of them.
8. **"Test bench" section on every explicit docs page** (heading.astro:71-74, text.astro:69-72, text-block.astro:59-62, button.astro:71-72, caption.astro:41-42, card.astro:65-66, cta-button.astro:47-48, nav-item.astro:47-48, notice.astro:93-94, screen-reader-text.astro:41-42, input.astro:20-21). Since ADR-0026, "bench" means `<Name>.bench.astro`, and `/docs/button/test` is a real bench. These sections mount *fixtures*. Fix: rename the heading to "Fixture" or "All states".

**Comments and prose describing deleted things**
9. **apps/docs/src/pages/map.astro:4-5**: `the test bench is linked but lives outside the map`. The kitchen-sink link was removed in 8cd24b0, and only the control-room link remains. Delete the clause.
10. **apps/docs/src/pages/docs/[slug].astro:3-4**: `It mounts the component's test-bench fixture, the same component the conformance suite runs against`. This is false for every fallback page with a plain bench: ChoiceField, ChoiceGroup, RangeField, RangeScale, RangeGroup, ToggleTip, ScrollArea, MotionRegion, ThemeSwitch. Fix: "mounts the component's fixture section".
11. **apps/docs/src/styles/templates/kitchenSink.css** (whole file) and **global.css:39**. The file is named after the deleted page.
    - Unused rules: `.KitchenSink` (2-18), `.kithensink-table` (typo, unused), `.group-inputs`, `.table`.
    - Still used: `.KitchenSink-section` (control-room.astro:26,43 and every fixture), `.component-map` (6 fixtures), `.example-box` / `.text-alignment` (Misc.astro only).
    - `.example-box .text` styles the class that ADR-0024 §3 gives to every text-box engine container. It is a latent collision.
    - Suggested fix: rename the file (e.g. `fixtures.css`), delete the dead rules, rename `.KitchenSink-section` in a separate pass.
12. **apps/docs/src/lib/sections.ts:14,27,30**: `Misc`, `TablesSection` and `ThemesSection` are registered, but no manifest row names them. `Misc` is mounted nowhere, so it is dead weight together with its CSS in item 11. ButtonCoverage is not listed, which goes against the "One line per fixture" claim. Fix: prune, or reword the claim.
13. **apps/docs/src/layouts/Layout.astro:21-22**: `The legacy primitives are still light-only — resolved by the upcoming color-system pass.` That pass has landed (ADR-0003/0006/0020). Delete.
14. **apps/docs/src/styles/global.css:13-15**: `Copied verbatim; mapped onto our own color system in a later pass.` `ui-tokens.css` is now generated (root CLAUDE.md hard rule 4; tokens.test "the generated --ui-* seam is fresh"). Fix: "GENERATED from theme-default/seam.ui.tokens.js".
15. **apps/docs/src/styles/global.css:1-4**: `Component CSS (04_ui) is co-located with each component in src/components/ … Skipped for now: Forms, Wheel, DateField, DateTimeField, TimeField, CoverComposition…`. Component CSS lives in the package, and most of the "skipped" items have shipped. Rewrite or delete.
16. **apps/docs/src/styles/ui/Tables.css:43-48, 57**: `BENCH ANCHOR … these cells host embedded component demos whose em-based geometry the conformance suites measure`. Suites no longer run in the docs app, and `bench/src/bench.css` does not import Tables.css. The rationale is dead. Either re-justify the anchor or drop it. The same rationale is repeated in `apps/docs/tests/typography-gate.test.ts:43-45`.
17. **apps/docs/astro.config.mjs:20-23**: the two-line comment appears twice, and it cites `lib/card.ts` ("renderer spike"). Dedupe and point at the recipe.
18. **apps/docs/src/components/ResolutionPanel/ResolutionPanel.astro:14-15**: `Every fontSize token is FLOOR × TYPE-SCALE`. The generated CSS uses `<tier value> × TYPE-SCALE` in each tier block. Fix: "each tier's value × TYPE-SCALE".
19. **apps/docs/src/pages/index.astro:149-152**: `& .principle-body > .Button { margin-block-start: auto }`. A page styles a child component's class. ADR-0015 §3 binds compositions, not pages, but this is the pattern that ADR names as drift. Low. Could become a wrapper part or a TODO(decide).
20. **apps/docs/src/components/DummyText/DummyText.astro:36,61-62**: `data-align`. This is a known dialect, accepted by ADR-0022's consequences ("takes the word when next touched"). Note only.

**Manifest (`apps/docs/src/lib/manifest.ts`)**
21. **:71** `cover-composition … suite: "tests/e2e/themes.e2e.test.js"`. That suite tests the voice × volume matrix on `theme-default/Themes.bench.astro`. CoverComposition's only browser check moved to `apps/docs/tests/e2e/home.e2e.test.js` (its own header says so). The pointer is wrong, and the field cannot express an app-side suite. Fix: drop the pointer, or allow a repo-relative path.
22. **:43** `button`: no `suite` pointer, although `packages/tsugite/tests/e2e/button.e2e.test.js` exists. Add it.
23. **:30** `/** Conformance suite file, repo-relative. */`. The path is actually package-relative: `docs-manifest.test.ts:34` resolves `packages/tsugite/${suite}`. Fix the doc comment.

**Config**
24. **apps/docs/playwright.config.ts:10,23-25**: the base URL is `:4321` with `reuseExistingServer: !CI`. This is the risk ADR-0026 removed from the package ("no longer reuses whatever runs on :4321"), and :4321 is the port known to clash locally. **:3** `The site's own e2e (rooms)` is also stale: there are now five files, including component-contract ones. Fix: use a dedicated port and update the comment.

### B-T. Docs tests (5)
1. **apps/docs/tests/e2e/input.e2e.test.js:1-19**: the Input height and validity contract is asserted on `/docs/input`, a docs page that also mounts Button. That conflicts with ADR-0026 §1/§5 (a component contract runs on its bench, inside the package). There is no `Input.bench.astro`. Fix: move it to an Input bench, or record why it stays.
2. **apps/docs/tests/e2e/card-renderers.e2e.test.js**: ADR-0017 §3 sanctions it on the docs page, but ADR-0026 §5 now says package contracts should not depend on the docs app. The two ADRs are in tension; decide or amend.
3. **apps/docs/tests/e2e/rooms.e2e.test.js:30-32**: `the fixture section mounted as the bench` plus the selector `.KitchenSink-section#Notice`. The term collides with ADR-0026 and the class is the legacy name. Reword the comment; the selector follows the item 11 rename.
4. **apps/docs/tests/css-nesting-gate.test.ts:19-25** and **typography-gate.test.ts:16-21**: SCAN_ROOTS omit `packages/tsugite/bench/` (bench.css, BenchLayout) and `packages/tsugite/theme-default/` (Themes.bench.astro). The bench app's CSS is not gated. Add both roots.
5. **apps/docs/tests/typography-gate.test.ts:38-41**: the allowlist key is `kitchenSink.css`. Its `line-height: 1cap` ×2 serves only `.example-box .text` (Misc, unmounted). It follows item B-A11.

### B-P. Package unit tests + fixture JSON (4)
1. **packages/tsugite/tests/fixtures/card.json:2**: `TS (lib/card.ts) is the reference until the recipe itself is generated`. `lib/card.ts` is gone. Card is `recipes/card.recipe.ts`, read by `lib/recipe.ts` (ADR-0018). Fix the path.
2. **packages/tsugite/tests/typographyTokens.test.ts:26,48**: `(and in the bench overrides)` / `one per bench override`. This means the test-viewport override blocks in the generated typography CSS, but "bench" now means ADR-0026 benches. Rename to "test-viewport overrides", which matches global.css:27.
3. **packages/tsugite/tests/tokens.test.ts:1,219**: `T7 adds the support axis` / `describe("T7 — oklch single-sourcing")`. T7 is an opaque task label from an old plan, also used at global.css:18. Low: replace it with the decision it refers to.
4. **packages/tsugite/tests/tokens.test.ts:187-188**: `Today's worst pair … accent/subtle/light textMuted at 4.66:1`. This is a dated snapshot in a comment and was not re-verified. Low: drop the number or move it into an assertion.

### B-E. Package e2e (11)
1. **packages/tsugite/tests/e2e/themeswitch.e2e.test.js:17-19** (worst in tests): `this site also mounts one in the header… Site-level behaviour (header instance, multi-instance sync) is covered by header.e2e.test.js.` The header suite was **deleted**, not moved, although ADR-0026's consequences said it would move to apps/docs. The bench has no header. **Nothing covers the header instance or multi-instance sync now.** Fix: restore a header suite in `apps/docs/tests/e2e/` (or record the drop), and reword the comment to "the bench mounts one live instance plus state rows".
2. **affixfield.e2e.test.js:192**: test name `'all kitchensink states pass axe'`. **:193-201** has kitchensink and PORT ADAPTATION wording. Rename to "all bench states". The comment can keep the upstream note as history.
3. **fileupload.e2e.test.js:35,37**: section banner and test name `kitchensink states`. **:38-43** describes the kitchen-sink first-section bug as current. **:159-160** `checking the kitchensink partial … The static error items live in the hbs`. Rename and trim.
4. **timefield.e2e.test.js:180**: test name `'passes axe on the kitchensink page'`. **:171** `The kitchensink has disabled TimeField instances`. **:6-7** `DateTimeField's live demo is meeting-datetime`: that is shared-page reasoning, and the TimeField bench mounts TimeField only. Reword.
5. **datetimefield.e2e.test.js:6-8**: `the kitchensink renders many DateTimeFields`. **:464**: `No kitchensink instance authors a range`. Change to "the bench".
6. **datefield.e2e.test.js:455**, **monthfield.e2e.test.js:317**, **weekfield.e2e.test.js:341**, **datetimefield.e2e.test.js:408**: `Invisible in the kitchensink, which only demos en-GB and sv-SE`. Change "kitchensink" to "bench" (four copies).
7. **helpers/target.js:102**: `matches the kitchensink's own layout table`. Historical rationale; reword to "a host page's layout table".
8. **scrollarea.e2e.test.js:38-39**: `on a heavier host page`. This is kitchen-sink-era timing reasoning. Low.
9. Upstream-path headers with no label: affixfield:1, datetimefield:1, fileupload:1, monthfield:1, motionregion:1, scrollarea:1, timefield:1, weekfield:1 (`// src/partials/components/<X>/tests/<X>.e2e.test.js`) and datefield:1 (`// tests/DateField.e2e.test.js`). A reader can mistake them for local paths. Low: prefix with "upstream:" or delete.
10. **notice.e2e.test.js:21** (wrong ledger, in A) and **motionregion.e2e.test.js:5** (wrong ledger, in A). Both are listed here too because they are e2e banners.
11. ADR-0026 says "RangeGroup and ToggleTip are fixed when their suites move". The suites have moved and the comments are consistent (toggletip.e2e:94-96). OK, noted for completeness.

---

## Worst offenders, in priority order
1. **User-facing false or stale statements:**
   - notice.astro:94 (the suite does not run on that fixture).
   - Three AlignWrap examples showing `align: left | center | right`.
   - card Renderers example and card lead citing the deleted `lib/card.ts`.
   - nav-item Refusals saying "render nothing in production" against ADR-0019 §5.
2. **themeswitch.e2e.test.js:17-19**: points coverage at a deleted suite. The header ThemeSwitch is untested.
3. **Fourteen ADR numbers in reader-facing prose**, against DocPage.astro:17's own rule.
4. **Four bare ref-lib ADR numbers** that resolve to unrelated ADRs in this ledger (global.css:13, kitchenSink.css:12, motionregion.e2e:5, notice.e2e:21).
5. **kitchenSink.css plus "kitchensink" in seven e2e files** (test names included). Tables.css and the typography-gate "BENCH ANCHOR" rationale is dead.
6. **Manifest:** cover-composition suite pointer is wrong, button suite pointer is missing, and the `suite` doc comment says repo-relative but the path is package-relative.
7. **Docs Playwright on :4321 with reuseExistingServer**, the very risk ADR-0026 removed for the package.
