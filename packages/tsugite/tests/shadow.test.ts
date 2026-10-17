// The shadow factory (docs/seams.md, lab case 7): a ground's shadow ink is its surface tinted
// by one recipe per mode, overridable per voice, precomputed at build.
import { describe, it, expect } from "vitest";
import { oklch } from "culori";
import { shadowInk, validateShadowTint, generateThemesStylesheet, generateStylesheet } from "../engine/collector.js";
import { resolveValue } from "../engine/color-engine.js";
import { shadowTint, voiceShadowTint } from "../theme-default/shadow.tokens.js";
import { themeVoices } from "../theme-default/theme.voices.tokens.js";
import { rawColorTokens } from "../theme-default/raw.color.tokens.js";

const ink = (surface: string, a: string, voice: string | null = null, soft = false) =>
  oklch(resolveValue(shadowInk(surface, a, voice, soft)).css)!;

describe("shadow inks", () => {
  it("the recipe is total and in range", () => {
    expect(() => validateShadowTint()).not.toThrow();
  });

  it("an ink keeps its ground's hue, darker and translucent", () => {
    const surface = themeVoices.brand.primary.surface.light;
    const base = oklch(rawColorTokens[surface.match(/--COLOR-[A-Z0-9-]+/)![0]])!;
    const shadow = ink(surface, "light", "brand");
    expect(shadow.l).toBeLessThan(base.l);
    expect(shadow.alpha).toBeCloseTo(shadowTint.alpha.light, 2);
    expect(Math.abs((shadow.h ?? 0) - (base.h ?? 0))).toBeLessThan(15);
  });

  it("the soft layer is lighter in alpha than the main one", () => {
    const surface = themeVoices.neutral.subtle.surface.light;
    expect(ink(surface, "light", "neutral", true).alpha!).toBeLessThan(ink(surface, "light", "neutral").alpha!);
  });

  it("the contrast modes cast no shadow", () => {
    for (const a of ["light-contrast", "dark-contrast"]) {
      expect(ink(themeVoices.brand.primary.surface[a], a, "brand").alpha ?? 0).toBe(0);
    }
  });

  it("a voice's override wins over the recipe, for that voice only", () => {
    const surface = themeVoices.accent.primary.surface.dark;
    const before = ink(surface, "dark", "accent").c!;
    Object.assign(voiceShadowTint, { accent: { chroma: { light: 1, dark: 0, "light-contrast": 0, "dark-contrast": 0 } } });
    try {
      expect(ink(surface, "dark", "accent").c ?? 0).toBeLessThan(before);
      expect(ink(themeVoices.brand.primary.surface.dark, "dark", "brand").c).toBeGreaterThan(0);
    } finally {
      delete (voiceShadowTint as Record<string, unknown>).accent;
    }
  });

  it("an override must name a real voice", () => {
    Object.assign(voiceShadowTint, { ghost: { alpha: { light: 0.1 } } });
    try {
      expect(() => validateShadowTint()).toThrow(/not a voice/);
    } finally {
      delete (voiceShadowTint as Record<string, unknown>).ghost;
    }
  });

  it("every voice cell and the page carry their inks", () => {
    const themes = generateThemesStylesheet();
    expect(themes).toContain("--theme-shadow: var(--theme-cell-primary-shadow);");
    expect(themes).toMatch(/--voice-inverse-primary-shadow: rgba\(/);
    expect(generateStylesheet()).toMatch(/--color-shadow-ground: rgba\(/);
  });
});
