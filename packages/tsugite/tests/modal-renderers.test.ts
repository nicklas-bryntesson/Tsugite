// The recipe is a table read by lib/recipe.ts (ADR-0018). tests/fixtures/modal.json lists
// inputs and the exact resolution each must produce. This file holds the recipe to it, then
// the Astro renderer to the recipe. Modal is Astro only for now; the React and Vue renderers
// join this file when they are built (ADR-0029, consequences).
import { readFileSync } from "node:fs";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, it, expect } from "vitest";
import { resolve } from "../lib/recipe";
import { modal } from "../recipes/modal.recipe";
import { modalDerive } from "../lib/modal";
import Astro from "../components/regions/Modal/Modal.astro";

interface Fixture {
  component: string;
  cases: Array<{
    name: string;
    input: Record<string, unknown> & { children: boolean };
    expect: { mode: "render" | "suppress" | "error"; tag?: string; className?: string; attrs?: Record<string, string>; errorMessage?: string };
  }>;
}

const fixture: Fixture = JSON.parse(readFileSync(new URL("./fixtures/modal.json", import.meta.url), "utf8"));
const container = await AstroContainer.create();
const CHILD = "<p>Body</p>";
const normalise = (html: string) =>
  html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<!--.*?-->/g, "").replace(/>\s+</g, "><").replace(/&quot;/g, '"').trim();
const propsOf = (input: Record<string, unknown>) => {
  const { children, ...props } = input;
  return props;
};
const viaAstro = async (props: Record<string, unknown>, children: boolean) =>
  normalise(await container.renderToString(Astro, { props, slots: children ? { default: CHILD } : undefined }));

describe(`${fixture.component}: the recipe resolves every fixture case`, () => {
  for (const { name, input, expect: want } of fixture.cases) {
    it(name, () => {
      const got = resolve(modal, propsOf(input), { hasContent: input.children, derive: modalDerive });
      expect(got.mode).toBe(want.mode);
      if (want.mode === "render") {
        expect(got.tag).toBe(want.tag);
        expect(got.className).toBe(want.className);
        expect(got.attrs).toEqual(want.attrs);
      }
      if (want.mode === "error") expect(got.errorMessage).toBe(want.errorMessage);
    });
  }
});

describe(`${fixture.component}: Astro renders every fixture case`, () => {
  for (const { name, input, expect: want } of fixture.cases) {
    it(name, async () => {
      const html = await viaAstro(propsOf(input), input.children);
      if (want.mode === "render") {
        // Astro writes an empty value as a bare attribute (data-region).
        const attrs = Object.entries(want.attrs!).map(([k, v]) => (v === "" ? ` ${k}` : ` ${k}="${v}"`)).join("");
        expect(html).toBe(`<dialog class="${want.className}"${attrs}>${CHILD}</dialog>`);
      } else if (want.mode === "suppress") {
        expect(html).toBe("");
      } else {
        expect(html).toContain(want.errorMessage!);
      }
    });
  }
});
