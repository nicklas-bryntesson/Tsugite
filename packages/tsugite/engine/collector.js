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
//   4. base.generated.css             — spacing, site scaffolding and grids
//      (ADR-0011): RAW constants + tier-gated semantic ramps, from
//      size/site/grid.tokens.js. Retired the Sass token tables.
//
// Recipes (mixes) are precomputed by the color engine; in-gamut results emit a
// single literal so no color-mix/light-dark construct ever ships. The only
// modern dependency left in output is the oklch literal — one @supports gate.

import { oklch } from "culori";
import { rawColorTokens, rawRefName, assertRawReferences } from "../theme-default/raw.color.tokens.js";
import { semanticColorTokens } from "../theme-default/semantic.color.tokens.js";
import { themeVoices, themeChannels, voiceMatrix, cellName, VOLUMES } from "../theme-default/theme.voices.tokens.js";
import { uiSeamTokens } from "../theme-default/seam.ui.tokens.js";
import { TIERS, typeFamilies, typeWeights, typeVoices, typeSizes } from "../theme-default/typography.tokens.js";
import { spaceScale, spaceSteps, sizeConstantName, sizeTokenName } from "../theme-default/size.tokens.js";
import { siteConstants, siteOffset, siteOffsetConstantName } from "../theme-default/site.tokens.js";
import { GRID_STEPS, GRID_MEDIA, gridSteps, gridGapConstantName, gridColumnsConstantName } from "../theme-default/grid.tokens.js";
import { resolveValue, computeMix, isRecipe, toSrgbCss, toSrgbHex } from "./color-engine.js";

export const APPEARANCES = ["light", "dark", "light-contrast", "dark-contrast"];

// The viewport-tier ladder (ADR-0001): bounded, mutually exclusive ranges —
// exactly one block matches at any viewport. Shared by every tier-mapped ramp
// (typography, spacing, site offset).
export const TIER_MEDIA = {
  floor: "(max-width: 21.24999rem)",
  mobile: "(min-width: 21.25rem) and (max-width: 48.74rem)",
  desktop: "(min-width: 48.75rem) and (max-width: 89.99rem)",
  wide: "(min-width: 90rem)",
};

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

// ── 4. Typography (ADR-0003 extended to type) ─────────────────────────────────

const TYPE_TABLES = {
  voices: typeVoices,
  sizes: typeSizes,
  families: typeFamilies,
  weights: typeWeights,
};

const BLOCK_METRICS = ["lineHeight", "letterSpacing", "featureSettings", "baselineOffset"];

const METRIC_TOKEN = {
  lineHeight: (voice) => `--lineHeight-${voice}`,
  letterSpacing: (voice) => `--letterSpacing-${voice}`,
  featureSettings: (voice) => `--fontFeatureSettings-${voice}`,
  baselineOffset: (voice) => `--baseline-offset-${voice}`,
};

/** A bundle metric is a scalar (one value for all tiers) or a tier map
    (the designer's per-range twist: tracking that tightens as the tier
    grows, leading that relaxes on FLOOR). Same shape as the size ramps. */
const isTierMap = (v) => typeof v === "object" && v !== null;

/** The refusal rule for type: every voice complete, every ramp complete —
    a tiered metric carries EVERY tier or none, and the units obey the
    trim engine's arithmetic. Incomplete tables are a build error, never
    a silent metric bug. */
export function validateTypography(tables = TYPE_TABLES) {
  const { voices, sizes, families, weights } = tables;
  const problems = [];

  const checkTierMap = (owner, map) => {
    for (const t of TIERS) {
      if (!(t in map)) problems.push(`${owner} is missing the ${t} tier`);
    }
    for (const t of Object.keys(map)) {
      if (!TIERS.includes(t)) problems.push(`${owner} has unknown tier "${t}"`);
    }
  };

  // The unit laws — what the trim engine's calc() arithmetic demands.
  // calc(<length> × <number>) is valid; calc(<length> × <length>) is not,
  // and calc(<length> + <number>) fails invalid-at-computed-value,
  // silently zeroing the fallback margins (found by browser probe).
  const UNIT_LAWS = {
    // multiplied by --_fontSize → must stay a unitless ratio
    lineHeight: { test: (v) => /^\d*\.?\d+$/.test(v), law: "must be a unitless ratio (it multiplies a length)" },
    // the sitting-in-the-box knob: a pure factor the engine multiplies
    // by the element's font size — 0 is neutral, 0.03 nudges 3% of the
    // em box. A unit here would make calc(<length> × <length>) invalid.
    baselineOffset: { test: (v) => /^-?\d*\.?\d+$/.test(v), law: "must be a unitless factor (the engine multiplies it by the font size)" },
  };

  const checkUnits = (owner, metric, value) => {
    const rule = UNIT_LAWS[metric];
    if (rule && !rule.test(String(value))) problems.push(`${owner}: "${value}" ${rule.law}`);
  };

  const eachValue = (owner, metric, value) => {
    if (isTierMap(value)) {
      for (const [t, v] of Object.entries(value)) checkUnits(`${owner}/${t}`, metric, v);
    } else {
      checkUnits(owner, metric, value);
    }
  };

  // Family entries carry the typeface's geometry — the faux-trim math
  // is only as true as these numbers, so their absence refuses to build.
  for (const [name, fam] of Object.entries(families)) {
    if (!fam?.stack) problems.push(`family ${name} is missing its stack`);
    for (const m of ["ascent", "capHeight", "descent"]) {
      const v = fam?.metrics?.[m];
      if (v === undefined) problems.push(`family ${name} is missing metrics.${m}`);
      else if (!/^\d*\.?\d+$/.test(String(v))) problems.push(`family ${name}: metrics.${m} "${v}" must be a unitless em fraction`);
    }
  }

  for (const [voice, def] of Object.entries(voices)) {
    if (!families[def.family]) problems.push(`${voice}: unknown family ${def.family}`);
    for (const [stop, w] of Object.entries(def.weights ?? {})) {
      if (!weights[w]) problems.push(`${voice}/weights.${stop}: unknown weight ${w}`);
    }
    if (!def.weights?.default) problems.push(`${voice} is missing weights.default`);
    if (!def.inline) {
      for (const m of BLOCK_METRICS) {
        if (!(m in def)) {
          problems.push(`${voice} is missing ${m} (a block voice carries the full bundle)`);
        } else {
          if (isTierMap(def[m])) checkTierMap(`${voice}/${m}`, def[m]);
          eachValue(`${voice}/${m}`, m, def[m]);
        }
      }
    }
  }

  for (const [name, tiers] of Object.entries(sizes)) {
    checkTierMap(`fontSize ${name}`, tiers);
  }

  if (problems.length) throw new Error(`The typography table is incomplete:\n${problems.join("\n")}`);
}

export function generateTypographyStylesheet(tables = TYPE_TABLES) {
  validateTypography(tables);
  const { voices, sizes, families, weights } = tables;

  const rawSizeName = (name, tier) => `--FONTSIZE-${name.toUpperCase()}-${tier.toUpperCase()}`;

  const rawConstants = Object.entries(sizes)
    .flatMap(([name, tiers]) => TIERS.map((t) => `  ${rawSizeName(name, t)}: ${tiers[t]};`))
    .join("\n");

  // Scalar metrics live once in :root; tier-mapped metrics move into the
  // tier blocks below (the semantic token NAME is the seam — components
  // consume var(--letterSpacing-x) either way and never know which).
  const tieredMetrics = Object.entries(voices).flatMap(([voice, def]) =>
    def.inline
      ? []
      : BLOCK_METRICS.filter((m) => isTierMap(def[m])).map((m) => ({ voice, metric: m, values: def[m] })),
  );

  const bundles = Object.entries(voices)
    .map(([voice, def]) => {
      const lines = [
        `  --fontFamily-${voice}: var(${def.family});`,
        `  --fontWeight-${voice}: var(${def.weights.default});`,
        ...Object.entries(def.weights)
          .filter(([stop]) => stop !== "default")
          .map(([stop, w]) => `  --fontWeight-${voice}-${stop}: var(${w});`),
      ];
      if (!def.inline) {
        for (const m of BLOCK_METRICS) {
          if (!isTierMap(def[m])) lines.push(`  ${METRIC_TOKEN[m](voice)}: ${def[m]};`);
        }
        // The typeface geometry the faux-trim math needs (emulating
        // text-box-edge: cap alphabetic): the REAL em box, the gap
        // between ascent and cap, and the descent — em fractions from
        // the voice's family.
        const { ascent, capHeight, descent } = families[def.family].metrics;
        lines.push(
          `  --fontEmBox-${voice}: ${+(ascent + descent).toFixed(4)};`,
          `  --fontCapGap-${voice}: ${+(ascent - capHeight).toFixed(4)};`,
          `  --fontDescent-${voice}: ${descent};`,
        );
      }
      return lines.join("\n");
    })
    .join("\n\n");

  const semanticSizes = (tier, indent) =>
    [
      ...Object.keys(sizes).map(
        (name) => `${indent}--fontSize-${name}: calc(var(${rawSizeName(name, tier)}) * var(--TYPE-SCALE, 1));`,
      ),
      ...tieredMetrics.map(
        ({ voice, metric, values }) => `${indent}${METRIC_TOKEN[metric](voice)}: ${values[tier]};`,
      ),
    ].join("\n");

  const mediaBlocks = TIERS.map(
    (t) => `@media ${TIER_MEDIA[t]} {\n  :root {\n${semanticSizes(t, "    ")}\n  }\n}`,
  ).join("\n\n");

  // Test-viewport overrides: forces tier values regardless of actual
  // viewport (the bench's side-by-side maps). The attribute selector
  // wins over the media :root blocks by source order at equal weight.
  const testViewports = ["floor", "mobile", "desktop"]
    .map((t) => `[data-test-viewport="${t}"] {\n${semanticSizes(t, "  ")}\n}`)
    .join("\n\n");

  return [
    "/* GENERATED — do not edit. Source: theme-default/typography.tokens.js",
    "   The typography map: RAW families/weights/size stops (the rebrand",
    "   surface), voice bundles, and the tier ramps (ADR-0001: explicit",
    "   stops, no fluid math; WIDE equals DESKTOP — type stops growing).",
    "   Regenerate: npm run tokens   (freshness guarded by tests) */",
    "",
    ":root {",
    "  --TYPE-SCALE: 1;",
    "",
    ...Object.entries(families).map(([n, v]) => `  ${n}: ${v.stack};`),
    "",
    ...Object.entries(weights).map(([n, v]) => `  ${n}: ${v};`),
    "",
    rawConstants,
    "",
    bundles,
    "}",
    "",
    mediaBlocks,
    "",
    testViewports,
    "",
  ].join("\n");
}

// ── 5. The --ui-* seam ────────────────────────────────────────────────────────

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

// ─── BASE TABLES: spacing, site, grids (ADR-0011) ─────────────────────────────

const BASE_TABLES = { steps: spaceSteps, offset: siteOffset, grid: gridSteps };

/** rem → px at the CSS reference 16px/rem, printed without float noise. */
const remToPx = (rem) => {
  const m = /^(-?[\d.]+)rem$/.exec(rem);
  if (!m) throw new Error(`base tokens: expected a rem literal, got "${rem}"`);
  return `${+(parseFloat(m[1]) * 16).toFixed(4)}px`;
};

/**
 * The refusal rule for the base tables: every spacing step and the site
 * offset define every tier; every grid step defines gap and columns. A hole
 * is a build error, never a silently missing viewport.
 */
export function validateBase(tables = BASE_TABLES) {
  const errors = [];
  for (const [step, tiers] of Object.entries(tables.steps)) {
    for (const t of TIERS) if (!(t in tiers)) errors.push(`spacing step "${step}" lacks tier "${t}"`);
    for (const t of Object.keys(tiers)) if (!TIERS.includes(t)) errors.push(`spacing step "${step}" has unknown tier "${t}"`);
    for (const t of TIERS) if (t in tiers && !/^[\d.]+rem$/.test(tiers[t])) errors.push(`spacing ${step}/${t}: "${tiers[t]}" is not a rem literal`);
  }
  for (const t of TIERS) if (!(t in tables.offset)) errors.push(`site offset lacks tier "${t}"`);
  for (const step of GRID_STEPS) {
    const def = tables.grid[step];
    if (!def) { errors.push(`grid lacks step "${step}"`); continue; }
    for (const k of ["gap", "columns"]) if (!(k in def)) errors.push(`grid step "${step}" lacks "${k}"`);
  }
  for (const step of Object.keys(tables.grid)) if (!GRID_STEPS.includes(step)) errors.push(`grid has unknown step "${step}"`);
  if (errors.length) throw new Error(`base token tables are incomplete:\n  ${errors.join("\n  ")}`);
}

export function generateBaseStylesheet(tables = BASE_TABLES) {
  validateBase(tables);
  const { steps, offset, grid } = tables;
  const stepNames = Object.keys(steps);

  // ── RAW constants ──────────────────────────────────────────────────────
  const sizeConstants = [
    `  --SPACE-SCALE: ${spaceScale};`,
    "",
    ...TIERS.flatMap((t) => [
      ...stepNames.map((s) => `  ${sizeConstantName(s, t)}: ${steps[s][t]};`),
      "",
    ]),
    ...TIERS.flatMap((t) => [
      ...stepNames.map((s) => `  ${sizeConstantName(s, t)}-PX: ${remToPx(steps[s][t])};`),
      "",
    ]),
  ].join("\n").trimEnd();

  const siteConsts = [
    ...Object.entries(siteConstants).map(([n, v]) => `  ${n}: ${v};`),
    "",
    ...TIERS.flatMap((t) => [
      `  ${siteOffsetConstantName(t)}: ${offset[t]};`,
      `  ${siteOffsetConstantName(t)}-NEGATIVE: calc(var(${siteOffsetConstantName(t)}) * -1);`,
    ]),
  ].join("\n");

  const gridConsts = [
    ...GRID_STEPS.map((s) => `  ${gridGapConstantName(s)}: ${grid[s].gap};`),
    ...GRID_STEPS.map((s) => `  ${gridColumnsConstantName(s)}: ${grid[s].columns};`),
  ].join("\n");

  // ── Semantic: spacing ramp, gated per tier ─────────────────────────────
  const sizeTier = (t) =>
    [
      ...stepNames.map((s) => `    ${sizeTokenName(s)}: calc(var(${sizeConstantName(s, t)}) * var(--SPACE-SCALE, 1));`),
      ...stepNames.map((s) => `    ${sizeTokenName(s)}-px: var(${sizeConstantName(s, t)}-PX);`),
      `    --site-offset: var(${siteOffsetConstantName(t)});`,
    ].join("\n");

  const tierBlocks = TIERS.map((t) => `@media ${TIER_MEDIA[t]} {\n  :root {\n${sizeTier(t)}\n  }\n}`).join("\n\n");

  // ── Semantic: grids ────────────────────────────────────────────────────
  const pad = (name, value) => `  ${name.padEnd(46)}${value};`;
  const layoutCount = (s) => `--grid-layout-columns-count-${s}`;
  const layoutGap = (s) => `--grid-layout-gap-${s}`;
  const layoutCols = (s) => `--grid-layout-columns-${s}`;
  const bCount = (s) => `--grid-breakout-columns-count-${s}`;
  const bGap = (s) => `--grid-breakout-gap-${s}`;
  const bCols = (s) => `--grid-breakout-columns-${s}`;
  const bAuto = (s) => `--grid-breakout-column-autoSize-${s}`;
  const bPad = (s) => `--grid-breakout-content-autoPadding-${s}`;
  const gapValue = (s) => (s === "base" ? `var(${gridGapConstantName(s)}, 0)` : `var(${gridGapConstantName(s)})`);
  const [firstStep, ...restSteps] = GRID_STEPS;

  const gridSemantic = [
    "  /* container — a centered grid with a fluid single content column */",
    pad("--grid-container-offset:", "var(--site-offset)"),
    pad("--grid-container-maxWidth:", "var(--SITE-MAXWIDTH)"),
    pad("--grid-container-columns:", "[full-start] minmax(var(--grid-container-offset), 1fr) [main-start] minmax(0, var(--grid-container-maxWidth)) [main-end]minmax(var(--grid-container-offset), 1fr) [full-end]"),
    "",
    "  /* layout — the 1/4/8/12-column responsive grid */",
    ...GRID_STEPS.map((s) => pad(`${layoutCount(s)}:`, `var(${gridColumnsConstantName(s)})`)),
    ...GRID_STEPS.map((s) => pad(`${layoutGap(s)}:`, gapValue(s))),
    ...GRID_STEPS.map((s) => pad(`${layoutCols(s)}:`, `repeat(var(${layoutCount(s)}), 1fr)`)),
    "",
    "  /* breakout — 12 centered columns with a fluid first and last track */",
    pad("--grid-breakout-offset:", "var(--site-offset)"),
    pad("--grid-breakout-maxWidth:", "var(--SITE-MAXWIDTH)"),
    ...GRID_STEPS.map((s) => pad(`${bCount(s)}:`, `var(${gridColumnsConstantName(s)})`)),
    ...GRID_STEPS.map((s) => pad(`${bGap(s)}:`, gapValue(s))),
    ...restSteps.flatMap((s) => [
      pad(`${bAuto(s)}:`, `calc((var(--grid-breakout-maxWidth) - (calc(var(${bCount(s)}) - 1) * var(${bGap(s)}))) / var(${bCount(s)}))`),
      pad(`${bPad(s)}:`, `calc(var(--grid-breakout-offset, 0rem) - var(${bGap(s)}, 0rem))`),
    ]),
    pad(`${bCols(firstStep)}:`, "[full-start] var(--grid-breakout-offset) [main-start] repeat(1, [main] 1fr) [main-end] var(--grid-breakout-offset) [full-end]"),
    ...restSteps.map((s) =>
      pad(`${bCols(s)}:`, `[full-start] minmax(var(${bPad(s)}), 1fr) [main-start] repeat(var(${bCount(s)}), [main] minmax(0, var(${bAuto(s)}))) [main-end] minmax(var(${bPad(s)}), 1fr) [full-end]`),
    ),
  ].join("\n");

  const gridBlocks = GRID_STEPS.map((s) =>
    [
      `@media ${GRID_MEDIA[s]} {`,
      "  :root {",
      `    --grid-layout-gap: var(${layoutGap(s)});`,
      `    --grid-layout-columns: var(${layoutCols(s)});`,
      `    --grid-breakout-gap: var(${bGap(s)});`,
      `    --grid-breakout-columns: var(${bCols(s)});`,
      "  }",
      "}",
    ].join("\n"),
  ).join("\n\n");

  return [
    "/* GENERATED — do not edit. Source: theme-default/size.tokens.js,",
    "   site.tokens.js, grid.tokens.js (ADR-0011). RAW constants first, then",
    "   the tier-gated semantic ramps (ADR-0001: explicit stops, one active",
    "   block per viewport), then the grids on their own ladder.",
    "   Regenerate: npm run tokens   (freshness guarded by tests) */",
    "",
    ":root {",
    sizeConstants,
    "",
    siteConsts,
    "",
    gridConsts,
    "",
    "  --size-none: 0;",
    "",
    gridSemantic,
    "}",
    "",
    "/* Writing direction as a sign, for mirrored offsets. Ported as emitted by",
    "   the Sass source: descendant selectors under :root (see ADR-0011). */",
    ':root :not([dir="rtl"]) { --dir: var(--DIR-LTR); }',
    ':root [dir="rtl"] { --dir: var(--DIR-RTL); }',
    "",
    tierBlocks,
    "",
    gridBlocks,
    "",
  ].join("\n");
}
