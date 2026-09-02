# Notes: the typography component family (input to T2 / Checkpoint 1)

Direction sketched by Nicklas 2026-09-02, during sweep planning. Not
decided — this feeds the gap analysis and the Checkpoint 1 vocabulary
decisions.

## The two-axis model

- **Technical axis** — the rendered element: `h1–h6`, `p`, `span`,
  `label`, `legend`, `figcaption`. Owns semantics, a11y, and structural
  constraints.
- **Visual axis** — the typographic *voice*: heading, display, body,
  label. The role bundles already exist complete in the token vocabulary
  (family/size/weight/lineHeight/tracking/featureSettings per role).

Heading is already a two-axis machine (`element` × `variant` × `size`).
The question is how the machine scales.

## Consolidated matrix (Nicklas, 2026-09-02 evening)

The rule that fell out mid-sentence ("…eller hmm, label är ju weird"):
**an element with no props of its own joins an existing farm; an element
with its own contract births a component.**

- **`legend` and `figcaption` join Heading's element farm.** They carry
  no extra props — the direct-child placement constraint is the
  parent's business, and Heading's root-IS-the-element pattern already
  satisfies it. Nested fieldsets then read naturally:
  `<Heading element="legend" variant="heading" size="3">` at level 1,
  `<Heading element="legend" variant="label">`-ish at level 2.
- **`Label` is its own technical component**: element `label`, owns
  `for`, `id`, aria-attrs — props only true in that context. Visually it
  wears the FULL grammar: all Heading variants (heading/display/body),
  label voice, and the future caption style.
- **`Text`** stays the simple authored-text tool (p/span/div, default
  body).
- **New visual gap — the `caption` style (G7):** a voice that doesn't
  exist yet (the quiet caption look). Token-bundle work in
  theme-default, wearable by the whole family once defined.
- Open eye for CP1: legend/figcaption in Heading's farm means one door;
  keep it that way — two components rendering the same element is how
  "which one do I grab" drift starts.

## Leaning: a family sharing one visual grammar

- **Per-element components where technical capabilities differ:**
  - `Label` — element farm like Heading's plus `label`; owns `for`.
    Voice default: label.
  - `Legend` — root IS `<legend>` (must be a direct child of
    `<fieldset>`; no wrappers, ever). Full voice matrix: nested
    fieldsets typically need level-1 legend to look like a heading,
    level-2 like a label.
  - `Figcaption` — root IS `<figcaption>` (direct child of `<figure>`),
    same reasoning; a figcaption may look like display.
- **One shared visual grammar, not four CSS copies:** the voice × size
  matrix is a single style contract (same `data-*` API, one shared CSS
  surface) that every family member emits. Components own element farms
  and technical props; voices own appearance, once.
- The inner text-wrapper pattern (`.heading-text` span for the
  typography engine/baseline trim) is fine inside legend/figcaption —
  the *root* is what placement rules constrain.

## The Body/Prose gap → `Text`

Prose is a *donut*, not an element: it styles its children — uncontrolled
flowing content (CMS/RTE output, articles) where you don't author each
element. The missing family member is **`Text`**: the same two-axis
machine, element farm `p`/`span`/`div`, default voice **body** — what
you reach for when authoring a single text run in a UI (helper text, a
lede, a one-line description). Heading with variant="body" works
mechanically but lies about intent.

The litmus for all text then collapses to one question: **do you author
the element?** → family component (Heading/Text/Label/Legend/Figcaption,
right voice). **Is it a flow you don't control?** → Prose. This also
explains Prose's 10 raw census hits: it has been serving as both donut
and stand-in for authored text; with Text in the drawer, Prose can be
purified back to its donut job.

## The eyebrow, untwined (resolves G2)

Years of drift (p/label/h*/div variants in the wild) came from letting
appearance pick the element. The model splits it clean:

1. **Technical:** an eyebrow is ALWAYS a `<p>` — rendered by `Text`.
   Never a heading, never a label.
2. **Visual:** "eyebrow" is a *named style stop* in the shared grammar.
   The bundle (size, weight, tracking, transform-or-not) is
   theme-authored — evidence: one brand renders it semibold lowercase,
   Tsugite's docs render it uppercase+tracked. The name is stable, the
   look belongs to theme-default.
3. **Composition:** eyebrow + heading + description is a composition —
   `HeadingGroup`, rooted in `<hgroup>` (WHATWG: one h1–h6 plus p
   before/after — built for exactly this). Arranges Text + Heading +
   Text; owns no vocabulary (ADR-0005).

**Amended (Nicklas):** the eyebrow often carries a specific graphic
manner — own tracking, and not seldom a graphic element (a dot, an
icon). That's markup, not typography, i.e. the technical axis — so the
eyebrow is a **likely future primitive of its own** (`Eyebrow`: renders
a `p` root, owns icon/dot slot and its manner), by the same rule that
gives Button its icon-position. Decision: **now** the sweep uses Text +
quantization (nothing built on speculation); **later** Eyebrow gets
defined as its own component when the design language actually demands
the graphic element. HeadingGroup and the p-semantics hold either way.

Sweep note: control-room guide-labels / map badges are judged per
instance — instrument labels quantize to label-small.

## To verify in T2

- Which class-C census rows map onto these roles (label text in fields,
  cell-labels in fixtures, guide-labels/kickers in control-room)?
- Does an uppercase-kicker style deserve a voice/variant of its own or
  is it a label-voice modifier?
- Naming: `voice` vs Heading's existing `variant` — one word for the
  visual axis across the family (field-dictionary rule: one word answers
  one question).
- Code voice: where does inline code/`code` element fit (Prose vs the
  family)?
