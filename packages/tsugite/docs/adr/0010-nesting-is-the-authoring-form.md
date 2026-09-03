# ADR-0010: Nesting is the authoring form — the pipeline lowers it to the support contract

**Status:** Accepted · 2026-09-03

## Context

Component CSS in this repo arrived in two dialects. The components
written in-house (Button, Card, Heading, Teaser, Prose, Text …) use
native CSS nesting: one root selector, parts and states as `&` rules
inside it. The components brought in from reference-components arrived
flat — every part a fully-qualified `.Root .part` rule — and several
carry the comment "flat, fully-qualified rule (ADR-0019)". That number
belongs to the reference repo's ledger, not this one: the flat form was
a decision nobody in this repo made.

Reading the flat form means reading the root selector once per section.
Reading the nested form means reading the component once, as a tree —
which is how the doctrine already thinks about it (root owns tokens,
parts consume them, states gate them).

Meanwhile the build shipped whatever was authored. Vite 8 minifies with
esbuild against its "baseline widely available" target, which includes
nesting, so nothing was lowered: `apps/docs/dist` contained raw
`& tbody { & th, & td … }`. The nested half of the codebase already
paid the ~8% support cost (caniuse, SE, 2026-09) without that cost ever
having been decided.

## Decision

1. **Nesting is the authoring form.** A component's stylesheet is one
   root rule; parts, states and variants are nested rules beginning with
   `&`. Tier and support gates (`@media`, `@container`, `@supports`,
   ADR-0001/0007/0009) may sit inside the root rule as nested at-rules —
   the output is the same bounded declaration, the source keeps the
   component in one tree.
2. **One root per block, `&` first.** A nested rule's parent is a
   single compound selector, and `&` opens the nested selector. Lowering
   then reproduces the flat form exactly. When the parent is a selector
   *list*, lowering must wrap it in `:is()`, whose specificity is the
   maximum of its arguments — a specificity the author did not write.
   Parent lists are therefore not nested into; author them flat.
3. **The support contract is one file: `/.browserslistrc`.** The pipeline
   (Lightning CSS, configured once in `apps/docs/astro.config.mjs`)
   lowers nesting, adds prefixes and minifies against that list, in one
   pass. No other place states a browser target.
4. **The lowering is a polyfill under ADR-0009.** It is deletable by
   construction: lowered output is the flat form the source would
   otherwise have been written in, so removing the transform on
   deletion day changes nothing for the supported set. The nesting gate
   test proves both halves — that every stylesheet lowers to `&`-free
   CSS today, and that the targets still require it. When the
   browserslist no longer needs the lowering, the gate says so, and
   the transform is removed.

## Alternatives rejected

- **PostCSS (`postcss-nesting` + `autoprefixer`).** Works, and was the
  team's habit. Rejected for the second tool in the chain: esbuild
  would still minify, so the browser target would be stated twice
  (browserslist for PostCSS, Vite's target for esbuild). One target,
  one pass.
- **Keep the flat form as the norm.** Rejected: the root selector
  repeated per section is noise that hides the tree, and the in-house
  half of the codebase had already voted with its feet.
- **Ship native nesting, accept the cost.** Rejected: an 8% cut taken by
  accident is not a threshold decision. It may become one, through the
  gate, on the day the browserslist says so.

## Consequences

- `docs/css-doctrine.md` §7 codifies the authoring form.
- Flat components are ported one per PR, mechanically: the same
  declarations, nested. Comments citing "ADR-0019" are rewritten to cite
  this ADR. The port changes no computed style; the conformance suites
  are the proof.
- A source-distributed package places the polyfill in the consumer's
  pipeline (ADR-0009's documented cost): a consumer that does not run
  Lightning CSS or an equivalent ships native nesting. This is part of
  the package's support contract until deletion day.
- Astro 7 applies its own scoping to `<style>` blocks before Lightning
  CSS sees them and excludes the nesting feature from that first pass,
  so nested source scopes correctly; lowering happens in Vite's build.
