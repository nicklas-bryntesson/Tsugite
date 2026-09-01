// Contract tests for Card.astro — mirrors CardTagHelper.cs (CardHelper.cs)
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, it, expect } from "vitest";
import Card from "../components/Card/Card.astro";

const container = await AstroContainer.create();

const render = (props: Record<string, unknown>, slots?: Record<string, string>) =>
  container.renderToString(Card, { props, slots });

describe("Card", () => {
  it("renders article.Card with default padding and border attributes", async () => {
    const html = await render({}, { default: "<p>x</p>" });
    expect(html).toContain("<article");
    expect(html).toContain('class="Card"');
    expect(html).toContain('data-border="false"');
    expect(html).toContain('data-padding="md"');
    expect(html).not.toContain("data-elevation");
  });

  it("sets data-elevation only when elevation prop is provided", async () => {
    const html = await render({ elevation: "sm" }, { default: "<p>x</p>" });
    expect(html).toContain('data-elevation="sm"');
  });

  it("renders border=true as data-border=\"true\"", async () => {
    const html = await render({ border: true }, { default: "<p>x</p>" });
    expect(html).toContain('data-border="true"');
  });

  it("renders the requested valid element, falls back to article", async () => {
    expect(await render({ element: "li" }, { default: "x" })).toContain("<li");
    expect(await render({ element: "nav" }, { default: "x" })).toContain("<article");
  });

  it("suppresses output without child content", async () => {
    const html = await render({});
    expect(html.trim()).toBe("");
  });

  it("errors on invalid padding in dev", async () => {
    const html = await render({ padding: "xl" }, { default: "x" });
    expect(html).toContain('invalid padding "xl"');
  });

  it("errors on invalid elevation in dev", async () => {
    const html = await render({ elevation: "xxl" }, { default: "x" });
    expect(html).toContain('invalid elevation "xxl"');
  });

  it("merges caller class after Card", async () => {
    const html = await render({ class: "extra" }, { default: "x" });
    expect(html).toContain('class="Card extra"');
  });

  it("passes through extra attributes like style", async () => {
    const html = await render({ style: "width:16rem;" }, { default: "x" });
    expect(html).toContain('style="width:16rem;"');
  });
});
