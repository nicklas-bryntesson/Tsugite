# 01 — Ledger revision index (ADR-0001 … ADR-0027)

Scope: `packages/tsugite/docs/adr/` read in full (2 634 lines). Paths below are relative to
`packages/tsugite/docs/adr/` unless they start with `packages/` or `apps/`. "Exists?" checks
were run against the working tree on `feat/appearance-guard` (clean), 2026-10-10.

All 27 ADRs say **Accepted**. No ADR carries Superseded/Amended in its status line. Revisions
live in four forms: (1) `## Amendment <date>` sections (0004, 0005, 0008, 0012, 0015, 0024);
(2) a later ADR saying "reverses / amends by pointer / superseded only for" (0018 §5, 0021, 0024);
(3) **silent** revisions — a later ADR or code changes the rule and the earlier ADR has no
pointer at all (the main hazard, marked **SILENT** below); (4) status-line notes.

---

## A. Per-ADR index

### 0001 — Viewport tiers are a global axis with fixed stops (SWEDISH)
- **Rule today:** four tiers `FLOOR ≤21.24999rem | MOBILE 21.25–48.74 | DESKTOP 48.75–89.99 | WIDE ≥90rem`; grammar `--{TOKEN}-{TIER}`; semantic layer switches in bounded `min`+`max` ranges; every tier written explicitly; no `clamp()`/vw; `--TYPE-SCALE`/`--SPACE-SCALE` are reserved hooks; 21.25rem shared with CoverComposition (0001-…:24-51).
- **Revisions:** ADR-0011 §4 made the ladder one constant `TIER_MEDIA` in the collector (exists). ADR-0011 adds derived `-PX` twins (`--SIZE-MD-DESKTOP-PX`) and `-NEGATIVE` offsets to the grammar — not mentioned here. Grid ladder (40/48/80rem) explicitly out of scope (0001:55-58) and still separate (`GRID_STEPS`/`GRID_MEDIA`, theme-default/grid.tokens.js:15-19).
- **Stale inside:** example `--FONTSIZE-DISPLAY-1-FLOOR` still exists (typography.generated.css). Line 70 "`--SITE--PADDING` aliased to `--site-offset`" still true (styles/ui-tokens.css:31).
- **Language:** entire ADR Swedish.

### 0002 — The component seam is an adapter (SWEDISH)
- **Rule today:** components keep the seam vocabulary `--ui-*` and `--SITE--PADDING`; all translation lives in one seam file.
- **Revisions (SILENT here):** ADR-0003 consequence (0003:59) made the seam file a **generated** artifact (source `theme-default/seam.ui.tokens.js`, output `packages/tsugite/styles/ui-tokens.css`); this ADR still describes hand-rewriting `ui-tokens.css` (0002:47-49). The "open detail" (0002:35-43, retire `--SITE--PADDING` alias) is still open; ADR-0014:65-67 restates it as "a port artefact to retire".
- **Stale paths:** `src/styles/ui-tokens.css` (0002:16) — MISSING; now `packages/tsugite/styles/ui-tokens.css`. "403 e2e" (0002:50) — now 20 files / 417 tests per ADR-0026:8.
- **Language:** entire ADR Swedish.

### 0003 — Colour tokens authored in JS, delivered as generated CSS (SWEDISH)
- **Rule today:** tokens authored as JS tables, build emits mutually exclusive CSS blocks per appearance; a render-blocking head script resolves preference; no-JS fallbacks via media blocks.
- **Revisions:**
  - Decision 1 "each component owns a four-mode `<Name>.color.tokens` factory" → **reversed by ADR-0004 rule 2**: four-mode tables live only in semantic/theme factories; components are mode-free pointers.
  - Decision 2/3 "four-value mode painted on `data-appearance`" → **revised by ADR-0005 implementation note** (0005:43-51): contrast never on the attribute; `data-appearance ∈ {light, dark, absent}`, crossed with `prefers-contrast` → 8 blocks. ADR-0003 has no pointer to this (**SILENT**).
  - Consequence "FOUC script in Layout extended" (0003:57-58) → today the head half ships as ThemeSwitch's `AppearanceGuard` mounted by every host (commit 8d8ea1e, this branch) — no ADR records it.
- **Stale paths:** status-line evidence `/theme-lab` + `tests/e2e/theme-lab.e2e.test.js` (0003:3) — both MISSING (deleted, as 0003:60-61 and 0005:55 predicted). `old-pattern.css` (Craft experiment, external, 0003:10). `theme-preference` kernel → `packages/tsugite/kernel/js/theme-preference.ts`.
- **Language:** entire ADR Swedish.

### 0004 — Token grammar and layer visibility (English; translated per ADR-0014:68)
- **Rule today:** single dash; RAW `--UPPERCASE`, semantic/tone `--lowercase-camelProperty`, private `--_`; RAW only referenced by semantic layer; component factories are mode-free pointers.
- **Revisions:** private form "refined by ADR-0013" (inline note 0004:24) → `--_<prefix>-[<part>-]<propertyCamel>[-<state>]`. Example `--button-backgroundColor-primary: var(--color-interactive-primary)` (0004:23,34) — the component *pointer layer* named `--button-*` **does not exist**; component values are `--_bt-*` slots (ADR-0013) reading `--theme-button-*` (registry). Palette names revised by ADR-0020.
- **Stale examples:** `--COLOR-B50` (0004:22) → palette is now family-keyed `--COLOR-SUMI-00`… (ADR-0020); `--_mf-popup-bg`, `--_rs-p` (0004:24) still exist in code but `bg` is forbidden by ADR-0013 §1 ("`backgroundColor`, never `bg`") — the ledger cites a slot its own later ADR outlaws.
- **Stale paths:** status-line precedent `src/styles/tokens/base/grid/` (0004:3) — MISSING (Sass tree retired by ADR-0011; grid is `theme-default/grid.tokens.js`). `--lab-*` tokens (0004:43) gone, as stated.

### 0005 — The ownership chain (SWEDISH, amendment in English)
- **Rule today:** one sanctioned chain `var(--custom-X, var(--component-X, var(--theme-X, var(--<semantic>))))`; first set level wins; claims are mode-free pointers; levels activate at first need. `--custom-*` live for line length only (amendment 0005:61-63); `--component-*` still dormant.
- **Revisions:** Amendment 2026-09-21 (ADR-0021) activates `--custom-<component>-lineLength`. Amendment text says the chain is `var(--custom-<component>-lineLength, var(--_lineLength))` — **stale slot name**: code uses prefixed `--_hd-lineLength`, `--_tx-lineLength`, `--_tb-lineLength` (Heading.css:131, Text.css:77, TextBlock.css:79); only Prose keeps bare `--_lineLength` (Prose.astro:108).
- Rule 4 "a named theme is `theme.<name>.tokens.js` + donut" → **SILENT revision**: ADR-0006 replaced per-theme files with one voice schema; file today is `theme-default/theme.voices.tokens.js` (no `theme.inverse.tokens.js`).
- Tension: the 4-level chain has 3 nested fallbacks; ADR-0008 forbids nested fallbacks and allows one per expression at a seam. Reconciled only implicitly (dormant levels are not written).
- **External citation:** "ref-lib ADR-0021" (0005:46) = reference-components' *appearance is a color-scheme switch*, not our line-length ADR.
- Consequences cite retired `color.semantic.scss` (0005:56) — retired again/deleted by ADR-0011.
- **Language:** body Swedish; amendment English.

### 0006 — The theme axis is voice × volume (SWEDISH)
- **Rule today:** `data-theme` = voice (roles, never identities), `data-prominence` = volume (`primary | subtle`, `VOLUMES` in theme.voices.tokens.js:23); voice is a four-mode factory; volume is pointer redirection; combination whitelist `voiceMatrix`; three enforcement surfaces (generator, dev guards, control room).
- **Revisions:** §6 "undefined combination is forbidden" → **ADR-0018 §5 supersedes it only for the authoring form on the component floor**; still governs the factory floor. ADR-0016 makes Surface the second enforcement surface. "Avgörs vid implementation" items: volumes settled as `primary | subtle`; `inverse` still its own voice (`inverse: ["primary"]`, theme.voices.tokens.js:55); `ground` value rejected by ADR-0016 ("for now").
- **Stale:** `npm run tokens` (0006:102) → `pnpm tokens`. `theme.inverse.tokens.js` (0006:104) → `theme.voices.tokens.js`. "komponentmodellen §2" (fältordboken) = component-model.md §2 item 5 (DRAFT). "culori-maskineriet från T7" — external task id.
- **Language:** entire ADR Swedish.

### 0007 — Declarations are bounded to their context
- **Rule today:** variant-dependent properties only behind a gate selector; base holds only unconditional props; `--_*` carry no base value; defaults live in the component layer, CSS never guards absence.
- **Revisions:** ADR-0013 §3 *refines* "slots carry no value in the base": a *design knob* has a root default; only *axis carriers* follow 0007 literally (**SILENT** in 0007). ADR-0024 §2 adds "inline is a gate of its own, not the absence of one" (consistent).

### 0008 — One hop per layer, one fallback per seam
- **Rule today (after amendment 2026-09-25, 0008:39-47):** one fallback per *expression*, only at a seam where absence is the contract; seams = theme claim **and** a voice's optional stop (`var(--fontWeight-label-bold, var(--fontWeight-label))`, used Caption.css:49).
- **Revisions:** original rule 2 "at most one fallback per chain, only at the theme seam" (0008:28) is the pre-amendment string. Amendment cites "ADR-0012 law b" — ADR-0012 numbers laws 1–4; "law b" = law 2 (see lettering note §C).
- **Incomplete:** the amendment enumerates two seams but ADR-0021 §3 (four days earlier) created a third: the `--custom-*` instance seam `var(--custom-…-lineLength, var(--_…-lineLength))`. 0008 does not list it.
- `@layer` rejection softened by ADR-0009 consequences (future native `@layer` = threshold decision, not a ban) — no pointer in 0008 (**SILENT**).

### 0009 — Deletability is the gate criterion
- **Rule today:** a fallback/polyfill is allowed iff removal is a no-op for the supported set, branches don't bleed, happy path last; deletion-readiness check = suites with fallback disabled.
- **Revisions:** none. Applied by 0010 (nesting lowering), 0024 (`[data-test-text-box="fallback"]` forced fallback block).

### 0010 — Nesting is the authoring form
- **Rule today:** one root rule, nested `&` parts; parent lists authored flat; support contract = `/.browserslistrc`; Lightning CSS lowers nesting.
- **Stale:** "Lightning CSS, configured once in `apps/docs/astro.config.mjs` … No other place states a browser target" (0010:42-45) — a second config exists, `packages/tsugite/bench/astro.config.mjs:5-23` (same browserslist, duplicated Lightning settings, ADR-0026). Also both configs exclude `Features.DirSelector` (`:dir()` not lowered) — a pipeline decision with no ADR. "Vite 8 / esbuild" context historical.
- **External citation:** "flat, fully-qualified rule (ADR-0019)" (0010:12) = reference-components ADR-0019 *class naming component vs element*. Consequence says such comments are rewritten to cite 0010 (none remain; grep "flat, fully" → only this ADR).

### 0011 — Base tables join the factory; Sass retires
- **Rule today:** `size.tokens.js`, `site.tokens.js`, `grid.tokens.js` → `styles/tokens/base/base.generated.css`; `validateBase()`; `TIER_MEDIA` one constant; no Sass.
- **Revisions (SILENT):** `--dir` described as set on descendants of `:root` via `:root :not([dir="rtl"])` (0011:74-79) — **now `:dir(ltr)/:dir(rtl)`** (base.generated.css:159-166); no ADR records the `:dir()` decision (ADR-0022 §2 still cites "ADR-0011's `--dir` sign").
- Still true: legacy `--MOBILE-BREAKPOINT`/`--DESKTOP-BREAKPOINT` unused; px twins emitted (`--SIZE-XS-FLOOR-PX`); grid ladder separate; points to `tasks/parking-lot.md` (exists).

### 0012 — The run engine laws
- **Rule today = heavily revised.** Original: laws 1–4 — (1) children pass through the engine container; (2) emphasis declared per family member (`semantic | flattened | none`); (3) run mode derived from element (`span` → inline), gated on `data-run`, not an author prop; (4) voice sovereignty: unvoiced inline `a, span, strong, em, b, i` inherit, voiced subtree exempt via `:where(:not([data-variant], [data-variant] *))`.
- **Revisions:**
  - Law 3 → **reversed by ADR-0024 §4** ("reverses ADR-0012 §3's 'it is not an author prop'"): mode is the `inline` boolean prop; attribute `data-run` → **`data-text-box`** (`block | inline`); `runOf(tag)` removed; `element="span"` without `inline` is now a *block*. Containers `.heading-text`, `.heading-link`, `.text-content`, `.textblock-content` (+ `.caption-content`) → **`.text`** (Heading's link is `<a class="text">`). Gate `[data-run="block"] > .heading-text` → `[data-text-box="block"] > .text`, generated in `kernel/css/text-box.generated.css`. **0012 itself carries no pointer to 0024 §4 — only the data-voice amendment (0012:131-134). SILENT for law 3.**
  - Law 4 → amendment 2026-10-06: `data-variant` → **`data-voice`**. The amendment says read the exemption selector as `:where(:not([data-voice], [data-voice] *))`, but **code uses a different, root-scoped selector**: `:where(:not(:is(.Text [data-voice]), :is(.Text [data-voice]) *))` (Text.css:33, Heading.css:37, Caption.css:30; rationale Text.css:28-32: a bare `[data-voice] *` would exempt everything). Ledger never records this. ADR-0024 Open: "§4 and law (b)'s selectors are rewritten later".
  - Law 2 "quiet voices (Text: body, label)" → label is Caption's (UI voices); ADR-0023 §3 restates the law per voice: "Heading: flattened. Text and Caption: semantic. TextBlock: none."
  - Open items resolved elsewhere without pointers: Open 1 (emphasis per component vs voice; body-voiced Heading) → **resolved by ADR-0023**; Open 2 (TextBlock carries `data-run` but doesn't gate) → resolved by ADR-0024 §5 (TextBlock always writes `data-text-box="block"`); Open 4 (author override of run mode) → resolved by ADR-0024 §4.
  - Consequence "`data-run` joins the field dictionary" (0012:96) — retired word.
- **Evidence paths:** `lib/typographyFamily.ts`, `tests/heading.test.ts`, `tests/typographyFamily.test.ts`, `fixtures/TextSection.astro` exist. Commit `cd44866` cited.
- **Lettering:** this ADR numbers laws **1–4**; every later citation (0008, 0023, 0024, lib/typographyFamily.ts:17,67, Text.css) uses **(a)–(d)** or "§3/§4". Mapping in §C.

### 0013 — Component slots follow the token grammar
- **Rule today:** `--_<prefix>-[<part>-]<propertyCamel>[-<state>]`, property spelled as its JS name (`backgroundColor` never `bg`, `color` never `fg`), state last; one prefix per component; knob (root default) vs carrier (no root default).
- **Revisions:** register amended in place (rows `tbx` text-box engine ADR-0024, `cp` Caption, `in` Input, `sf` Surface per ADR-0016). Consequence "Heading/Text/TextBlock share one engine vocabulary (`--_fontSize`, `--_lineHeight`) — prefix or shared file open" → **resolved by ADR-0024** (`--_tbx-*` engine + `--_hd-/--_tx-/--_tb-` per component).
- **Register gaps (ledger stale vs code):** prefixes in use but NOT registered: **`cta`** (CtaButton, 77 uses), **`ni`** (NavItem, 53 uses). Unprefixed slots still in code: `--_fontSize`/`--_lineLength` (Prose.astro), `--_size`, `--_offset`, `--_click`, `--_wheel*` (MotionRegion, CoverComposition, ToggleTip, kernel Wheel).
- **Pending conversion acknowledged (0013:90-92):** ≈117 distinct kebab-case pre-ADR slots remain (`--_af-border-color-hover`, `--_af-bg-hover`, `--_pl-chip-min-block-size`…), mostly pl/wf/tf/mf/dtf/df/af/ts/fu/cf.
- Consequence "`css-doctrine.md` §1 should gain a pointer" — doctrine cites ADR-0013 §3 at line 37 (done).

### 0014 — The token registry is the list of what exists
- **Rule today:** `docs/tokens.generated.md` (from `engine/registry.js`) is the definition of "exists"; names+roles, never values; `TODO(token)` for missing names.
- **Stale counts:** "six generated CSS files" (0014:9) and "`pnpm tokens` writes seven artifacts" (0014:60) — now base, color×3, typography + **fonts.generated.css** (ADR-0027), **text-box.generated.css** (ADR-0024), **Surface.generated.css** (ADR-0016), registry, ui-tokens.css. Test name `tests/tokens.test.ts` exists.
- Person name in ADR text ("Nicklas declined…", 0014:17,52-53).

### 0015 — A child owns its footprint; a composition styles its own parts
- **Rule today:** `data-grow-inline` / `data-cap-inline` booleans (`="true|false"`); child owns both gates; composition never selects a child's class; booleans are permissions, parent's region allocates; a prop never carries a context condition.
- **Revisions:** Amendment 2026-09-21 (ADR-0021): cap value for typography = `--lineLength-<stop>` in ch; Heading/Text/TextBlock/Prose default `capInline: true`; rem ceilings on Notice/Quote/ChoiceGroup/Surface unchanged. ADR-0022 generalises the `<property>-<axis>` naming. ADR-0024 §4: `inline` + `cap-inline` is a forbidden cell (in recipes as `when: { axis: "inline", is: false }`, text.recipe.ts:42).
- Historical consequences now done: Teaser composes Button via recipe (ADR-0017 §6/0018).

### 0016 — Surface is the voice donut as a region
- **Rule today (per this ADR):** Surface owns ground+ink (`--theme-surface`, `--theme-text`), block/inline rhythm, the theme claim; adjacency rules generated by `engine/surface.js` from `voiceMatrix`.
- **Pending revision recorded elsewhere:** ADR-0018 Open (0018:356-359): "Surface owns no padding, the adjacency collapse of ADR-0016 §5 moves to the block with a per-instance boolean" — contradicts §2 ("rhythm") and §5; no amendment in 0016. Code still matches 0016 (Surface.generated.css drops `padding-block-start`).
- **Stale path:** `components/Surface/Surface.generated.css` (0016:56) → `components/regions/Surface/Surface.generated.css` (pillar tree). Surface CSS still lives in `Surface.astro` (no `Surface.css`) — ADR-0017 §4 exception noted in 0017:90.

### 0017 — The recipe is the source; renderers are adapters
- **Rule today:** renderers are thin adapters; byte-identical equality tests; one `<Name>.css` per component; React SSR only; compositions express parts through their recipes (§6).
- **Revisions:** §1 "a framework-free module in `lib/` — `resolveCard(props)` …; validation/defaults/forbidden combinations live there" → **superseded by ADR-0018 §2/§5**: one interpreter `lib/recipe.ts` reads `recipes/<name>.recipe.ts` tables; per-component `lib/<name>.ts` only for "holes"; forbidden-of-taste moved to project closure. 0017 only says "the next ADR narrows that" (0017:82-85).
- **Stale paths:** `lib/buttonShared.ts` (0017:26) MISSING; `lib/card.ts` (0017:78) MISSING (removed by 0018). `Card.vue`, `tests/card-renderers.test.ts`, `apps/docs/tests/e2e/card-renderers.e2e.test.js` exist. Status lists of renderers/components on the pattern (0017:86-91) dated.

### 0018 — The recipe is data
- **Rule today:** a recipe is a `const` table per CSS root; one interpreter; fields `element, axes, host, parts, derived, absent, when, content`; system declares *absence*, project declares *closure* (subtraction).
- **Revisions (SILENT, schema grew in code, `lib/recipe.ts`):**
  - "`element` … is the only field allowed to gate others (see `when`)" (0018:110-111) and ADR-0021 consequence "`when` takes one element or one part" → code `When` also keys on **another axis** (`"axis" in when`, recipe.ts:255; text.recipe.ts:42).
  - "Every axis is written on every render, never omitted" (0018:115-116) → `unwritten: true` (recipe.ts:29; text/caption `inline`).
  - "Split only when … one axis with different value sets per element" (0018:171-172) → `valuesBy` (value set by another axis's value, recipe.ts:11-12).
  - New fields not in the ADR: `promise`, `refuses`, `default: { hole: true }`, `element.required`, `derived … from` (card.recipe.ts:8-9; recipe.ts:13-15, 90-93).
  - Closure is **unimplemented**: `theme-default/recipes.config.ts` (0018:189) MISSING and never existed in git history; interpreter has no subtraction step. ADR-0019 §4's "closed in this project's configuration — permitted here: …" message does not exist in code.
- Supersedes: ADR-0006 §6 / component-model §7 whitelist "only for the authoring form on the component floor" (0018:203-206).
- **Stale:** `lib/card.ts` (0018:13), `lib/picture.ts` (gone, as stated); Consequence "Heading, Text, TextBlock and Quote still carry their ADR-0017 resolvers" (0018:297-298) → all have recipes now (`recipes/*.recipe.ts`), `lib/*.ts` survive as holes. Consequence/Open "Button owns the hiding in `Button.css`" (0018:311-316, 360-362) → **SILENT revision**: ScreenReaderText component (PR #79); Button.css:426 says the label suffix "is a ScreenReaderText". Open item hero `figureCssClass: "grid-container-full"` still in media.presets.ts:42.
- Person name ("Nicklas's next idea", 0018:366).

### 0019 — An invalid value on a closed axis is an error
- **Rule today:** invalid value → `mode: "error"`; element falls back to default; axis absent for element → error; host decides consequence.
- **Revisions (SILENT):** §2 "Element falls back to its default" → code adds `element.required` (no fallback) and a `hole` default (recipe.ts:90-93). §4 second message (project closure) not implemented (see 0018).
- **Misattribution in consumers:** `apps/docs/src/examples/nav-item/Refusals.astro:5` and `apps/docs/src/pages/docs/nav-item.astro:42` cite "The element is the gate (ADR-0019)" — the element-gates-axes rule is ADR-0018 §3 (`when`).

### 0020 — The palette is authored as families
- **Rule today:** `palette = { key: { label, glyph, note, steps: [[label, oklch]] } }`; kind-less; CSS names derived `--COLOR-<KEY>-<STEP>`; `rawColorTokens` derived.
- **Retires:** `LEGACY_MAP`, `RETIRED`, `FEEDBACK_SHAPE` (0 hits in code); flat 55-key palette; family-by-regex grouping. Makes ADR-0004's `--COLOR-B50` example stale.
- Person name (0020:13).

### 0021 — Line length is a bundle metric; the cap reads it through the chain
- **Rule today:** `typeLineLengths` (ch, one per size stop) → `--lineLength-<stop>`; word stays `cap-inline`, value `lineLength`; custom level live: `var(--custom-<component>-lineLength, <slot>)`; instance sets a pointer to another stop's token; tiers are the wall; `align` moves the box.
- **Revisions (SILENT, no amendment):**
  - §2 "The CSS applies the ceiling behind the `data-run="block"` gate" → ADR-0024 §4: `data-run` gone; selectors drop the mode (`[data-cap-inline="true"] > .text`), `inline`+`cap-inline` closed.
  - §2/§3 name `capInline`, `align` (§5 "`align` moves the box": `center`/`right`) → ADR-0022 renamed to `alignInline` / `data-align-inline` with `start|center|end` (no `right`).
  - §3 slot `var(--_lineLength)` → prefixed per component (`--_hd-/--_tx-/--_tb-lineLength`).
  - Consequence "the gate grows a `run` form (a derived value)" (0021:86-89) → realised differently: `when: { axis: "inline" }` (text.recipe.ts:42).
- Rejected word `measure` (docs uses `data-measure` for live measurement — still true, grids.astro:75).
- **Number collision:** ADR-0021 is also the reference-components ADR most cited in this repo (see §D).

### 0022 — An axis with a logical pair carries the axis in its word; logical values
- **Rule today:** `align-inline`/`grow-inline`/`cap-inline` (later `align-block`); values `start | center | end`; bare `align` is not a dictionary word; typography owns the inline axis only.
- **Retires:** `data-align="left|center|right"` on Heading/Text/TextBlock/Caption; error string becomes `invalid alignInline "middle" — expected start | center | end`.
- Known dialects left: AffixField `data-align="end"` (ref-lib contract), docs DummyText `data-align="start|center"` (14 `data-align=` hits in repo).
- **Stale cite:** §2 "ADR-0011's `--dir` sign" — mechanism now `:dir()` (see 0011).

### 0023 — Heading speaks the loud voices only; body on a heading shape is Text's cell
- **Rule today:** Heading = `heading | display` only; body on h1–h6 is `<Text element="h3" …>`; a voice's emphasis law travels with the voice.
- **Revisions (SILENT):** written before the data-voice rename; still says `variant="body"` (0023:35) and `[data-variant="body"]` (0023:54), `<Heading … variant="body">` (0023:72). ADR-0024's amendment covers 0024 and ADR-0012 law (d) only, **not 0023**. Prop today: `voice="body"` (ADR-0024 amendment, 0024:127).
- Resolves ADR-0012 Open 1 without a back-pointer.

### 0024 — The text-box engine is one generated kernel file; the mode is intent
- **Rule today:** `engine/text-box.js` → `kernel/css/text-box.generated.css`; one cell per voice keyed on **`[data-voice="<voice>"]`** (amendment 2026-10-06), slots `--_tbx-{emBox,capGap,descent,baselineOffset,lineHeight}`; gates `[data-text-box="block|inline"] > .text`; native/fallback/forced (`[data-test-text-box="fallback"]`) blocks; mode is the `inline` prop; Button/TextBlock always write `data-text-box="block"`; Button writes `data-voice="button"`; components read `--_tbx-lineHeight`.
- **Revises:** ADR-0012 §3 (reversal, by pointer) and ADR-0012 law 4 selector attribute (amendment). Amendment: `data-variant` (as voice) → `data-voice`; prop `variant` → `voice` on typography doors; `variant` stays free for a component's look (CtaButton `gradient`, Notice `error`, Prose `basic`).
- **Body still uses the old word** (by design of "read as"): decision 2 `[data-variant="<voice>"]` (0024:42), decision 3 example HTML `data-variant="body"` / `data-variant="button"` (0024:60,63), decision 5 and consequences (0024:82,107). Greppable trap.
- **Stale pointers:** Context `/lab/run` (0024:25,111) — deleted (1 residual mention in code). Open "TODOS(?) in Caption.css" (0024:119) — **no TODOS in Caption.css any more** (only Prose.astro has one). Open "the `code` voice's `inline: true`" — still in typography.tokens.js:117,164.
- Rejected words: `data-flow`, `data-test-text-trim="false"`; dead `Button-text` container.

### 0025 — A test state is one boolean attribute per state
- **Rule today:** `data-test-state-<state>="true"` (hover, active, focus = twin of `:focus-visible`, disabled, autofill, readonly); combination = two attributes; `data-test-debug="true"` for overlays; twins only on benches/tests; state maps write props.
- **Retires:** `data-test-state="hover"` (single value), token list `data-test-state="active focus"` read with `~=`, `data-test-state="debug"`, `propsFor` token join, bare presence `data-test-state-hover`. (0 hits for `data-test-state=` / `~=` in code today.)

### 0026 — A component is tested on its own bench
- **Rule today:** one plain bench per component `components/<pillar>/…/<Name>/<Name>.bench.astro`; package-own Astro app (`packages/tsugite/bench/`) renders benches; package Playwright starts it on its own port; docs may mount at `/docs/<slug>/test` (exists for button); **kitchen sink deleted**.
- **Retires:** `/kitchen-sink` page (MISSING ✓), `helpers/target.js` default `/kitchen-sink` (now `targetPath(bench)` ✓), suites against docs app, reuse of :4321. `header.e2e.test.js` moved out of the package (✓ absent).
- **Contradicted by code comments:** 9 bench files say "a holding form: it mounts the kitchen-sink section" (e.g. `components/primitives/fields/DateField/DateField.bench.astro:2`) — against §3 ("the bench is plain") and the consequence "a bench is not a section"; `ThemeSwitch.ts:48` still mentions "the kitchen-sink demo".

### 0027 — A typeface is delivered by the theme that measures it
- **Rule today:** `typeFamilies` entries hold stack + metrics + faces; files in `theme-default/fonts/<Family>/` (exists: AbrilFatface, FiraSans, Inter, NotoSerif); `pnpm tokens` emits `styles/tokens/typography/fonts.generated.css` (exists), woff2 first, `font-display: swap`; system family marker for `--MONOSPACE`.
- **Retires:** `apps/docs/src/styles/base/font.css` (MISSING ✓), `apps/docs/public/fonts/` (an **empty, untracked `apps/docs/public/fonts/NotoSerif/` dir lingers** on disk), woff-before-woff2 ordering.
- Says "exact shape is settled when it is built" (0027:55) — the ADR's code sample is not authoritative.

---

## B. Revision graph (who revises whom)

| Revised | By | Kind | Pointer in revised ADR? |
|---|---|---|---|
| 0003 d1 (per-component four-mode factories) | 0004 r2 | reversal | no |
| 0003 d2/d3 (four-value `data-appearance`) | 0005 impl. note | revision | no |
| 0002 (hand-rewritten seam file) | 0003 consequence | seam becomes generated | no |
| 0004 private-slot form | 0013 | refinement | yes (inline note) |
| 0004 `--COLOR-B50` example | 0020 | renamed palette | no |
| 0005 rule 3 (`--custom-*` dormant) | 0021 | activation | yes (amendment) |
| 0005 rule 4 (`theme.<name>.tokens.js`) | 0006 | restructure | no |
| 0006 §6 whitelist | 0018 §5 | partial supersession (component authoring only) | no |
| 0007 "slots carry no value in base" | 0013 §3 | refinement (knob vs carrier) | no |
| 0008 rule 2 (one fallback, theme seam) | 0008 amendment | second seam | yes |
| 0008 (seam list) | 0021 §3 | third seam (custom) | **no — amendment omits it** |
| 0008 `@layer` ban | 0009 consequence | softened to threshold | no |
| 0010 "configured once in apps/docs" | 0026 (bench app) | second config | no |
| 0011 `--dir` descendant selector | (no ADR; `:dir()` in base.generated.css) | silent code change | no |
| 0012 law 3 (`data-run`, derived) | 0024 §3–§4 | reversal + rename | **no (only data-voice amendment)** |
| 0012 law 4 attribute | 0024 amendment | rename `data-variant`→`data-voice` | yes |
| 0012 law 4 selector shape | code (Text/Heading/Caption.css) | root-scoped `:is(.X [data-voice])` | no |
| 0012 Open 1 | 0023 | resolved | no |
| 0012 Open 2, Open 4 | 0024 §4–§5 | resolved | no |
| 0013 engine vocabulary open | 0024 (`tbx`) | resolved | register row only |
| 0015 cap value | 0021 | amendment | yes |
| 0016 §2 rhythm / §5 adjacency | 0018 Open (pending) | announced revision | no |
| 0017 §1 per-component resolver | 0018 §2 | supersession | "next ADR narrows" only |
| 0018 §3 schema (`when` element-only, every axis written, no per-element value sets) | code (`when.axis`, `unwritten`, `valuesBy`, `required`, `hole`, `promise`, `refuses`) | silent growth | no |
| 0018 srText hidden by Button.css | ScreenReaderText (PR #79, no ADR) | silent | no |
| 0019 §2 element always falls back | code `element.required` | silent exception | no |
| 0021 §2 `data-run="block"` gate | 0024 §4 | revision | **no** |
| 0021 `align`/`capInline` vocab | 0022 | rename | no |
| 0023 `variant="body"` | 0024 amendment | rename | **no** |

---

## C. ADR-0012 law lettering (citation trap)

ADR-0012 numbers its laws **1–4** (0012:32-73). Everyone else letters them:

| ADR-0012 text | Cited as | Where |
|---|---|---|
| 1. child content through engine container | law (a) | lib/typographyFamily.ts |
| 2. inline emphasis per member | **law b / law (b)** | 0008:39, 0023:17, 0024:118, typographyFamily.ts:17,67, Text.css "Law (b)" |
| 3. run mode / `data-run` | **§3 / law (c)** | 0024:4,15,68 |
| 4. voice sovereignty | **§4 / law (d)** | 0012:133, 0024:118,128,134, Text.css:28 |

---

## D. ADR numbers with a DIFFERENT (external) ledger meaning

The reference-components ledger lives at `~/Documents/Projects/Designsystem/reference-components/docs/adr/` (copy under `../NextJsRefComp/reference-components/`). Its numbers 0001–0032 overlap ours 0001–0027 completely.

Labelled external citations ("ref-lib ADR-…" / "reference-components ADR-…"):
- **ref ADR-0021** *appearance is a color-scheme switch, not a token system* — 0005:46; Header.astro:4, ResolutionPanel.astro:81, Layout.astro:20, apps/docs global.css:14, ThemeSwitch.astro:6,139, ThemeSwitch.ts:9, collector.js:635,643, theme-preference.ts:2, styles/ui-tokens.css:7,35.
- **ref ADR-0010** *decorative motion region and motion-policy kernel* — MotionRegion.astro:50 (labelled), but MotionRegion.astro:3, MotionRegion.ts:2, kernel/js/motion-policy.ts:2 cite bare "ADR-0010" (= ours: nesting).
- **ref ADR-0019** *class naming component vs element* — 0010:12 ("flat, fully-qualified rule (ADR-0019)").

**Unlabelled** citations whose meaning is the reference ledger (collide with our numbers):

| Bare cite | Ref-lib meaning | Our ADR with that number | Sites |
|---|---|---|---|
| ADR-0002 | data attributes are the public API | component seam adapter | ChoiceField.astro:184, Picklist.astro:248, MotionRegion.ts:4 |
| ADR-0004 | clarity over DRY, kernel is the exception | token grammar | Picklist.astro:69 |
| ADR-0005 | feature detection is PE only | ownership chain | Picklist.astro:79 |
| ADR-0008 | family-wide field-height contract | one hop/one fallback | Picklist.astro:94,173, ThemeSwitch.astro:168 |
| ADR-0009 | end-state contract specifies DOM | deletability | ThemeSwitch.ts:25 |
| ADR-0010 | motion region / motion policy | nesting | MotionRegion.astro:3, MotionRegion.ts:2, motion-policy.ts:2 |
| ADR-0011 | demos default to English (locale) | base tables / Sass | MonthField.ts:113, WeekField.ts:149 |
| ADR-0013 | native radio/checkbox + fieldset | slot grammar | ChoiceField.astro:62, ChoiceGroup.astro:5,61,91, Picklist.astro:110, ThemeSwitch.astro:180 |
| ADR-0014 | picklist toggle vs buttongroup | token registry | Picklist.astro:3,60,67,133 |
| ADR-0015 | ChoiceField keyed on native type | footprint | ChoiceField.astro:3,55, ChoiceGroup.astro:66, Picklist.astro:73 |
| ADR-0016 | Notice message + separate live region | Surface | Picklist.astro:141 |
| ADR-0023 | range family splits three ways | Heading loud voices | RangeField.astro:5 |
| ADR-0029 | footer actions that complete the value close the popup | (none — beyond our ledger) | MonthField.ts:849,876, TimeField.ts:878,915, WeekField.ts:1140 |

(Heuristic sweep by topic keyword; field components are the hot zone. Our 0010 "One root, one tree (ADR-0010)" and 0025/0026 citations in the same files ARE ours — the files mix both ledgers.)

Other external references inside the ledger: AiPoc manifest / `.claude/patterns/css.md` (0005, 0007, 0008), Craft experiment `old-pattern.css` (0003, 0004), reference-components `PORTING.md` (0002), SVL design system (0006), task "T7" (0006), porting log `../AstroRefComp/tasks/porting-log.md` (0022), commit `cd44866` (0012).

---

## E. Language (hard rule 1: English everywhere)

Fully Swedish: **0001, 0002, 0003, 0006**. Swedish body + English amendment: **0005**. All others English (0004 translated per 0014:68). `component-model.md` (cited by 0006, 0015, 0018, 0022, 0025) is Swedish too ("Komponentmodellen — arbetsdokument").
Also against the no-people rule (git-flow/memory): person named in 0014:17,52, 0016:15, 0017:12,90, 0018:366, 0020:13.

---

## F. Greppable stale terms

Each string, if found in code/docs/tests outside the ledger, signals pre-revision understanding. Count = `git grep -F` hits outside `docs/adr/` (excl. node_modules) on 2026-10-10.

| Stale string | Current form | Retired by | Hits |
|---|---|---|---|
| `data-run`, `data-run="block"`, `[data-run=` | `data-text-box="block\|inline"` | 0024 §3 | 4 |
| `runOf(` | `inline` prop | 0024 cons. | 0 |
| `.heading-text`, `.heading-link`, `.text-content`, `.caption-content`, `.textblock-content` | `.text` | 0024 §3 | 2/2/2/1/1 |
| `Button-text` (dead engine container) | `.text` in Button | 0024 | 4 (incl. `CtaButton-text`) |
| `data-variant="body\|heading\|display\|label\|button"` (voice), `[data-variant]` in sovereignty selector, `variant="body"` prop on typography | `data-voice`, `voice=` | 0024 amendment | 52 `data-variant` (some legit: look axes on CtaButton/Notice/Prose) |
| `:where(:not([data-voice], [data-voice] *))` (literal amendment form) | `:where(:not(:is(.X [data-voice]), :is(.X [data-voice]) *))` | code, unrecorded | — |
| `data-align="left\|right"`, `align="center"` on typography, `alignInline … left` | `data-align-inline="start\|center\|end"` | 0022 | 14 `data-align=` (AffixField + DummyText legit dialects) |
| `capInline` behind `data-run` | `[data-cap-inline="true"] > .text` | 0024 §4 | — |
| `var(--_lineLength)` in Heading/Text/TextBlock | `--_hd-/--_tx-/--_tb-lineLength` | 0013 applied | 4 (Prose legit-ish) |
| `data-test-state="…"`, `data-test-state~=`, `data-test-state="debug"` | `data-test-state-<state>="true"`, `data-test-debug="true"` | 0025 | 0 |
| `data-test-text-trim` | `data-test-text-box="fallback"` | 0024 (rejected) | 0 |
| `data-flow` | `data-text-box` | 0024 (rejected) | 1 |
| `kitchen-sink`, `/kitchen-sink` | per-component bench, `targetPath(bench)` | 0026 §7 | 13 |
| `/lab/run` | control-room benches | 0024 cons. | 1 |
| `/theme-lab`, `theme-lab.e2e`, `--lab-*` | — | 0003/0004/0005 | 0 |
| `src/styles/tokens/base/grid/`, `tokens.scss`, `color.semantic.scss`, `.scss`, `sass` | `theme-default/*.tokens.js` → `*.generated.css` | 0011 | 0 |
| `src/styles/ui-tokens.css` | `packages/tsugite/styles/ui-tokens.css` (generated from `seam.ui.tokens.js`) | 0003/monorepo | — |
| `:root :not([dir="rtl"])` for `--dir` | `:dir(ltr)` / `:dir(rtl)` | unrecorded | — |
| `theme.inverse.tokens.js`, `theme.<name>.tokens.js` | `theme.voices.tokens.js` | 0006 | — |
| `npm run tokens` | `pnpm tokens` | monorepo | — |
| `--COLOR-B50` style (letter+number RAW) | `--COLOR-<FAMILY>-<STEP>` | 0020 | — |
| `LEGACY_MAP`, `RETIRED`, `FEEDBACK_SHAPE` | — | 0020 | 0 |
| `--button-backgroundColor-primary` (component pointer layer) | `--_bt-*` slot → `--theme-button-*` | 0013 | — |
| kebab slots `--_xx-border-color`, `-bg`, `-fg`, `-border-width`, `-min-block-size` | `--_xx-borderColor`, `backgroundColor`, `color` | 0013 | ≈117 distinct |
| unregistered prefixes `--_cta-`, `--_ni-` | add rows to 0013 register | 0013 §2 | 77 / 53 |
| `lib/card.ts`, `lib/picture.ts`, `lib/buttonShared.ts`, `resolveCard(` | `recipes/*.recipe.ts` + `lib/recipe.ts` | 0018 | `lib/card.ts` 5 |
| `TEASER_FRAMES`, `CARD_FORBIDDEN_COMBINATIONS`, `onInvalid` | `absent` cells / project closure | 0018/0019 | 0 |
| `recipes.config.ts` | (unbuilt) | 0018 §5 — aspirational | 0 |
| "element is the only field allowed to gate" / "every axis is written" | `when.axis`, `unwritten`, `valuesBy` | code, unrecorded | — |
| `apps/docs/src/styles/base/font.css`, `public/fonts` | `theme-default/fonts/`, `fonts.generated.css` | 0027 | 0 (empty dir on disk) |
| `woff` listed before `woff2` | woff2 first | 0027 | — |
| `TagHelper` dev-guard pattern (0006) | recipe `mode: "error"` + DevError | 0018/0019 | component-model only |
| "403 e2e", "six generated CSS files", "seven artifacts" | 20 files / 417 tests; 9+ artifacts | 0026/0024/0027 | — |
| Heading `variant="body"` / body on Heading | `<Text element="h3">` | 0023 | 0 |
| `measure` as the cap word | `cap-inline` / `lineLength` | 0021 (rejected) | `data-measure` 7 (legit docs instrument) |
| "a holding form: it mounts the kitchen-sink section" (bench headers) | plain bench | 0026 §3 | 9 |
| `ADR-0019` meaning "flat fully-qualified rules" | cite ADR-0010 | 0010 | 0 |
| bare `ADR-0002/0004/0005/0008/0009/0010/0011/0013/0014/0015/0016/0023/0029` in field/region files | prefix `ref-lib` | §D | see §D |

---

## G. Short list of ledger fixes that would stop the bleeding

1. Add pointer amendments: 0012 law 3 → 0024 §4; 0021 §2/§3/§5 → 0022 + 0024 §4 + prefixed slots; 0023 → data-voice; 0017 §1 → 0018; 0003 → 0004 r2 + 0005 note; 0008 seam list + custom seam; 0016 → pending block move; 0018 §3 schema growth (`when.axis`, `unwritten`, `valuesBy`, `required`, `hole`, `promise`, `refuses`) and closure status (unbuilt).
2. Record unrecorded decisions: `:dir()` sign; root-scoped sovereignty selector; ScreenReaderText owns visually-hidden text; AppearanceGuard; Lightning `DirSelector` exclusion.
3. Add `cta`, `ni` to the 0013 register; fix 0024 Open pointer (no TODOS in Caption.css).
4. Normalise ADR-0012 law labels (a–d) to stop 1–4 vs a–d drift.
5. Translate 0001, 0002, 0003, 0005, 0006.
6. Mandate `ref-lib ADR-NNNN` for every reference-components citation; ~30 bare collisions exist in field/region files.
