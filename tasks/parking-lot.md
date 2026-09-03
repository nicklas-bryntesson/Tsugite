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
