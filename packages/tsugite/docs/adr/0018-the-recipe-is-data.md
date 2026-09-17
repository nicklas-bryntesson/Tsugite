# ADR-0018: The recipe is data

**Status:** Proposed · 2026-09-17. The decision is taken; the proof is Card
on `recipes/card.recipe.ts` read by `lib/recipe.ts`, its three renderers
unchanged in behaviour and `tests/fixtures/card.json` still green.
Accepted when that lands.

## Context

ADR-0017 moved a component's logic into a framework-free recipe in `lib/`
and made every renderer an adapter of it. Read `lib/card.ts` as a sentence
and it says: *a Card is one of these elements, with these axes, each with
these values and this default, written out as these attributes in this
order.* That is a declaration of what may exist, not an instruction for how
to build it. It is a table with a little policy around it, written as a
function because a function was the nearest thing to hand.

Two things showed the cost of keeping it a function. First, a hand port of
Card and Teaser to another host drifted within two weeks — not in the
value lists, which matched exactly, but in the *defaults*, in which
attributes are *always written*, and in a composition inlining its parts
as literal markup. A table copied by hand drifts in precisely the places
a table does not show. Second, inside this repo each component's prop
list exists three times: a `Props` interface in the `.astro` file, a
`CardProps` in the `.tsx`, a `defineProps` in the `.vue`, each mapping
its names into the recipe by hand. A new axis is one edit in the recipe
and six in the renderers, and the equality test catches a missed one only
if a case happens to use the new axis.

The repo already has the pattern for this. ADR-0003 authors tokens as
data in JS because "the lookup belongs in a language that has lookups",
and generates CSS because CSS cannot look anything up. Here the reader
is TypeScript, which can. So the recipe becomes data, and nothing is
generated: one interpreter reads the tables at render time.

Two further things were settled in the same discussion and shape the
schema. The repo had two error policies (Card raised on an invalid
padding; Button dropped an invalid emphasis silently, with a
`TODO(decide)` saying so); ADR-0019 makes it one rule, so the schema
carries no policy field. And the draft component model (§7, 2026-09-01)
recorded a "combination law" in whitelist form — *undefined is
forbidden* — while the component floor wants the opposite: everything
renders unless a project closes it. Decision 5 reconciles the two; they
were never about the same thing.

## Decision

1. **A recipe is a table in `recipes/<name>.recipe.ts`, one per CSS
   root.** A `const` object literal, `as const satisfies Recipe`, with no
   functions and no conditions in it — the same authoring form as
   `theme-default/*.tokens.js`. It declares the full universe of the
   component: what exists, never what a brand prefers. A `.ts` file
   rather than JSON so that TypeScript derives literal types from the
   table; a JSON import would widen `"lg"` to `string`.

2. **One interpreter reads every recipe: `lib/recipe.ts`.** Nothing is
   generated. `resolve(recipe, props, ctx)` picks the element with
   fallback, walks the axes in order, validates each against its set
   (ADR-0019), skips axes whose `when` does not hold, checks the `absent`
   cells, applies the project's subtraction, separates unknown props into
   `rest` for pass-through, and returns `{ mode, tag, className, attrs,
   rest, errorMessage }`. About a hundred lines, component-blind, tested
   against every recipe at once. The per-component `lib/<name>.ts`
   modules go away. `lib/` keeps the interpreter, the media pipeline,
   `html.ts`, and — only where a recipe declares a derived flag — the
   handwritten formula for it.

   Renderers stop listing props. Their input type is derived,
   `InputOf<typeof card>`, and they pass props straight through:

   ```astro
   ---
   import "./Card.css";
   import { card } from "../../recipes/card.recipe";
   import { resolve, type InputOf } from "../../lib/recipe";
   type Props = InputOf<typeof card> & { class?: string; [key: string]: unknown };
   const { class: className, ...props } = Astro.props;
   const childHtml = Astro.slots.has("default") ? await Astro.slots.render("default") : "";
   const r = resolve(card, props, { class: className, hasContent: childHtml.trim().length > 0 });
   ---
   ```

   What stays per host is the list that must differ per host and nothing
   else: content detection, dev-error rendering, the host's way of writing
   attributes, escaping where strings are built. That list neither grows
   nor shrinks; the equality tests exist to keep it honest. (The Vue SFC,
   plain JS for the reason in ADR-0017, takes everything through
   `useAttrs` and gets no derived type; it still lists nothing.)

3. **The schema is a table.** Card, the whole file:

   ```ts
   export const card = {
     name: "Card",
     class: "Card",
     element: { values: ["div", "article", "section", "li"], default: "div" },
     axes: {
       border:    { type: "boolean", default: false },
       padding:   { values: ["none", "sm", "md", "lg"], default: "md" },
       elevation: { values: ["none", "sm", "md", "lg"], default: "none" },
     },
     content: { empty: "suppress" },
   } as const satisfies Recipe;
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
     interpreter requires a function for each declared flag in `ctx`,
     typed from the recipe, so a missing one fails to compile in the
     renderer that forgot it; the fixtures cover the formula.
   - `absent` — cells with no CSS answer (decision 5), each with a
     message. Named `absent`, not `forbidden`, on purpose.
   - `when` — an axis exists only when another field has a given value:
     `intent` when `element` is `button`; `iconPosition` when the `icon`
     part is present. It is one lookup, one level. **There is no `and`.**
     An axis whose existence would need two conditions is a placement
     table, and a placement table is a closed branch with a name: an
     element value, an `absent` cell, or a second component with its own
     CSS root. Never an expression language.

   Button exercises every field; Teaser adds the composition form:

   ```ts
   frame: {
     values: ["bordered", "elevated", "bare"], default: "bordered",
     maps: {
       to: "Card",
       bordered: { element: "div", padding: "none", border: true,  elevation: "none" },
       elevated: { element: "div", padding: "none", border: false, elevation: "sm" },
       bare: null,
     },
   },
   ```

   A composition's axis may *map* to another recipe's input; the
   interpreter returns that input and the renderer hands it to the part's
   component. It never writes that recipe's attributes (ADR-0017 decision
   6). `TEASER_FRAMES` as a positive list of permitted combinations goes
   away: the frames are lookups into Card's universe, and whatever a
   project closes on Card, Teaser inherits through the lookup.

4. **The coastlines.** What earns a place in a recipe, and where:

   - One recipe per CSS root. `Button.css` has one root and never
     distinguishes `a` from `button`, so Button is one recipe with
     `element` as the gate; `LinkButton` and `ActionButton` are front
     doors with host-typed props.
   - An axis is a closed set that appears in a selector. If the CSS never
     reads a value, it is not an axis. An icon name is content.
   - Open values are host attributes or parts, never axes.
   - Split only when the tables split: two CSS roots, or one axis with
     different value sets per element. Not on "it feels like two things".

5. **The system declares absence; the project declares closure.** Two
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

   A project's closures live in `theme-default/recipes.config.ts`
   (empty in this repo; the create rig's blob in a consumer). It only
   ever subtracts — closes values, closes cells, moves a default,
   overrides a composition's `with` — by naming cells, never by
   expression. The interpreter merges it with the universe once, at
   module load; it is data onto data. An axis narrowed to one value
   disappears from the input type while its attribute is still written,
   constant, because the CSS reads it.

   This reconciles the draft's whitelist with today's subtraction the way
   ADR-0003 already did for tokens: **subtraction is the authoring form,
   the whitelist is the delivered form.** The universe is a whitelist,
   total by construction (the Cartesian product of the axes minus the
   absences). A project authors a subtraction. The result is a computed
   whitelist, and nothing downstream ever sees anything else. The draft's
   "undefined is forbidden" still governs the factory floor (which
   voice × volume blocks get emitted) and the delivered form; it is
   superseded only for the authoring form on the component floor. The
   draft's totality rule survives, sharper: it applies to the computed
   whitelist and becomes a lint on the project configuration ("you have
   closed five of six cells; elevation is a boolean for you, collapse
   it?").

6. **The ownership chain in a composition** is three questions with
   three different answers, and inheritance is the wrong word for it:

   - *Who owns the capability?* The part's recipe. Button declares
     `parts.icon`; Teaser declares nothing about icons.
   - *Who takes the decision?* The composition, in its `with` block or a
     derived value. "A teaser's button carries an arrow" is
     `with: { icon: "arrow-right" }`. "Read more *about {heading}*" is a
     derived `srText` that only Teaser can compute, because only Teaser
     knows the heading.
   - *Who has the taste?* The project, which may override a composition's
     `with`. Copy ("about") is not taste; it is a localisation input with
     a default, like `buttonLabel`.

   A composition passes a part's input through as a prop of its own only
   when something needs to vary it per instance; the axis budget pays.

7. **Media is three things, and only one of them varies.** `lib/media.ts`
   today holds decisions (crops, presets, the figure/picture/source
   plan), URL resolution (Astro's `getImage`) and markup emission (an
   HTML string), in one file. They come apart:

   - **Decisions are tables.** The shape of a preset (groups, sources,
     widths, `sizes`, media queries, loading) is the system's schema. The
     *content* — which crops exist, which widths a teaser image gets — is
     the brand's, the same kind of thing as tokens, and moves to
     `theme-default/` beside them. The system declares the preset *names*
     it requires (Teaser needs one called `teaser`), the registry lists
     them (ADR-0014's pattern), the project supplies the values.
   - **URL resolution is one injected function**,
     `(image, crop, width, format) => Promise<string>`. It varies with the
     asset pipeline a site runs on — Astro assets, a CDN, a static
     folder — and **not with the UI framework**: a Vue Picture and a React
     Picture in the same Astro site share the same resolver.
   - **`resolveMedia(preset, image, resolver)` returns a plan**: data with
     finished srcsets, classes, alt, loading. Each renderer writes the plan
     in its idiom. The resolution is asynchronous and lives at the host
     boundary: `Picture.astro` takes an image and a preset name and
     resolves; `Picture.tsx` and `Picture.vue` take a finished plan as a
     prop, synchronous and pure, testable against a fixture plan with no
     pipeline present. A React composition in the docs app receives its
     media plan from the Astro page that mounts it.

   Teaser today reaches past Picture into `PRESETS` and calls the
   pipeline itself — the media-side version of the drift decision 6 of
   ADR-0017 forbids. With `parts.media: { uses: "Picture", with: { preset:
   "teaser" } }` it renders `<Picture>` like anyone else.

## Alternatives rejected

- **Keep one handwritten resolver per component**, guarded by the
  fixtures. The fixtures stay (they are the regression contract), but a
  resolver per component is a table pretending to be code, and its three
  prop lists per component are the drift surface this ADR removes.
- **Generate `lib/<name>.ts` per component from the table.** Considered
  first, and it was the wrong reflex: generation is what ADR-0003 does
  because CSS cannot look things up. TypeScript can. A generator adds a
  build step, a folder of generated files under hook protection and a
  second thing to read when something breaks, to produce code an
  interpreter makes unnecessary. If a reader in another language ever
  needs the table, it is a `JSON.stringify` away; that needs no ADR now.
- **Recipes as `.json` files.** Loses literal types; the prop types would
  have to be written by hand again, which is the drift this ADR removes.
- **An expression language in the schema** (`when` with `and`/`or`,
  computed defaults, formulas for derived flags). Every system that
  starts here ends with a language nobody has tooling for. The schema
  stays a table; what needs an expression is a named hole filled by hand
  and covered by a fixture. The count of such holes is the health
  metric: a handful across Card, Notice, Button and Teaser today; twenty
  after Field would mean the line is in the wrong place.
- **An `onInvalid` policy per axis.** Nobody wants "padding raises,
  elevation falls back". A field that always holds the same value is a
  rule, not a field. ADR-0019.
- **Positive lists of permitted combinations** (`TEASER_FRAMES`,
  `CARD_FORBIDDEN_COMBINATIONS` as a whitelist). Permits scale with the
  product of the axes; closures scale with the number of things a brand
  dislikes.

## Consequences

- `recipes/` is a new top-level folder in the package. `lib/card.ts`,
  `lib/notice.ts` and their kin retire as Card, Notice, Button, Teaser
  and Picture move over, one branch each; `lib/recipe.ts` arrives with
  Card. Deleting a component (ADR-0009) is deleting its recipe, its CSS
  and its renderers; nothing generated to clean up.
- Whatever can be derived from the table is derived by whoever needs it,
  when they need it: the prop types by TypeScript, the props table on a
  docs page by the docs app at build (as `tokens.generated.md` is derived
  from the token sources), exhaustive fixture cases by the test at run
  time (the Cartesian product of the axes). `tests/fixtures/card.json`
  stays as the handwritten regression contract; it is no longer a
  pipeline.
- The project configuration is a second section of the future create
  rig's blob, next to tokens. It can also emit CMS field options from the
  computed whitelist, so an editor cannot pick a closed value.
- Button gains a `srText` part: a visually hidden suffix to the label
  that extends the accessible name ("Read more" + " about {heading}").
  Button owns the hiding, in `Button.css`. Today `Teaser.astro` writes a
  `visually-hidden` span into Button's slot — the slot-side version of
  the drift decision 6 of ADR-0017 forbids on the attribute side. It moves
  when Teaser moves.
- Order of work: `lib/recipe.ts` and `recipes/card.recipe.ts` with Card's
  three renderers on them (acceptance of this ADR); Notice; Button with
  its `iconOnly` hole and `srText` part; Picture with the media split;
  Teaser with `maps`, `parts.media` and `srText`.
- The draft component model, §7, gets a dated note pointing here; the
  passage itself is left as the record of where the thought stood on
  2026-09-01.

## Open

- **A backdrop axis on Picture** (`backdrop: ["none", "blur"]`) is a
  plain axis with a CSS answer, but the effect needs the image's URL in
  CSS — an inline custom property on the figure carrying data. That is
  the first time a component would write an inline style that carries a
  value; the CSS doctrine rules on it before the axis exists. The
  alternative is a second `img` element.
- Whether visually hidden text is a Button part's own CSS or a kernel
  utility (the `Teaser.css` comment about two identical rules and the
  docs app's `.ScreenReaderText`). Decided when `srText` lands.
- The lint's thresholds (when is a narrowed axis "a disguised enum"?).
  Decided when a project configuration exists to lint.
- Tweakable scales in the project configuration (typography, grid column
  width, gap) are Nicklas's next idea and deliberately not in this ADR.
