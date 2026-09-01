// Emits the color artifacts from the token factories (ADR-0003, T7).
// Run via `npm run tokens` — hooked into predev/prebuild, guarded by
// tests/tokens.test.ts so a stale artifact fails the suite.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  generateRawStylesheet,
  generateStylesheet,
  generateThemesStylesheet,
  generateSeamStylesheet,
  gamutReport,
} from "./collector.js";

const here = dirname(fileURLToPath(import.meta.url));
const rawOut = resolve(here, "../styles/tokens/color/color.raw.generated.css");
const out = resolve(here, "../styles/tokens/color/color.appearance.generated.css");
const themesOut = resolve(here, "../styles/tokens/color/color.themes.generated.css");
const seamOut = resolve(here, "../styles/ui-tokens.css");

mkdirSync(dirname(out), { recursive: true });
writeFileSync(rawOut, generateRawStylesheet());
writeFileSync(out, generateStylesheet());
writeFileSync(themesOut, generateThemesStylesheet());
writeFileSync(seamOut, generateSeamStylesheet());
console.log(`raw    → ${rawOut}`);
console.log(`tokens → ${out}`);
console.log(`themes → ${themesOut}`);
console.log(`seam   → ${seamOut}`);

const clipped = gamutReport();
if (clipped.length) {
  console.log(`gamut  → ${clipped.length} value(s) chroma-clamped in the sRGB emission:`);
  for (const c of clipped) console.log(`         ${c}`);
} else {
  console.log("gamut  → everything within sRGB, no clamping");
}
