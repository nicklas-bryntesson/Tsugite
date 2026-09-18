// TSUGITE RAW COLOR PALETTE — authored as FAMILIES (ADR-0020), 100% oklch.
//
// A family is authoring form and UI grouping, nothing more: a key (the system's id),
// a label (free text — brand-blue, AI-50, Ocean, whatever a brand calls it), and an
// ordered list of steps. The order is the author's and may be wrong on purpose; the
// step labels are free. The system requires only that (family, step) is addressable.
// One family or twenty deliver the same CSS: the flat map `rawColorTokens` below is
// DERIVED from this structure, and the CSS names (--COLOR-<KEY>-<STEP>) with it —
// they are never authored. Roles are assigned in the semantic and voice factories,
// by pointing at a step; the palette knows nothing about roles.

export const palette = {
  sumi: {
    label: "SUMI",
    glyph: "墨",
    note: "The neutral ramp: warm greige, hue 74. Chroma peaks in the midtones (0.020) and thins toward both ends — SUMI-00 is plain paper, SUMI-95 warm yakisugi black. The L steps match the old N ramp, so the semantic layer's contrast relations survived the rename mechanically.",
    steps: [
      ["00", "oklch(100% 0 74)"],
      ["05", "oklch(98.5% 0.004 74)"],
      ["10", "oklch(97% 0.007 74)"],
      ["15", "oklch(95% 0.010 74)"],
      ["20", "oklch(93% 0.013 74)"],
      ["25", "oklch(89% 0.016 74)"],
      ["30", "oklch(85% 0.018 74)"],
      ["35", "oklch(80% 0.019 74)"],
      ["40", "oklch(75% 0.020 74)"],
      ["45", "oklch(70% 0.020 74)"],
      ["50", "oklch(65% 0.020 74)"],
      ["55", "oklch(58.97% 0.019 74)"],
      ["60", "oklch(52.94% 0.018 74)"],
      ["65", "oklch(46.91% 0.017 74)"],
      ["70", "oklch(40.88% 0.016 74)"],
      ["75", "oklch(34.85% 0.015 74)"],
      ["80", "oklch(28.82% 0.014 74)"],
      ["85", "oklch(22.79% 0.013 74)"],
      ["90", "oklch(16.76% 0.011 74)"],
      ["95", "oklch(11.24% 0.010 74)"],
    ],
  },
  ai: {
    label: "AI",
    glyph: "藍",
    note: "Indigo: the brand voice, interaction, and feedback-info. Chroma down from 0.21 to 0.145 on the middle step — a coloured blue, not a screen blue. AI-60 carries white text at 7.0:1, which is why feedback-info moved from 50 to 60. L steps match the old B ramp.",
    steps: [
      ["05", "oklch(96.63% 0.014 258)"],
      ["10", "oklch(91.11% 0.035 256)"],
      ["20", "oklch(83.67% 0.065 254)"],
      ["30", "oklch(74.76% 0.098 256)"],
      ["40", "oklch(67.38% 0.125 258)"],
      ["50", "oklch(61.48% 0.145 260)"],
      ["60", "oklch(46.65% 0.135 262)"],
      ["70", "oklch(38.13% 0.115 263)"],
      ["80", "oklch(27.26% 0.085 264)"],
      ["90", "oklch(18.34% 0.060 264)"],
      ["95", "oklch(11.28% 0.040 265)"],
    ],
  },
  hinoki: {
    label: "HINOKI",
    glyph: "檜",
    note: "Cypress: the accent voice. The hue slides 77 → 48 as it darkens, anchored in photographed cedar — the warmth deepens the way real wood does.",
    steps: [
      ["05", "oklch(97% 0.020 77)"],
      ["20", "oklch(90% 0.060 70)"],
      ["40", "oklch(79% 0.096 64)"],
      ["60", "oklch(62% 0.098 57)"],
      ["80", "oklch(42% 0.078 52)"],
      ["95", "oklch(23% 0.048 48)"],
    ],
  },
  yu: {
    label: "YU",
    glyph: "湯",
    note: "Onsen water. No role points at it today: info is AI, and water as a voice overreached. Decor, glow, illustration, data-viz accent — or it shrinks. Deliberately left in the map.",
    steps: [
      ["05", "oklch(96.5% 0.016 205)"],
      ["10", "oklch(93% 0.028 204)"],
      ["25", "oklch(86% 0.055 203)"],
      ["50", "oklch(66% 0.095 206)"],
      ["70", "oklch(45% 0.070 209)"],
      ["85", "oklch(27% 0.042 212)"],
    ],
  },
  kaki: {
    label: "KAKI",
    glyph: "柿",
    note: "Persimmon: feedback-error. Four steps, one per mode row, so the feedback tokens are pointers instead of mix() recipes.",
    steps: [
      ["10", "oklch(93% 0.032 40)"],
      ["30", "oklch(80% 0.115 38)"],
      ["50", "oklch(58% 0.190 32)"],
      ["80", "oklch(41% 0.145 30)"],
    ],
  },
  matcha: {
    label: "MATCHA",
    glyph: "抹茶",
    note: "Matcha: feedback-success. Four steps, one per mode row.",
    steps: [
      ["10", "oklch(94% 0.040 148)"],
      ["30", "oklch(80% 0.090 150)"],
      ["50", "oklch(55% 0.105 148)"],
      ["80", "oklch(40% 0.080 150)"],
    ],
  },
  kohaku: {
    label: "KOHAKU",
    glyph: "琥珀",
    note: "Amber: feedback-warning. Four steps, one per mode row; KOHAKU-80 is a dark bronze used as text.",
    steps: [
      ["10", "oklch(96% 0.045 88)"],
      ["30", "oklch(88% 0.115 85)"],
      ["50", "oklch(78% 0.145 78)"],
      ["80", "oklch(45% 0.095 70)"],
    ],
  },
};

/** The CSS name of a step: derived from the family key and the step label, never authored. */
export const rawName = (familyKey, step) => `--COLOR-${familyKey.toUpperCase()}-${step}`;

/** The flat map every consumer reads — the delivered form, derived from the families in
    authoring order so the generated CSS is stable. */
export const rawColorTokens = Object.fromEntries(
  Object.entries(palette).flatMap(([key, family]) => family.steps.map(([step, value]) => [rawName(key, step), value])),
);

// ─────────────────────────────────────────────────────────────────────────────
// The hardening of the RAW→semantic seam: one grammar, one lookup, one guard.
// ─────────────────────────────────────────────────────────────────────────────

/** The ONE definition of what a RAW reference looks like: FAMILY-STEP, upper case,
    a hyphen between. collector.asColorLiteral, docs/color.astro:paintable and
    tokens.test.ts import this instead of keeping copies. The name is derived from
    the palette's structure (family key + step label), never authored. */
export const RAW_REF = /^var\((--COLOR-[A-Z]+-\d{2})\)$/;

/** The RAW name inside a var() expression, or null when it is not one. */
export function rawRefName(value) {
  if (typeof value !== "string") return null;
  const m = value.match(RAW_REF);
  return m && m[1] in rawColorTokens ? m[1] : null;
}

/** Authoring helper: raw("SUMI-40") → "var(--COLOR-SUMI-40)". Throws on an unknown
    step — that is the point: resolveValue passes any string through untouched, so a
    typo would otherwise die in the browser. */
export function raw(step) {
  const name = `--COLOR-${step}`;
  if (!(name in rawColorTokens)) {
    const near = Object.keys(rawColorTokens)
      .filter((n) => n.startsWith(`--COLOR-${String(step).split("-")[0]}`))
      .join(", ");
    throw new Error(
      `raw(): "${step}" is not in the palette.` + (near ? ` The family has: ${near}` : ""),
    );
  }
  return `var(${name})`;
}

/** Every --COLOR- reference in a factory must point at something that exists.
    Run in validateTokens() and validateVoices(). */
export function assertRawReferences(factoryName, table) {
  const problems = [];
  const walk = (node, path) => {
    if (typeof node === "string") {
      for (const hit of node.match(/--COLOR-[A-Za-z0-9-]+/g) ?? []) {
        if (!(hit in rawColorTokens)) problems.push(`${path}: "${hit}" is not in the palette`);
      }
    } else if (node && typeof node === "object") {
      for (const [k, v] of Object.entries(node)) walk(v, `${path}/${k}`);
    }
  };
  walk(table, factoryName);
  if (problems.length) throw new Error(`Broken RAW references:\n${problems.join("\n")}`);
}
