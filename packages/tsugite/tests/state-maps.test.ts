// A state map is complete by construction only if every pair is answered: a pair left out
// is a combination nobody looked at. This holds every map in fixtures/states/ to it.
import { describe, it, expect } from "vitest";
import { pairKey, type StateMap } from "../fixtures/states/types";
import { fieldStates } from "../fixtures/states/field.states";

const maps: Record<string, StateMap> = { field: fieldStates };

describe("state maps answer every pair", () => {
  for (const [name, map] of Object.entries(maps)) {
    const order = map.states.map((s) => s.key);
    it(`${name}: every unordered pair has a reach, and nothing else does`, () => {
      const expected = new Set<string>();
      for (let i = 0; i < order.length; i++) for (let j = i + 1; j < order.length; j++) expected.add(pairKey(order[i], order[j], order));
      expect(new Set(Object.keys(map.pairs))).toEqual(expected);
    });
    it(`${name}: has contents, and every exclusion names a known state`, () => {
      expect(map.contents.length, `${name}: no contents`).toBeGreaterThan(0);
      for (const c of map.contents) for (const k of Object.keys(c.excludes ?? {})) expect(order, `${name}/${c.key} excludes "${k}"`).toContain(k);
    });
    it(`${name}: every triple names known states and no unreachable pair`, () => {
      for (const t of map.triples) {
        for (const k of t.keys) expect(order, `${name}: triple names "${k}"`).toContain(k);
        for (const [a, b] of [[t.keys[0], t.keys[1]], [t.keys[0], t.keys[2]], [t.keys[1], t.keys[2]]]) {
          expect(map.pairs[pairKey(a, b, order)].reach, `${name}: ${t.keys.join("+")} holds ${a}+${b}`).not.toBe("no");
        }
      }
    });
  }
});
