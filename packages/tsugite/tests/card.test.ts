// Contract tests for Card.astro
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, it, expect } from "vitest";
import Card from "../components/Card/Card.astro";

const container = await AstroContainer.create();

const render = (props: Record<string, unknown>, slots?: Record<string, string>) =>
  container.renderToString(Card, { props, slots });

describe("Card", () => {
  it("renders div.Card with default padding, border and elevation attributes", async () => {
    const html = await render({}, { default: "<p>x</p>" });
    expect(html).toContain("<div");
    expect(html).toContain('class="Card"');
    expect(html).toContain('data-border="false"');
    expect(html).toContain('data-padding="md"');
    expect(html).toContain('data-elevation="none"');
  });

  it("projects the elevation prop as data-elevation", async () => {
    const html = await render({ elevation: "sm" }, { default: "<p>x</p>" });
    expect(html).toContain('data-elevation="sm"');
  });

  it("renders border=true as data-border=\"true\"", async () => {
    const html = await render({ border: true }, { default: "<p>x</p>" });
    expect(html).toContain('data-border="true"');
  });

  it("renders the requested valid element, falls back to div", async () => {
    expect(await render({ element: "li" }, { default: "x" })).toContain("<li");
    expect(await render({ element: "nav" }, { default: "x" })).toContain("<div");
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
