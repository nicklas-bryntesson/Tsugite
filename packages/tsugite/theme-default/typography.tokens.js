// THE TYPOGRAPHY TABLES (ADR-0003 extended to type)
//
// The whole typography map as data — voices (role bundles) and size
// ramps (explicit stops per tier, ADR-0001; WIDE equals DESKTOP: type
// stops growing). This factory GENERATES
// styles/tokens/typography/typography.generated.css — humans edit here,
// never there. validateTypography() (collector.js) refuses incomplete
// voices and ramps; tests/typographyTokens.test.ts cross-validates
// against the component family contract (lib/typographyFamily.ts) so
// the voices the family speaks and the voices the theme defines can
// never drift apart.

export const TIERS = ["floor", "mobile", "desktop", "wide"];

/** RAW families and weights — the rebrand surface.

    metrics are the typeface's geometry as em fractions (ascent above /
    descent below the baseline, capHeight above it), the constants the
    faux-trim math needs to emulate text-box-edge: cap alphabetic: the
    em box is ascent+descent (NOT 1!), the cap gap is ascent−capHeight.
    Values below were probed via canvas TextMetrics (Chromium's reading
    of the font tables); the step-2 plan is to read them exactly from
    the woff2 files at build. A family without metrics refuses to
    build. */
export const typeFamilies = {
  "--FIRA-SANS": {
    stack: "'Fira Sans', system-ui, sans-serif",
    metrics: { ascent: 0.93, capHeight: 0.692, descent: 0.26 },
  },
  "--NOTO-SERIF": {
    stack: "'Noto Serif', georgia, serif",
    metrics: { ascent: 1.07, capHeight: 0.714, descent: 0.29 },
  },
  "--ABRIL-FATFACE": {
    stack: "'Abril Fatface', georgia, serif",
    metrics: { ascent: 1.06, capHeight: 0.7, descent: 0.29 },
  },
  "--INTER": {
    stack: "'Inter', system-ui, sans-serif",
    metrics: { ascent: 0.97, capHeight: 0.728, descent: 0.24 },
  },
  "--MONOSPACE": {
    stack: "monospace",
    metrics: { ascent: 0.8, capHeight: 0.7, descent: 0.2 },
  },
};

export const typeWeights = {
  "--FIRA-SANS-600": "600",
  "--NOTOS-SERIF-400": "400",
  "--NOTOS-SERIF-700": "700",
  "--ABRIL-FATFACE-400": "400",
  "--INTER-400": "400",
  "--MONOSPACE-400": "400",
};

/** The voices — complete role bundles. A voice with `inline: true`
    (code) carries no block metrics: it rides the run it sits in.

    Every block metric (lineHeight, letterSpacing, featureSettings,
    baselineOffset) is a scalar OR a tier map — the designer's
    per-range twist, same shape as the size ramps:

      letterSpacing: "-0.01em"                       // one value, all tiers
      letterSpacing: { floor: "0", mobile: "-0.005em",
                       desktop: "-0.01em", wide: "-0.01em" }

    A tier map carries EVERY tier or the build refuses. Components
    consume the same semantic token either way — responsiveness is a
    supplier decision, invisible at the seam.

    baselineOffset is the sitting-in-the-box knob: a PURE FACTOR the
    trim engine multiplies by the element's font size (0 = the typeface
    sits perfectly, 0.03 = massage 3% of the em box). Calibrate per
    typeface against the native trim branch in the control room. */
export const typeVoices = {
  heading: {
    family: "--FIRA-SANS",
    weights: { default: "--FIRA-SANS-600" },
    lineHeight: "1.1",
    letterSpacing: "normal",
    featureSettings: "normal",
    baselineOffset: "0",
  },
  display: {
    family: "--ABRIL-FATFACE",
    weights: { default: "--ABRIL-FATFACE-400" },
    lineHeight: "0.95",
    letterSpacing: "-0.01em",
    featureSettings: "normal",
    baselineOffset: "0",
  },
  body: {
    family: "--NOTO-SERIF",
    weights: { default: "--NOTOS-SERIF-400", bold: "--NOTOS-SERIF-700" },
    lineHeight: "1.5",
    letterSpacing: "normal",
    featureSettings: "normal",
    baselineOffset: "0",
  },
  code: {
    family: "--MONOSPACE",
    weights: { default: "--MONOSPACE-400" },
    inline: true,
  },
  label: {
    family: "--INTER",
    weights: { default: "--INTER-400" },
    lineHeight: "1.3",
    letterSpacing: "normal",
    featureSettings: "normal",
    baselineOffset: "0",
  },
  preamble: {
    // The standfirst voice: body's family at ingress metrics — big text
    // at body's 1.5 goes airy, so the preamble owns a tighter leading.
    family: "--NOTO-SERIF",
    weights: { default: "--NOTOS-SERIF-400" },
    lineHeight: "1.35",
    letterSpacing: "normal",
    featureSettings: "normal",
    baselineOffset: "0",
  },
};

/** The size ramps — explicit stops per tier, no scale math (ADR-0001).
    Every fontSize token is emitted as FLOOR-style RAW constants plus a
    semantic calc(× --TYPE-SCALE). Preamble stops sit ≥ body-large on
    their tier, or it is no preamble. */
export const typeSizes = {
  "h1": { floor: "2rem", mobile: "2.5rem", desktop: "3.5rem", wide: "3.5rem" },
  "h2": { floor: "1.75rem", mobile: "2.25rem", desktop: "2.5rem", wide: "2.5rem" },
  "h3": { floor: "1.5rem", mobile: "1.75rem", desktop: "2rem", wide: "2rem" },
  "h4": { floor: "1.25rem", mobile: "1.375rem", desktop: "1.5rem", wide: "1.5rem" },
  "h5": { floor: "1.0625rem", mobile: "1.125rem", desktop: "1.25rem", wide: "1.25rem" },
  "h6": { floor: "1rem", mobile: "1rem", desktop: "1.125rem", wide: "1.125rem" },

  "display-1": { floor: "2.25rem", mobile: "3.5rem", desktop: "4rem", wide: "4rem" },
  "display-2": { floor: "2rem", mobile: "3rem", desktop: "3.5rem", wide: "3.5rem" },
  "display-3": { floor: "1.75rem", mobile: "2.5rem", desktop: "3rem", wide: "3rem" },

  "body-small": { floor: "0.75rem", mobile: "0.75rem", desktop: "1rem", wide: "1rem" },
  "body": { floor: "1rem", mobile: "1.125rem", desktop: "1.25rem", wide: "1.25rem" },
  "body-large": { floor: "1.25rem", mobile: "1.5rem", desktop: "1.75rem", wide: "1.75rem" },

  "code": { floor: "0.75rem", mobile: "0.75rem", desktop: "1rem", wide: "1rem" },

  "label-small": { floor: "0.75rem", mobile: "0.75rem", desktop: "0.85rem", wide: "0.85rem" },
  "label": { floor: "0.9375rem", mobile: "1rem", desktop: "1.125rem", wide: "1.125rem" },
  "label-large": { floor: "1.0625rem", mobile: "1.25rem", desktop: "1.375rem", wide: "1.375rem" },

  "preamble-small": { floor: "1.125rem", mobile: "1.25rem", desktop: "1.375rem", wide: "1.375rem" },
  "preamble": { floor: "1.25rem", mobile: "1.5rem", desktop: "1.625rem", wide: "1.625rem" },
  "preamble-large": { floor: "1.375rem", mobile: "1.625rem", desktop: "1.875rem", wide: "1.875rem" },
};

/** The (voice, size) → fontSize-token mapping the family contract uses:
    heading "3" → h3, display "2" → display-2, quiet voices sm/md/lg →
    <voice>-small / <voice> / <voice>-large. */
export function sizeTokenName(voice, size) {
  if (voice === "heading") return `h${size}`;
  if (voice === "display") return `display-${size}`;
  if (size === "md") return voice;
  return `${voice}-${size === "sm" ? "small" : "large"}`;
}
