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

The result: "where does this come from?" always has a one-line answer.
That is the whole point.

---

Where to go next: the repo guide in `CLAUDE.md`, the doctrine in
`packages/tsugite/docs/css-doctrine.md`, the ledger in
`packages/tsugite/docs/adr/`, the token registry in
`packages/tsugite/docs/tokens.generated.md`.
