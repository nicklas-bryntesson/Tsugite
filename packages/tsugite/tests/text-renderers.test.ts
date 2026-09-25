// The recipe is a table read by lib/recipe.ts (ADR-0018). tests/fixtures/text.json lists
// inputs and the exact resolution each must produce. This file holds the recipe to it, then
// the Astro renderer to the recipe: the root, the engine container, the words.
import { readFileSync } from "node:fs";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, it, expect } from "vitest";
import { resolve } from "../lib/recipe";
import { text } from "../recipes/text.recipe";
import { textDerive } from "../lib/text";
import TextAstro from "../components/primitives/typography/Text/Text.astro";

interface Fixture {
  component: string;
  cases: Array<{
    name: string;
    input: Record<string, unknown> & { children: boolean };
    expect: { mode: "render" | "suppress" | "error"; tag?: string; className?: string; attrs?: Record<string, string>; errorMessage?: string };
  }>;
}

const fixture: Fixture = JSON.parse(readFileSync(new URL("./fixtures/text.json", import.meta.url), "utf8"));
const container = await AstroContainer.create();
const CHILD = "Rich <em>content</em>";
const normalise = (html: string) => html.replace(/<!--.*?-->/g, "").replace(/>\s+</g, "><").replace(/&quot;/g, '"').trim();
const propsOf = (input: Record<string, unknown>) => {
  const { children, ...props } = input;
  return props;
};
const openingTag = (tag: string, className: string, attrs: Record<string, string>) =>
  `<${tag} class="${className}"` + Object.entries(attrs).map(([k, v]) => ` ${k}="${v}"`).join("") + ">";

describe(`${fixture.component}: the recipe resolves every fixture case`, () => {
  for (const { name, input, expect: want } of fixture.cases) {
    it(name, () => {
      const got = resolve(text, propsOf(input), { slots: { children: input.children }, derive: textDerive });
      expect(got.mode).toBe(want.mode);
      if (want.mode === "render") {
        expect(got.tag).toBe(want.tag);
        expect(got.className).toBe(want.className);
        expect(got.attrs).toEqual(want.attrs);
        expect(Object.keys(got.attrs), "attribute order").toEqual(Object.keys(want.attrs!));
      }
      if (want.mode === "error") expect(got.errorMessage).toBe(want.errorMessage);
    });
  }
});

describe(`${fixture.component}: the Astro renderer writes the recipe`, () => {
  for (const { name, input, expect: want } of fixture.cases) {
    it(name, async () => {
      const html = normalise(await container.renderToString(TextAstro, { props: propsOf(input), slots: input.children ? { default: CHILD } : undefined }));
      if (want.mode === "render") {
        const words = input.children ? CHILD : String(input.text);
        expect(html).toBe(`${openingTag(want.tag!, want.className!, want.attrs!)}<span class="text-content">${words}</span></${want.tag}>`);
      } else if (want.mode === "suppress") expect(html).toBe("");
      else {
        expect(html).toContain(want.errorMessage!);
        expect(html).not.toContain('class="Text"');
      }
    });
  }
});
