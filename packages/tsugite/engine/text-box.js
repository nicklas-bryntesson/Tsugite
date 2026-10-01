// THE TEXT-BOX ENGINE (ADR-0024)
//
// One run of words in one voice is a box: in block mode the container is a block,
// trimmed from cap height to baseline; in inline mode it flows on the line and is
// never trimmed. The engine owns that box and the trim, nothing else — line length
// and placement stay in the components.
//
// Generated from the typography map so the formula exists once and every voice gets
// its cell: a new voice in typography.tokens.js is on the engine by construction.
// The fallback is written twice — for the browser that cannot trim, and for a region
// forced to the fallback (data-test-text-box="fallback") — so control room can show
// both branches in one modern browser. The duplication lives here, in the output.
import { typeVoices } from "../theme-default/typography.tokens.js";
import { METRIC_TOKEN, GEOMETRY_TOKEN } from "./collector.js";

/** The feature the native branch needs: trim to the cap height and the alphabetic baseline. */
export const NATIVE_TRIM = "(text-box-trim: trim-both) and (text-box-edge: cap alphabetic)";

/** The engine's slots, filled per voice and read by the formula (and by a component's
    line-height, ADR-0024 §6). Prefix tbx, claimed in ADR-0013 §2. */
export const SLOT = {
  lineHeight: "--_tbx-lineHeight",
  baselineOffset: "--_tbx-baselineOffset",
  emBox: "--_tbx-emBox",
  capGap: "--_tbx-capGap",
  descent: "--_tbx-descent",
};

/** The voices the engine serves: every voice with block metrics. An inline voice (code)
    has none — it rides the run it sits in. */
export function textBoxVoices(voices = typeVoices) {
  return Object.entries(voices)
    .filter(([, def]) => !def.inline)
    .map(([voice]) => voice);
}

/** The fallback trim: the half-leading minus the gap above the cap height (start) or
    the descent (end), nudged by the voice's baseline offset, in the container's own em. */
function fallbackDeclarations(indent) {
  const v = (name) => `var(${SLOT[name]})`;
  return [
    `${indent}margin-block-start: calc(((${v("emBox")} - ${v("lineHeight")}) / 2 - ${v("capGap")} + ${v("baselineOffset")}) * 1em);`,
    `${indent}margin-block-end: calc(((${v("emBox")} - ${v("lineHeight")}) / 2 - ${v("descent")} - ${v("baselineOffset")}) * 1em);`,
  ];
}

export function generateTextBoxStylesheet(voices = typeVoices) {
  const block = `[data-text-box="block"] > .text`;
  const forced = `[data-test-text-box="fallback"]`;
  const lines = [
    "/* GENERATED — do not edit. Source: theme-default/typography.tokens.js (typeVoices)",
    "   via engine/text-box.js (ADR-0024). The text-box engine: one cell per voice, the two",
    "   mode gates, and the trim — native, fallback, and the fallback forced in a region",
    "   that asks for it, each excluding the others.",
    "   Regenerate: pnpm tokens   (freshness guarded by tests) */",
    "",
  ];

  for (const voice of textBoxVoices(voices)) {
    lines.push(
      `[data-variant="${voice}"] {`,
      `  ${SLOT.lineHeight}: var(${METRIC_TOKEN.lineHeight(voice)});`,
      `  ${SLOT.baselineOffset}: var(${METRIC_TOKEN.baselineOffset(voice)});`,
      `  ${SLOT.emBox}: var(${GEOMETRY_TOKEN.emBox(voice)});`,
      `  ${SLOT.capGap}: var(${GEOMETRY_TOKEN.capGap(voice)});`,
      `  ${SLOT.descent}: var(${GEOMETRY_TOKEN.descent(voice)});`,
      "}",
      "",
    );
  }

  lines.push(
    `[data-text-box="inline"] > .text {`,
    "  display: inline;",
    "}",
    "",
    `${block} {`,
    "  display: block;",
    "}",
    "",
    `@supports not (${NATIVE_TRIM}) {`,
    `  ${block} {`,
    ...fallbackDeclarations("    "),
    "  }",
    "}",
    "",
    `@supports ${NATIVE_TRIM} {`,
    `  [data-text-box="block"]:not(${forced} *) > .text {`,
    "    text-box-trim: trim-both;",
    "    text-box-edge: cap alphabetic;",
    "  }",
    "",
    `  ${forced} ${block} {`,
    ...fallbackDeclarations("    "),
    "  }",
    "}",
    "",
  );
  return lines.join("\n");
}
