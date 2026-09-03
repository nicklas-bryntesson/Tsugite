// THE CSS NESTING GATE (ADR-0010) — the polyfill is proven, and it announces its own deletion day.
//
// Two halves, both under ADR-0009's deletion criterion:
//   1. Every stylesheet in both workspaces, run through the same Lightning CSS
//      lowering the build uses (same targets, from /.browserslistrc), comes out
//      free of nesting. What ships is the flat form.
//   2. The targets still NEED the lowering. The day the browserslist covers
//      native nesting, this half fails on purpose: remove the transform from
//      apps/docs/astro.config.mjs and this test, per ADR-0009 — deletion, not edits.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import browserslist from "browserslist";
import { browserslistToTargets, transform } from "lightningcss";
import { describe, it, expect } from "vitest";

const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));

const SCAN_ROOTS = [
  "packages/tsugite/components",
  "packages/tsugite/kernel",
  "packages/tsugite/fixtures",
  "packages/tsugite/styles",
  "apps/docs/src",
];

// .scss is Sass nesting, lowered by Sass before Lightning CSS sees it — out of scope.
const EXTENSIONS = [".css", ".astro"];
const SKIP = [/node_modules/, /\.generated\.css$/, /styles\/ui-tokens\.css$/];

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

/** A nesting selector outside comments: `&` at the start of a selector or after a combinator/comma. */
const NESTING = /(^|[{;,\s>+~])&/m;

function lower(code: string, filename: string): string {
  return transform({ filename, code: Buffer.from(code), targets, minify: false }).code.toString();
}

describe("CSS nesting gate (ADR-0010)", () => {
  const files = SCAN_ROOTS.flatMap((root) => walk(join(repoRoot, root)));

  it("scans a non-trivial corpus", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it("the browserslist still requires the lowering — otherwise it is deletion day (ADR-0009)", () => {
    const probe = lower(".probe { &:hover { color: red; } }", "probe.css");
    expect(
      NESTING.test(stripComments(probe)),
      "Every target in /.browserslistrc supports native nesting. Delete the Lightning CSS " +
        "nesting transform (astro.config.mjs) and this test — ADR-0009, deletion not edits.",
    ).toBe(false);
  });

  for (const file of files) {
    const rel = relative(repoRoot, file);
    const sheets = stylesheetsOf(file);
    if (sheets.length === 0) continue;

    it(`${rel} lowers to nesting-free CSS`, () => {
      sheets.forEach((sheet, i) => {
        const out = stripComments(lower(sheet, `${rel}#${i}`));
        const hit = out.match(NESTING);
        expect(hit, `nesting survived lowering near: ${out.slice(Math.max(0, (hit?.index ?? 0) - 60), (hit?.index ?? 0) + 60)}`).toBeNull();
      });
    });
  }
});
