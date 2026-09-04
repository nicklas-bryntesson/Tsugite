// THE CAPABILITY GATE (RFC 0001, phase 0) — closed queries become a checked invariant.
//
// Every progressive-enhancement branch is a closed `@supports` pair (ADR-0009,
// css-doctrine §5): positive and negated, mutually exclusive, neither aware of
// the other. The condition lives once, in the registry
// (packages/tsugite/engine/capabilities.js); this gate proves the corpus obeys it.
//
//   R1  every `@supports` condition in the corpus is a registry key, verbatim
//   R2  every positive block has exactly one negated sibling for the same key
//       under the same parent, and vice versa (pairs nest inside the component
//       root per ADR-0010, so "same parent" is the same enclosing rule; two
//       top-level blocks share the stylesheet root as their parent)
//   R3  the two blocks of a pair have identical selector sets — a divergence
//       IS the bleed the pair exists to prevent
//   R4  every registry condition is parseable CSS in both polarities
//
// Same corpus as the nesting gate, with one difference: `.generated.css` files
// are scanned here. The oklch pair is emitted by the token factory into
// packages/tsugite/styles/tokens/color/color.raw.generated.css and is a real
// pair; a gate about pairs must see it.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import browserslist from "browserslist";
import { browserslistToTargets, transform } from "lightningcss";
import { describe, it, expect } from "vitest";
import { capabilities, positive, negative, parseCondition } from "tsugite/engine/capabilities.js";

const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));

const SCAN_ROOTS = [
  "packages/tsugite/components",
  "packages/tsugite/kernel",
  "packages/tsugite/fixtures",
  "packages/tsugite/styles",
  "apps/docs/src",
];

const EXTENSIONS = [".css", ".astro"];
// The nesting gate also skips /\.generated\.css$/ — not here, see the header.
const SKIP = [/node_modules/, /styles\/ui-tokens\.css$/];

const targets = browserslistToTargets(browserslist(undefined, { path: repoRoot }));

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (SKIP.some((re) => re.test(full))) continue;
    if (entry.isDirectory()) walk(full, out);
    else if (EXTENSIONS.some((ext) => full.endsWith(ext))) out.push(full);
  }
  return out;
}

/** The CSS of a source file: the file itself, or every <style> block of a .astro file. */
function stylesheetsOf(file: string): string[] {
  const source = readFileSync(file, "utf8");
  if (file.endsWith(".css")) return [source];
  return [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
    .map((m) => m[1])
    // `<style>{`…`}</style>` is an Astro expression, not a stylesheet — skip it.
    .filter((css) => !css.trim().startsWith("{"));
}

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");
const squash = (s: string) => s.replace(/\s+/g, " ").trim();

// ── A block parser for nested CSS ────────────────────────────────────────────
// The nesting gate only needs a regex; this gate needs the tree. Every `{…}` is
// a Block whose prelude is the text before the brace (a selector or an
// at-rule); declarations are consumed and dropped. Strings are honoured so a
// brace or semicolon inside `content: "…"` cannot open or close anything.

type Block = { prelude: string; children: Block[]; parent: Block | null };

function parseBlocks(css: string): Block {
  const root: Block = { prelude: "", children: [], parent: null };
  let cur = root;
  let buf = "";
  let quote: string | null = null;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (quote) {
      buf += ch;
      if (ch === "\\") buf += css[++i] ?? "";
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      buf += ch;
    } else if (ch === "{") {
      const block: Block = { prelude: squash(buf), children: [], parent: cur };
      cur.children.push(block);
      cur = block;
      buf = "";
    } else if (ch === "}") {
      cur = cur.parent ?? root;
      buf = "";
    } else if (ch === ";") {
      buf = "";
    } else {
      buf += ch;
    }
  }
  return root;
}

function* allBlocks(block: Block): Generator<Block> {
  for (const child of block.children) {
    yield child;
    yield* allBlocks(child);
  }
}

/** Split on commas at bracket depth zero, outside strings — `:is(a, b)` and `[x="a,b"]` stay whole. */
function splitSelectorList(prelude: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let buf = "";
  for (const ch of prelude) {
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    else if (ch === "," && depth === 0) {
      out.push(buf);
      buf = "";
      continue;
    }
    buf += ch;
  }
  out.push(buf);
  return out.map(squash).filter(Boolean);
}

/** The set of top-level selectors inside a block (at-rule preludes kept whole), sorted. */
function selectorSet(block: Block): string[] {
  return block.children
    .flatMap((c) => (c.prelude.startsWith("@") ? [c.prelude] : splitSelectorList(c.prelude)))
    .sort();
}

// ── The corpus ───────────────────────────────────────────────────────────────

type Gate = {
  where: string; // `<file>#<sheet index>`
  params: string;
  block: Block;
  parsed: ReturnType<typeof parseCondition>;
};

const SUPPORTS = /^@supports\s+([\s\S]+)$/;

function gatesOf(): Gate[] {
  const gates: Gate[] = [];
  for (const file of SCAN_ROOTS.flatMap((root) => walk(join(repoRoot, root)))) {
    const rel = relative(repoRoot, file);
    stylesheetsOf(file).forEach((sheet, i) => {
      for (const block of allBlocks(parseBlocks(stripComments(sheet)))) {
        const m = block.prelude.match(SUPPORTS);
        if (!m) continue;
        gates.push({ where: `${rel}#${i}`, params: m[1], block, parsed: parseCondition(m[1]) });
      }
    });
  }
  return gates;
}

const gates = gatesOf();

/** Registered gates grouped by (sheet, parent block, key) — the unit R2 and R3 reason about. */
function pairs(): Map<string, { where: string; key: string; on: Gate[]; off: Gate[] }> {
  const groups = new Map<string, { where: string; key: string; on: Gate[]; off: Gate[] }>();
  const parentIds = new Map<Block, number>();
  for (const g of gates) {
    if (!g.parsed) continue;
    const parent = g.block.parent!;
    if (!parentIds.has(parent)) parentIds.set(parent, parentIds.size);
    const id = `${g.where} parent#${parentIds.get(parent)} (${parent.prelude || "<stylesheet root>"}) ${g.parsed.key}`;
    const group = groups.get(id) ?? { where: g.where, key: g.parsed.key, on: [], off: [] };
    group[g.parsed.polarity].push(g);
    groups.set(id, group);
  }
  return groups;
}

describe("capability gate (RFC 0001, phase 0)", () => {
  it("scans a non-trivial corpus of @supports gates", () => {
    expect(gates.length).toBeGreaterThanOrEqual(2 * Object.keys(capabilities).length);
  });

  it("R1 — every @supports condition is a registry key, verbatim", () => {
    const unregistered = gates.filter((g) => !g.parsed).map((g) => `${g.where}: @supports ${g.params}`);
    expect(unregistered).toEqual([]);
  });

  it("R2 — every gate is one half of exactly one pair under the same parent", () => {
    const broken: string[] = [];
    for (const [id, group] of pairs()) {
      if (group.on.length !== 1 || group.off.length !== 1) {
        broken.push(`${id}: ${group.on.length} positive, ${group.off.length} negated`);
      }
    }
    expect(broken).toEqual([]);
  });

  it("R3 — the two blocks of a pair have identical selector sets", () => {
    const diverged: string[] = [];
    for (const [id, group] of pairs()) {
      if (group.on.length !== 1 || group.off.length !== 1) continue; // R2's finding, not R3's
      const on = selectorSet(group.on[0].block);
      const off = selectorSet(group.off[0].block);
      if (JSON.stringify(on) !== JSON.stringify(off)) {
        diverged.push(`${id}\n    positive: ${JSON.stringify(on)}\n    negated:  ${JSON.stringify(off)}`);
      }
    }
    expect(diverged).toEqual([]);
  });

  for (const key of Object.keys(capabilities)) {
    it(`R4 — "${key}" is parseable CSS in both polarities`, () => {
      const code = `@supports ${positive(key)} { a { color: red } } @supports ${negative(key)} { a { color: red } }`;
      const out = transform({ filename: `${key}.css`, code: Buffer.from(code), targets, minify: false }).code.toString();
      expect(out.match(/@supports/g)?.length).toBe(2);
      expect(out).toContain("not ");
    });
  }
});
