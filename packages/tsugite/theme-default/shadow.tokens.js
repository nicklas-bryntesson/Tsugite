// SHADOW TINT — the recipe a ground's shadow ink is mixed by (docs/seams.md, lab case 7).
//
// A shadow takes the tone of the ground it falls on: the ground's surface, its lightness and
// chroma scaled down, at an alpha. Three knobs × four modes, authored here like every colour;
// dark mode amplifies a coloured glow, so its chroma and alpha are turned separately.
// A voice may override any knob in any mode (per voice, not per volume — decided
// 2026-10-17); the factory takes the voice's value where it exists, the global one
// otherwise, the same pattern as a voice's optional stop (ADR-0012 law b). The factory
// precomputes the inks at build (engine/color-engine.js tint): the floor lacks relative
// colour, so nothing here is mixed at runtime.
//
// Reading order per knob: light · dark · light-contrast · dark-contrast. The contrast modes
// carry no shadow (alpha 0): depth there is a border's job.

const t = (light, dark, lc, dc) => ({ light, dark, "light-contrast": lc, "dark-contrast": dc });

export const SHADOW_KNOBS = ["lightness", "chroma", "alpha"];

/** The global recipe: the main shadow layer. */
export const shadowTint = {
  lightness: t(0.35, 0.25, 0, 0),
  chroma: t(1, 0.5, 0, 0),
  alpha: t(0.14, 0.45, 0, 0),
};

/** The soft layer's alpha, relative to the main one (the second, tighter shadow). */
export const SHADOW_SOFT_RATIO = 0.5;

/** Per-voice overrides: { <voice>: { <knob>: t(…) } }. Empty: every voice takes the recipe. */
export const voiceShadowTint = {};

// THE GLOW — the shadow's second layer: the card's own surface mixed in. A card's surface is
// known only at runtime (its resolve chain), so the glow is mixed in the browser by relative
// colour, behind a support gate; the floor casts the ground's layer alone. The valves are the
// same three knobs, per mode, published as numbers so the mix can read them; a voice may
// override them, and a card reads the valves of the voice it speaks.

/** The global glow valves. Lightness 1 keeps the card's own tone; dark mode turns chroma and
    alpha down, since a coloured glow on a dark ground reads as coloured light. */
export const glowTint = {
  lightness: t(1, 1, 0, 0),
  chroma: t(1, 0.5, 0, 0),
  alpha: t(0.35, 0.25, 0, 0),
};

/** Per-voice glow overrides: { <voice>: { <knob>: t(…) } }. */
export const voiceGlowTint = {};
