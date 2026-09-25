// Contract tests for Quote.astro — element follows content, gates always written.
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, it, expect } from "vitest";
import Quote from "../components/Quote/Quote.astro";
import { resolve } from "../lib/recipe";
import { quote as recipe } from "../recipes/quote.recipe";
import { quoteDefaults, quoteDerive } from "../lib/quote";

const container = await AstroContainer.create();
const render = (props: Record<string, unknown>, slots?: Record<string, string>) =>
  container.renderToString(Quote, { props, slots });
const image = { src: "/img/a.jpg", width: 1200, height: 1200, format: "jpg" } as const;

describe("Quote", () => {
  it("words alone: an aside labelled by the quote, both gates false", async () => {
    const html = await render({ id: "q", quote: "Hello" });
    expect(html).toMatch(/<aside class="Quote"[^>]*data-id="q"/);
    expect(html).toMatch(/<aside class="Quote"[^>]*data-media="false"/);
    expect(html).toMatch(/<aside class="Quote"[^>]*data-source="false"/);
    expect(html).toMatch(/<aside class="Quote"[^>]*data-size="md"/);
    expect(html).toMatch(/<aside class="Quote"[^>]*aria-labelledby="q-quote"/);
    expect(html).toContain('<p class="quote" id="q-quote">Hello</p>');
    expect(html).not.toContain("<blockquote");
  });

  it("a source makes it a figure with a blockquote and a figcaption", async () => {
    const html = await render({ quote: "Hello", source: "Ada" });
    expect(html).toMatch(/<figure class="Quote"[^>]*data-source="true"/);
    expect(html).toContain('<blockquote class="quote"><p>Hello</p></blockquote>');
    expect(html).toContain('<figcaption class="source">Ada</figcaption>');
    expect(html).not.toContain("aria-labelledby");
  });

  it("a portrait renders the square picture and its blurred echo", async () => {
    const html = await render({ quote: "Hello", image, alt: "Ada" });
    expect(html).toMatch(/<figure class="Quote"[^>]*data-media="true"/);
    expect(html).toContain('<div class="thumbnail">');
    expect(html).toContain('<figure class="Picture portrait">');
    expect(html).toMatch(/<img class="echo"[^>]*aria-hidden="true"/);
  });

  it("slot content lands inside the blockquote", async () => {
    const html = await render({ source: "Ada" }, { default: "<p>One<br>two</p>" });
    expect(html).toContain('<blockquote class="quote"><p>One<br>two</p></blockquote>');
  });

  it("size projects; an invalid size is a dev error", async () => {
    expect(await render({ quote: "x", size: "lg" })).toContain('data-size="lg"');
    const html = await render({ quote: "x", size: "xl" });
    expect(html).toContain("Quote:");
    expect(html).toContain('invalid size "xl"');
  });

  it("suppresses without words", async () => {
    expect((await render({ source: "Ada" })).trim()).toBe("");
  });

  it("the table alone: the element follows the content", () => {
    const ctx = (media: boolean) => ({ slots: { children: false, media }, derive: quoteDerive, defaults: quoteDefaults });
    const q = resolve(recipe, { quote: "x", id: "a" }, ctx(false));
    expect(q.tag).toBe("aside");
    expect(q.attrs["aria-labelledby"]).toBe("a-quote");
    expect(resolve(recipe, { quote: "x" }, ctx(true)).tag).toBe("figure");
    expect(resolve(recipe, { quote: "x", source: "x" }, ctx(false)).tag).toBe("figure");
  });
});
