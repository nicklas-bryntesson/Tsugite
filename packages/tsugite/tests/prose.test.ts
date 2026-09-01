// Contract tests for Prose.astro — mirrors ProseTagHelper.cs
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, it, expect } from "vitest";
import Prose from "../components/Prose/Prose.astro";

const container = await AstroContainer.create();

const render = (props: Record<string, unknown>, slots?: Record<string, string>) =>
  container.renderToString(Prose, { props, slots });

describe("Prose", () => {
  it("renders div.Prose with default variant and size", async () => {
    const html = await render({}, { default: "<p>Text</p>" });
    expect(html).toContain("<div");
    expect(html).toContain('class="Prose"');
    expect(html).toContain('data-variant="default"');
    expect(html).toContain('data-size="md"');
    expect(html).toContain("<p>Text</p>");
  });

  it("renders the requested valid element", async () => {
    const html = await render({ element: "aside" }, { default: "<p>x</p>" });
    expect(html).toContain("<aside");
  });

  it("falls back to div for invalid element", async () => {
    const html = await render({ element: "table" }, { default: "<p>x</p>" });
    expect(html).toContain("<div");
  });

  it("accepts content prop as pre-rendered HTML", async () => {
    const html = await render({ content: "<p>From RTE</p>" });
    expect(html).toContain("<p>From RTE</p>");
  });

  it("renders nothing when both content and children are absent", async () => {
    const html = await render({});
    expect(html.trim()).toBe("");
  });

  it("errors on invalid variant in dev", async () => {
    const html = await render({ variant: "fancy" }, { default: "<p>x</p>" });
    expect(html).toContain("app-prose:");
    expect(html).toContain('invalid variant "fancy"');
  });

  it("errors on invalid size in dev", async () => {
    const html = await render({ size: "xl" }, { default: "<p>x</p>" });
    expect(html).toContain('invalid size "xl"');
  });

  it("merges caller class after Prose", async () => {
    const html = await render({ class: "extra" }, { default: "<p>x</p>" });
    expect(html).toContain('class="Prose extra"');
  });
});
