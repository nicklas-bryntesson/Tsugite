# ADR-0018: The recipe is data

**Status:** Proposed · 2026-09-17. The decision is taken; the proof is Card
generated from `recipes/card.recipe.json` and diffed against today's
handwritten `lib/card.ts` with a boring diff. Accepted when that lands.

## Context

ADR-0017 moved a component's logic into a framework-free recipe in `lib/`
and made every renderer an adapter of it. Read `lib/card.ts` as a sentence
and it says: *a Card is one of these elements, with these axes, each with
these values and this default, written out as these attributes in this
order.* That is a declaration of what may exist, not an instruction for how
to build it. It is a table with a little policy around it. It is written
as a function only because TypeScript happened to be the first reader.

The second reader arrived before the first was finished. Nicklas builds
Umbraco sites where the same components are ASP.NET TagHelpers, and the
C# port of Card and Teaser (the AiPoc project) was written by hand from
the same rules. Within two weeks it had drifted — and not in the rules.
The permitted-value lists matched exactly. The drift was in the *output
shape* (default element `article` versus `div`; `data-elevation` omitted
when not given, where TS always writes `none`) and in *composition*
(Teaser writing Card and Button as string literals, missing
`data-elevation` on the frame and `data-grow-inline` on the button).
A hand-copied table drifts in exactly the places a table does not show:
its defaults and what is always written.

The repo already has the answer to that class of problem. ADR-0003
authors tokens in JS and delivers generated CSS; the generated file is
never edited (root hard rule 4) and a hook enforces it. The same
discipline applies one floor up.

Two further things were settled in the same discussion and shape the
schema below. First, the repo had two error policies (Card raises a dev
error on an invalid padding; Button dropped an invalid emphasis silently,
with a `TODO(decide)` saying so). ADR-0019 makes it one rule, so the
schema carries no policy field. Second, the draft component model
(§7, 2026-09-01) recorded a "combination law" in whitelist form —
*undefined is forbidden, not AiPoc's blacklist form* — while the
component floor wants the opposite: everything renders unless a project
closes it. Decision 4 reconciles the two; they were never about the same
thing.

## Decision

1. **A recipe is a JSON file, one per CSS root.** It lives in
   `packages/tsugite/recipes/<name>.recipe.json` and declares the full
   universe of the component: what exists, never what a brand prefers.
   A generator reads it and emits `lib/<name>.generated.ts` (the
   TypeScript reader), the language-neutral fixture file
   `tests/fixtures/<name>.json` (PR #45 is its handwritten forerunner),
   and, outside this repo, a `Recipes/<Name>Recipe.cs` for the .NET host.
   Generated files are never edited by hand; the token hook extends to
   them. Renderers stay handwritten and thin, in every host.

2. **The schema is a table.** Card, the whole file:

   ```json
   {
     "name": "Card",
     "class": "Card",
     "element": { "values": ["div", "article", "section", "li"], "default": "div" },
     "axes": {
       "border":    { "type": "boolean", "default": false },
       "padding":   { "values": ["none", "sm", "md", "lg"], "default": "md" },
       "elevation": { "values": ["none", "sm", "md", "lg"], "default": "none" }
     },
     "content": { "empty": "suppress" }
   }
   ```

   The fields, and what each may hold:

   - `element` — the permitted tags and a default. It is the only field
     allowed to gate others (see `when`). An invalid element falls back to
     the default (ADR-0019): `div` is always an honest answer.
   - `axes` — closed sets the CSS switches on, each with a default. The
     order of the keys is the order of the `data-*` attributes in the DOM
     and is part of the contract. Every axis is written on every render,
     never omitted.
   - `host` — per element, the open-valued attributes the host element
     carries (`href`, `target` on `a`; `type`, `disabled` on `button`).
     Rules on them (`rel` when `target="_blank"`) have no value set and
     are handwritten in the renderer, guarded by a fixture.
   - `parts` — the component's named children (ADR-0013): a `slot`, a
     `name` (an open string written to an attribute, like an icon's
     sprite id), a `text`, or a `part` that *uses* another recipe with a
     fixed `with` input.
   - `derived` — flags the CSS reads that come from content, not props:
     `iconOnly`, `hasMedia`. The recipe declares the name, the attribute
     and what it depends on. It does not declare the formula. The
     generator emits a typed hole (`deriveIconOnly`) that each language
     fills by hand; the fixtures cover it.
   - `absent` — cells with no CSS answer (decision 4), each with a
     message. Named `absent`, not `forbidden`, on purpose.
   - `when` — an axis exists only when another field has a given value:
     `intent` when `element` is `button`; `iconPosition` when the `icon`
     part is present. It is one lookup, one level. **There is no `and`.**
     An axis whose existence would need two conditions is a placement
     table, and a placement table is a closed branch with a name: an
     element value, an `absent` cell, or a second component with its own
     CSS root. Never an expression language.

   Button exercises every field; Teaser adds the composition form:

   ```json
   "frame": {
     "values": ["bordered", "elevated", "bare"], "default": "bordered",
     "maps": {
       "to": "Card",
       "bordered": { "element": "div", "padding": "none", "border": true,  "elevation": "none" },
       "elevated": { "element": "div", "padding": "none", "border": false, "elevation": "sm" },
       "bare": null
     }
   }
   ```

   A composition's axis may *map* to another recipe's input. It never
   writes that recipe's attributes (ADR-0017 decision 6). `TEASER_FRAMES`
   as a positive list of permitted combinations goes away: the frames are
   lookups into Card's universe, and whatever a project closes on Card,
   Teaser inherits through the lookup.

3. **The coastlines.** What earns a place in a recipe, and where:

   - One recipe per CSS root. `Button.css` has one root and never
     distinguishes `a` from `button`, so Button is one recipe with
     `element` as the gate; `LinkButton` and `ActionButton` are front
     doors with host-typed props, in Astro and in C# alike.
   - An axis is a closed set that appears in a selector. If the CSS never
     reads a value, it is not an axis. An icon name is content.
   - Open values are host attributes or parts, never axes.
   - Split only when the tables split: two CSS roots, or one axis with
     different value sets per element. Not on "it feels like two things".

4. **The system declares absence; the project declares closure.** Two
   things were both called "forbidden", and the word hid a floor:

   - **Absence**: a cell for which the CSS has no defined answer. An
     icon-only button that grows across a row has no geometry. Intent on a
     link has no selector. The system declares these — as `when` or as
     `absent` — because nothing else can.
   - **Closure**: a cell that renders perfectly well and a brand does not
     want. Card with border and elevation together. The system has no
     opinion; a project does.

   The test is one question asked of one cell: *does the CSS have an
   answer?* If yes, only a project may close it. If no, the recipe
   declares it absent. There are no component-own forbids of taste.

   A project's closures live in a configuration file
   (`theme-default/recipes.config.json`, empty in this repo; the create
   rig's blob in a consumer). It only ever subtracts — closes values,
   closes cells, moves a default, overrides a composition's `with` — by
   naming cells, never by expression. The generator applies it to the
   universe and emits the narrowed readers. An axis narrowed to one value
   disappears from the API (no prop, no TagHelper property) while its
   attribute is still written, constant, because the CSS reads it.

   This reconciles the draft's whitelist with today's subtraction the way
   ADR-0003 already did for tokens: **subtraction is the authoring form,
   the whitelist is the delivered form.** The universe is a whitelist,
   total by construction (the Cartesian product of the axes minus the
   absences). A project authors a subtraction. The result is a computed
   whitelist, and the generator never sees anything else. The draft's
   "undefined is forbidden" still governs the factory floor (which
   voice × volume blocks get emitted) and the delivered form; it is
   superseded only for the authoring form on the component floor. The
   draft's totality rule survives, sharper: it now applies to the
   computed whitelist and becomes a lint on the project configuration
   ("you have closed five of six cells; elevation is a boolean for you,
   collapse it?").

5. **The ownership chain in a composition** is three questions with
   three different answers, and inheritance is the wrong word for it:

   - *Who owns the capability?* The part's recipe. Button declares
     `parts.icon`; Teaser declares nothing about icons.
   - *Who takes the decision?* The composition, in its `with` block or a
     derived value. "A teaser's button carries an arrow" is
     `with: { "icon": "arrow-right" }`. "Read more *about {heading}*" is a
     derived `srText` that only Teaser can compute, because only Teaser
     knows the heading.
   - *Who has the taste?* The project, which may override a composition's
     `with`. Copy ("about") is not taste; it is a localisation input with
     a default, like `buttonLabel`.

   A composition passes a part's input through as a prop of its own only
   when something needs to vary it per instance; the axis budget pays.

## Alternatives rejected

- **Keep the recipe in TypeScript and port by hand**, guarded by shared
  fixtures. The fixtures are kept (they are step one and they stay the
  cross-language proof), but a hand port of a table drifts in its
  defaults and its always-written attributes, which is exactly what the
  C# port showed. Fixtures catch it; generation prevents it.
- **Run the TS recipe inside .NET** (Jint, a Node sidecar). A runtime
  dependency on a JavaScript engine to write four attributes. No.
- **An expression language in the schema** (`when` with `and`/`or`,
  computed defaults, formulas for derived flags). Every system that
  starts here ends with a language nobody has tooling for. The schema
  stays a table; what needs an expression is a named hole filled by hand
  in each language and covered by a fixture. The count of such holes is
  the health metric: five across Card, Notice, Button and Teaser today;
  twenty after Field would mean the line is in the wrong place.
- **An `onInvalid` policy per axis.** Nobody wants "padding raises,
  elevation falls back". A field that always holds the same value is a
  rule, not a field. ADR-0019.
- **Positive lists of permitted combinations** (`TEASER_FRAMES`,
  `CARD_FORBIDDEN_COMBINATIONS` as a whitelist). Permits scale with the
  product of the axes; closures scale with the number of things a brand
  dislikes.

## Consequences

- `recipes/` is a new top-level folder in the package; `lib/<name>.ts`
  survives only where derived flags need a handwritten formula (Button,
  Teaser) and then imports the generated module.
- The docs app's props table per component can be generated from the
  same file, as `tokens.generated.md` already is from the token sources
  (ADR-0014). Not in the first pass.
- The project configuration is a second section of the future create
  rig's blob, next to tokens, through a second generator with the same
  discipline. The rig can also emit CMS field options (Umbraco data-type
  prevalues) from it, so an editor cannot pick a closed value.
- Button gains a `srText` part: a visually hidden suffix to the label that
  extends the accessible name ("Read more" + " about {heading}"). Button
  owns the hiding, in `Button.css`. Today `Teaser.astro` writes a
  `visually-hidden` span into Button's slot — the slot-side version of
  the drift decision 6 of ADR-0017 forbids on the attribute side. It moves
  with this ADR's first implementation pass.
- Order of work: the fixture file for Card (PR #45, done); the schema and
  generator producing Card and diffing clean (acceptance of this ADR);
  Notice; Button with its two holes; Teaser with `maps` and `srText`.
  Each on its own branch.
- The draft component model, §7, gets a dated note pointing here; the
  passage itself is left as the record of where the thought stood on
  2026-09-01.

## Open

- Whether visually hidden text is a Button part's own CSS or a kernel
  utility (the `Teaser.css` comment about two identical rules and the
  docs app's `.ScreenReaderText`). Small, separate; decided when Button's
  `srText` lands.
- The lint's thresholds (when is a narrowed axis "a disguised enum"?).
  Decided when the project configuration exists to lint.
- Tweakable scales in the project configuration (typography, grid column
  width, gap) are Nicklas's next idea and deliberately not in this ADR.
