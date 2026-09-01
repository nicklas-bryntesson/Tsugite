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
import { raw } from "./raw.color.tokens.js";

export const semanticColorTokens = {
  // ── Surfaces ────────────────────────────────────────────────────────────────
  /** The page/content ground. */
  "--color-surface-page": {
    light: "var(--COLOR-SUMI-00)",
    dark: "var(--COLOR-SUMI-90)",
    "light-contrast": "var(--COLOR-SUMI-00)",
    "dark-contrast": "var(--COLOR-SUMI-95)",
  },
  /** Site chrome: header, footer, table heads. */
  "--color-surface-chrome": {
    light: "var(--COLOR-SUMI-10)",
    dark: "var(--COLOR-SUMI-85)",
    "light-contrast": "var(--COLOR-SUMI-00)",
    "dark-contrast": "var(--COLOR-SUMI-95)",
  },
  /** Inset/demo/placeholder surfaces. */
  "--color-surface-inset": {
    light: "var(--COLOR-SUMI-20)",
    dark: "var(--COLOR-SUMI-80)",
    "light-contrast": "var(--COLOR-SUMI-00)",
    "dark-contrast": "var(--COLOR-SUMI-95)",
  },

  // ── Text ────────────────────────────────────────────────────────────────────
  "--color-text-primary": {
    light: "var(--COLOR-SUMI-90)",
    dark: "var(--COLOR-SUMI-05)",
    "light-contrast": "var(--COLOR-SUMI-95)",
    "dark-contrast": "var(--COLOR-SUMI-00)",
  },
  "--color-text-secondary": {
    light: "var(--COLOR-SUMI-60)",
    dark: "var(--COLOR-SUMI-35)",
    "light-contrast": "var(--COLOR-SUMI-95)",
    "dark-contrast": "var(--COLOR-SUMI-00)",
  },

  // ── Interactive (buttons, links — the tone-interactive slots) ──────────────
  "--color-interactive-primary": {
    light: "var(--COLOR-AI-80)",
    dark: "var(--COLOR-AI-30)",
    "light-contrast": "var(--COLOR-SUMI-95)",
    "dark-contrast": "var(--COLOR-SUMI-00)",
  },
  "--color-interactive-primary-hover": {
    light: "var(--COLOR-AI-90)",
    dark: "var(--COLOR-AI-20)",
    "light-contrast": "var(--COLOR-SUMI-95)",
    "dark-contrast": "var(--COLOR-SUMI-00)",
  },
  "--color-interactive-onPrimary": {
    light: "var(--COLOR-SUMI-00)",
    dark: "var(--COLOR-SUMI-95)",
    "light-contrast": "var(--COLOR-SUMI-00)",
    "dark-contrast": "var(--COLOR-SUMI-95)",
  },
  "--color-interactive-secondary-text": {
    light: "var(--COLOR-AI-80)",
    dark: "var(--COLOR-AI-20)",
    "light-contrast": "var(--COLOR-SUMI-95)",
    "dark-contrast": "var(--COLOR-SUMI-00)",
  },
  "--color-interactive-secondary-border": {
    light: "var(--COLOR-AI-30)",
    dark: "var(--COLOR-AI-60)",
    "light-contrast": "var(--COLOR-SUMI-95)",
    "dark-contrast": "var(--COLOR-SUMI-00)",
  },
  "--color-interactive-secondary-hoverSurface": {
    light: "var(--COLOR-SUMI-10)",
    dark: "var(--COLOR-SUMI-80)",
    "light-contrast": "transparent",
    "dark-contrast": "transparent",
  },
  "--color-interactive-hoverRing": {
    light: mix("--COLOR-AI-20", 60),
    dark: mix("--COLOR-AI-60", 60),
    "light-contrast": "var(--COLOR-SUMI-95)",
    "dark-contrast": "var(--COLOR-SUMI-00)",
  },
  "--color-focus-ring": {
    light: "var(--COLOR-AI-50)",
    dark: "var(--COLOR-AI-30)",
    "light-contrast": "var(--COLOR-SUMI-95)",
    "dark-contrast": "var(--COLOR-SUMI-00)",
  },

  /** Decorative promo glow (CtaButton) — calm/off in the contrast modes. */
  "--color-interactive-glow": {
    light: "var(--COLOR-AI-50)",
    dark: "var(--COLOR-AI-40)",
    "light-contrast": "transparent",
    "dark-contrast": "transparent",
  },

  /** Scrim over hero media — heavier where legibility is law. */
  "--color-scrim-media": {
    light: mix("--COLOR-AI-90", 55),
    dark: mix("--COLOR-SUMI-95", 65),
    "light-contrast": mix("--COLOR-SUMI-95", 78),
    "dark-contrast": mix("--COLOR-SUMI-95", 78),
  },

  // ── Disabled — WCAG-exempt, midtones stay in the contrast modes ────────────
  "--color-disabled-text": {
    light: "var(--COLOR-SUMI-70)",
    dark: "var(--COLOR-SUMI-40)",
    "light-contrast": "var(--COLOR-SUMI-70)",
    "dark-contrast": "var(--COLOR-SUMI-40)",
  },
  "--color-disabled-surface": {
    light: "var(--COLOR-SUMI-05)",
    dark: "var(--COLOR-SUMI-85)",
    "light-contrast": "var(--COLOR-SUMI-05)",
    "dark-contrast": "var(--COLOR-SUMI-85)",
  },
  "--color-disabled-border": {
    light: "var(--COLOR-SUMI-20)",
    dark: "var(--COLOR-SUMI-75)",
    "light-contrast": "var(--COLOR-SUMI-20)",
    "dark-contrast": "var(--COLOR-SUMI-75)",
  },

  // ── Feedback (intent: destructive/success — shared with Notice later) ──────
  "--color-feedback-error": {
    light: raw("KAKI-50"),
    dark: raw("KAKI-30"),
    "light-contrast": raw("KAKI-80"),
    "dark-contrast": raw("KAKI-10"),
  },
  "--color-feedback-onError": {
    light: "var(--COLOR-SUMI-00)",
    dark: "var(--COLOR-SUMI-95)",
    "light-contrast": "var(--COLOR-SUMI-00)",
    "dark-contrast": "var(--COLOR-SUMI-95)",
  },
  "--color-feedback-success": {
    light: raw("MATCHA-50"),
    dark: raw("MATCHA-30"),
    "light-contrast": raw("MATCHA-80"),
    "dark-contrast": raw("MATCHA-10"),
  },
  "--color-feedback-warning": {
    light: raw("KOHAKU-50"),
    dark: raw("KOHAKU-30"),
    "light-contrast": raw("KOHAKU-10"),
    "dark-contrast": raw("KOHAKU-10"),
  },
  "--color-feedback-info": {
    light: raw("AI-60"),
    dark: raw("AI-30"),
    "light-contrast": raw("AI-80"),
    "dark-contrast": raw("AI-10"),
  },
  "--color-feedback-onWarning": {
    light: raw("SUMI-95"),
    dark: raw("SUMI-95"),
    "light-contrast": raw("SUMI-95"),
    "dark-contrast": raw("SUMI-95"),
  },
  "--color-feedback-onSuccess": {
    light: "var(--COLOR-SUMI-00)",
    dark: "var(--COLOR-SUMI-95)",
    "light-contrast": "var(--COLOR-SUMI-00)",
    "dark-contrast": "var(--COLOR-SUMI-95)",
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
    light: "var(--COLOR-SUMI-30)",
    dark: "var(--COLOR-SUMI-60)",
    "light-contrast": "var(--COLOR-SUMI-95)",
    "dark-contrast": "var(--COLOR-SUMI-00)",
  },
  "--color-border-subtle": {
    light: "var(--COLOR-SUMI-20)",
    dark: "var(--COLOR-SUMI-70)",
    "light-contrast": "var(--COLOR-SUMI-95)",
    "dark-contrast": "var(--COLOR-SUMI-00)",
  },
};
