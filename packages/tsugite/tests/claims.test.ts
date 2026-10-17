// The claims factory (engine/claims.js, ADR-0006 amended 2026-10-17): a composition's voice
// claim is data in its recipe; the CSS is generated, complete and fresh.
import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { generateClaimsStylesheet, claimLines } from "../engine/claims.js";
import { themeChannels } from "../theme-default/theme.voices.tokens.js";
import { covercomposition } from "../recipes/covercomposition.recipe";

describe("voice claims", () => {
  it("CoverComposition.claims.generated.css matches the factory", () => {
    const onDisk = readFileSync(
      new URL("../components/compositions/CoverComposition/CoverComposition.claims.generated.css", import.meta.url),
      "utf8",
    );
    expect(onDisk).toBe(generateClaimsStylesheet(covercomposition, "recipes/covercomposition.recipe.ts"));
  });

  it("a claim points every channel of the slot schema, at the voice's pointers", () => {
    const lines = claimLines("inverse", "primary", "");
    expect(lines).toHaveLength(Object.keys(themeChannels).length);
    for (const channel of Object.values(themeChannels)) {
      expect(lines.some((l) => l.startsWith(`${channel}: var(--voice-inverse-primary-`))).toBe(true);
    }
  });

  it("the combination law holds: a forbidden combination cannot be claimed", () => {
    expect(() => claimLines("inverse", "subtle", "")).toThrow(/not an allowed combination/);
  });

  it("each claim is a pair of branches, fallback first, the same lines in both", () => {
    const css = generateClaimsStylesheet(covercomposition, "x");
    expect(css.indexOf("@supports not (container-type: inline-size)")).toBeLessThan(
      css.indexOf("@supports (container-type: inline-size)"),
    );
    const [fallback, modern] = css.split("@supports (container-type: inline-size)");
    const channelsIn = (part: string) => [...part.matchAll(/--theme-[A-Za-z-]+: var\([^)]+\)/g)].map((m) => m[0]);
    expect(channelsIn(fallback)).toEqual(channelsIn(modern));
  });
});
