// THE CAPABILITY PLUGIN (RFC 0001, phases 1–2) — what each mode may and may not emit.
//
//   H1  the head is generated once per key: one @property, one closed pair, two overrides
//   H2  the head has no unconditional `:root { --cap-… }` — the discriminant is a closed pair
//   H3  the head parses, and the probe visitor leaves it alone (filename check AND root-only check)
//   S1  mode `supports` contributes no visitor and serves an empty virtual sheet
//   P1  mode `probe` rewrites a registry pair in a nested sheet to `@container style(--cap-key: on|off)`
//   P2  unregistered `@supports` and root-only pairs (oklch) are left as `@supports`
//   P3  the rewrite is idempotent — Astro runs the visitor twice per <style> block
//   P4  the rewritten output lowers cleanly against the browserslist (no `&` survives)
//   P5  an existing consumer visitor is composed with, not replaced
import { transform } from "lightningcss";
import { describe, it, expect } from "vitest";
import { capabilities, positive, negative } from "../engine/capabilities.js";
import tsugiteCapabilities, {
  VIRTUAL_ID,
  attributeOf,
  capabilitiesHead,
  createProbeVisitor,
} from "../vite/capabilities.js";

// Chrome 109 — the long tail of /.browserslistrc (`defaults`), the version that
// still needs nesting lowered. Pinned here so the package's tests need no
// browserslist of their own; the docs' nesting gate checks the real list.
const targets = { chrome: 109 << 16 };

const count = (s: string, re: RegExp) => (s.match(re) ?? []).length;
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Run `css` through Lightning with (or without) the probe visitor; nesting is kept unless `targets` is passed. */
function run(css: string, opts: { visitor?: boolean; filename?: string; lower?: boolean } = {}) {
  return transform({
    filename: opts.filename ?? "sample.css",
    code: Buffer.from(css),
    minify: false,
    ...(opts.lower ? { targets } : {}),
    ...(opts.visitor === false ? {} : { visitor: createProbeVisitor() }),
  }).code.toString();
}

// A component in the authoring form (ADR-0010) with a closed textTrim pair
// nested in its root, a root-only oklch pair as the token factory emits it,
// and one unregistered gate that must pass through untouched.
const SAMPLE = `
.Heading {
  color: red;
  @supports ${positive("textTrim")} {
    &[data-run="block"] > .heading-text { text-box-trim: trim-both; margin-block: 0; }
  }
  @supports ${negative("textTrim")} {
    &[data-run="block"] > .heading-text { margin-block: 1em; }
  }
}
@supports ${positive("oklch")} { :root { --x: oklch(1 0 0); } }
@supports ${negative("oklch")} { :root { --x: #fff; } }
@supports (display: grid) { .a { display: grid; } }
`;

describe("the head (mode probe)", () => {
  const head = capabilitiesHead();

  it("H1 — once per key: one @property, one closed pair, two attribute overrides", () => {
    for (const key of Object.keys(capabilities)) {
      expect(count(head, new RegExp(`@property --cap-${key} `, "g"))).toBe(1);
      expect(count(head, new RegExp(`^@supports ${esc(positive(key))} \\{ :root \\{ --cap-${key}: on \\} \\}$`, "gm"))).toBe(1);
      expect(count(head, new RegExp(`^@supports ${esc(negative(key))} \\{ :root \\{ --cap-${key}: off \\} \\}$`, "gm"))).toBe(1);
      expect(count(head, new RegExp(`^\\[${attributeOf(key)}="on"\\] \\{ --cap-${key}: on \\}$`, "gm"))).toBe(1);
      expect(count(head, new RegExp(`^\\[${attributeOf(key)}="off"\\] \\{ --cap-${key}: off \\}$`, "gm"))).toBe(1);
    }
    expect(attributeOf("textTrim")).toBe("data-cap-text-trim");
    expect(head).toContain('syntax: "on | off"');
  });

  it("H2 — no unconditional :root base: every --cap-* on :root sits inside an @supports block", () => {
    const outsideSupports = head.replace(/^@supports .*$/gm, "");
    expect(outsideSupports).not.toMatch(/:root\s*\{\s*--cap-/);
    expect(head).not.toMatch(/^:root/m);
  });

  it("H3 — the head parses, and the probe visitor leaves it alone by filename and by shape", () => {
    const asHead = run(head, { filename: `\0${VIRTUAL_ID}` });
    const asOther = run(head, { filename: "elsewhere.css" });
    const plain = run(head, { visitor: false });
    expect(asHead).toBe(plain);
    expect(asOther).toBe(plain);
    expect(plain).not.toContain("@container");
    expect(count(plain, /@supports/g)).toBe(2 * Object.keys(capabilities).length);
  });
});

describe("mode supports (production)", () => {
  it("S1 — contributes no visitor and serves an empty virtual sheet", () => {
    const plugin = tsugiteCapabilities({ mode: "supports" }) as any;
    const config: any = { css: { transformer: "lightningcss", lightningcss: { targets } } };
    plugin.config(config);
    expect(config.css.lightningcss.visitor).toBeUndefined();
    expect(config.css.lightningcss.targets).toBe(targets);
    const id = plugin.resolveId(VIRTUAL_ID);
    expect(id).toBe(`\0${VIRTUAL_ID}`);
    expect(plugin.load(id)).toBe("");
  });

  it("defaults to `supports` when CAP_MODE is unset", () => {
    const saved = process.env.CAP_MODE;
    delete process.env.CAP_MODE;
    try {
      const plugin = tsugiteCapabilities() as any;
      expect(plugin.load(`\0${VIRTUAL_ID}`)).toBe("");
    } finally {
      if (saved !== undefined) process.env.CAP_MODE = saved;
    }
  });

  it("rejects an unknown mode", () => {
    expect(() => tsugiteCapabilities({ mode: "force" as any })).toThrow(/unknown mode "force"/);
  });
});

describe("mode probe", () => {
  const out = run(SAMPLE);

  it("P1 — a registry pair becomes a style-query pair", () => {
    expect(out).toMatch(/@container style\(--cap-textTrim: ?on\)/);
    expect(out).toMatch(/@container style\(--cap-textTrim: ?off\)/);
    expect(out).not.toContain("@supports (text-box-trim");
    expect(out).not.toContain("@supports not ((text-box-trim");
    expect(count(out, /@container/g)).toBe(2);
  });

  it("P2 — unregistered gates and root-only pairs stay @supports", () => {
    expect(out).toContain("@supports (display: grid)");
    expect(out).toContain("@supports (color: oklch(1 0 0))");
    expect(out).toContain("@supports not (color: oklch(1 0 0))");
    expect(out).not.toContain("--cap-oklch");
  });

  it("P3 — idempotent: the visitor changes nothing on its own output", () => {
    expect(run(out)).toBe(run(out, { visitor: false }));
  });

  it("P4 — lowers against the browserslist: nested queries flatten, no `&` survives", () => {
    const lowered = run(SAMPLE, { lower: true });
    expect(lowered).not.toContain("&");
    expect(lowered).toMatch(/@container style\(--cap-textTrim: ?on\)\s*\{\s*\.Heading\[data-run="block"\] > \.heading-text/);
  });

  it("serves the head as the virtual sheet", () => {
    const plugin = tsugiteCapabilities({ mode: "probe" }) as any;
    expect(plugin.load(plugin.resolveId(VIRTUAL_ID))).toBe(capabilitiesHead());
  });

  it("P5 — composes with a consumer's visitor rather than replacing it", () => {
    const seen: string[] = [];
    const existing = { Rule: { media() { seen.push("media"); } } };
    const plugin = tsugiteCapabilities({ mode: "probe" }) as any;
    const config: any = { css: { lightningcss: { targets, visitor: existing } } };
    plugin.config(config);
    expect(config.css.lightningcss.visitor).not.toBe(existing);
    const code = transform({
      filename: "composed.css",
      code: Buffer.from(`@media (min-width: 1px) { .a { color: red } } ${SAMPLE}`),
      visitor: config.css.lightningcss.visitor,
    }).code.toString();
    expect(seen).toEqual(["media"]);
    expect(code).toMatch(/@container style\(--cap-textTrim: ?on\)/);
  });
});
