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
  ADR; every component has a suite that measures rendered DOM. The same
  DOM from Astro, React and Vue, byte for byte.

## The order of work: from the worst case backwards

Most projects start with the simple case — one colour axis, the component
in its prettiest state — and add the rest later. Every later state then
becomes an override of the first: dark mode as `.dark .Button`, contrast as
another layer, the phone as "the mobile version". The pretty case is the
base and everything else is a deviation from it. That is base-plus-override,
and it is the four examples above. Drift is not carelessness; it is the
consequence of the order.

Tsugite works the other way round. The full state space is laid out first:
every colour axis that can exist (voice, volume, four modes, forced colours),
every layout state (viewport tier, container state), every axis a component
can carry — and, for each axis, **who decides**: the region owns the voice,
the child owns its footprint, the composition owns placement. Then the
hardest state is built first and the simplest last. Light mode is one
column of four, not the default. The stacked Teaser is one container state
of two, not the mobile version. The pretty case is just a cell, and there is
no base left to override.

Within that space the building order is still primitives first — inputs,
buttons, text — out to compositions of primitives, to regions that host
them, to page layout. That is atomic design's shape with one difference:
the tiers are sorted by **ownership**, not size. A primitive owns its
vocabulary and is content; a composition owns arrangement and theme claims
and no vocabulary; a region governs a capability over what it hosts. So
when a component lacks a capability you need, that is a contract question
with three outcomes, none of them CSS: it is a variant of something that
exists, so a new cell on an existing axis, with its gate; or it is not, so a
new name, a verb, a list of what it refuses, assembled from the primitives;
or someone wants to bend the old one, and the old one's refusal is what
protects it.

The counterweight, so this does not become thirty cells nobody uses: the
*shape* of the space is enumerated up front, the *values* of its cells are
written when a real case needs them (ADR-0005 rule 3), and a cell the
combination law does not whitelist does not exist (ADR-0006 §6). Every axis
known and every owner named from day one; not every cell filled.

The result: "where does this come from?" always has a one-line answer.
That is the whole point.

---

Where to go next: the repo guide in `CLAUDE.md`, the doctrine in
`packages/tsugite/docs/css-doctrine.md`, the ledger in
`packages/tsugite/docs/adr/`, the token registry in
`packages/tsugite/docs/tokens.generated.md`.
