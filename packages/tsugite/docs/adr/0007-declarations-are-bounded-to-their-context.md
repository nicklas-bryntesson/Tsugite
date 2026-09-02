# ADR-0007: Declarations are bounded to the context where they are valid

**Status:** Accepted · 2026-09-02

## Context

Normative CSS practice declares a property at a base level and overrides
it per breakpoint, variant, and state. The cost is well known: DevTools
fills with strikethrough rules, and finding the active truth requires
tracing the full cascade. It is also the default reflex AI models drift
back to — mobile-first base-plus-override, defensive defaults, guards
against states that cannot occur.

The counter-pattern was proven in the AiPoc predecessor across 18
components (its `.claude/patterns/css.md`), extending Hodgson's
[Generic CSS, Mobile First](https://www.smashingmagazine.com/2018/12/generic-css-mobile-first/)
(2018) from the viewport axis to every axis: don't declare a property
only to override it — bound each declaration to the exact context where
it is valid. Viewport tiers (ADR-0001) already apply this to one axis.

## Decision

Every axis is bounded. Concretely:

- A property that varies by attribute never appears in the base rule.
  It enters the cascade through a **gate selector** (the grouped
  selector declares the property once); individual variant selectors
  set the private `--_*` slot the gate consumes.
- The base rule holds only unconditional properties — true for every
  instance in every state.
- Private `--_*` slots carry no value in the base; they exist once a
  variant sets them.
- **Defaults live in the component layer, never in CSS.** The component
  always outputs its `data-*` attributes, so CSS never guards against
  absence — impossible states cannot be authored, so they are not
  defended against.

## Consequences

- `docs/css-doctrine.md` §1 and §3 codify the pattern and its no-list;
  the doctrine is read before any CSS is written.
- The inspector test holds: exactly one active rule per property, no
  strikethrough noise. Conformance suites can assert computed styles
  deterministically because any attribute combination has exactly one
  predictable output.
- A base-rule default or a progressive override is a review defect, not
  a style preference.
