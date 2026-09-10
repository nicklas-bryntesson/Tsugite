// Contract tests for Surface.astro — the voice donut as a region (ADR-0016).
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, it, expect } from "vitest";
import Surface from "../components/Surface/Surface.astro";

const container = await AstroContainer.create();
const render = (props: Record<string, unknown>, slots: Record<string, string> = { default: "<p>x</p>" }) =>
  container.renderToString(Surface, { props, slots });

describe("Surface", () => {
  it("ground by default: div.Surface with no voice and no volume, content capped", async () => {
    const html = await render({});
    expect(html).toMatch(/<div class="Surface"[^>]*data-cap-inline="true"/);
    expect(html).not.toContain("data-theme");
    expect(html).not.toContain("data-prominence");
    expect(html).toContain('<div class="content">');
  });

  it("a voice writes both attributes; volume defaults to primary", async () => {
    const html = await render({ theme: "brand" });
    expect(html).toMatch(/data-theme="brand"/);
    expect(html).toMatch(/data-prominence="primary"/);
  });

  it("volume without a voice is written alone: the surrounding voice, quieter", async () => {
    const html = await render({ prominence: "subtle" });
    expect(html).not.toContain("data-theme");
    expect(html).toContain('data-prominence="subtle"');
  });

  it("renders the requested element, falls back to div", async () => {
    expect(await render({ element: "section" })).toContain("<section");
    expect(await render({ element: "nav" })).toContain("<div");
  });

  it("capInline=false lifts the content measure", async () => {
    expect(await render({ capInline: false })).toContain('data-cap-inline="false"');
  });

  it("refuses a forbidden combination from the matrix (inverse × subtle)", async () => {
    const html = await render({ theme: "inverse", prominence: "subtle" });
    expect(html).toContain("Surface:");
    expect(html).toContain("not an allowed combination");
    expect(html).not.toContain('class="Surface"');
  });

  it("refuses an unknown voice", async () => {
    const html = await render({ theme: "mossa" });
    expect(html).toContain('unknown voice "mossa"');
  });
});
