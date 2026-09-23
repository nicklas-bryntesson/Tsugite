// Button.css — every emphasis gate writes every colour slot the states read
// (css-doctrine §1, ADR-0013 §3). Text-level, no CSS parser: the file's form is
// one declaration per line and one gate per `&[data-emphasis="…"] {` block.
import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

const css = readFileSync(new URL("../components/Button/Button.css", import.meta.url), "utf8");

// Parked: tertiary has no design yet and writes none of the slots — see its
// TODO(decide) in Button.css. Remove it from here when the cell is decided.
const PARKED = new Set(["tertiary"]);

const COLOUR = /^--_bt-(color|backgroundColor|borderColor)(-\w+)?$/;

/** Slots the state rules read on the element: `property: var(--_bt-…)`. */
const consumed = new Set(
  [...css.matchAll(/^\s+(?:color|background-color|border-color):\s+var\((--_bt-[\w-]+)\)/gm)].map((m) => m[1]).filter((n) => COLOUR.test(n)),
);

/** The body of one `&[data-emphasis="X"] {` block (brace-balanced). */
function gateBody(value: string): string {
  const open = css.indexOf(`&[data-emphasis="${value}"] {`);
  if (open < 0) throw new Error(`no gate for ${value}`);
  let depth = 0;
  for (let i = css.indexOf("{", open); i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}" && --depth === 0) return css.slice(open, i);
  }
  throw new Error(`unbalanced gate for ${value}`);
}

const written = (body: string) => new Set([...body.matchAll(/^\s+(--_bt-[\w-]+):/gm)].map((m) => m[1]));

describe("Button.css slots", () => {
  it("reads the fifteen colour slots", () => {
    expect(consumed.size).toBe(15);
  });

  it("declares no slot empty", () => {
    expect(css.match(/^\s+--_bt-[\w-]+:\s*;/gm)).toBeNull();
  });

  it("declares no colour slot on the root", () => {
    const root = css.slice(css.indexOf(".Button {"), css.indexOf("&"));
    for (const name of written(root)) expect(name, `${name} on the root`).not.toMatch(COLOUR);
  });

  for (const emphasis of ["primary", "secondary", "tertiary"]) {
    const test = PARKED.has(emphasis) ? it.skip : it;
    test(`${emphasis} writes every colour slot the states read`, () => {
      const set = written(gateBody(emphasis));
      const missing = [...consumed].filter((n) => !set.has(n));
      expect(missing).toEqual([]);
    });
  }
});
