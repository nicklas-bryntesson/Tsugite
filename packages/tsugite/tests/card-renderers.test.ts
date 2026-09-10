// The renderers are adapters; the recipe is the contract. Astro and React must emit
// the same markup for the same props — a mechanical cross-check, not a comment.
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, it, expect } from "vitest";
import CardAstro from "../components/Card/Card.astro";
import CardReact from "../components/Card/Card.tsx";

const container = await AstroContainer.create();

const normalise = (html: string) => html.replace(/>\s+</g, "><").trim();

const viaAstro = async (props: Record<string, unknown>, child = "<p>x</p>") =>
  normalise(await container.renderToString(CardAstro, { props, slots: { default: child } }));

const viaReact = (props: Record<string, unknown>, child = createElement("p", null, "x")) =>
  normalise(renderToStaticMarkup(createElement(CardReact, props, child)));

const cases: Array<[string, Record<string, unknown>]> = [
  ["defaults", {}],
  ["bordered lg", { border: true, padding: "lg" }],
  ["elevated article", { element: "article", elevation: "md" }],
  ["li sm no border", { element: "li", padding: "sm", border: false }],
  ["invalid element falls back", { element: "nav" }],
  ["extra class", { class: "extra" }],
];

describe("Card renders identically through Astro and React", () => {
  for (const [name, props] of cases) {
    it(name, async () => {
      const reactProps = { ...props, className: props.class };
      delete reactProps.class;
      expect(viaReact(reactProps)).toBe(await viaAstro(props));
    });
  }

  it("both suppress an empty card", async () => {
    expect(normalise(await container.renderToString(CardAstro, { props: {} }))).toBe("");
    expect(renderToStaticMarkup(createElement(CardReact, {}))).toBe("");
  });
});
