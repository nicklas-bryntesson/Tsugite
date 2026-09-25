// The recipe is a table read by lib/recipe.ts (ADR-0018). tests/fixtures/quote.json lists
// inputs and the exact resolution each must produce. This file holds the recipe to it, then
// holds the Astro and React renderers to the recipe and to each other — byte-identical
// markup for the same words; with a portrait the picture markup is the host's, so that case
// compares root and parts.
import { readFileSync } from "node:fs";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, it, expect } from "vitest";
import { resolve } from "../lib/recipe";
import { quote } from "../recipes/quote.recipe";
import { quoteDefaults, quoteDerive } from "../lib/quote";
import QuoteAstro from "../components/Quote/Quote.astro";
import QuoteReact from "../components/Quote/Quote.tsx";

interface Fixture {
  component: string;
  cases: Array<{
    name: string;
    input: Record<string, unknown> & { children: boolean; media: boolean };
    expect: { mode: "render" | "suppress" | "error"; tag?: string; className?: string; attrs?: Record<string, string>; errorMessage?: string };
  }>;
}

const fixture: Fixture = JSON.parse(readFileSync(new URL("./fixtures/quote.json", import.meta.url), "utf8"));
const container = await AstroContainer.create();
const image = { src: "/img/a.jpg", width: 1200, height: 1200, format: "jpg" } as const;
const CHILD = "<p>One<br>two</p>";
// React closes void elements with "/>"; Astro writes HTML. Same DOM.
const normalise = (html: string) => html.replace(/<!--.*?-->/g, "").replace(/>\s+</g, "><").replace(/&quot;/g, '"').replace(/<br\/>/g, "<br>").trim();

const split = (input: Record<string, unknown>) => {
  const { children, media, ...props } = input;
  return { props, children: children as boolean, media: media as boolean };
};
const viaAstro = async (input: Record<string, unknown>) => {
  const { props, children, media } = split(input);
  return normalise(await container.renderToString(QuoteAstro, { props: { ...props, image: media ? image : null, alt: media ? "Ada" : undefined }, slots: children ? { default: CHILD } : undefined }));
};
const viaReact = (input: Record<string, unknown>) => {
  const { props, children, media } = split(input);
  const { class: className, ...rest } = props;
  const p: Record<string, unknown> = { ...rest, ...(className === undefined ? {} : { className }), image: media ? { src: image.src, width: image.width, height: image.height } : null, alt: media ? "Ada" : undefined };
  const child = children ? createElement("p", null, "One", createElement("br"), "two") : undefined;
  return normalise(renderToStaticMarkup(createElement(QuoteReact, p as never, child)));
};
const openingTag = (tag: string, className: string, attrs: Record<string, string>) =>
  `<${tag} class="${className}"` + Object.entries(attrs).map(([k, v]) => ` ${k}="${v}"`).join("") + ">";

describe(`${fixture.component}: the recipe resolves every fixture case`, () => {
  for (const { name, input, expect: want } of fixture.cases) {
    it(name, () => {
      const { props, children, media } = split(input);
      const got = resolve(quote, props, { slots: { children, media }, derive: quoteDerive, defaults: quoteDefaults });
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

describe(`${fixture.component}: Astro and React render every fixture case identically`, () => {
  for (const { name, input, expect: want } of fixture.cases) {
    it(name, async () => {
      const astro = await viaAstro(input);
      const react = viaReact(input);
      if (want.mode === "render") {
        const root = openingTag(want.tag!, want.className!, want.attrs!);
        expect(astro.startsWith(root), `astro root\n${astro}`).toBe(true);
        if (input.media) {
          // the portrait is the host's picture markup; root and parts must agree, bytes need not
          expect(react.startsWith(root)).toBe(true);
          for (const part of ['<div class="thumbnail">', 'class="Picture portrait"', 'class="echo"']) {
            expect(astro).toContain(part);
            expect(react).toContain(part);
          }
          if (input.source) for (const html of [astro, react]) expect(html).toContain(`<figcaption class="source">${input.source}</figcaption>`);
          expect(react.replace(/<div class="thumbnail">.*?<\/div>/, "").replace(/<figure class="Picture portrait">.*?<\/figure>/, "")).toBe(astro.replace(/<div class="thumbnail">.*?<\/div>/, "").replace(/<figure class="Picture portrait">.*?<\/figure>/, ""));
        } else {
          expect(react, "react").toBe(astro);
        }
        if (want.tag === "aside") expect(astro).toContain(input.id ? `<p class="quote" id="${input.id}-quote">` : '<p class="quote">');
        else expect(astro).toContain('<blockquote class="quote">');
      } else if (want.mode === "suppress") {
        expect(astro).toBe("");
        expect(react).toBe("");
      } else {
        expect(astro).toContain(want.errorMessage!);
        expect(react).toContain(want.errorMessage!);
      }
    });
  }
});
