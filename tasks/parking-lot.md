# Parking lot — noticed during the typography sweep, not swept

- **Button's text engine is dead — everywhere, always** (found 2026-09-03
  by browser probe during the baseline-offset work). Button.css's
  `--_baselineOffset: var(--button--baselineOffset, 0)` defaults to a
  bare number, and `calc(<length> + 0)` is invalid-at-computed-value —
  so `.Button-text`'s leading compensation has never applied in ANY
  browser (no @supports gate there). Also: `--_fontBaselineOffset:
  var(--baseline-offset-label)` on line 10 is declared but never
  consumed (orphaned). Both are upstream findings (ref-comps, ADR-0002
  diffability): fixing changes button geometry that the whole alignment
  bench is calibrated against — needs its own pass with the field ×
  button rows as the instrument, and the family components' new
  factor-×-fontSize formula as the donor pattern.

## From the sweep (2026-09-02)

Non-typography drift observed while sweeping (2026-09-02). Each is a
future sweep or decision of its own; nothing here blocks anything.

- **The spacing/radius zoo.** Raw paddings, gaps, margins and radii
  everywhere the typography sweep walked (`.theme-cell` 1rem/0.75rem,
  fixture inline styles, page cards 1.25rem/0.5rem/999px pills, …).
  Same disease, different organ — needs its own census, map and ramp
  decisions (the `--size-*` scale exists).
- **CtaLinkButton's ghost tokens** — `--fontSize-cta` and
  `--fontFamily-button` don't exist in the semantic layer; the
  defensive fallbacks are the real values (ADR-0008 violation).
  Needs a voice decision: is CTA the label voice at a bigger stop, or
  its own voice?
- **The Eyebrow primitive** — the tracked-caps manner (letter-spacing +
  uppercase on map badges, pillar eyebrows, guide labels, table headers)
  is deliberately allowlisted raw until the Eyebrow component exists
  (notes-typography-components.md). When it lands, those allowlist rows
  should shrink to zero.
- **The pill component** — res-name/value chips, doc chips, badges share
  a shape (border, radius, small text, name/value pair). Nicklas: own
  component, defined after the sweep passes.
- **text-align as a swept property** — open question from the plan:
  Heading owns alignment via data-align; page-local text-align is
  arguably the same drift. Decide when the spacing sweep is scoped.

## From the nesting sweep (2026-09-04)

- **ToggleTip's public API lives on `:root`, not on the component.** Every
  other component carries its public tokens on its own root element;
  ToggleTip declares `--_toggletip-*` on `:root` and then re-maps them to
  `--_tt-*` on `toggle-tip`. That is why its stylesheet cannot be one tree
  (ADR-0010 port left the `:root` block top-level). Two questions for a
  separate pass: does the token grammar allow a component to claim
  document-global names at all, and should the custom-element root take the
  tokens directly, like the class-rooted components do? Upstream finding
  (reference-components, ADR-0002 diffability).
- **In-house Teaser and CoverComposition gate outside the root.** Both wrap
  `.Teaser { … }` / `.CoverComposition { … }` inside top-level `@supports`
  and `@container` blocks, repeating the root per gate — the nested form
  everywhere else, but doctrine §7 says the gate nests inside the root.
  Teaser also has bare descendant selectors without `&` (`img { … }`).
  Mechanical to fix; the equivalence proof from the sweep applies.

## From the base-table port (ADR-0011, 2026-09-04)

The port to the factory was faithful; these four are what it preserved
and did not decide. Each is a separate call.

- **The grid runs on its own ladder.** `grid.tokens.js`: steps
  base/mobile/tablet/desktop at 40 / 48 / 80rem, not the ADR-0001 tiers
  (21.25 / 48.75 / 90rem). Aligning it changes where columns flip on
  every grid consumer (utils/grids, CoverComposition) — threshold
  decision, measure first.
- **`--dir` lands on descendants of `:root`.** Emitted as
  `:root :not([dir="rtl"])` / `:root [dir="rtl"]` because the Sass source
  nested the selectors inside the `:root` mixin. No consumer today.
  Decide where the sign lives (`html[dir]`?) or delete it.
- **`--MOBILE-BREAKPOINT` (48.74rem) and `--DESKTOP-BREAKPOINT` (75rem)**
  are unused and 75rem is no boundary anywhere. Delete, or make them the
  tier boundaries and have the emitter read them.
- **The px twins (`--size-*-px`, `--SIZE-*-*-PX`) have no consumer.**
  They are now derived in the emitter; removing them is one line once
  the decision is that px spacing should not exist.
