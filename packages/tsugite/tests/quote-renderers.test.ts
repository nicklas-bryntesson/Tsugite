// The recipe is the contract; Astro and React must emit the same markup for the same
// words. The portrait is the one host idiom that differs (Astro's media pipeline
// against a plain <img>), so the media case compares structure, not bytes.
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, it, expect } from "vitest";
import QuoteAstro from "../components/Quote/Quote.astro";
import QuoteReact from "../components/Quote/Quote.tsx";

const container = await AstroContainer.create();
const normalise = (html: string) => html.replace(/<!--.*?-->/g, "").replace(/>\s+</g, "><").trim();

const viaAstro = async (props: Record<string, unknown>, slot?: string) =>
  normalise(await container.renderToString(QuoteAstro, { props, slots: slot ? { default: slot } : undefined }));
const viaReact = (props: Record<string, unknown>, child?: unknown) =>
  normalise(renderToStaticMarkup(createElement(QuoteReact, props, child)));

const cases: Array<[string, Record<string, unknown>]> = [
  ["aside, words alone", { id: "q", quote: "Hello" }],
  ["figure with a source", { id: "q", quote: "Hello", source: "Ada" }],
  ["large words", { quote: "Hello", source: "Ada", size: "lg" }],
  ["no cap", { quote: "Hello", capInline: false }],
];

describe("Quote renders identically through Astro and React", () => {
  for (const [name, props] of cases) {
    it(name, async () => {
      expect(viaReact(props)).toBe(await viaAstro(props));
    });
  }

  it("children and slot land in the same place", async () => {
    const astro = await viaAstro({ source: "Ada" }, "<p>One</p>");
    const react = viaReact({ source: "Ada" }, createElement("p", null, "One"));
    expect(react).toBe(astro);
  });

  it("both suppress without words", async () => {
    expect(await viaAstro({ source: "Ada" })).toBe("");
    expect(viaReact({ source: "Ada" })).toBe("");
  });

  it("with a portrait: same root, same parts; only the picture markup differs", async () => {
    const image = { src: "/img/a.jpg", width: 1200, height: 1200, format: "jpg" } as const;
    const astro = await viaAstro({ id: "q", quote: "Hello", source: "Ada", image, alt: "Ada" });
    const react = viaReact({ id: "q", quote: "Hello", source: "Ada", image: { src: image.src, width: image.width, height: image.height }, alt: "Ada" });
    const root = (html: string) => html.match(/^<figure class="Quote"[^>]*>/)![0];
    expect(root(react)).toBe(root(astro));
    for (const part of ['<div class="thumbnail">', '<figure class="portrait">', 'class="echo"', '<figcaption class="source">Ada</figcaption>']) {
      expect(astro).toContain(part);
      expect(react).toContain(part);
    }
  });
});
