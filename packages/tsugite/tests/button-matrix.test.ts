// The Button bench's three families (fixtures/states/button.matrix.ts). The pairwise family
// stands in for the full product, so it must owe nothing: every pair of axis values that
// any valid button holds is held by one of its rows.
import { describe, expect, test } from "vitest";
import { colourCases, fullProduct, geometryCases, pairwiseCases, pairwiseRows } from "../fixtures/states/button.matrix";
import { pairsIn, type Row } from "../fixtures/states/pairwise";

const rowOf = (name: string): Row => {
  const [, door, content, states, colour, geometry] = name.split("/");
  return { door, content, states, colour, geometry };
};

describe("Button bench families", () => {
  test("the pairwise cover holds every pair the full product holds", () => {
    const covered = pairsIn(pairwiseRows);
    const owed = [...pairsIn(fullProduct)].filter((pair) => !covered.has(pair));
    expect(owed).toEqual([]);
  });

  test("the pairwise cover is a small fraction of the product", () => {
    expect(pairwiseCases.length).toBeLessThan(fullProduct.length / 20);
  });

  test("every pairwise button has a colour reference and a geometry reference", () => {
    const colours = new Set(colourCases.map((c) => { const r = rowOf(c.name); return `${r.door}/${r.content}/${r.states}/${r.colour}`; }));
    const geometries = new Set(geometryCases.map((c) => { const r = rowOf(c.name); return `${r.door}/${r.content}/${r.geometry}`; }));
    for (const c of pairwiseCases) {
      const r = rowOf(c.name);
      expect(colours.has(`${r.door}/${r.content}/${r.states}/${r.colour}`), c.name).toBe(true);
      expect(geometries.has(`${r.door}/${r.content}/${r.geometry}`), c.name).toBe(true);
    }
  });

  test("every name is unique", () => {
    const names = [...colourCases, ...geometryCases, ...pairwiseCases].map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
