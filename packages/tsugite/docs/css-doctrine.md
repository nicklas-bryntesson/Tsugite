# CSS doctrine — anti-drift rules

> **Status: ADOPTED 2026-09-02.** Distilled from the AiPoc
> predecessor (`.claude/patterns/css.md`, `.claude/contracts/tokens.md`)
> and reconciled against Tsugite's implemented reality. The resolution
> chain rule was reformulated after review against `Button.css` — the
> predecessor's "no var() chains longer than one level" did not survive
> contact with the ownership chain.

Models (and humans) drift back toward normative CSS: mobile-first
base-plus-override cascades, utility classes, specificity escalation,
defensive fallbacks. This document is the counterweight. The stance in
one line:

**One truth active at a time. Explicit over implicit, bounded over
cascading, presence over absence.**

---

## 1. The gate pattern — bounded declarations (ADR-0007)

Don't declare a property only to override it. Bound each declaration to
the exact context where it is valid — a viewport tier (ADR-0001), a
variant, a state.

- A property that varies by attribute never appears in the base rule.
  It enters the cascade through a gate selector; variants set the
  private `--_*` slot the gate consumes.
- The base rule holds only unconditional properties — true for every
  instance, every state.
- `--_*` slots carry no value in the base. They exist once a variant
  sets them.
- Defaults live in the component layer, never in CSS. The component
  always outputs its `data-*` attributes, so CSS never guards against
  absence — impossible states cannot be authored, so they are not
  defended against.

Lineage: Hodgson, [Generic CSS, Mobile First](https://www.smashingmagazine.com/2018/12/generic-css-mobile-first/)
(2018), extended from the viewport axis to every axis.

## 2. The resolution chain — one hop per layer, one fallback per seam (ADR-0008)

A `var()` chain may be as long as the ownership chain (ADR-0005):

```
component slot (--_*) → theme claim (--theme-*) → semantic (--color-*) → RAW
```

- Never skip a layer. Each layer references exactly the layer below it.
- At most **one** fallback per chain, and only at the theme seam:
  `var(--theme-x, var(--color-y))`. There, absence is the contract —
  the theme donut is present or it is not, and the same declaration
  covers both worlds.
- Nested defensive fallbacks — `var(--a, var(--b, var(--c, …)))` — are
  forbidden. A chain describes ownership, never guesswork.

## 3. Forbidden reflexes — the no-list

- **No mobile-first base + progressive overrides.** Declarations live
  inside the tier where they are valid (ADR-0001), not in a base that
  gets unwound per breakpoint.
- **No utility classes.** Semantic HTML; variants via `data-*`.
- **No `!important`.**
- **No specificity escalation** as conflict resolution.
- **No `@layer`.** No graceful degradation: unsupported layers collapse
  into one specificity pool and the failure mode is invisible — the bug
  reads as a cascade problem, not a support problem.
- **No defaults in CSS** (see §1) and **no defensive fallbacks**
  (see §2).

## 4. Cascade usage

The cascade is used intentionally, never as an escape hatch.

- ✅ Donut-scoped theme overrides, appearance overrides, semantic
  remapping.
- ❌ Conflict resolution, specificity wars, overriding component rules
  downstream.

## 5. Progressive enhancement — gated, happy path last, deletable (ADR-0009)

Defensive design applied to front-end structure: guards first, the
happy path last, authored as the end state.

- Enhancement is gated with `@supports`. Branches are bounded and
  self-contained — values never bleed between them. The support axis is
  an axis like every other (§1).
- Fallbacks are guards written to die. A fallback branch or a compile
  polyfill is allowed only if removal is a no-op for the supported set
  — by construction, or proven by running the conformance suites with
  the mechanism disabled (the deletion-readiness check).
- When a feature crosses the support threshold, the fallback branch,
  its gate, or the polyfill package is deleted wholesale. The surviving
  modern branch is never edited by the deletion.

## 6. The inspector test

Inspecting any element must show exactly one active rule per property —
no strikethrough noise — and the resolution must read unambiguously:
component slot → theme claim → semantic → raw. If the inspector cannot
tell which truth is active, the doctrine has been violated.
