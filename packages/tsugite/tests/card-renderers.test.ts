// The renderers are adapters; the recipe is the contract (ADR-0017), and the recipe is a
// table read by lib/recipe.ts (ADR-0018). tests/fixtures/card.json lists inputs and the exact resolution each must
// produce. This file holds the recipe to it, then holds Astro, React and Vue to the
// recipe — byte-identical markup for the same props, nothing for an empty card, the
// same message for an invalid one. A renderer in another language reads the same file.
import { readFileSync } from "node:fs";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, it, expect } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString as renderVue } from "vue/server-renderer";
import { resolve } from "../lib/recipe";
import { card } from "../recipes/card.recipe";
import CardAstro from "../components/primitives/Card/Card.astro";
import CardReact from "../components/primitives/Card/Card.tsx";
import CardVue from "../components/primitives/Card/Card.vue";

interface Fixture {
  component: string;
  attrOrder: string[];
  cases: Array<{
    name: string;
    input: Record<string, unknown> & { hasContent: boolean };
    expect: {
      mode: "render" | "suppress" | "error";
      tag?: string;
      className?: string;
      attrs?: Record<string, string>;
      errorMessage?: string;
    };
  }>;
}

const fixture: Fixture = JSON.parse(readFileSync(new URL("./fixtures/card.json", import.meta.url), "utf8"));

const container = await AstroContainer.create();

// Vue SSR leaves slot markers (<!--[--> <!--]-->) and a placeholder comment for a
// v-if that rendered nothing; comments are not DOM the CSS or a user can see. Text
// content escapes quotes differently per host; the message is compared decoded.
const normalise = (html: string) =>
  html
    .replace(/<!--.*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/&quot;/g, '"')
    .trim();

// The renderers detect content themselves; the fixture's hasContent decides whether
// each gets a child to host.
const child = (hasContent: boolean) => (hasContent ? "<p>x</p>" : undefined);

const viaAstro = async (props: Record<string, unknown>, hasContent: boolean) =>
  normalise(
    await container.renderToString(CardAstro, {
      props,
      slots: hasContent ? { default: child(true)! } : undefined,
    }),
  );

const viaReact = (props: Record<string, unknown>, hasContent: boolean) => {
  const { class: className, ...rest } = props;
  const reactProps = className === undefined ? rest : { ...rest, className };
  return normalise(
    renderToStaticMarkup(createElement(CardReact, reactProps, hasContent ? createElement("p", null, "x") : undefined)),
  );
};

const viaVue = async (props: Record<string, unknown>, hasContent: boolean) =>
  normalise(
    await renderVue(
      createSSRApp({
        render: () => h(CardVue, props, hasContent ? { default: () => h("p", null, "x") } : undefined),
      }),
    ),
  );

const propsOf = (input: { hasContent: boolean }): Record<string, unknown> => {
  const { hasContent, ...props } = input;
  return props;
};

const openingTag = (tag: string, className: string, attrs: Record<string, string>) =>
  `<${tag} class="${className}"` + Object.entries(attrs).map(([k, v]) => ` ${k}="${v}"`).join("") + ">";

describe(`${fixture.component}: the recipe resolves every fixture case`, () => {
  for (const { name, input, expect: want } of fixture.cases) {
    it(name, () => {
      const got = resolve(card, propsOf(input), { hasContent: input.hasContent });
      expect(got.mode).toBe(want.mode);
      if (want.mode === "render") {
        expect(got.tag).toBe(want.tag);
        expect(got.className).toBe(want.className);
        expect(got.attrs).toEqual(want.attrs);
        expect(Object.keys(got.attrs), "attribute order").toEqual(fixture.attrOrder);
      }
      if (want.mode === "error") expect(got.errorMessage).toBe(want.errorMessage);
    });
  }
});

describe(`${fixture.component}: Astro, React and Vue render every fixture case identically`, () => {
  for (const { name, input, expect: want } of fixture.cases) {
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
