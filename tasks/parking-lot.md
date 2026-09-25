# Parking lot — noticed during the typography sweep, not swept

- **Button's text engine is dead — everywhere, always** (found 2026-09-03
  by browser probe during the baseline-offset work). Button.css's
  `--_baselineOffset: var(--button--baselineOffset, 0)` defaults to a
  bare number, and `calc(<length> + 0)` is invalid-at-computed-value —
  so `.Button-text`'s leading compensation has never applied in ANY
  browser (no @supports gate there). Also: `--_fontBaselineOffset:
  var(--baseline-offset-label)` on line 10 is declared but never
  consumed (orphaned). Both are upstream findings (ref-comps, ADR-0002
  diffability): fixing changes button geometry that the whole alignment
  bench is calibrated against — needs its own pass with the field ×
  button rows as the instrument, and the family components' new
  factor-×-fontSize formula as the donor pattern.

## From the sweep (2026-09-02)

Non-typography drift observed while sweeping (2026-09-02). Each is a
future sweep or decision of its own; nothing here blocks anything.

- **The spacing/radius zoo.** Raw paddings, gaps, margins and radii
  everywhere the typography sweep walked (`.theme-cell` 1rem/0.75rem,
  fixture inline styles, page cards 1.25rem/0.5rem/999px pills, …).
  Same disease, different organ — needs its own census, map and ramp
  decisions (the `--size-*` scale exists).
- **CtaLinkButton's ghost tokens** — `--fontSize-cta` and
  `--fontFamily-button` don't exist in the semantic layer; the
  defensive fallbacks are the real values (ADR-0008 violation).
  Needs a voice decision: is CTA the label voice at a bigger stop, or
  its own voice?
- **The Eyebrow primitive** — the tracked-caps manner (letter-spacing +
  uppercase on map badges, pillar eyebrows, guide labels, table headers)
  is deliberately allowlisted raw until the Eyebrow component exists
  (notes-typography-components.md). When it lands, those allowlist rows
  should shrink to zero.
- **The pill component** — res-name/value chips, doc chips, badges share
  a shape (border, radius, small text, name/value pair). Nicklas: own
  component, defined after the sweep passes.
- **text-align as a swept property** — open question from the plan:
  Heading owns alignment via data-align; page-local text-align is
  arguably the same drift. Decide when the spacing sweep is scoped.

## From the nesting sweep (2026-09-04)

- ~~ToggleTip's public API lives on `:root`~~ — **resolved 2026-09-09** by
  the ToggleTip house-structure pass (`tasks/plan-toggletip.md`): tokens
  sit on `.ToggleTip` in one layer, the `:root` block is gone.

## From the ToggleTip house-structure pass (2026-09-09)

- ~~The date fields still carry their private popup wiring~~ — **resolved
  2026-09-09** (`tasks/plan-datefields-popup-anchor.md`): all five fields
  call `popup-anchor`; `tests/kernel/popup-anchor-adoption.test.ts` keeps
  it that way.
- **Two variants of the same verb upstream.** Reference-components may
  carry ToggleTip twice: the rail variant (this port — bubble on a
  full-width rail, positioned by the shared kernel math) and a Popover API
  variant (top layer — escapes overflow clipping, retires the z-index
  rail; positioning still from the kernel math since CSS anchor
  positioning lacks Firefox). The consuming library picks by its support
  contract. Tsugite's `.browserslistrc` pins Chrome 109 (Popover is 114,
  anchor positioning 125), so the swap here is a deletion-day event under
  ADR-0009 — the rail CSS is deleted, not overlaid — not something to
  gate today.

## From the base-table port (ADR-0011, 2026-09-04)

The port to the factory was faithful; these four are what it preserved
and did not decide. Each is a separate call.

- **The grid runs on its own ladder.** `grid.tokens.js`: steps
  base/mobile/tablet/desktop at 40 / 48 / 80rem, not the ADR-0001 tiers
  (21.25 / 48.75 / 90rem). Aligning it changes where columns flip on
  every grid consumer (utils/grids, CoverComposition) — threshold
  decision, measure first.
- **`--dir` lands on descendants of `:root`.** ~~Emitted as
  `:root :not([dir="rtl"])` / `:root [dir="rtl"]` because the Sass source
  nested the selectors inside the `:root` mixin.~~ Resolved 2026-09-22: the
  attribute form asked whether an element *carried* `dir`, so every
  descendant of an rtl subtree got the ltr sign. Now `:dir(ltr)` / `:dir(rtl)`
  on the computed direction — one rule per element, a closed question. Still
  no consumer; delete the sign if none arrives.
- **`--MOBILE-BREAKPOINT` (48.74rem) and `--DESKTOP-BREAKPOINT` (75rem)**
  are unused and 75rem is no boundary anywhere. Delete, or make them the
  tier boundaries and have the emitter read them.
- **The px twins (`--size-*-px`, `--SIZE-*-*-PX`) have no consumer.**
  They are now derived in the emitter; removing them is one line once
  the decision is that px spacing should not exist.

## From the docs pages (2026-09-07)

- **legend and figcaption are in Heading's body farm, but nothing emits them.**
  `FAMILY.Heading.voices.body` lists `legend` and `figcaption`, yet
  ChoiceGroup renders its `<legend>` as plain text and no component renders a
  `<figure>`/`<figcaption>` at all. Either the farm is aspirational (then say
  so), or ChoiceGroup's legend should route through the Heading body voice and
  a Figure/Picture caption should exist. Found writing /docs/heading, where the
  only way to show a body-voiced legend was a bare `<fieldset>` — which the
  system forbids. Direction Nicklas sketched (2026-09-07, not decided):
  ChoiceGroup stays the radio/checkbox group wrapper; a separate **Fieldset**
  primitive would host legend in the body voice and carry the nesting complex
  wizards need — several fieldset levels, each tied to its heading via
  aria-describedby. That primitive would own the fieldset vocabulary (ADR-0005:
  compositions own none). Later.

## From the lab cleanup (2026-09-21)

- ~~**Button's empty slots are a hidden default, and tertiary lives on it.**~~ —
  **resolved 2026-09-23** (`tasks/plan-button-slots.md`): prefix `--_bt-`, the
  empties and the dead slots gone, `tests/button-slots.test.ts` keeps every
  emphasis gate complete, css-doctrine §1 says a slot is never declared empty.
  **Tertiary itself stays parked** (no design, no use yet): it still writes none
  of the fourteen and the test names it exempt. Original note:
  `Button.css` declares fifteen colour slots empty (`--_color: ;` …) under
  "own by tone axis". An empty custom property is valid: `color: var(--_color)`
  turns invalid at computed-value time and falls to `inherit`, background to
  `transparent`, border to `currentColor`. Census of who fills them: primary and
  secondary 14 of 15, primary + intent 11, tertiary + intent 7, **tertiary 0** —
  it zeroes the border width, writes `background: transparent` on the element and
  takes every other colour from the empties. That is the "tertiary unfinished"
  of PR #31, made invisible by the empties. `--_color-hover` is declared and never
  read; `--_borderRadius: ;` is overwritten by both `data-pill` values. Doctrine:
  every gate sets its slots; the empties let a gate be partial. **The pass:**
  prefix `--_bt-` (the TODO(decide) at the top of the file), delete the empties,
  make tertiary write all fifteen with explicit `transparent`/`inherit`, give
  tertiary + intent its backgrounds, drop the dead hover slot, rewrite the header
  in Card's format. Before the prefix, check the e2e suites and CtaButton for
  reads of Button's slot names; `--button--baselineOffset` (line ~406) is a
  public knob and keeps its name. Own PR, after the lab branch closes.
- **Fallback-first is the @supports order.** ADR-0013's gate rule (off value
  first, on value last) applied to feature queries: the `@supports not` branch
  before the native one. Heading and TextBlock were flipped to match Text and
  Caption; a sentence in css-doctrine.md should say it.
- **The trim engine is four copies.** The `@supports` pair (native
  text-box-trim / margin fallback) is identical in Heading, Text, Caption and
  TextBlock but for the container class and the slot prefix. Candidate:
  `kernel/css/run.css` on `[data-run="block"] > .run`, the container renamed
  `.run` in all four, slots read under one set of names — which decides the
  prefix question too (the slot TODO in Heading.css). Law (d)/(b) follows later,
  after its selector is rethought (TODOS(?) in Caption.css).
- **Where does a block's padding live, and who holds the lever?** The grid lab
  (lab/grid.astro, eleven layouts) proved the band cannot pad: a breakout's
  picture must run from the band's top to its bottom, so the block padding sits
  on the copy there and on the layout grid in a centered block, and adjacency
  collapses only between blocks that pad at the same level (same voice,
  sibling selector). Open: what kind of axis that is — a word on the block
  ("media fills the band" vs "media sits inside the padding"), the block's
  recipe, or the grid-region spike where the Surface root is the grid — and
  where the lever sits. Lab-only CSS today (two TODO(lab) rules); an answer
  is needed before compositions ship on Surface. Related: the `join` boolean
  (ADR-0016 amendment), Layout.css's `align-items: flex-start` on the root
  (dead weight: every child sets full width), the lab's `data-align-block` /
  `data-align-inline` words.


## From the Button slots pass (2026-09-23)

- **The git-flow guard lives in the wrong layer.** `.claude/hooks/protect-git.py`
  enforces hard rule 5 as a Claude Code PreToolUse hook and judged the branch
  in the session's cwd — an assumption about how the shell behaves that
  stopped holding when the cwd began resetting between commands, blocking
  every worktree commit (PR #70 patched it by reading `cd`/`-C` out of the
  command string, which is the same kind of assumption). The robust home is
  git itself: a `pre-commit` hook under `.githooks/` (`core.hooksPath`) runs
  in the directory the commit actually happens in, for every tool and every
  person, and needs only `git branch --show-current`. Force-push is already
  refused by the GitHub ruleset on origin, the guard that counts. Decide:
  move the branch rule to git, keep the PreToolUse hook as an early friendly
  message or delete it. ADR-shaped.

## From the cleanup round (2026-09-24)

- **The inner span: one part, four names, and a mode word nobody reads right.**
  The engine container is `text-content` in Text, `heading-text` / `heading-link`
  in Heading, `Button-text` in Button — three dialects for the recipe's one part,
  `text`. Two questions, two answers so far (discussion 2026-09-24, nothing decided):
  (1) the part's class is the recipe's part name, bare and lowercase under the root —
  `.Text .text`, `.Button .text` — see the class-naming row below; (2) the container is a PART, not a sub-component
  (no axes, no props, borrows the parent's carriers, its tag varies by the parent),
  so the lift is not `<Run>` but the kernel run engine already noted above
  (`kernel/css/run.css` on `[data-run="block"] > .run`), Button last with the
  alignment bench as instrument. Open on top: `data-run` was read as "makes the
  component block" — it gates the container's mode (display, trim, cap, box move),
  not the root's display. Rename candidate `data-flow="block | inline"`, or drop
  the attribute for `:not(span)`. To be settled with an HTML/CSS POC before any ADR.
- **Button's next spike: the label as a run, screen-reader affixes, two icon slots.**
  Findings from the design examples (Vercel's pill with a three-icon stack at the start and
  a copy icon at the end; SvD's full-width quiet link button with mixed weights and an
  arrow), 2026-09-24, nothing decided:
  - *Control surfaces, four:* the box (axes — a value must answer in every cell of every
    other axis, the anti-utility test; `quiet` passes), the label run (`Button-text` is a
    run and should obey the family's laws — law (b) `<strong>` through the voice's bold
    weight, height always from the label, the dead baseline engine replaced by the kernel
    run engine, Button last with the alignment bench as instrument), the icon areas (slots,
    never axes), and the root's knobs + tokens (where a design's individual values land;
    a new *look* with a name is CtaButton).
  - *Screen-reader affixes:* `srText` becomes two text parts, `screenReaderPrefix` and
    `screenReaderSuffix` (spelled out, ADR-0013; "who reads it", not "hidden" — the text is
    read, only visually hidden). Both are needed when the visible label is a bare value:
    "Sida 3 av 12", "Torsdag 14 maj", "Sortera efter Namn, stigande". DOM order = the
    accessible name; label-in-name (WCAG 2.5.3) is why affixes and not aria-label. Icon-only
    falls into the same door (both affixes, no visible words), affix + aria-label is refused.
  - *ScreenReaderText is a component, not a utility class:* always a `<span>`, promise "words
    in the accessible name only", refuses focusable hosts, interactive or block content,
    emptiness. Replaces ten copies of the clip pattern (Button, ChoiceGroup, Picklist,
    ThemeSwitch, MotionRegion, the five date fields). Button renders its affixes through it.
  - *Two icon slots, `iconStart` and `iconEnd`* (logical, ADR-0022), replacing the `icon`
    part + `iconPosition` axis — position is which slot is filled, one axis fewer. Each slot
    takes a sprite name (square from the size gate) or children (block size from the gate,
    inline auto — the stack). `--_bt-iconSize` is a carrier set by raw values in the size
    gates: read a token there, never inject per instance. Grid per filled cell, five gates
    (`data-icon-start` × `data-icon-end` × text), no empty tracks so `gap` stays right —
    not a collapsing `auto 1fr auto`. Two icons and no words is an `absent` cell.
  - The Vercel button is then Button (secondary, pill, stack at start, copy sprite at end)
    *if* the copy icon is decoration; a second action makes it two buttons, a composition.
    The SvD button is Button today plus `quiet`: grow-inline, iconEnd, `<strong>` in the label,
    and it settles the TODO(decide) on a grown button's inner layout (label start, icon end).
  - POC question that ties it to the run engine: children in an icon slot must stay inside
    the label's line — the label owns the height.
- **AffixField: onto the table, an align axis, a closed type list, and the affix wiring question.**
  Discussion 2026-09-24, nothing decided. AffixField is reference-components' canonical port
  (the field family's frozen upstream API) and is NOT on the interpreter: no recipe, the Astro
  file authors the end state and `AffixField.ts` gap-fills attributes client-side.
  - *Port it to the recipe + lib engine* (ADR-0017/0018): `recipes/affixfield.recipe.ts` for the
    table, `lib/affixfield.ts` for the holes (affix ids, the describedby merge, the character
    counts), and the Astro, React and Vue renderers as adapters of one resolution — the first
    field on the table, the pattern for the rest of the family.
  - *Align:* the upstream had `data-input-align="end"`; the port kept `data-align="end"` on the
    root as an on-switch (text-align on `.input`, no start gate, no center). Tsugite form per
    ADR-0022: `data-align-inline="start | center | end"`, three gates, start explicit; center is a
    real cell in the sized variant (a code centred in its character slot). No "input" in the word:
    the affixes have no alignment of their own.
  - *A closed type list.* Today `type` is an open pass-through defaulting to text; `type="date"`
    would render and break the layout silently. The recipe closes it: text | number | tel | email
    | url | search (the text-like inputs; number keeps its spinner rule), an invalid value refused
    in development (ADR-0019). The element stays `<input>`: the date/time family has its own
    components, a select with a prefix is a different component, a textarea with affixes is not a
    thing.
  - *Affix wiring:* the port puts prefix + suffix ids in `aria-describedby` after any hint
    (name "Amount", description "$ USD"). The alternative `aria-labelledby="label prefix"` puts
    the unit in the name; `aria-labelledby="currency sum"` as seen in the wild self-references
    the value and drops the label. Any change is a contract change in the frozen family → a
    porting-log question for reference-components, not a local deviation. The escape hatch
    (`prefix.attrs.id`, `input["aria-labelledby"]`) exists today but double-announces.
- **Caption's weight axis, and "value" as a manner, not a voice.** Discussion 2026-09-24
  ahead of the job that pulls the custom input components apart; nothing decided.
  - *Caption gets `weight="regular | strong"`:* the label voice has one weight (Inter 400) and
    the popups need two (calendar header and today strong, weekdays regular). The strong gate
    writes the slot the `<strong>` door already reads (`--_cp-boldWeight`), so it costs no
    token and turns visible when the theme gives label a bold stop — which also retires the
    seam's cross-wiring (`--ui-font-weight-strong` → body's bold under label's face, seven
    files). Two cables, one truth: `<strong>` is content, the axis is design; both read the
    voice's bold stop. Word: `weight` (values `regular | strong`, role words); `emphasis` is
    taken twice already. Dictionary question.
  - *Words vs controls in a popup:* a segment is a control (JS-made span, focusable,
    spinbutton) and reads its voice as tokens like Button; the words (month/year, weekday
    names, hints, legends, headings) go through Caption, whose farm already has h1–h6 and
    legend. Swapping Text/Heading/Caption on a word is cheap — same engine — except for the
    emphasis law (Heading flattens) and the door law (a voice lives behind one door).
  - *"Value" is a manner, orthogonal to voice:* what is true of a value in any typeface —
    tabular lining figures (`font-variant-numeric`), no ligatures, nowrap, no hyphens,
    `unicode-bidi: isolate`, optional slashed zero. None touch the voice bundle. So: not a
    voice, not a component (door law), not a utility class (doctrine) — a `manners.value`
    group in typography.tokens.js beside the voices, read as tokens by the controls
    (segments, AffixField's input value, day buttons) and as an axis by the family doors.
    Eyebrow, already parked as "the tracked-caps manner", is the same kind — two manners
    argue for `manner: value | eyebrow` over a lone boolean. Word undecided (`value`
    collides with the input attribute). Lands with the input-component job, but AffixField's
    value is already typography of this family, so it may arrive earlier.
- **Shadows as roles: geometry in a ramp, ink built at build time.** Card's three elevation
  gates are raw `oklch(0 0 0 / α)` stacks — one truth for every mode, invisible on dark
  ground. `--color-shadow-popup` already does it right (four mode rows), Card just does not
  read it. Proposed shape (discussion 2026-09-24, not decided): split the string —
  *geometry* (offsets, blur) as a theme-independent ramp in `shadow.tokens.js`,
  `--shadow-sm | md | lg`, two layers each; *ink* as a role with mode rows,
  `--color-shadow-ink-1/2`, `mix()` recipes computed by the color engine. The tinted-shadow
  POC lands there as `mix(<ground>, pct, <black>)` per voice cell — a `--theme-shadow-ink`
  in the voice donut, so the tint follows the cell's ground with no runtime `color-mix()`
  and therefore no fallback question. Card reads `var(--shadow-sm)`; `--color-shadow-popup`
  is rebuilt the same way behind the unchanged `--ui-shadow` seam. Forced-colors forces
  `box-shadow` to none on its own. Same job shape as the gradient role.
- **Runtime `color-mix()` under a Chrome 109 floor.** Five files compute colours in the
  browser: FileUpload (three, with system colours), Notice (`--_nt-backgroundColor`),
  RangeScale (four) and RangeField (two). `color-mix()` arrived in Chrome 111; `defaults`
  in `.browserslistrc` still carries 109. Lightning lowers `color-mix()` only with static
  operands, and these mix `var()`s, `currentColor` and system colours — so on 109 the
  declaration is dropped and the slot falls to its fallback or to nothing. Decide per site:
  a build-time recipe where the operands are tokens (Notice), a `@supports` pair where they
  are `currentColor`/system colours (the ranges, FileUpload), or a floor decision (ADR-0009).
- **Border width and radius as tokens.** Census 2026-09-24: 56 raw border widths and radii in
  20 components — the date/time fields carry 32 of them (DateTimeField 8, WeekField 7,
  DateField 7, TimeField 5, MonthField 5), then ChoiceField 3, Button 3, Card 2, CtaButton 2,
  AffixField 2, and one each in ToggleTip, ScrollArea, RangeScale, Prose, Picklist, Notice,
  MotionRegion, CoverComposition, RangeField 2, FileUpload 2. Eleven distinct values: `2px`
  (22), `4px` (14), `50%` (7, the circles), `1px` (6), and one each of `999px`, `10em`,
  `5em`, `3em`, `0.5rem`, `0.375em`, `0.35em` — three spellings of "pill" and three of a
  small radius. Tokens that exist: `--ui-radius` (0.75rem) and `--ui-border` (a colour) on the
  seam, nothing for width, nothing for a radius ramp. Decide: a `--borderWidth-*` set (hairline
  1px, control 2px, focus 4px?) and a `--radius-*` ramp (sm | md | lg | pill, circle stays `50%`
  as geometry, not a token) in a `shape.tokens.js`; whether `em` radii on Button/CtaButton are
  a size-relative choice worth keeping (they scale with the voice) or drift. Same disease as
  the spacing zoo above, same cure: census, ramp, gates.
  *Added 2026-09-24, after discussion:*
  - **At least two widths.** Even a site whose manner is broad lines has the place where a
    line must be thin; `thin | regular` (or `hairline | line`) is the floor of the set, a
    third for focus/emphasis rings if the census bears it out.
  - **Outer and inner radius, with the formula.** A rounded box inside a rounded box needs
    the inner corner to follow the outer one: `inner = outer − inset` (the padding or gap
    between the two edges), clamped at zero. The inner radius is not a second token value
    but a derivation, `--_x-radiusInner: max(0px, calc(var(--radius-outer) - var(--_x-padding)))`,
    on the component that nests — Card around a Picture, a chip inside a field, a popup's
    rail inside its frame. Where the gap is a token, the derivation is exact and stays in
    sync when the theme turns the outer radius.
  - **The composite.** Sveriges Lärare's `--border: var(--borderWidth) var(--borderStyle)
    var(--borderColor)` is a seam convenience: width from the width set, style constant,
    colour from the border role. Worth one alias on the `--ui-*` seam for the fields; in
    the components the gate still sets width and colour from their own tokens so each can
    turn alone.
  - **Modern corners to evaluate:** `corner-shape` (CSS Borders 4: `squircle | bevel |
    notch | scoop`, shipped in Chromium 2025, not in the floor — a progressive enhancement
    under `@supports`, since the fallback is the round corner); and the aspect-corrected
    percentage radius for boxes whose ratio is known — a `15%` radius on a 16:9 box is an
    ellipse, the fix is a per-axis pair, `border-*-radius: var(--h) var(--v)` with
    `--v: calc(var(--pct) * var(--aspectWidth) / var(--aspectHeight) * 1%)` — a Picture /
    media-frame concern where `aspect-ratio` is already a token.
- **Class naming: a capital is a root, a bare lowercase word is a part.** Settled in
  discussion 2026-09-25, to be written into ADR-0013 (a sentence beside the slot grammar):
  a PascalCase class is a component root, the name to look up in `recipes/`; a part is the
  recipe's part name in lowercase, unprefixed, nested under the root — `.Quote .body`,
  `.Notice .title`. Nested under the root the prefix is noise. Census: Quote, Notice,
  RangeScale and the fields already do it; nine components carry a prefix — capitalised
  (`Button-text`, `CtaButton-text`, `NavItem-text`, `Teaser-link`, `CoverComposition-media`)
  or lowercase (`caption-content`, `heading-text` / `heading-link`, `text-content`,
  `textblock-content`). The rename is mechanical per component (CSS, plan helpers in
  `lib/*.ts`, renderers, fixtures, e2e selectors) and rides with each component's next
  pass; the typography four go with the run-engine job, where the container becomes `.text`
  in all of them. ScreenReaderText stays capitalised because it is a component.
- **A `write-css` skill with an example file.** Agreed shape 2026-09-25, not built: a skill
  folder `.claude/skills/write-css/` with `SKILL.md` (the routine: read the doctrine, the
  registry and the component's recipe first; write; then compare the file against
  `example.css` point by point and name every deviation in the reply), `example.css` (one
  component that does not exist, showing everything on one page, each thing commented with
  the rule and its ADR: Card-form header; capital root, bare lowercase parts nested under
  it; knobs on the root, carriers set by gates, the prefix from the ADR-0013 register; every
  axis value gated, off value first; the `@supports` pair, fallback first, nothing in the
  base re-declared; the resolution chain with one fallback at the theme seam; the engine's
  `:where` exemption with the comment that says why it is right there; `TODO(kind)` above
  the line; one declaration per line) and `counter-example.css` (the same component written
  wrong, every fault marked). The skill judges what a script cannot (`:where` in the engine
  vs in Picture); the mechanical gates that exist (typography gate, button-slots test) stay
  as the guards for what is a matter of characters. Conditions: the description must
  trigger on writing or changing CSS in the package, and root CLAUDE.md's "read the doctrine
  before CSS" points to the skill; a doctrine change lands in `example.css` in the same PR,
  or the example lies within a month. Own branch, `chore/write-css-skill`, from main.
- **The components tree follows the pillars, and the path stops being API.** Discussion
  2026-09-25, not decided. 33 folders in one `components/`; the manifest says 26
  primitives (15 of them the fields family), 3 compositions, 3 regions, 2 chrome. Pillar
  folders alone leave a pile of 26, so the shape is pillar, then family where one exists,
  then component: `components/primitives/fields/DateField`, `components/primitives/typography/Text`,
  `components/compositions/Teaser`, `components/regions/Surface`. Three conditions:
  (1) the path is the truth — `manifest.ts` reads pillar and family from it (or a test holds
  them together), so a reclassification is a `git mv` and shows in the tree; (2) the path
  stops being the public import — `package.json` exports `"./*": "./*"` today, and 287
  imports name `components/<Name>/` (docs app 141, fixtures 112, tests 34); an export map
  by name, `tsugite/Button`, makes this the last move any consumer notices; (3) `recipes/`
  and `lib/` stay flat for now — colocating the table in the component folder is an
  ADR-0018 change and its own question. Own chore PR when nothing else is in flight: the
  move and the export map together, proof = all suites green, the docs routes render the
  same, zero `components/` paths in imports outside the package.
  *Added 2026-09-25:* three families cover 21 of the 26 primitives — `primitives/fields`
  (15), `primitives/typography` (Heading, Text, Caption, TextBlock), `primitives/buttons`
  (Button, CtaButton); NavItem stands alone until a second nav component arrives. The
  pillar test is the ledger's own (ADR-0005, packages/tsugite/CLAUDE.md): *a composition
  owns no vocabulary* — it places primitives and makes claims; whoever owns slots and
  consumes tokens is a primitive, whatever it contains. So Teaser (five imports, five slots
  for its own parts) is a composition; Notice (raw markup, thirteen slots) and DateField
  (raw markup, owns everything) are primitives, size and inner complexity notwithstanding.
  DateField becomes a composition the day it is built from Segment, Popup, Wheel and
  Calendar primitives that exist on their own — which the input-component job may produce.
  That is why the path must be the truth: the tree shows where the ledger stands now and
  moves with it, a reclassification is a `git mv`.
