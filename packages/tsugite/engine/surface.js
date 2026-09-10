// SURFACE ADJACENCY (ADR-0016)
//
// Two Surfaces of the same voice × volume standing next to each other read
// as one continuous ground, so the second drops its start padding. CSS has
// no "same attribute value as my sibling" selector; every combination must
// be enumerated, and the combinations are the combination law's whitelist
// (voiceMatrix, ADR-0006 §6). Generated from that one table so a new voice
// or volume can never leave a pair behind, and a forbidden pair gets no rule.
import { voiceMatrix, VOLUMES } from "../theme-default/theme.voices.tokens.js";

/** The selector for one Surface state: a voice × volume, a volume-only nesting, or the ground. */
export function surfaceSelector(voice, volume) {
  if (voice === null && volume === null) return `.Surface:not([data-theme]):not([data-prominence])`;
  if (voice === null) return `.Surface:not([data-theme])[data-prominence="${volume}"]`;
  return `.Surface[data-theme="${voice}"][data-prominence="${volume}"]`;
}

/** Every state a Surface can be in, in matrix order: ground, volume-only, then each allowed pair. */
export function surfaceStates() {
  const states = [[null, null]];
  for (const volume of VOLUMES) states.push([null, volume]);
  for (const [voice, volumes] of Object.entries(voiceMatrix)) {
    for (const volume of volumes) states.push([voice, volume]);
  }
  return states;
}

export function generateSurfaceStylesheet() {
  const lines = [
    "/* GENERATED — do not edit. Source: theme-default/theme.voices.tokens.js (voiceMatrix)",
    "   via engine/surface.js (ADR-0016). Two adjacent Surfaces of the same voice × volume",
    "   are one ground: the second drops its start padding. One rule per allowed",
    "   combination, plus the volume-only nestings and the ground.",
    "   Regenerate: pnpm tokens   (freshness guarded by tests) */",
    "",
  ];
  for (const [voice, volume] of surfaceStates()) {
    const s = surfaceSelector(voice, volume);
    lines.push(`${s} + ${s} {`, "  padding-block-start: 0;", "}", "");
  }
  return lines.join("\n");
}
