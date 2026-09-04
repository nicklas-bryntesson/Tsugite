// THE CAPABILITY PLUGIN (RFC 0001, phases 1–2) — one registry, three builds.
//
// Component source is standard CSS: every progressive-enhancement branch is a
// closed `@supports` pair whose condition is a registry entry
// (engine/capabilities.js), verbatim. This Vite plugin reads that registry and
// decides, per build, what the discriminant of each pair becomes:
//
//   mode `supports`  (default, production)
//       A no-op. No visitor, an empty virtual sheet. The output is
//       byte-identical to a build without the plugin — this is the null
//       hypothesis the RFC is measured against.
//
//   mode `probe`     (kitchensink side-by-side)
//       A Lightning CSS visitor rewrites `@supports <positive(key)>` into
//       `@container style(--cap-<key>: on)` and `@supports <negative(key)>`
//       into `… off`. A generated head registers `--cap-<key>` and sets it on
//       `:root` from the real `@supports` (so an unprobed page renders exactly
//       as production) and lets `[data-cap-<kebab-key>="on|off"]` on any
//       ancestor override it by inheritance. Both branches of a pair then live
//       in one bundle and a capable browser can render the degraded case on
//       demand. This mode never reaches production (style queries and
//       `@property` have a narrower floor than anything in the registry).
//
//   mode `force`     (not built yet — the shape is reserved)
//       ADR-0009's deletion-readiness check: a parse-time swap that keeps one
//       branch and drops the other, per capability. Adds a `mode` value and a
//       second visitor here; nothing else in this file needs to move.
//
// WHY THE HEAD IS A CLOSED PAIR
//
// The head sets `--cap-<key>` on `:root` from TWO mutually exclusive
// `@supports` blocks — `positive(key)` → on, `negative(key)` → off — and never
// from an unconditional `:root` rule. An unconditional base with an `@supports`
// override would be base-plus-override: two rules on one property on one
// element, one struck through. That is the very shape the doctrine forbids for
// what the pair discriminates (css-doctrine §1, ADR-0007), so the discriminant
// obeys it too. `@property … syntax: "on | off"` makes the style query compare
// identifiers rather than token streams; its `initial-value` never fires,
// because exactly one `:root` rule always matches.
//
// WHAT IS NOT REWRITTEN
//
// A style query resolves against the nearest ANCESTOR container. The root
// element has no ancestor, so a `@supports` block whose every subject is
// `:root` cannot be probed and is left as `@supports`. Today that is the oklch
// palette pair the token factory emits (color.raw.generated.css) — and the
// head's own pair, which is how the head survives its own visitor even if the
// filename check below were to miss.
//
// THE ASTRO DOUBLE PASS
//
// Astro runs Vite's CSS pipeline twice over every `<style>` block: once via
// `preprocessCSS` before its scoping pass, once more on the scoped
// `?astro&type=style` module. Plain `.css` files pass once. The rewrite is
// therefore idempotent by construction — it consumes `@supports` and emits
// `@container`, which it never touches again — and the head is NOT prepended
// per sheet (that would have emitted it once per pass per sheet). The head is
// one virtual module, `virtual:tsugite/capabilities.css`, imported once by the
// consumer's layout. It is a JS-side import, not a CSS `@import`: Vite's
// Lightning bundler reads `@import` targets from disk and resolves them
// without consulting plugin `resolveId`, so a virtual id cannot be reached
// from CSS.
//
// LIGHTNING'S JS BRIDGE
//
// Absent fields arrive as `null` but `null` is rejected on the way back in
// ("expected a string, found ()"), so everything returned from a visitor has
// its nulls stripped. The `supports(rule)` hook receives a structured
// SupportsCondition, not a string: registry conditions are matched by parsing
// each of them with Lightning itself and comparing the canonical JSON, so the
// registry's textual form and Lightning's structural form cannot drift apart.

import { transform, composeVisitors } from "lightningcss";
import { capabilities, positive, negative } from "../engine/capabilities.js";

/** @typedef {"supports" | "probe"} CapMode */

/** The id a consumer imports: `import "virtual:tsugite/capabilities.css"`. */
export const VIRTUAL_ID = "virtual:tsugite/capabilities.css";
const RESOLVED_ID = "\0" + VIRTUAL_ID;

const MODES = /** @type {const} */ (["supports", "probe"]);

/** `textTrim` → `text-trim`: the attribute suffix of a key. */
export const kebab = (key) => key.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());

/** The `data-cap-*` attribute a probe page sets for `key`. */
export const attributeOf = (key) => `data-cap-${kebab(key)}`;

/**
 * The generated head for mode `probe`: per key, one `@property` registration,
 * the closed `:root` pair, and the two attribute overrides. Emitted ONCE per
 * page via the virtual module. Every `:root` rule sits inside an `@supports`
 * block — there is no unconditional base, by design (see the header).
 * @param {string[]} [keys] defaults to every registry key
 * @returns {string} CSS
 */
export function capabilitiesHead(keys = Object.keys(capabilities)) {
  return keys
    .map((key) => {
      const prop = `--cap-${key}`;
      const attr = attributeOf(key);
      return [
        `@property ${prop} { syntax: "on | off"; inherits: true; initial-value: off; }`,
        `@supports ${positive(key)} { :root { ${prop}: on } }`,
        `@supports ${negative(key)} { :root { ${prop}: off } }`,
        `[${attr}="on"] { ${prop}: on }`,
        `[${attr}="off"] { ${prop}: off }`,
        "",
      ].join("\n");
    })
    .join("\n");
}

/** Drop `null` fields from a value that is about to cross back into Lightning. */
const stripNulls = (v) => JSON.parse(JSON.stringify(v, (_k, x) => (x === null ? undefined : x)));

/**
 * The canonical form of a SupportsCondition: its JSON after null-stripping.
 * Conditions carry no source locations, so two parses of the same text agree.
 * @param {unknown} condition
 */
const signatureOf = (condition) => JSON.stringify(stripNulls(condition));

/** Parse a `@supports` param string with Lightning and return its condition signature. */
function parseSignature(params) {
  let signature;
  transform({
    filename: "registry.css",
    code: Buffer.from(`@supports ${params} { a { color: red } }`),
    visitor: {
      Rule: {
        supports(rule) {
          signature = signatureOf(rule.value.condition);
        },
      },
    },
  });
  if (!signature) throw new Error(`capability condition did not parse: @supports ${params}`);
  return signature;
}

/**
 * signature → { key, polarity } for both polarities of every registry key.
 * @returns {Map<string, { key: string, polarity: "on" | "off" }>}
 */
function conditionTable() {
  const table = new Map();
  for (const key of Object.keys(capabilities)) {
    table.set(parseSignature(positive(key)), { key, polarity: "on" });
    table.set(parseSignature(negative(key)), { key, polarity: "off" });
  }
  return table;
}

/** True when the sheet named `source` is the generated head. */
const isHeadSource = (source) => typeof source === "string" && source.includes(VIRTUAL_ID);

/** True for a selector that is exactly the root element: `:root` or `html`. */
const isRootSelector = (sel) =>
  sel.length === 1 &&
  ((sel[0].type === "pseudo-class" && sel[0].kind === "root") ||
    (sel[0].type === "type" && sel[0].name === "html"));

/**
 * True when every rule inside a `@supports` block is a style rule on the root
 * element alone — unprobeable (no ancestor container), so left as `@supports`.
 */
const isRootOnly = (rule) =>
  rule.value.rules.length > 0 &&
  rule.value.rules.every(
    (r) => r.type === "style" && !(r.value.rules?.length) && r.value.selectors.every(isRootSelector),
  );

/** The `style(--cap-<key>: <polarity>)` container condition. */
const styleQuery = (key, polarity) => ({
  type: "style",
  value: {
    type: "declaration",
    value: {
      property: "custom",
      value: {
        name: `--cap-${key}`,
        value: [{ type: "token", value: { type: "ident", value: polarity } }],
      },
    },
  },
});

/**
 * The mode-`probe` visitor. Stateless across sheets except for the current
 * sheet's source list, which the filename check reads.
 * @returns {import("lightningcss").Visitor<{}>}
 */
export function createProbeVisitor() {
  const table = conditionTable();
  /** @type {string[]} */
  let sources = [];
  return {
    StyleSheet(sheet) {
      sources = sheet.sources;
    },
    Rule: {
      supports(rule) {
        if (isHeadSource(sources[rule.value.loc.source_index])) return;
        const hit = table.get(signatureOf(rule.value.condition));
        if (!hit || isRootOnly(rule)) return;
        return stripNulls({
          type: "container",
          value: {
            loc: rule.value.loc,
            rules: rule.value.rules,
            condition: styleQuery(hit.key, hit.polarity),
          },
        });
      },
    },
  };
}

/**
 * The Vite plugin.
 *
 * Requires `css.transformer: "lightningcss"` on the consumer (ADR-0010) — the
 * visitor rides that pipeline and has nothing to attach to otherwise. Never
 * touches `css.lightningcss.targets`; the browserslist owns those.
 *
 * @param {{ mode?: CapMode }} [options] `mode` defaults to `process.env.CAP_MODE`, then `"supports"`
 * @returns {import("vite").Plugin}
 */
export default function tsugiteCapabilities({ mode = /** @type {CapMode} */ (process.env.CAP_MODE ?? "supports") } = {}) {
  if (!MODES.includes(mode)) {
    throw new Error(`tsugite/vite/capabilities: unknown mode "${mode}" (expected ${MODES.join(" | ")})`);
  }
  return {
    name: "tsugite:capabilities",
    config(config) {
      if (mode !== "probe") return;
      config.css ??= {};
      config.css.lightningcss ??= {};
      const existing = config.css.lightningcss.visitor;
      const probe = createProbeVisitor();
      config.css.lightningcss.visitor = existing ? composeVisitors([existing, probe]) : probe;
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },
    load(id) {
      if (id === RESOLVED_ID) return mode === "probe" ? capabilitiesHead() : "";
    },
  };
}
