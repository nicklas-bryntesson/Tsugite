// SITE SCAFFOLDING (ADR-0001, ADR-0011)
//
// The outer offset between content and viewport edge (Figma's "offset"),
// the site and content max widths, and the writing-direction sign.
// The offset follows the viewport-tier ladder (ADR-0001): FLOOR / MOBILE /
// DESKTOP / WIDE, explicit stops. The factory emits the RAW constants
// (--SITE-OFFSET-DESKTOP and its derived --SITE-OFFSET-DESKTOP-NEGATIVE),
// the semantic ramp (--site-offset, gated per tier) and the --dir sign.
// Humans edit here; base.generated.css is the output.

/** Scalar constants emitted verbatim into :root, in this order. */
export const siteConstants = {
  "--DIR-LTR": "1",
  "--DIR-RTL": "-1",

  // Legacy breakpoint constants. Nothing reads them and neither value is a
  // tier boundary (ADR-0001) — kept for a faithful port, parked for a decision.
  "--MOBILE-BREAKPOINT": "48.74rem",
  "--DESKTOP-BREAKPOINT": "75rem",

  "--SITE-MAXWIDTH": "106rem",
  "--CONTENT-MAXWIDTH": "64rem",
};

/** The offset ramp, rem per tier. */
export const siteOffset = { floor: "1rem", mobile: "1.5rem", desktop: "3rem", wide: "5rem" };

export const siteOffsetConstantName = (tier) => `--SITE-OFFSET-${tier.toUpperCase()}`;
