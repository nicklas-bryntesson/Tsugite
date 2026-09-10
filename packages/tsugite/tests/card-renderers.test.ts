// The renderers are adapters; the recipe is the contract. Astro, React and Vue must
// emit the same markup for the same props — a mechanical cross-check, not a comment.
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, it, expect } from "vitest";
import CardAstro from "../components/Card/Card.astro";
import CardReact from "../components/Card/Card.tsx";
import { createSSRApp, h } from "vue";
import { renderToString as renderVue } from "vue/server-renderer";
import CardVue from "../components/Card/Card.vue";

const container = await AstroContainer.create();

// Vue SSR leaves slot markers (<!--[--> <!--]-->) and a placeholder comment for a
// v-if that rendered nothing; comments are not DOM the CSS or a user can see.
const normalise = (html: string) => html.replace(/<!--.*?-->/g, "").replace(/>\s+</g, "><").trim();

const viaAstro = async (props: Record<string, unknown>, child = "<p>x</p>") =>
  normalise(await container.renderToString(CardAstro, { props, slots: { default: child } }));

const viaReact = (props: Record<string, unknown>, child = createElement("p", null, "x")) =>
  normalise(renderToStaticMarkup(createElement(CardReact, props, child)));

const viaVue = async (props: Record<string, unknown>, child = () => h("p", null, "x")) =>
  normalise(await renderVue(createSSRApp({ render: () => h(CardVue, props, { default: child }) })));

const cases: Array<[string, Record<string, unknown>]> = [
  ["defaults", {}],
  ["bordered lg", { border: true, padding: "lg" }],
  ["elevated article", { element: "article", elevation: "md" }],
  ["li sm no border", { element: "li", padding: "sm", border: false }],
  ["invalid element falls back", { element: "nav" }],
  ["extra class", { class: "extra" }],
];

describe("Card renders identically through Astro, React and Vue", () => {
  for (const [name, props] of cases) {
    it(name, async () => {
      const expected = await viaAstro(props);
      const reactProps = { ...props, className: props.class };
      delete reactProps.class;
      expect(viaReact(reactProps), "react").toBe(expected);
      expect(await viaVue(props), "vue").toBe(expected);
    });
  }

  it("all three suppress an empty card", async () => {
    expect(normalise(await container.renderToString(CardAstro, { props: {} }))).toBe("");
    expect(renderToStaticMarkup(createElement(CardReact, {}))).toBe("");
    expect(normalise(await renderVue(createSSRApp({ render: () => h(CardVue, {}) })))).toBe("");
  });
});
