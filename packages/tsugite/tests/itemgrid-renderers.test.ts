// The renderers are adapters; the recipe is the contract (ADR-0017), and the recipe is a
// table read by lib/recipe.ts (ADR-0018). tests/fixtures/itemgrid.json lists inputs and the
// exact resolution each must produce, for ItemGrid and for its cell, ItemGridItem. This file
// holds both recipes to it, then holds Astro, React and Vue to the recipe — byte-identical
// markup for the same props, nothing for an empty grid or cell, the same message for an
// invalid one.
import { readFileSync } from "node:fs";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, it, expect } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString as renderVue } from "vue/server-renderer";
import { resolve, type Recipe } from "../lib/recipe";
import { itemGrid, itemGridItem } from "../recipes/itemgrid.recipe";
import { itemGridDerive } from "../lib/itemgrid";
import ItemGridAstro from "../components/regions/ItemGrid/ItemGrid.astro";
import ItemGridReact from "../components/regions/ItemGrid/ItemGrid.tsx";
import ItemGridVue from "../components/regions/ItemGrid/ItemGrid.vue";
import ItemGridItemAstro from "../components/regions/ItemGrid/ItemGridItem.astro";
import ItemGridItemReact from "../components/regions/ItemGrid/ItemGridItem.tsx";
import ItemGridItemVue from "../components/regions/ItemGrid/ItemGridItem.vue";

interface Case {
  name: string;
  input: Record<string, unknown> & { hasContent: boolean };
  expect: { mode: "render" | "suppress" | "error"; tag?: string; className?: string; attrs?: Record<string, string>; errorMessage?: string };
}
interface Fixture {
  component: string;
  cases: Case[];
  item: { component: string; cases: Case[] };
}

const fixture: Fixture = JSON.parse(readFileSync(new URL("./fixtures/itemgrid.json", import.meta.url), "utf8"));
const container = await AstroContainer.create();

// Vue SSR leaves slot markers and a placeholder comment for a v-if that rendered nothing;
// comments are not DOM. Text content escapes quotes differently per host.
const normalise = (html: string) =>
  html
    .replace(/<!--.*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/&quot;/g, '"')
    .trim();

const propsOf = (input: { hasContent: boolean }): Record<string, unknown> => {
  const { hasContent, ...props } = input;
  return props;
};

const openingTag = (tag: string, className: string, attrs: Record<string, string>) =>
  `<${tag} class="${className}"` + Object.entries(attrs).map(([k, v]) => ` ${k}="${v}"`).join("") + ">";

const suites = [
  { component: fixture.component, cases: fixture.cases, recipe: itemGrid as Recipe, derive: itemGridDerive, Astro: ItemGridAstro, React: ItemGridReact, Vue: ItemGridVue },
  { component: fixture.item.component, cases: fixture.item.cases, recipe: itemGridItem as Recipe, derive: undefined, Astro: ItemGridItemAstro, React: ItemGridItemReact, Vue: ItemGridItemVue },
];

for (const { component, cases, recipe, derive, Astro, React, Vue } of suites) {
  const viaAstro = async (props: Record<string, unknown>, hasContent: boolean) =>
    normalise(await container.renderToString(Astro, { props, slots: hasContent ? { default: "<p>x</p>" } : undefined }));

  const viaReact = (props: Record<string, unknown>, hasContent: boolean) => {
    const { class: className, ...rest } = props;
    const reactProps = className === undefined ? rest : { ...rest, className };
    return normalise(renderToStaticMarkup(createElement(React, reactProps, hasContent ? createElement("p", null, "x") : undefined)));
  };

  const viaVue = async (props: Record<string, unknown>, hasContent: boolean) =>
    normalise(
      await renderVue(createSSRApp({ render: () => h(Vue, props, hasContent ? { default: () => h("p", null, "x") } : undefined) })),
    );

  describe(`${component}: the recipe resolves every fixture case`, () => {
    for (const { name, input, expect: want } of cases) {
      it(name, () => {
        const got = resolve(recipe, propsOf(input), { hasContent: input.hasContent, derive });
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

  describe(`${component}: Astro, React and Vue render every fixture case identically`, () => {
    for (const { name, input, expect: want } of cases) {
      it(name, async () => {
        const props = propsOf(input);
        const astro = await viaAstro(props, input.hasContent);
        const react = viaReact(props, input.hasContent);
        const vue = await viaVue(props, input.hasContent);

        if (want.mode === "render") {
          // The Astro markup is checked against the fixture; the others against Astro.
          expect(astro).toBe(`${openingTag(want.tag!, want.className!, want.attrs!)}<p>x</p></${want.tag}>`);
          expect(react, "react").toBe(astro);
          expect(vue, "vue").toBe(astro);
        } else if (want.mode === "suppress") {
          expect(astro, "astro").toBe("");
          expect(react, "react").toBe("");
          expect(vue, "vue").toBe("");
        } else {
          // Dev-error markup is each host's idiom; the message is the contract.
          expect(astro, "astro").toContain(want.errorMessage!);
          expect(react, "react").toContain(want.errorMessage!);
          expect(vue, "vue").toContain(want.errorMessage!);
        }
      });
    }
  });
}
