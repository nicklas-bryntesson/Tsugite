// SEMANTIC COLOR FACTORY (ADR-0003/0004)
//
// The four-mode tables live HERE — the only layer that may reference RAW
// (--COLOR-*). Components never see these names; they consume the semantic
// tokens through appearance-free pointers.
//
// Reading order per token: light · dark · light-contrast · dark-contrast.
// Mixes are RECIPES (mix(base, pct, with)) — computed at build by the color
// engine, spec-faithful oklch interpolation, gamut-mapped sRGB emission.
// Dark/contrast values are a MECHANICAL FIRST DRAFT (neutral ramp inverted,
// midtones collapsed in contrast modes) — flagged for taste-tuning.

import { mix } from "../engine/color-engine.js";

export const semanticColorTokens = {
  // ── Surfaces ────────────────────────────────────────────────────────────────
  /** The page/content ground. */
  "--color-surface-page": {
    light: "var(--COLOR-N00)",
    dark: "var(--COLOR-N90)",
    "light-contrast": "var(--COLOR-N00)",
    "dark-contrast": "var(--COLOR-N95)",
  },
  /** Site chrome: header, footer, table heads. */
  "--color-surface-chrome": {
    light: "var(--COLOR-N10)",
    dark: "var(--COLOR-N85)",
    "light-contrast": "var(--COLOR-N00)",
    "dark-contrast": "var(--COLOR-N95)",
  },
  /** Inset/demo/placeholder surfaces. */
  "--color-surface-inset": {
    light: "var(--COLOR-N20)",
    dark: "var(--COLOR-N80)",
    "light-contrast": "var(--COLOR-N00)",
    "dark-contrast": "var(--COLOR-N95)",
  },

  // ── Text ────────────────────────────────────────────────────────────────────
  "--color-text-primary": {
    light: "var(--COLOR-N90)",
    dark: "var(--COLOR-N05)",
    "light-contrast": "var(--COLOR-N95)",
    "dark-contrast": "var(--COLOR-N00)",
  },
  "--color-text-secondary": {
    light: "var(--COLOR-N60)",
    dark: "var(--COLOR-N35)",
    "light-contrast": "var(--COLOR-N95)",
    "dark-contrast": "var(--COLOR-N00)",
  },

  // ── Interactive (buttons, links — the tone-interactive slots) ──────────────
  "--color-interactive-primary": {
    light: "var(--COLOR-B80)",
    dark: "var(--COLOR-B30)",
    "light-contrast": "var(--COLOR-N95)",
    "dark-contrast": "var(--COLOR-N00)",
  },
  "--color-interactive-primary-hover": {
    light: "var(--COLOR-B90)",
    dark: "var(--COLOR-B20)",
    "light-contrast": "var(--COLOR-N95)",
    "dark-contrast": "var(--COLOR-N00)",
  },
  "--color-interactive-onPrimary": {
    light: "var(--COLOR-N00)",
    dark: "var(--COLOR-N95)",
    "light-contrast": "var(--COLOR-N00)",
    "dark-contrast": "var(--COLOR-N95)",
  },
  "--color-interactive-secondary-text": {
    light: "var(--COLOR-B80)",
    dark: "var(--COLOR-B20)",
    "light-contrast": "var(--COLOR-N95)",
    "dark-contrast": "var(--COLOR-N00)",
  },
  "--color-interactive-secondary-border": {
    light: "var(--COLOR-B30)",
    dark: "var(--COLOR-B60)",
    "light-contrast": "var(--COLOR-N95)",
    "dark-contrast": "var(--COLOR-N00)",
  },
  "--color-interactive-secondary-hoverSurface": {
    light: "var(--COLOR-N10)",
    dark: "var(--COLOR-N80)",
    "light-contrast": "transparent",
    "dark-contrast": "transparent",
  },
  "--color-interactive-hoverRing": {
    light: mix("--COLOR-B20", 60),
    dark: mix("--COLOR-B60", 60),
    "light-contrast": "var(--COLOR-N95)",
    "dark-contrast": "var(--COLOR-N00)",
  },
  "--color-focus-ring": {
    light: "var(--COLOR-B50)",
    dark: "var(--COLOR-B30)",
    "light-contrast": "var(--COLOR-N95)",
    "dark-contrast": "var(--COLOR-N00)",
  },

  /** Decorative promo glow (CtaButton) — calm/off in the contrast modes. */
  "--color-interactive-glow": {
    light: "var(--COLOR-B50)",
    dark: "var(--COLOR-B40)",
    "light-contrast": "transparent",
    "dark-contrast": "transparent",
  },

  /** Scrim over hero media — heavier where legibility is law. */
  "--color-scrim-media": {
    light: mix("--COLOR-B90", 55),
    dark: mix("--COLOR-N95", 65),
    "light-contrast": mix("--COLOR-N95", 78),
    "dark-contrast": mix("--COLOR-N95", 78),
  },

  // ── Disabled — WCAG-exempt, midtones stay in the contrast modes ────────────
  "--color-disabled-text": {
    light: "var(--COLOR-N70)",
    dark: "var(--COLOR-N40)",
    "light-contrast": "var(--COLOR-N70)",
    "dark-contrast": "var(--COLOR-N40)",
  },
  "--color-disabled-surface": {
    light: "var(--COLOR-N05)",
    dark: "var(--COLOR-N85)",
    "light-contrast": "var(--COLOR-N05)",
    "dark-contrast": "var(--COLOR-N85)",
  },
  "--color-disabled-border": {
    light: "var(--COLOR-N20)",
    dark: "var(--COLOR-N75)",
    "light-contrast": "var(--COLOR-N20)",
    "dark-contrast": "var(--COLOR-N75)",
  },

  // ── Feedback (intent: destructive/success — shared with Notice later) ──────
  "--color-feedback-error": {
    light: "var(--COLOR-R50)",
    dark: mix("--COLOR-R50", 60, "--COLOR-N00"),
    "light-contrast": mix("--COLOR-R50", 55, "--COLOR-N95"),
    "dark-contrast": mix("--COLOR-R50", 45, "--COLOR-N00"),
  },
  "--color-feedback-onError": {
    light: "var(--COLOR-N00)",
    dark: "var(--COLOR-N95)",
    "light-contrast": "var(--COLOR-N00)",
    "dark-contrast": "var(--COLOR-N95)",
  },
  "--color-feedback-success": {
    light: "var(--COLOR-G50)",
    dark: mix("--COLOR-G50", 60, "--COLOR-N00"),
    "light-contrast": mix("--COLOR-G50", 45, "--COLOR-N95"),
    "dark-contrast": mix("--COLOR-G50", 55, "--COLOR-N00"),
  },
  "--color-feedback-warning": {
    light: "var(--COLOR-Y80)",
    dark: mix("--COLOR-Y80", 70, "--COLOR-N00"),
    "light-contrast": mix("--COLOR-Y80", 80, "--COLOR-N95"),
    "dark-contrast": mix("--COLOR-Y80", 55, "--COLOR-N00"),
  },
  "--color-feedback-info": {
    light: "var(--COLOR-B50)",
    dark: mix("--COLOR-B50", 65, "--COLOR-N00"),
    "light-contrast": "var(--COLOR-B80)",
    "dark-contrast": mix("--COLOR-B50", 50, "--COLOR-N00"),
  },
  "--color-feedback-onSuccess": {
    light: "var(--COLOR-N00)",
    dark: "var(--COLOR-N95)",
    "light-contrast": "var(--COLOR-N00)",
    "dark-contrast": "var(--COLOR-N95)",
  },


  /** Popup/elevation ink — a shadow reads as depth on light ground; on dark
      the same ink is invisible, so the dark rows are darker and more opaque
      (inherited from the reference seam's light-dark() pairs, now explicit
      mode rows — light-dark() leaves the generated output entirely). */
  "--color-shadow-popup": {
    light: [
      "0px 0px 1px rgba(3, 7, 18, 0.01)",
      "0px 1px 4px rgba(3, 7, 18, 0.01)",
      "0px 2px 9px rgba(3, 7, 18, 0.02)",
      "0px 4px 17px rgba(3, 7, 18, 0.02)",
      "0px 7px 26px rgba(3, 7, 18, 0.03)",
      "0px 10px 37px rgba(3, 7, 18, 0.03)",
      "0px 13px 51px rgba(3, 7, 18, 0.04)",
      "0px 17px 66px rgba(3, 7, 18, 0.04)",
      "0px 22px 84px rgba(3, 7, 18, 0.05)",
    ].join(", "),
    dark: [
      "0px 0px 1px rgba(0, 0, 0, 0.20)",
      "0px 1px 4px rgba(0, 0, 0, 0.20)",
      "0px 2px 9px rgba(0, 0, 0, 0.24)",
      "0px 4px 17px rgba(0, 0, 0, 0.24)",
      "0px 7px 26px rgba(0, 0, 0, 0.28)",
      "0px 10px 37px rgba(0, 0, 0, 0.28)",
      "0px 13px 51px rgba(0, 0, 0, 0.32)",
      "0px 17px 66px rgba(0, 0, 0, 0.32)",
      "0px 22px 84px rgba(0, 0, 0, 0.36)",
    ].join(", "),
    "light-contrast": [
      "0px 0px 1px rgba(3, 7, 18, 0.01)",
      "0px 1px 4px rgba(3, 7, 18, 0.01)",
      "0px 2px 9px rgba(3, 7, 18, 0.02)",
      "0px 4px 17px rgba(3, 7, 18, 0.02)",
      "0px 7px 26px rgba(3, 7, 18, 0.03)",
      "0px 10px 37px rgba(3, 7, 18, 0.03)",
      "0px 13px 51px rgba(3, 7, 18, 0.04)",
      "0px 17px 66px rgba(3, 7, 18, 0.04)",
      "0px 22px 84px rgba(3, 7, 18, 0.05)",
    ].join(", "),
    "dark-contrast": [
      "0px 0px 1px rgba(0, 0, 0, 0.20)",
      "0px 1px 4px rgba(0, 0, 0, 0.20)",
      "0px 2px 9px rgba(0, 0, 0, 0.24)",
      "0px 4px 17px rgba(0, 0, 0, 0.24)",
      "0px 7px 26px rgba(0, 0, 0, 0.28)",
      "0px 10px 37px rgba(0, 0, 0, 0.28)",
      "0px 13px 51px rgba(0, 0, 0, 0.32)",
      "0px 17px 66px rgba(0, 0, 0, 0.32)",
      "0px 22px 84px rgba(0, 0, 0, 0.36)",
    ].join(", "),
  },

  // ── Borders — the midtones that expose the modes ───────────────────────────
  "--color-border-default": {
    light: "var(--COLOR-N30)",
    dark: "var(--COLOR-N60)",
    "light-contrast": "var(--COLOR-N95)",
    "dark-contrast": "var(--COLOR-N00)",
  },
  "--color-border-subtle": {
    light: "var(--COLOR-N20)",
    dark: "var(--COLOR-N70)",
    "light-contrast": "var(--COLOR-N95)",
    "dark-contrast": "var(--COLOR-N00)",
  },
};
