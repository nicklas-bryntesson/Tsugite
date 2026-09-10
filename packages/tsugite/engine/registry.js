// THE TOKEN REGISTRY (ADR-0014)
//
// One generated page that lists every custom property a component author may
// reference, per layer, in resolution-chain order — names and roles, never
// values. It is built from the same factories that emit the CSS, so it cannot
// drift from them; tests/tokens.test.ts keeps the committed copy fresh.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  generateRawStylesheet,
  generateStylesheet,
  generateThemesStylesheet,
  generateTypographyStylesheet,
  generateBaseStylesheet,
} from "./collector.js";
import { themeChannels, voiceMatrix, VOLUMES } from "../theme-default/theme.voices.tokens.js";
import { uiSeamTokens } from "../theme-default/seam.ui.tokens.js";
import { typeVoices, TIERS } from "../theme-default/typography.tokens.js";
import { spaceSteps } from "../theme-default/size.tokens.js";
import { GRID_STEPS } from "../theme-default/grid.tokens.js";

const SEMANTIC_COLOR_SOURCE = fileURLToPath(new URL("../theme-default/semantic.color.tokens.js", import.meta.url));

/** Distinct declared custom-property names in a stylesheet, in source order. */
const declaredNames = (css) =>
  [...new Set([...css.matchAll(/^\s*(--[A-Za-z0-9_-]+)\s*:/gm)].map((m) => m[1]))];

const isRaw = (name) => /^--[A-Z0-9-]+$/.test(name);

/** `/** role *\/` doc comments that sit directly above a token key in a source file. */
function docRoles(sourcePath) {
  const text = readFileSync(sourcePath, "utf8");
  const roles = {};
  for (const m of text.matchAll(/\/\*\*\s*([^*]*?)\s*\*\/\s*\n\s*"(--[^"]+)"/g)) {
    roles[m[2]] = m[1].replace(/\s+/g, " ").trim();
  }
  return roles;
}

const table = (header, rows) =>
  [`| ${header[0]} | ${header[1]} |`, "|---|---|", ...rows.map(([a, b]) => `| \`${a}\` | ${b} |`)].join("\n");

const groupByPrefix = (names, depth = 1) => {
  const groups = new Map();
  for (const n of names) {
    const key = n.replace(/^--/, "").split("-").slice(0, depth).join("-");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(n);
  }
  return groups;
};

const inlineList = (names) => names.map((n) => `\`${n}\``).join(", ");

function colorSection() {
  const names = declaredNames(generateStylesheet());
  const roles = docRoles(SEMANTIC_COLOR_SOURCE);
  const rows = names.map((n) => [n, roles[n] ?? ""]);
  return [
    `### Colour — \`--color-*\` (${names.length}, four-mode)`,
    "",
    "Each name switches light · dark · light-contrast · dark-contrast by itself; the",
    "component never mentions appearance (ADR-0004 §2).",
    "",
    table(["Token", "Role"], rows),
  ].join("\n");
}

function typographySection() {
  const names = declaredNames(generateTypographyStylesheet()).filter((n) => !isRaw(n));
  const voices = Object.keys(typeVoices);
  const voiceRe = new RegExp(`^--(.+?)-(${voices.join("|")})(-.*)?$`);
  const bundles = new Map();
  for (const n of names) {
    if (n.startsWith("--fontSize-")) continue;
    const m = n.match(voiceRe);
    if (!m) continue;
    if (!bundles.has(m[1])) bundles.set(m[1], []);
    bundles.get(m[1]).push(m[2] + (m[3] ?? ""));
  }
  const sizes = names.filter((n) => n.startsWith("--fontSize-"));
  return [
    `### Typography roles (${names.length})`,
    "",
    `Voices: ${voices.map((v) => `\`${v}\``).join(", ")}. Every voice publishes one token per`,
    "bundle property; a component reads the voice's bundle, never a family or weight",
    "constant. Size stops are tier ramps (ADR-0001) multiplied by `--TYPE-SCALE`.",
    "",
    table(
      ["Bundle property", "Per voice"],
      [...bundles.entries()].map(([prop, vs]) => [`--${prop}-<voice>`, inlineList(vs)]),
    ),
    "",
    `Size stops: ${inlineList(sizes)}.`,
  ].join("\n");
}

function baseSection() {
  const names = declaredNames(generateBaseStylesheet()).filter((n) => !isRaw(n));
  const size = names.filter((n) => n.startsWith("--size-"));
  const site = names.filter((n) => n.startsWith("--site-"));
  const grid = names.filter((n) => n.startsWith("--grid-"));
  const steps = Object.keys(spaceSteps);
  return [
    `### Spacing — \`--size-*\` (${size.length})`,
    "",
    `Steps ${steps.map((s) => `\`${s}\``).join(", ")}, one value per viewport tier (${TIERS.join(" · ")}),`,
    "multiplied by `--SPACE-SCALE`. The `-px` twins are the same step in px for the",
    "rare property that cannot take rem.",
    "",
    inlineList(size) + ".",
    "",
    `### Site scaffolding (${site.length})`,
    "",
    inlineList(site) + ".",
    "",
    `### Grids — \`--grid-*\` (${grid.length})`,
    "",
    `Three recipes (container, layout, breakout) on the grid's own ladder (${GRID_STEPS.join(" · ")}, ADR-0011).`,
    "",
    inlineList(grid) + ".",
  ].join("\n");
}

function themeSection() {
  const channels = Object.values(themeChannels);
  const voices = Object.entries(voiceMatrix).map(([v, vols]) => `\`${v}\` (${vols.join(", ")})`).join(", ");
  return [
    `## 2. Theme channels — \`--theme-*\` (${channels.length}) — read with one fallback`,
    "",
    "A channel is present when a voice region (`data-theme`) is an ancestor and absent",
    "otherwise, so it is read with exactly one fallback to the semantic token the",
    "component would otherwise use (ADR-0008): `var(--theme-text, var(--color-text-primary))`.",
    `Voices and their volumes (\`data-prominence\`, ${VOLUMES.join(" | ")}): ${voices}.`,
    "`--theme-cell-*` names are generated wiring and are never referenced.",
    "",
    inlineList(channels) + ".",
  ].join("\n");
}

function seamSection() {
  const rows = Object.entries(uiSeamTokens).map(([n, v]) => [n, `\`${v}\``]);
  return [
    `## 4. The \`--ui-*\` seam (${rows.length}) — pointers into the semantic layer`,
    "",
    "The reference-components lineage's public surface (ADR-0002), expressed as",
    "appearance-free pointers. Ported components read it; it never mentions a mode.",
    "",
    table(["Seam token", "Points to"], rows),
  ].join("\n");
}

function rawSection() {
  const all = [
    ...declaredNames(generateRawStylesheet()),
    ...declaredNames(generateTypographyStylesheet()),
    ...declaredNames(generateBaseStylesheet()),
  ].filter(isRaw);
  const names = [...new Set(all)];
  const groups = groupByPrefix(names, 1);
  const lines = [];
  for (const [prefix, members] of groups) {
    if (prefix === "COLOR") {
      const families = groupByPrefix(members, 2);
      const fam = [...families.entries()].map(([f, m]) => `\`--${f}-\` × ${m.length}`).join(", ");
      lines.push(`- \`--COLOR-<FAMILY>-<L>\` (${members.length}): ${fam}`);
    } else if (members.length > 12) {
      const tails = [...new Set(members.map((n) => n.split("-").pop()))];
      lines.push(`- \`--${prefix}-<STOP>-<TIER>\` (${members.length}), tiers ${inlineList(tails)}`);
    } else {
      lines.push(`- ${inlineList(members)}`);
    }
  }
  return [
    `## 5. RAW constants (${names.length}) — never in a component`,
    "",
    "UPPERCASE names are the palette, the type stops per tier, the spacing and site",
    "constants and the scale knobs. Only the semantic factories may reference them",
    "(ADR-0004 §1). A component that writes one has skipped a layer.",
    "",
    ...lines,
  ].join("\n");
}

export function generateTokenRegistry() {
  return [
    "# Token registry — what a component may reference",
    "",
    "<!-- GENERATED — do not edit. Built by engine/registry.js from theme-default/*.tokens.js.",
    "     Regenerate: pnpm tokens   (freshness guarded by tests/tokens.test.ts) -->",
    "",
    "Names and roles only, never values: values switch by appearance and viewport",
    "tier and resolve at runtime. Read top-down; that is the resolution chain",
    "(ADR-0008), and a component's CSS reaches at most one layer down from where",
    "it stands:",
    "",
    "```",
    "component slot (--_*) → theme channel (--theme-*, one fallback) → semantic → RAW",
    "```",
    "",
    "**If a name is not on this page it does not exist.** Do not invent a value or a",
    "token; write a `TODO(token)` beside the raw value and raise it as a finding.",
    "",
    "## 1. Component slots — `--_<prefix>-<propertyCamel>` — private",
    "",
    "Declared by the component that owns them, on its root (ADR-0013). Never read",
    "another component's slot. The prefix register lives in ADR-0013.",
    "",
    themeSection(),
    "",
    "## 3. Semantic tokens — read directly",
    "",
    "The layer a component's slot resolves to when no theme channel applies, and the",
    "only layer allowed to reference RAW.",
    "",
    colorSection(),
    "",
    baseSection(),
    "",
    typographySection(),
    "",
    seamSection(),
    "",
    rawSection(),
    "",
  ].join("\n");
}
