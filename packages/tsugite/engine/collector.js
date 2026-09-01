// TOKEN COLLECTOR + GENERATORS (ADR-0003; T7 adds the support axis)
//
// Three emitted artifacts from one JS source:
//   1. color.raw.generated.css        — the RAW palette: @property registrations,
//      gamut-mapped sRGB fallback branch, oklch branch. Single-sourced from
//      raw.color.tokens.js (retires the three hand-kept copies).
//   2. color.appearance.generated.css — semantic/theme four-mode tables as
//      8 mutually exclusive blocks (data-appearance × prefers-contrast media;
//      absent-attribute media fallbacks work with zero JS), plus @property
//      registrations for every color-valued semantic token whose precomputed
//      initial-value is the third safety net: an invalid substitution degrades
//      to a real color instead of killing the consuming property.
//   3. ui-tokens.css                  — the --ui-* seam as appearance-free pointers.
//
// Recipes (mixes) are precomputed by the color engine; in-gamut results emit a
// single literal so no color-mix/light-dark construct ever ships. The only
// modern dependency left in output is the oklch literal — one @supports gate.

import { oklch } from "culori";
import { rawColorTokens, rawRefName, assertRawReferences } from "../theme-default/raw.color.tokens.js";
import { semanticColorTokens } from "../theme-default/semantic.color.tokens.js";
import { themeVoices, themeChannels, voiceMatrix, cellName, VOLUMES } from "../theme-default/theme.voices.tokens.js";
import { uiSeamTokens } from "../theme-default/seam.ui.tokens.js";
import { resolveValue, computeMix, isRecipe, toSrgbCss, toSrgbHex } from "./color-engine.js";

export const APPEARANCES = ["light", "dark", "light-contrast", "dark-contrast"];

const factories = {
  semantic: semanticColorTokens,
};

export function allTokens() {
  return Object.assign({}, ...Object.values(factories));
}

/** Every token defines every mode; every value must resolve (refusal rule). */
export function validateTokens() {
  assertRawReferences("semantic", allTokens());
  const problems = [];
  for (const [token, modes] of Object.entries(allTokens())) {
    for (const a of APPEARANCES) {
      if (!(a in modes)) {
        problems.push(`${token} is missing ${a}`);
        continue;
      }
      try {
        resolveValue(modes[a]);
      } catch (e) {
        problems.push(`${token}/${a}: ${e.message}`);
      }
    }
    for (const key of Object.keys(modes)) {
      if (!APPEARANCES.includes(key)) problems.push(`${token} has unknown mode "${key}"`);
    }
  }
  if (problems.length) throw new Error(`The token table is incomplete:\n${problems.join("\n")}`);
}

/** Gamut report: which tokens get chroma-clamped in the sRGB emission. */
export function gamutReport() {
  const clipped = [];
  for (const [token, modes] of Object.entries(allTokens())) {
    for (const a of APPEARANCES) {
      const r = resolveValue(modes[a]);
      if (r.clipped) clipped.push(`${token}/${a}`);
    }
  }
  for (const [name, literal] of Object.entries(rawColorTokens)) {
    const r = resolveValue({ __recipe: "mix", base: name, pct: 100, with: "transparent" });
    // pct 100 against transparent = the color itself at alpha 1 — a pure gamut probe
    if (r.clipped) clipped.push(`${name} (RAW)`);
  }
  return clipped;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function declarations(appearance, indent) {
  return Object.entries(allTokens())
    .map(([token, modes]) => `${indent}${token}: ${resolveValue(modes[appearance]).css};`)
    .join("\n");
}

/** Resolve a factory value to a plain color literal, or null if it isn't one. */
function asColorLiteral(value) {
  if (isRecipe(value)) return toSrgbCss(computeMix(value));
  if (typeof value !== "string") return null;
  if (value === "transparent") return "transparent";
  const name = rawRefName(value); // EN definition av RAW-grammatiken (theme-default)
  if (name) return toSrgbCss(oklch(rawColorTokens[name]));
  return null; // shadow lists, multi-part values — not registrable as <color>
}

// ── 1. RAW palette ────────────────────────────────────────────────────────────

export function generateRawStylesheet() {
  const names = Object.entries(rawColorTokens);

  const registrations = names
    .map(
      ([name, literal]) =>
        `@property ${name} {\n  syntax: "<color>";\n  inherits: false;\n  initial-value: ${literal};\n}`,
    )
    .join("\n\n");

  const fallback = names
    .map(([name, literal]) => `    ${name}: ${toSrgbHex(oklch(literal))};`)
    .join("\n");

  const modern = names.map(([name, literal]) => `    ${name}: ${literal};`).join("\n");

  return [
    "/* GENERATED — do not edit. Source: src/lib/tokens/raw.color.tokens.js",
    "   The RAW palette, authored in oklch. The sRGB branch is the CSS Color 4",
    "   gamut mapping (chroma clamped, L and H preserved) computed at build —",
    "   the same rendering a browser applies on an sRGB display.",
    "   Regenerate: npm run tokens */",
    "",
    registrations,
    "",
    "@supports not (color: oklch(1 0 0)) {",
    "  :root {",
    fallback,
    "  }",
    "}",
    "",
    "@supports (color: oklch(1 0 0)) {",
    "  :root {",
    modern,
    "  }",
    "}",
    "",
  ].join("\n");
}

// ── 2. Appearance tables ──────────────────────────────────────────────────────

export function generateStylesheet() {
  validateTokens();

  const registrations = Object.entries(allTokens())
    .map(([token, modes]) => {
      const initial = asColorLiteral(modes.light);
      if (initial === null) return null; // not a <color> (e.g. shadow list)
      return `@property ${token} {\n  syntax: "<color>";\n  inherits: true;\n  initial-value: ${initial};\n}`;
    })
    .filter(Boolean)
    .join("\n\n");

  const attr = (scheme, contrastMedia, appearance) =>
    `@media (prefers-contrast: ${contrastMedia}) {\n` +
    `  :root[data-appearance="${scheme}"] {\n${declarations(appearance, "    ")}\n  }\n}`;

  const absent = (schemeMedia, contrastMedia, appearance) =>
    `@media (prefers-color-scheme: ${schemeMedia}) and (prefers-contrast: ${contrastMedia}) {\n` +
    `  :root:not([data-appearance]) {\n${declarations(appearance, "    ")}\n  }\n}`;

  return [
    "/* GENERATED — do not edit. Source: src/lib/tokens/*.tokens.js",
    "   Regenerate: npm run tokens   (freshness guarded by tests/tokens.test.ts) */",
    "",
    "/* Type registrations — the third safety net: an invalid substitution",
    "   degrades to the initial value (precomputed sRGB) instead of killing",
    "   the consumer. */",
    registrations,
    "",
    "/* User preference pinned (data-appearance from ThemeSwitch) × OS contrast */",
    attr("light", "no-preference", "light"),
    attr("light", "more", "light-contrast"),
    attr("dark", "no-preference", "dark"),
    attr("dark", "more", "dark-contrast"),
    "",
    "/* No preference (attribute absent = follow the OS) — works without JS */",
    absent("light", "no-preference", "light"),
    absent("light", "more", "light-contrast"),
    absent("dark", "no-preference", "dark"),
    absent("dark", "more", "dark-contrast"),
    "",
  ].join("\n\n");
}

// ── 3. Theme voices (ADR-0006: voice × volume) ────────────────────────────────

/** The combination law + slot schema, enforced: a voice must fill EVERY
    channel for EVERY volume the matrix allows — and nothing else. */
export function validateVoices() {
  assertRawReferences("voices", themeVoices);
  const problems = [];
  const channelKeys = Object.keys(themeChannels);

  for (const [voice, volumes] of Object.entries(voiceMatrix)) {
    if (!themeVoices[voice]) {
      problems.push(`the matrix lists "${voice}" but the voice is missing`);
      continue;
    }
    for (const vol of volumes) {
      if (!VOLUMES.includes(vol)) problems.push(`${voice}: unknown volume "${vol}"`);
      const table = themeVoices[voice][vol];
      if (!table) {
        problems.push(`${voice} is missing allowed volume "${vol}"`);
        continue;
      }
      for (const key of channelKeys) {
        if (!(key in table)) {
          problems.push(`${voice}/${vol} is missing channel ${key}`);
          continue;
        }
        for (const a of APPEARANCES) {
          if (!(a in table[key])) {
            problems.push(`${voice}/${vol}/${key} is missing ${a}`);
            continue;
          }
          try {
            resolveValue(table[key][a]);
          } catch (e) {
            problems.push(`${voice}/${vol}/${key}/${a}: ${e.message}`);
          }
        }
      }
      for (const key of Object.keys(table)) {
        if (!channelKeys.includes(key)) problems.push(`${voice}/${vol} has unknown channel "${key}"`);
      }
    }
    for (const vol of Object.keys(themeVoices[voice])) {
      if (!volumes.includes(vol)) problems.push(`${voice} defines "${vol}" which the matrix forbids`);
    }
  }
  for (const voice of Object.keys(themeVoices)) {
    if (!voiceMatrix[voice]) problems.push(`voice "${voice}" is missing from the matrix`);
  }
  if (problems.length) throw new Error(`The voice table is incomplete:\n${problems.join("\n")}`);
}

export function generateThemesStylesheet() {
  validateVoices();

  // Channel wiring: [data-theme] defaults every channel to the primary
  // column; [data-prominence] re-aims. Voice-agnostic, appearance-agnostic —
  // one block per volume stop, exactly as ADR-0006 §3 promises.
  const wire = (volume, indent) =>
    Object.entries(themeChannels)
      .map(([key, channel]) => `${indent}${channel}: var(${cellName(volume, key)});`)
      .join("\n");

  const wiring = [
    "/* Channel wiring: [data-theme] defaults every channel to the primary",
    "   column; [data-prominence] re-aims. Order is the law: prominence blocks",
    "   come after and win on the same element. One block per volume stop —",
    "   no voice × volume combinatorics (ADR-0006 §3). */",
    `[data-theme] {\n${wire("primary", "  ")}\n}`,
    ...VOLUMES.map((vol) => `[data-prominence="${vol}"] {\n${wire(vol, "  ")}\n}`),
  ].join("\n\n");

  // Voice cells per appearance context. Only matrix-allowed volumes emit —
  // a forbidden combination has no cells and therefore does not exist
  // (kombinationslagen, ADR-0006 §6).
  const cells = (voice, appearance, indent) =>
    voiceMatrix[voice]
      .flatMap((vol) =>
        Object.keys(themeChannels).map(
          (key) =>
            `${indent}${cellName(vol, key)}: ${resolveValue(themeVoices[voice][vol][key][appearance]).css};`,
        ),
      )
      .join("\n");

  const voiceBlocks = (rootSelector, appearance) =>
    Object.keys(voiceMatrix)
      .map(
        (voice) =>
          `  ${rootSelector} [data-theme="${voice}"] {\n${cells(voice, appearance, "    ")}\n  }`,
      )
      .join("\n\n");

  const attr = (scheme, contrastMedia, appearance) =>
    `@media (prefers-contrast: ${contrastMedia}) {\n${voiceBlocks(`:root[data-appearance="${scheme}"]`, appearance)}\n}`;

  const absent = (schemeMedia, contrastMedia, appearance) =>
    `@media (prefers-color-scheme: ${schemeMedia}) and (prefers-contrast: ${contrastMedia}) {\n${voiceBlocks(":root:not([data-appearance])", appearance)}\n}`;

  return [
    "/* GENERATED — do not edit. Source: src/lib/tokens/theme.voices.tokens.js",
    "   Theme voices (ADR-0006): data-theme carries the VOICE, data-prominence",
    "   the VOLUME. Channels and cells are DELIBERATELY unregistered (@property):",
    "   a voiceless channel must fail invalid-at-computed-value so the ownership",
    "   chain's semantic fallback answers — a registered initial-value would",
    "   hijack the chain.",
    "   Regenerate: npm run tokens */",
    "",
    wiring,
    "",
    "/* Voice cells × appearance context (pinned attribute × OS contrast) */",
    attr("light", "no-preference", "light"),
    attr("light", "more", "light-contrast"),
    attr("dark", "no-preference", "dark"),
    attr("dark", "more", "dark-contrast"),
    "",
    "/* No preference (attribute absent = follow the OS) */",
    absent("light", "no-preference", "light"),
    absent("light", "more", "light-contrast"),
    absent("dark", "no-preference", "dark"),
    absent("dark", "more", "dark-contrast"),
    "",
  ].join("\n\n");
}

// ── 4. The --ui-* seam ────────────────────────────────────────────────────────

export function generateSeamStylesheet() {
  const entries = Object.entries(uiSeamTokens)
    .map(([token, value]) => `  ${token}: ${value};`)
    .join("\n");

  return [
    "/* GENERATED — do not edit. Source: src/lib/tokens/seam.ui.tokens.js",
    "   The --ui-* seam (reference-components' design surface, ADR-0002) as",
    "   appearance-free pointers into the semantic layer (ADR-0004).",
    "   Regenerate: npm run tokens */",
    "",
    ":root {",
    "  /* Platform line (ref-lib ADR-0021): makes system colours, form controls",
    "     and UA chrome follow light/dark. The single most expensive line to lose. */",
    "  color-scheme: light dark;",
    "",
    entries,
    "}",
    "",
    "/* An explicit user choice pins the scheme; absence means \"follow the OS\".",
    "   These two rules are the entire projection surface (ref-lib ADR-0021). */",
    ':root[data-appearance="light"] { color-scheme: light; }',
    ':root[data-appearance="dark"]  { color-scheme: dark; }',
    "",
  ].join("\n");
}
