# TL;DR — what Tsugite is trying to solve

Tsugite is an attempt to answer one question: can a front-end system be
built so that, for every pixel, **exactly one rule is active — and you can
point at it?**

## Why that is hard in a classical model

In ordinary CSS the answer to "why is this button blue?" is almost always a
sum. Four deliberately blunt examples:

1. **The cascade as a stack.** A button gets its colour from `.Button`,
   overridden by `.Card .Button`, overridden again by
   `.Hero .Card .Button`, and once more by `.dark .Hero .Card .Button`.
   The colour you see is four rules fighting over specificity. Move the
   button from the hero to the footer and it changes colour without
   anyone touching the button.

2. **Mobile-first as layer upon layer.** `padding: 8px` in the base,
   `16px` at 640px, `24px` at 1024px. On an 1100px screen all three
   rules are true at once and the last one wins. To know what applies you
   have to add them up, and changing the base moves every screen.

3. **Variables that leak through walls.** A section sets `--color: white`
   for its own text. The card inside inherits it, the button inside the
   card inherits it, and suddenly the button's label is white on a white
   button. Nobody wrote a rule for the button. It bled in.

4. **Utility classes that move the design into the markup.**
   `class="p-4 md:p-6 lg:p-8 bg-blue-600 dark:bg-blue-400"`. The design
   now lives in a thousand HTML files. When the brand changes its blue,
   that is a grep, and every hit is a decision.

What these share: the truth is **spread out** — across cascade order,
specificity, source order, inheritance and markup at the same time. That
makes it impossible to reason about, for a person and for a model alike.

## What Tsugite does instead

- **Gates, not overrides.** A property is declared only in the context
  where it applies. No base that gets overridden. At 1100px there is one
  padding rule, not three.
- **Exactly one hop per layer.** A component's slot points at the theme
  channel, which points at the semantic token, which points at the raw
  value. Never past a layer; one fallback, at one known seam. "Why blue?"
  is a chain of four links you can follow in the inspector.
- **Attributes are the API.** `data-variant="error"`,
  `data-grow-inline="true"`. Every value on an axis has its own gate,
  the off value included, and the attribute is always written. No rule
  guesses at absence.
- **Nobody writes on anyone else's class.** A composition places its own
  parts; the child gets props. The button inside a Teaser does not know
  it is inside a Teaser.
- **Tokens are generated from tables** — four modes, validated for
  contrast and fidelity, with a registry of what exists. If a name is not
  in the registry, it does not exist.
- **Decisions in a ledger, contracts in the browser.** Every choice is an
  ADR; every component has a suite that measures rendered DOM.

## A component is a contract

The insight everything else rests on: a component is not a template that
happens to accept some props. It is a **contract over what may happen** —
which elements it may render as, which axes it has, which values each axis
takes, which combinations may exist at the same time, and what it refuses.
The contract defines the HTML that is an allowed outcome. Nothing else is.

Card, whole (`packages/tsugite/recipes/card.recipe.ts`):

```ts
export const card = {
  name: "Card",
  promise: "A visual frame around other components.",
  refuses: ["content of its own", "meaning — it is not a link, a region or a section"],
  class: "Card",
  element: { values: ["div", "article", "section", "li"], default: "div" },
  axes: {
    border: { type: "boolean", default: false },
    padding: { values: ["none", "sm", "md", "lg"], default: "md" },
    elevation: { values: ["none", "sm", "md", "lg"], default: "none" },
  },
  content: { empty: "suppress" },
} as const satisfies Recipe;
```

That is a table, not code. One resolver reads it and answers every question
about a set of props: render this tag with this class and these attributes,
render nothing (an empty card frames nothing), or refuse (`padding="xl"` is
not a smaller or larger guess; it is an error, shown where it happened). A
combination the table does not allow cannot be rendered by accident.

Two things follow, and both are the point.

**The CSS mounts on the outcome, not on the framework.** Because the
contract fixes the HTML, `Card.css` is written against exactly the
attributes the table can produce — one gate per value, nothing for values
that cannot occur. It does not know or care how the markup got to the
browser.

**Adapters become almost nothing.** `Card.astro` is 23 lines, `Card.tsx`
31, `Card.vue` 26: each hands its props to the resolver and prints what comes
back, in the host's idiom. The renderer tests hold all three to the same
fixture file — byte-identical markup for the same props, nothing for an
empty card, the same message for an invalid one. The fixture is JSON, so a
renderer in another language is held to the same file. A new framework is a
small adapter, not a port of the component.

This is also what ends prop explosion (below): the props are the axes the
table names, and the combinations are what the table allows. A new
situation does not get a prop; it gets a cell on an axis that exists, or it
is a new component with its own contract.

## The order of work: worst case first

Most systems build the default case first (light mode, wide screen, the
component at rest) and add every later state as an override: dark mode as
`.dark .Button`, the phone as "the mobile version".
That is the four examples above. Drift is a consequence of the order, not
of carelessness.

In component APIs the same order gives **prop explosion**: `dark`,
`compact`, `inverse`, `variant="hero-dark-compact"`. Every late state
becomes a prop, every combination a special case, until nobody can say
which combinations are meant to exist.

Tsugite reverses the order:

- **The whole state space first.** Every colour axis (voice, volume, four
  modes, forced colours), every layout state (viewport tier, container
  state), every component axis, and who owns each: the region owns the
  voice, the child its footprint, the composition placement.
- **The hardest state first.** Light mode is one column of four; the
  stacked Teaser is one container state of two. The default is a cell,
  not a base.
- **A prop is an axis**, never a combination and never a context. The prop
  count is the number of axes, not the number of situations.
- **Tiers by ownership, not size.** A primitive owns its vocabulary; a
  composition owns arrangement and no vocabulary; a region governs a
  capability over what it hosts. A missing capability is a contract
  question, never CSS: a new cell on an existing axis, a new component
  with its own refusals, or a refusal that protects the old one.
- **Shape up front, values on demand.** Every axis and owner is named from
  day one; a cell is written when a real case needs it, and a cell the
  combination law does not allow does not exist.

The result: "where does this come from?" always has a one-line answer.

---

Where to go next: the repo guide in `CLAUDE.md`, the doctrine in
`packages/tsugite/docs/css-doctrine.md`, the ledger in
`packages/tsugite/docs/adr/`, the token registry in
`packages/tsugite/docs/tokens.generated.md`.
