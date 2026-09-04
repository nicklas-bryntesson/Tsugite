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
//   R3  no base under the branches: a property a branch sets on a target is
//       set by no rule OUTSIDE the support axis on the same target — that is
//       base-plus-override, the one bleed the doctrine forbids (css-doctrine §1,
//       ADR-0007). The branches themselves need not mirror each other: a
//       value-swap feature (trim) does, an axis-swap feature (container queries
//       vs viewport queries) cannot, and both are lawful.
//   R4  every registry condition is parseable CSS in both polarities
//   R5  gates do not nest in gates — every capability is its own axis, so the
//       N+2 test matrix (all-on, all-off, one-off) stays sound
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

const SUPPORTS = /^@supports\s+([\s\S]+)$/;

// ── A block parser for nested CSS ────────────────────────────────────────────
// The nesting gate only needs a regex; this gate needs the tree. Every `{…}` is
// a Block whose prelude is the text before the brace (a selector or an
// at-rule); declarations are consumed and dropped. Strings are honoured so a
// brace or semicolon inside `content: "…"` cannot open or close anything.

type Block = { prelude: string; children: Block[]; parent: Block | null; props: string[] };

/** The property name of a declaration, or null for anything else (nested-rule fragments, noise). */
function propertyOf(decl: string): string | null {
  const m = /^\s*(--[\w-]+|[a-zA-Z-]+)\s*:/.exec(decl);
  return m ? m[1].toLowerCase() : null;
}

function parseBlocks(css: string): Block {
  const root: Block = { prelude: "", children: [], parent: null, props: [] };
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
      const block: Block = { prelude: squash(buf), children: [], parent: cur, props: [] };
      cur.children.push(block);
      cur = block;
      buf = "";
    } else if (ch === "}") {
      const prop = propertyOf(buf); // a last declaration without a trailing semicolon
      if (prop) cur.props.push(prop);
      cur = cur.parent ?? root;
      buf = "";
    } else if (ch === ";") {
      const prop = propertyOf(buf);
      if (prop) cur.props.push(prop);
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

const isAtRule = (b: Block) => b.prelude.startsWith("@");
const tidy = (sel: string) => squash(sel).replace(/\s*([>+~])\s*/g, " $1 ");

/**
 * The full selectors a rule block matches, with nesting resolved: `&` is
 * replaced by each parent selector, a nested selector without `&` is a
 * descendant of it (CSS Nesting semantics), at-rules are transparent. Parent
 * lists expand as a cross product — enough for identity, and ADR-0010 forbids
 * nesting into lists anyway.
 */
function resolvedSelectors(block: Block): string[] {
  if (isAtRule(block) || !block.prelude) return [];
  let up = block.parent;
  while (up && (isAtRule(up) || !up.prelude) && up.parent) up = up.parent;
  const parents = up && up.prelude && !isAtRule(up) ? resolvedSelectors(up) : [];
  const own = splitSelectorList(block.prelude);
  if (parents.length === 0) return own.map((s) => tidy(s.replace(/&/g, "")));
  return parents.flatMap((p) => own.map((s) => tidy(s.includes("&") ? s.replace(/&/g, p) : `${p} ${s}`)));
}

/**
 * The at-rule context of a rule: the preludes of every enclosing at-rule
 * except @supports (the axis under test), outermost first. Two declarations
 * on the same selector+property conflict only when their contexts can be
 * active at once. We can prove that in two cases — one side has NO context
 * (truly unconditional), or the contexts are identical — and only flag
 * those. Two different media ranges are treated as disjoint even when they
 * overlap: a false negative we accept over reasoning about range algebra.
 */
function contextOf(block: Block, stopAt: Block | null): string {
  const chain: string[] = [];
  for (let up = block.parent; up && up !== stopAt; up = up.parent) {
    if (isAtRule(up) && !SUPPORTS.test(up.prelude)) chain.unshift(up.prelude);
  }
  return chain.join(" ");
}

type Decl = { sel: string; prop: string; ctx: string };

/** Every declaration inside `block`, recursively, with its selector resolved and its at-rule context relative to `block`. */
function surfaceOf(block: Block): Decl[] {
  const out: Decl[] = [];
  const visit = (b: Block) => {
    if (!isAtRule(b) && b.prelude) {
      const ctx = contextOf(b, block);
      for (const sel of resolvedSelectors(b)) for (const prop of b.props) out.push({ sel, prop, ctx });
    }
    b.children.forEach(visit);
  };
  block.children.forEach(visit);
  return out;
}

const underSupports = (b: Block): boolean => {
  for (let up = b.parent; up; up = up.parent) if (SUPPORTS.test(up.prelude)) return true;
  return false;
};

// ── The corpus ───────────────────────────────────────────────────────────────

type Gate = {
  where: string; // `<file>#<sheet index>`
  params: string;
  block: Block;
  sheet: Block;
  parsed: ReturnType<typeof parseCondition>;
};

function gatesOf(): Gate[] {
  const gates: Gate[] = [];
  for (const file of SCAN_ROOTS.flatMap((root) => walk(join(repoRoot, root)))) {
    const rel = relative(repoRoot, file);
    stylesheetsOf(file).forEach((sheet, i) => {
      const tree = parseBlocks(stripComments(sheet));
      for (const block of allBlocks(tree)) {
        const m = block.prelude.match(SUPPORTS);
        if (!m) continue;
        gates.push({ where: `${rel}#${i}`, params: m[1], block, sheet: tree, parsed: parseCondition(m[1]) });
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

  it("R3 — no base under the branches: nothing outside the support axis sets what a branch sets", () => {
    // Per stylesheet: every declaration NOT inside any @supports — the
    // unconditional layer of the component, viewport/container gates included
    // (they bound a different axis and carry their context along). A branch
    // declaring the same property on the same selector in a context that can
    // co-occur is an override over a base: two rules, one struck through.
    const baseCache = new Map<Block, Decl[]>();
    const baseOf = (sheet: Block) => {
      if (!baseCache.has(sheet)) {
        const out: Decl[] = [];
        for (const b of allBlocks(sheet)) {
          if (isAtRule(b) || !b.prelude || underSupports(b)) continue;
          const ctx = contextOf(b, null);
          for (const sel of resolvedSelectors(b)) for (const prop of b.props) out.push({ sel, prop, ctx });
        }
        baseCache.set(sheet, out);
      }
      return baseCache.get(sheet)!;
    };
    const coOccur = (a: string, b: string) => a === "" || b === "" || a === b;
    const bleeds: string[] = [];
    for (const g of gates) {
      if (!g.parsed) continue; // R1's finding
      const base = baseOf(g.sheet);
      for (const d of surfaceOf(g.block)) {
        const hit = base.find((b) => b.sel === d.sel && b.prop === d.prop && coOccur(b.ctx, d.ctx));
        if (hit) {
          bleeds.push(
            `${g.where}: @supports ${g.params}${d.ctx ? ` ${d.ctx}` : ""} sets "${d.prop}" on "${d.sel}" — ` +
              `also set ${hit.ctx ? `under ${hit.ctx}` : "unconditionally"}`,
          );
        }
      }
    }
    expect(bleeds).toEqual([]);
  });

  it("R5 — gates do not nest in gates: every capability is its own axis", () => {
    const nested = gates.filter((g) => underSupports(g.block)).map((g) => `${g.where}: @supports ${g.params} inside another @supports`);
    expect(nested).toEqual([]);
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
