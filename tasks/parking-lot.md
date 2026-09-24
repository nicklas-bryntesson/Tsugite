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
  (1) the part's class should fall out of the recipe, `<Class>-<part>` — a sentence
  next to ADR-0013's slot grammar; (2) the container is a PART, not a sub-component
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
