// COLOR ENGINE (T7) — the build-time math that lets authoring stay 100% oklch.
//
// - Recipes (mixes) are computed here with the SAME interpolation the browser
//   would use for color-mix(in oklch, …): per-channel in oklch, premultiplied
//   alpha, hue via shortest arc (culori).
// - Fallbacks are the CSS Color 4 gamut mapping: chroma clamped in oklch with
//   L and H preserved — i.e. exactly what a browser shows on an sRGB display.
//   The fallback is not another color; it is the sRGB rendering of the same one.
// - Anything that cannot be precomputed (non-static ingredients) is refused.

import { oklch, interpolate, formatRgb, formatHex, clampChroma, inGamut, differenceEuclidean } from "culori";
import { rawColorTokens } from "../theme-default/raw.color.tokens.js";

const inSrgb = inGamut("rgb");
const deltaEok = differenceEuclidean("oklab");

/** Recipe constructor: color-mix(in oklch, <base> <pct>%, <with>). */
export function mix(base, pct, withColor = "transparent") {
  return { __recipe: "mix", base, pct, with: withColor };
}

export const isRecipe = (v) => typeof v === "object" && v !== null && v.__recipe === "mix";

function resolveIngredient(name) {
  if (name === "transparent") return { mode: "oklch", l: 0, c: 0, h: 0, alpha: 0 };
  const literal = rawColorTokens[name];
  if (!literal) throw new Error(`color-engine: "${name}" is not a RAW color — recipes only accept static ingredients`);
  const parsed = oklch(literal);
  if (!parsed) throw new Error(`color-engine: could not parse ${name} = ${literal}`);
  return parsed;
}

/** Compute a mix recipe → culori color (oklch mode). Spec-faithful. */
export function computeMix(recipe) {
  const a = resolveIngredient(recipe.base);
  const b = resolveIngredient(recipe.with);
  const w = recipe.pct / 100;

  // Mixing with transparent is exact under premultiplied interpolation:
  // the base's channels survive untouched, only alpha scales.
  if ((b.alpha ?? 1) === 0) return { ...a, alpha: (a.alpha ?? 1) * w };
  if ((a.alpha ?? 1) === 0) return { ...b, alpha: (b.alpha ?? 1) * (1 - w) };

  // Opaque-opaque: plain per-channel oklch interpolation (hue: shortest arc).
  const at = interpolate([a, b], "oklch");
  return at(1 - w); // t is the weight of b; recipe.pct is the weight of base
}

/** Gamut-map to sRGB the way CSS does: clamp chroma, preserve L and H. */
export function toSrgbCss(color) {
  const mapped = inSrgb(color) ? color : clampChroma(color, "oklch");
  return formatRgb(mapped); // rgb()/rgba() — alpha survives, parses everywhere
}

export function toSrgbHex(color) {
  const mapped = inSrgb(color) ? color : clampChroma(color, "oklch");
  return formatHex(mapped);
}

/**
 * Resolve a factory value to the emitted CSS string + metadata.
 * - "var(--COLOR-…)" pointers and plain keywords pass through untouched.
 * - Recipes are precomputed; in-gamut results emit ONE literal (no support
 *   branching needed anywhere). An out-of-gamut result is gamut-mapped and
 *   reported — dual-branch emission is added the day a token earns it.
 */
export function resolveValue(value) {
  if (isRecipe(value)) {
    const color = computeMix(value);
    const clipped = !inSrgb(color);
    return { css: toSrgbCss(color), computed: true, clipped, color };
  }
  if (typeof value !== "string") throw new Error(`color-engine: unknown value ${JSON.stringify(value)}`);
  return { css: value, computed: false, clipped: false };
}

/** Fidelity check used by the tests: ΔE_OK between intent and emission. */
export function fidelity(oklchLiteral, emittedSrgb) {
  return deltaEok(oklch(oklchLiteral), oklch(emittedSrgb));
}
