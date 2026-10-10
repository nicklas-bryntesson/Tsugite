// Throwaway conformance scan (read-only) — measures the ratchet baseline for the
// writing-css rules over packages/tsugite/components (+ kernel) CSS and <style> blocks.
// Usage: node scan.mjs [repoRoot] [--json out.json]   (repoRoot defaults to this checkout)
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join, relative, dirname, basename } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const repo = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2]
  : fileURLToPath(new URL("../../../../", import.meta.url));
const pkg = join(repo, "packages/tsugite");
const require = createRequire(join(repo, "node_modules/.pnpm/postcss@8.5.26/node_modules/postcss/package.json"));
const postcss = require("postcss");

// ── registry: every name tokens.generated.md lists (ADR-0014) ───────────────────
const md = readFileSync(join(pkg, "docs/tokens.generated.md"), "utf8");
const registry = new Set([...md.matchAll(/`(--[A-Za-z0-9_-]+)`/g)].map((m) => m[1]));
for (const row of md.matchAll(/^\| `(--[A-Za-z]+-)<voice>` \| (.+) \|$/gm))
  for (const v of row[2].matchAll(/`([\w-]+)`/g)) registry.add(row[1] + v[1]);
const themeChannels = new Set([...registry].filter((n) => n.startsWith("--theme-")));

// ── ADR-0013 prefix register ────────────────────────────────────────────────────
const adr13 = readFileSync(join(pkg, "docs/adr/0013-component-slots-follow-the-token-grammar.md"), "utf8");
const prefixOf = {};
for (const line of adr13.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("| `"))) {
  const cells = line.split("|").map((c) => c.trim());
  for (let i = 1; i + 1 < cells.length; i += 3) {
    const pre = [...cells[i].matchAll(/`(\w+)`/g)].map((m) => m[1]);
    const name = cells[i + 1]?.split(/\s/)[0];
    if (pre.length && name) prefixOf[name] = pre;
  }
}

const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
// ── recipes: axes → required gates ──────────────────────────────────────────────
const recipes = {}; // class → { axis: { attr, values, unwritten } }
const recipeHits = [];
for (const f of readdirSync(join(pkg, "recipes"))) {
  const mod = await import(join(pkg, "recipes", f));
  for (const r of Object.values(mod)) {
    if (!r?.class || !r.axes) continue;
    const axes = {};
    for (const [name, a] of Object.entries(r.axes)) {
      const values = a.type === "boolean" ? ["false", "true"] : a.valuesBy ? [...new Set(Object.values(a.valuesBy.values).flat())] : [...(a.values ?? [])];
      axes[name] = { attr: `data-${kebab(name)}`, values, skip: Boolean(a.unwritten || a.maps) };
      // ADR-0022 §2: an axis with a logical pair takes logical values
      for (const v of values) if (/^(left|right|top|bottom)$/.test(v)) recipeHits.push({ cls: r.class, text: `${name}: "${v}" (ADR-0022 §2)` });
      if (name === "align") recipeHits.push({ cls: r.class, text: "bare align (ADR-0022 §1)" });
    }
    recipes[r.class] = axes;
  }
}
// names other kernel sheets declare for components to read (debug palette)
const kernelDeclared = new Set([...readFileSync(join(pkg, "kernel/css/debug.css"), "utf8").matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]));

// ── corpus ──────────────────────────────────────────────────────────────────────
function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.name === "node_modules") continue;
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}
const sheets = []; // {file, component, css, lineOffset, kind}
for (const root of ["components", "kernel/css"]) {
  for (const file of walk(join(pkg, root))) {
    if (file.endsWith(".generated.css")) continue;
    const rel = relative(repo, file);
    const component = root === "kernel/css" ? `kernel:${basename(file)}` : basename(dirname(file));
    const kind = file.includes(".bench.") ? "bench" : "component";
    if (file.endsWith(".css")) sheets.push({ file: rel, component, css: readFileSync(file, "utf8"), lineOffset: 0, kind });
    else if (file.endsWith(".astro")) {
      const src = readFileSync(file, "utf8");
      for (const m of src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
        if (m[1].trim().startsWith("{")) continue;
        const lineOffset = src.slice(0, m.index).split("\n").length - 1;
        sheets.push({ file: rel, component, css: m[1], lineOffset, kind });
      }
    }
  }
}

// ── rules ───────────────────────────────────────────────────────────────────────
const V = []; // {rule, file, component, line, text, kind}
const hit = (s, rule, node, text) =>
  V.push({ rule, file: s.file, component: s.component, kind: s.kind, line: (node?.source?.start?.line ?? 0) + s.lineOffset, text: String(text).slice(0, 120) });

/** top-level var() expressions in a value: [{name, fallback}] (recursive). */
function vars(value) {
  const out = [];
  let i = 0;
  while ((i = value.indexOf("var(", i)) >= 0) {
    let depth = 0, j = i + 3;
    for (; j < value.length; j++) {
      if (value[j] === "(") depth++;
      else if (value[j] === ")" && --depth === 0) break;
    }
    const inner = value.slice(i + 4, j);
    const comma = inner.indexOf(",");
    const name = (comma < 0 ? inner : inner.slice(0, comma)).trim();
    const fallback = comma < 0 ? null : inner.slice(comma + 1).trim();
    out.push({ name, fallback, expr: value.slice(i, j + 1) });
    i = j + 1;
  }
  return out;
}

const PHYSICAL = /^(margin|padding|border|scroll-margin|scroll-padding)-(left|right|top|bottom)(-|$)|^(left|right|top|bottom)$|^border-(top|bottom)-(left|right)-radius$/;
const PHYSICAL_DIM = /^(min-|max-)?(width|height)$/;
const SPACING = /^(margin|padding|gap|row-gap|column-gap|inset)(-|$)/;
const RAW_LEN = /(?<![\w.-])(?:\d*\.)?\d+(px|rem|em|ch|vw|vh)\b/;
const PROVENANCE = /\b(port(ed)? (of|from)|reference-components|ref-comps|AiPoc|kitchen[- ]sink|previous codebase|predecessor|flat, fully-qualified)\b/i;
const RULER = /[─━═]{4,}|[-=*]{8,}/;
const TIER_BOUNDS = new Set(["21.24999rem", "21.25rem", "48.74999rem", "48.75rem", "89.99999rem", "89.99rem", "90rem"]);

function todoAbove(node, type) {
  // a TODO(type) comment among the preceding siblings, before the previous declaration
  let p = node.prev();
  while (p && p.type === "comment") {
    if (p.text.includes(`TODO(${type})`)) return true;
    p = p.prev();
  }
  // also accept a TODO in the rule's leading comments (knob blocks write one per group)
  return false;
}

for (const s of sheets) {
  let root;
  try { root = postcss.parse(s.css, { from: s.file }); }
  catch (e) { hit(s, "parse-error", null, e.message); continue; }

  // one root per file (doctrine §7) — .css files only; Astro blocks may hold :global helpers
  const tops = root.nodes.filter((n) => n.type === "rule");
  if (tops.length > 1) for (const t of tops.slice(1)) hit(s, "second-root", t, t.selector);
  for (const t of tops) {
    const first = t.selector.match(/^\s*\.([\w-]+)/)?.[1];
    if (first && /^[a-z]/.test(first) && s.kind === "component") hit(s, "lowercase-root", t, t.selector);
  }

  const decLines = new Map();
  root.walkDecls((d) => {
    const prop = d.prop;
    const value = d.value;
    const ln = d.source.start.line;
    decLines.set(ln, (decLines.get(ln) ?? 0) + 1);

    if (d.important) hit(s, "important", d, `${prop}: ${value} !important`);
    if (prop.startsWith("--_") && value.trim() === "") hit(s, "empty-slot", d, prop);
    if (PHYSICAL.test(prop)) hit(s, "physical-property", d, `${prop}: ${value}`);
    if (PHYSICAL_DIM.test(prop)) hit(s, "physical-dimension", d, `${prop}: ${value}`);
    if (/^(text-align|float|clear)$/.test(prop) && /\b(left|right)\b/.test(value)) hit(s, "physical-value", d, `${prop}: ${value}`);

    // raw spacing length where --size-* exists, without a TODO(token) above
    const bare = value.replace(/var\([^)]*\)/g, "");
    if (SPACING.test(prop) && RAW_LEN.test(bare) && !todoAbove(d, "token")) hit(s, "raw-spacing-no-todo", d, `${prop}: ${value}`);
    else if (!prop.startsWith("--") && RAW_LEN.test(bare) && !/^(font|line-height|letter-spacing)/.test(prop) && !todoAbove(d, "token"))
      hit(s, "raw-length-other", d, `${prop}: ${value}`);

    // the chain (doctrine §2)
    for (const v of vars(value)) {
      const n = v.name;
      if (n.startsWith("--_")) {
        const pre = n.match(/^--_([a-z]{2,3})-/)?.[1];
        const own = prefixOf[s.component];
        if (!pre) hit(s, "slot-unprefixed", d, n);
        else if (pre === "tbx") { /* text-box engine carriers, ADR-0024 */ }
        else if (own && !own.includes(pre)) hit(s, "slot-foreign-prefix", d, `${n} in ${s.component} (register: ${own.join(",")})`);
        else if (!own && s.kind === "component" && !s.component.startsWith("kernel:")) hit(s, "slot-prefix-unregistered", d, `${n} (${s.component} has no row)`);
      } else if (/^--[A-Z0-9-]+$/.test(n)) hit(s, "raw-token-in-component", d, n);
      else if (n.startsWith("--theme-cell-")) hit(s, "theme-cell-referenced", d, n);
      else if (n.startsWith("--custom-")) { /* ADR-0021 consumer hook */ }
      else if (kernelDeclared.has(n)) { /* kernel debug palette */ }
      else if (/^--fontWeight-\w+-bold$/.test(n) && v.fallback) { /* voice optional stop, ADR-0012 law b */ }
      else if (!registry.has(n)) hit(s, "unregistered-token", d, n);

      if (v.fallback !== null) {
        const inner = vars(v.fallback);
        if (inner.some((x) => x.fallback !== null)) hit(s, "fallback-pyramid", d, v.expr);
        const seam = n.startsWith("--theme-") || /^--fontWeight-[\w]+-bold$/.test(n) || n.startsWith("--custom-");
        if (!seam) hit(s, "fallback-off-seam", d, v.expr);
      }
    }
  });
  for (const [ln, c] of decLines) if (c > 1) hit(s, "multi-decl-per-line", { source: { start: { line: ln } } }, `${c} declarations`);

  // slot names, declared: form (ADR-0013 §1)
  root.walkDecls(/^--_/, (d) => {
    const n = d.prop;
    const rest = n.replace(/^--_([a-z]{2,3})-/, "");
    if (n !== rest && /(^|-)(border|background|font|line|letter|max|min|inline|block|padding|margin|text|box|outline|grid|align|justify|z)-[a-z]/.test(rest))
      hit(s, "slot-kebab-form", d, n);
    if (/(^|-)(bg|fg)(-|$)/.test(rest)) hit(s, "slot-abbreviation", d, n);
  });

  root.walkRules((r) => {
    const sel = r.selector;
    // parts: bare lowercase; Name-part / name-part is drift
    for (const m of sel.matchAll(/\.([A-Za-z][\w]*-[\w-]+)/g)) hit(s, "prefixed-part-class", r, `.${m[1]}`);
    // nested rule must begin with & (doctrine §7)
    if (r.parent && r.parent.type !== "root") {
      for (const piece of postcss.list.comma(sel)) {
        if (!piece.trim().startsWith("&") && !r.parent.type.startsWith("atrule-root")) {
          // inside an at-rule directly under root, the rule is top-level-ish; skip
          let anc = r.parent;
          while (anc && anc.type === "atrule") anc = anc.parent;
          if (anc && anc.type === "rule") hit(s, "nested-without-ampersand", r, piece.trim());
        }
      }
      // nesting into a selector list (ADR-0010 §2)
      if (r.parent.type === "rule" && postcss.list.comma(r.parent.selector).length > 1) hit(s, "nested-into-list", r, `${r.parent.selector} > ${sel}`);
    }
    // absence guards
    if (/:not\(\[data-[\w-]+\]\)/.test(sel)) hit(s, "absence-guard", r, sel);
    // rule on another component's class (ADR-0015)
    const rootName = tops.find((t) => r === t || t.contains?.(r))?.selector.match(/^\s*\.([A-Z]\w*)/)?.[1];
    for (const m of sel.matchAll(/\.([A-Z][A-Za-z]+)\b(?!-)/g)) {
      const own = rootName ?? s.component;
      if (m[1] !== own && m[1] !== s.component) hit(s, "foreign-component-class", r, `.${m[1]} in ${s.component}`);
    }
    // ADR-0025 old test-state form
    if (/\[data-test-state(~|\*)?=/.test(sel)) hit(s, "test-state-old-form", r, sel);
    // ADR-0022: bare align, physical values
    if (/\[data-align=/.test(sel) || /\[data-[\w-]+="(left|right|top|bottom)"\]/.test(sel)) hit(s, "physical-axis-word", r, sel);
  });

  root.walkAtRules((a) => {
    if (a.name === "layer") hit(s, "at-layer", a, `@layer ${a.params}`);
    if (a.name === "media" || a.name === "container") {
      for (const m of a.params.matchAll(/(min|max)-(width|height)\s*:\s*([\d.]+\w+)/g))
        if (a.name === "media" && !TIER_BOUNDS.has(m[3])) { hit(s, "media-not-tier-bound", a, `@media ${a.params}`); break; }
      if (a.name === "media" && /\bmin-width\b/.test(a.params) && !/\bmax-width\b/.test(a.params) && !/90rem|48\.75rem/.test(a.params))
        hit(s, "open-ended-tier", a, `@media ${a.params}`);
    }
    if (a.name === "supports" && !/^not\b/.test(a.params.trim())) {
      const want = `not ${a.params.trim()}`;
      const sibs = a.parent.nodes;
      const idx = sibs.indexOf(a);
      const pair = sibs.findIndex((x) => x.type === "atrule" && x.name === "supports" && x.params.replace(/\s+/g, " ").trim() === want.replace(/\s+/g, " "));
      if (pair < 0) hit(s, "supports-unpaired", a, `@supports ${a.params}`);
      else if (pair > idx) hit(s, "supports-fallback-not-first", a, `@supports ${a.params}`);
    }
  });

  root.walkComments((c) => {
    if (PROVENANCE.test(c.text)) hit(s, "provenance-comment", c, c.text.split("\n")[0]);
    if (RULER.test(c.text)) hit(s, "ruler-comment", c, c.text.split("\n")[0]);
    for (const m of c.text.matchAll(/TODO(?!\((decide|token|markup|dead|ref|investigate|class)\))(\(\w*\))?/g)) hit(s, "todo-untyped", c, m[0]);
  });
}

// ── recipe gate coverage: every axis value gated, nothing gated outside the table ─
const cssByComp = {};
for (const s of sheets.filter((x) => x.kind === "component")) cssByComp[s.component] = (cssByComp[s.component] ?? "") + s.css;
for (const [cls, axes] of Object.entries(recipes)) {
  const css = cssByComp[cls];
  if (!css) continue;
  const s = { file: `recipes→${cls}`, component: cls, kind: "component", lineOffset: 0 };
  for (const { attr, values, skip } of Object.values(axes)) {
    if (skip) continue;
    const used = new Set([...css.matchAll(new RegExp(`\\[${attr}="([^"]+)"\\]`, "g"))].map((m) => m[1]));
    if (!used.size) { hit(s, "axis-ungated", null, `${attr} (no gate at all)`); continue; }
    for (const v of values) if (!used.has(v)) hit(s, "axis-value-ungated", null, `${attr}="${v}"`);
    for (const u of used) if (!values.includes(u)) hit(s, "gate-outside-recipe", null, `${attr}="${u}"`);
  }
}
for (const r of recipeHits) hit({ file: `recipes→${r.cls}`, component: r.cls, kind: "component", lineOffset: 0 }, "recipe-physical-value", null, r.text);

// ── report ──────────────────────────────────────────────────────────────────────
const comps = V.filter((v) => v.kind === "component");
const byRule = {};
for (const v of comps) byRule[v.rule] = (byRule[v.rule] ?? 0) + 1;
const byComp = {};
for (const v of comps) (byComp[v.component] ??= {})[v.rule] = (byComp[v.component][v.rule] ?? 0) + 1;
const benches = V.filter((v) => v.kind === "bench").length;

console.log(`sheets: ${sheets.length} (${sheets.filter((s) => s.kind === "bench").length} bench) · registry names: ${registry.size} · register rows: ${Object.keys(prefixOf).length} · recipes: ${Object.keys(recipes).length}`);
console.log("\nBY RULE (component + kernel sheets, benches excluded)");
for (const [r, n] of Object.entries(byRule).sort((a, b) => b[1] - a[1])) console.log(`${String(n).padStart(5)}  ${r}`);
console.log(`\nbench-sheet violations (all rules): ${benches}`);
console.log("\nBY COMPONENT");
for (const [c, rules] of Object.entries(byComp).sort((a, b) => Object.values(b[1]).reduce((x, y) => x + y) - Object.values(a[1]).reduce((x, y) => x + y)))
  console.log(`${String(Object.values(rules).reduce((x, y) => x + y)).padStart(5)}  ${c}: ${Object.entries(rules).map(([r, n]) => `${r}=${n}`).join(" ")}`);

const jsonOut = process.argv.indexOf("--json");
if (jsonOut > 0) writeFileSync(process.argv[jsonOut + 1], JSON.stringify({ byRule, byComp, violations: V }, null, 2));
if (process.argv.includes("--samples")) {
  const seen = {};
  for (const v of comps) if ((seen[v.rule] = (seen[v.rule] ?? 0) + 1) <= 4) console.log(`[${v.rule}] ${v.file}:${v.line}  ${v.text}`);
}

// ═══ non-CSS gates ═════════════════════════════════════════════════════════════
if (process.argv.includes("--prose")) {
  const ledger = new Set(readdirSync(join(pkg, "docs/adr")).map((f) => f.slice(0, 4)).filter((n) => /^\d{4}$/.test(n)));
  const roots = ["packages/tsugite", "apps/docs/src", "apps/docs/tests", ".claude/skills", ".claude/hooks", "CLAUDE.md", "tasks"];
  const SKIPDIR = /node_modules|test-results|dist|\.astro\/|\.generated\./;
  const files = [];
  for (const r of roots) {
    const abs = join(repo, r);
    if (!existsSync(abs)) continue;
    if (r.endsWith(".md")) { files.push(abs); continue; }
    for (const f of walk(abs)) if (!SKIPDIR.test(f) && /\.(css|astro|ts|tsx|js|mjs|md|vue|py|json)$/.test(f)) files.push(f);
  }
  const out = { adrRefs: 0, adrMissing: [], adrQualifiedExternal: 0, adrSuspectExternal: [], deadPaths: [], swedish: [], testStateOld: [], dataWords: new Set() };
  const QUAL = /(reference-components|ref-lib|reference repo|reference library|AstroRefComp|reference-components')[^.\n]{0,40}$/i;
  for (const f of files) {
    const rel = relative(repo, f);
    const src = readFileSync(f, "utf8");
    const lines = src.split("\n");
    const portedFile = /Port of reference-components|reference-components lineage/i.test(src.slice(0, 1500));
    lines.forEach((line, i) => {
      for (const m of line.matchAll(/ADR[- ](\d{4})/g)) {
        out.adrRefs++;
        const before = line.slice(0, m.index);
        if (QUAL.test(before)) { out.adrQualifiedExternal++; continue; }
        if (!ledger.has(m[1])) out.adrMissing.push(`${rel}:${i + 1} ADR-${m[1]}`);
        else if (portedFile && !rel.includes("docs/adr/")) out.adrSuspectExternal.push(`${rel}:${i + 1} ADR-${m[1]}`);
      }
      if (/[åäöÅÄÖ]/.test(line) && !/\.(json)$/.test(rel)) out.swedish.push(`${rel}:${i + 1}`);
      if (/data-test-state(~|\*)?=|data-test-state="/.test(line)) out.testStateOld.push(`${rel}:${i + 1}`);
      for (const m of line.matchAll(/\bdata-([a-z][a-z-]*[a-z])\b/g)) out.dataWords.add(m[1]);
    });
    // dead paths, in comments only (/* */, //, <!-- -->, markdown prose/backticks)
    const commentText = /\.(md)$/.test(rel) ? src : [...src.matchAll(/\/\*[\s\S]*?\*\/|\/\/[^\n]*|<!--[\s\S]*?-->|^\s*#[^\n]*/gm)].map((m) => m[0]).join("\n");
    for (const m of commentText.matchAll(/(?<![\w@:/.-])((?:\.{1,2}\/)?[\w.-]+(?:\/[\w.-]+)+\.(?:css|ts|tsx|js|mjs|md|astro|json|vue|py))\b/g)) {
      const p = m[1];
      if (/^(https?|www)/.test(p) || p.includes("node_modules")) continue;
      const bases = [dirname(f), join(repo, "packages/tsugite"), repo, join(repo, "apps/docs"), join(repo, "apps/docs/src"), join(repo, "packages/tsugite/docs"), join(repo, ".claude")];
      if (!bases.some((b) => existsSync(join(b, p)))) out.deadPaths.push(`${rel}: ${p}`);
    }
  }
  console.log(`\n═══ NON-CSS (files scanned: ${files.length}) ═══`);
  console.log(`ADR refs: ${out.adrRefs} · qualified-external: ${out.adrQualifiedExternal} · missing from ledger: ${out.adrMissing.length} · unqualified in ported files (suspect): ${out.adrSuspectExternal.length}`);
  console.log("  missing:", out.adrMissing.slice(0, 15).join(" | "));
  console.log("  suspect:", out.adrSuspectExternal.slice(0, 15).join(" | "));
  console.log(`dead paths in comments/docs: ${out.deadPaths.length}`);
  console.log("  " + out.deadPaths.join("\n  "));
  console.log(`swedish-character lines (non-json): ${out.swedish.length}`, out.swedish.slice(0, 12).join(" | "));
  console.log(`old data-test-state form (ADR-0025): ${out.testStateOld.length}`, out.testStateOld.slice(0, 12).join(" | "));
  console.log(`distinct data-* words: ${out.dataWords.size}`);
  console.log("  " + [...out.dataWords].sort().join(" "));
}
