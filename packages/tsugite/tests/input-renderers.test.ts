// The renderers are adapters; the recipe is a table read by lib/recipe.ts (ADR-0018).
// tests/fixtures/input.json lists inputs and the exact resolution each must produce.
// This file holds the recipe to it, then holds the Astro and React front doors to the
// recipe — the same element with the same attributes for the same props, the same
// message for a refused one.
import { readFileSync } from "node:fs";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, it, expect } from "vitest";
import { resolve } from "../lib/recipe";
import { input as recipe } from "../recipes/input.recipe";
import { inputDerive } from "../lib/input";
import InputAstro from "../components/primitives/fields/Input/Input.astro";
import { Input as InputReact } from "../components/primitives/fields/Input/Input.tsx";

interface Fixture {
  component: string;
  cases: Array<{
    name: string;
    input: Record<string, unknown>;
    expect: { mode: "render" | "error"; tag?: string; className?: string; attrs?: Record<string, string | true>; errorMessage?: string };
  }>;
}

const fixture: Fixture = JSON.parse(readFileSync(new URL("./fixtures/input.json", import.meta.url), "utf8"));
const container = await AstroContainer.create();

/** the rendered input's attributes, in order — the two hosts write booleans differently
 *  (bare against =""), and React writes readOnly in camelCase and the value last. The
 *  order is the recipe's contract and is held above; between the hosts the DOM is what
 *  must agree, so React is compared as a set of lowercased names. */
const attributesOf = (html: string) => {
  const tag = html.replace(/<script[\s\S]*?<\/script>/g, "").match(/<input\b([^>]*?)\/?>/);
  if (!tag) return null;
  const out: Array<[string, string | true]> = [];
  for (const m of tag[1].matchAll(/([\w:-]+)(?:="([^"]*)")?/g)) out.push([m[1].toLowerCase(), m[2] === undefined || m[2] === "" ? true : m[2].replace(/&quot;/g, '"')]);
  return out;
};

const toReact = (p: Record<string, unknown>) => {
  const r: Record<string, unknown> = { ...p };
  if ("readonly" in r) { r.readOnly = r.readonly; delete r.readonly; }
  return r;
};

describe(`${fixture.component}: the recipe resolves every fixture case`, () => {
  for (const { name, input, expect: want } of fixture.cases) {
    it(name, () => {
      const got = resolve(recipe, { ...input, element: "input" }, { derive: inputDerive });
      expect(got.mode).toBe(want.mode);
      if (want.mode === "render") {
        expect(got.tag).toBe(want.tag);
        expect(got.className).toBe(want.className);
        expect(Object.entries(got.attrs)).toEqual(Object.entries(want.attrs!));
      } else {
        expect(got.errorMessage).toBe(want.errorMessage);
      }
    });
  }
});

describe(`${fixture.component}: the Astro and React front doors render every fixture case identically`, () => {
  for (const { name, input, expect: want } of fixture.cases) {
    it(name, async () => {
      const astro = await container.renderToString(InputAstro, { props: input });
      const react = renderToStaticMarkup(createElement(InputReact, toReact(input) as never));
      if (want.mode === "render") {
        const expected: Array<[string, string | true]> = [["class", want.className!], ...Object.entries(want.attrs!)];
        expect(attributesOf(astro), "astro").toEqual(expected);
        const sorted = (a: Array<[string, string | true]> | null) => [...(a ?? [])].sort(([x], [y]) => x.localeCompare(y));
        expect(sorted(attributesOf(react)), "react").toEqual(sorted(expected));
      } else {
        const decode = (html: string) => html.replace(/&quot;/g, '"').replace(/&#34;/g, '"');
        expect(decode(astro), "astro").toContain(want.errorMessage!);
        expect(decode(react), "react").toContain(want.errorMessage!);
      }
    });
  }
});
