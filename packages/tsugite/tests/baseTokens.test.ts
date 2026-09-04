// Base-table pipeline guards (ADR-0011: spacing, site, grids join the
// factory). Completeness is validated in JS — a spacing step without a tier
// is a build error, never a viewport with no value — and the committed
// artifact must match the factory. The ramps are proven to be BOUNDED: one
// active block per viewport, no overlaps, no gaps (ADR-0001).
import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { validateBase, generateBaseStylesheet, TIER_MEDIA } from "../engine/collector.js";
import { TIERS } from "../theme-default/typography.tokens.js";
import { spaceSteps, sizeConstantName, sizeTokenName } from "../theme-default/size.tokens.js";
import { siteOffset } from "../theme-default/site.tokens.js";
import { GRID_STEPS, GRID_MEDIA, gridSteps } from "../theme-default/grid.tokens.js";

const css = generateBaseStylesheet();

describe("the base tables", () => {
  it("every spacing step, the offset and every grid step are complete (the refusal rule)", () => {
    expect(() => validateBase()).not.toThrow();
  });

  it("a missing tier is refused, not silently skipped", () => {
    const steps = { ...spaceSteps, probe: { floor: "1rem", mobile: "1rem", desktop: "1rem" } };
    expect(() => validateBase({ steps, offset: siteOffset, grid: gridSteps })).toThrow(/probe.*wide/);
  });

  it("a non-rem spacing literal is refused — the px twin is derived from rem", () => {
    const steps = { ...spaceSteps, probe: { floor: "16px", mobile: "1rem", desktop: "1rem", wide: "1rem" } };
    expect(() => validateBase({ steps, offset: siteOffset, grid: gridSteps })).toThrow(/rem literal/);
  });

  it("the committed artifact matches the factory (freshness)", () => {
    const artifact = readFileSync(new URL("../styles/tokens/base/base.generated.css", import.meta.url), "utf8");
    expect(artifact).toBe(css);
  });
});

describe("what the artifact says", () => {
  it("emits every RAW spacing constant with its px twin at 16px/rem", () => {
    for (const [step, tiers] of Object.entries(spaceSteps)) {
      for (const t of TIERS) {
        expect(css).toContain(`${sizeConstantName(step, t)}: ${tiers[t]};`);
        const px = `${+(parseFloat(tiers[t]) * 16).toFixed(4)}px`;
        expect(css).toContain(`${sizeConstantName(step, t)}-PX: ${px};`);
      }
    }
  });

  it("every semantic step is set in every tier block, scaled by --SPACE-SCALE", () => {
    for (const t of TIERS) {
      const block = css.split(`@media ${TIER_MEDIA[t]} {`)[1]?.split("\n}\n")[0];
      expect(block, `tier ${t} block`).toBeDefined();
      for (const step of Object.keys(spaceSteps)) {
        expect(block).toContain(`${sizeTokenName(step)}: calc(var(${sizeConstantName(step, t)}) * var(--SPACE-SCALE, 1));`);
        expect(block).toContain(`${sizeTokenName(step)}-px: var(${sizeConstantName(step, t)}-PX);`);
      }
      expect(block).toContain(`--site-offset: var(--SITE-OFFSET-${t.toUpperCase()});`);
    }
  });

  it("the tier ladder is bounded: ranges abut with no overlap and no gap (ADR-0001)", () => {
    // floor ≤ 21.24999 | 21.25–48.74 | 48.75–89.99 | ≥ 90 — the boundaries the
    // typography ramp uses, so spacing and type flip at the same pixel.
    expect(TIER_MEDIA.floor).toBe("(max-width: 21.24999rem)");
    expect(TIER_MEDIA.mobile).toBe("(min-width: 21.25rem) and (max-width: 48.74rem)");
    expect(TIER_MEDIA.desktop).toBe("(min-width: 48.75rem) and (max-width: 89.99rem)");
    expect(TIER_MEDIA.wide).toBe("(min-width: 90rem)");
  });

  it("the grid keeps its own ladder, also bounded, and sets gap + columns for both grids per step", () => {
    for (const s of GRID_STEPS) {
      const block = css.split(`@media ${GRID_MEDIA[s]} {`)[1]?.split("\n}\n")[0];
      expect(block, `grid step ${s}`).toBeDefined();
      expect(block).toContain(`--grid-layout-gap: var(--grid-layout-gap-${s});`);
      expect(block).toContain(`--grid-layout-columns: var(--grid-layout-columns-${s});`);
      expect(block).toContain(`--grid-breakout-gap: var(--grid-breakout-gap-${s});`);
      expect(block).toContain(`--grid-breakout-columns: var(--grid-breakout-columns-${s});`);
    }
    expect(GRID_MEDIA.base).toBe("(max-width: 39.9375rem)");
    expect(GRID_MEDIA.desktop).toBe("(min-width: 80rem)");
  });

  it("no Sass survives: nothing but CSS in the artifact", () => {
    expect(css).not.toMatch(/@(mixin|include|use)\b/);
    expect(css).not.toContain("$");
  });
});
