// Manifest guards: the map and /docs render from the manifest, so it must
// be internally consistent — and every pointer must resolve to a file on
// disk (a deleted section should fail here, not as a 404 in production).
import { existsSync, readdirSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { manifest, foundations, pillarLabels } from "../src/lib/manifest.ts";

describe("the docs manifest", () => {
  it("slugs are unique and url-safe", () => {
    const slugs = manifest.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("every pillar is a known pillar", () => {
    for (const e of manifest) expect(Object.keys(pillarLabels)).toContain(e.pillar);
  });

  it("published entries have a demo: section or demoHref", () => {
    for (const e of manifest.filter((e) => e.published)) {
      expect(!!(e.section || e.demoHref), e.slug).toBe(true);
    }
  });

  it("section pointers resolve to files on disk", () => {
    for (const e of manifest.filter((e) => e.section)) {
      const path = new URL(`../../../packages/tsugite/fixtures/${e.section}.astro`, import.meta.url);
      expect(existsSync(path), `${e.slug} → ${e.section}.astro`).toBe(true);
    }
  });

  it("suite pointers resolve to files on disk", () => {
    for (const e of manifest.filter((e) => e.suite)) {
      expect(existsSync(new URL(`../../../packages/tsugite/${e.suite}`, import.meta.url)), `${e.slug} → ${e.suite}`).toBe(true);
    }
  });

  it("adr pointers resolve to existing ADRs", () => {
    for (const e of manifest) {
      for (const n of e.adrs ?? []) {
        const dir = new URL("../../../packages/tsugite/docs/adr/", import.meta.url);
        const hit = readdirSync(dir).some((f) => f.startsWith(`${n}-`));
        expect(hit, `${e.slug} → ADR-${n}`).toBe(true);
      }
    }
  });

  it("foundations entries have valid hrefs", () => {
    for (const f of foundations) expect(f.href).toMatch(/^\/docs\/[a-z-]+$/);
  });
});
