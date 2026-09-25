# ADR-0008: The resolution chain — one hop per layer, one fallback per seam

**Status:** Accepted · 2026-09-02

## Context

Components resolve their values through the ownership chain (ADR-0005):

```
component slot (--_*) → theme claim (--theme-*) → semantic (--color-*) → RAW
```

The AiPoc predecessor's manifest ruled "no var() chains longer than one
level". That rule is falsified by the implemented system —
`Button.css` resolves a primary background through four to five hops —
but its intent (forbidding defensive fallback pyramids) remains sound.
The rule needed reformulation, and the mechanism for themed vs unthemed
contexts needed a recorded decision, since several alternatives were
debated in the predecessor.

## Decision

A `var()` chain may be as long as the ownership chain, under two
constraints:

1. **One hop per layer.** Each layer references exactly the layer below
   it. Never skip a layer.
2. **At most one fallback per chain, only at the theme seam:**
   `var(--theme-x, var(--color-y))`. There, absence is the contract —
   the theme donut is present or it is not, and the same declaration
   covers both worlds. This is the simplification that removes a
   parallel rule set: without the seam fallback every component would
   need an authored themed path and an authored unthemed path, or every
   theme would have to define the full component token surface.

Nested defensive fallbacks — `var(--a, var(--b, var(--c, …)))` — are
forbidden. A chain describes ownership, never guesswork.

**Amendment 2026-09-25 — a second seam.** Since ADR-0012 law b a voice's
optional stop is a seam of the same kind: `var(--fontWeight-label-bold,
var(--fontWeight-label))` — the theme gives the bold weight or it does
not, and one declaration covers both. Rule 2 reads: one fallback per
expression, only at a seam where absence is the contract; the seams are
the theme claim and a voice's optional stop. Measured the same day: no
expression in any component nests deeper than one fallback, and every
one sits at one of the two; Button's "four to five hops" are hops
between layers, one declaration each, not a pyramid.

## Alternatives rejected

- **`@layer`** — layer order beats specificity, so context would always
  win. Rejected: no graceful degradation (unsupported layers collapse
  into one specificity pool with unpredictable source order) and the
  failure mode is invisible — the bug reads as a cascade problem, not a
  support problem.
- **Specificity escalation / `!important`** — an arms race with no
  stable end state; conflicts get resolved by force instead of by
  ownership.
- **Parallel themed/unthemed rule sets** — doubles the resolve map and
  drifts; the seam fallback expresses both worlds in one declaration.

## Consequences

- `docs/css-doctrine.md` §2 codifies the rule; §3 carries the `@layer`
  rejection into the no-list.
- The inspector resolution reads unambiguously: component slot → theme
  claim → semantic → raw. Which truth is active is visible per element.
- Theme donuts opt in by defining `--theme-*` tokens; their absence
  costs nothing and requires no authored fallback path.
