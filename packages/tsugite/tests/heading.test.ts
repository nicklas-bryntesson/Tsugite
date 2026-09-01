// Contract tests for Heading.astro — mirrors HeadingTagHelper.cs behaviour
// as documented in AiPoc .claude/contracts/tag-helpers.md
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, it, expect } from "vitest";
import Heading from "../components/Heading/Heading.astro";

const container = await AstroContainer.create();

const render = (props: Record<string, unknown>, slots?: Record<string, string>) =>
  container.renderToString(Heading, { props, slots });

describe("Heading", () => {
  it("renders default heading/2 with text wrapped in .heading-text", async () => {
    const html = await render({ text: "Hello" });
    expect(html).toContain("<h2");
    expect(html).toContain('class="Heading"');
    expect(html).toContain('data-variant="heading"');
    expect(html).toContain('data-size="2"');
    expect(html).toContain('data-align="left"');
    expect(html).toContain('data-wrap="balance"');
    expect(html).toContain('<span class="heading-text">Hello</span>');
  });

  it("infers heading size from element when size omitted", async () => {
    const html = await render({ text: "T", element: "h4" });
    expect(html).toContain("<h4");
    expect(html).toContain('data-size="4"');
  });

  it("defaults display variant to size 2", async () => {
    const html = await render({ text: "T", element: "h1", variant: "display" });
    expect(html).toContain('data-variant="display"');
    expect(html).toContain('data-size="2"');
  });

  it("accepts explicit display size", async () => {
    const html = await render({ text: "T", element: "h1", variant: "display", size: "1" });
    expect(html).toContain('data-size="1"');
  });

  it("defaults body variant to size md", async () => {
    const html = await render({ text: "T", element: "h3", variant: "body" });
    expect(html).toContain('data-variant="body"');
    expect(html).toContain('data-size="md"');
  });

  it("rejects non-heading elements for body variant (dev error)", async () => {
    const html = await render({ text: "T", element: "span", variant: "body" });
    expect(html).toContain("app-heading:");
    expect(html).toContain("does not allow element");
  });

  it("wraps text in a link when href is set", async () => {
    const html = await render({ text: "Latest posts", element: "h3", href: "/blog" });
    expect(html).toContain('<a href="/blog" class="heading-link">Latest posts</a>');
  });

  it("wraps highlight words in <mark>", async () => {
    const html = await render({ text: "Build better with AiPoc", highlight: "AiPoc" });
    expect(html).toContain("<mark>AiPoc</mark>");
  });

  it("renders slot content without .heading-text wrapper", async () => {
    const html = await render({}, { default: "Rich <em>content</em>" });
    expect(html).toContain("Rich <em>content</em>");
    expect(html).not.toContain("heading-text");
  });

  it("renders nothing when no text and no child content", async () => {
    const html = await render({});
    expect(html.trim()).toBe("");
  });

  it("errors on text combined with child content", async () => {
    const html = await render({ text: "X" }, { default: "Y" });
    expect(html).toContain("invalid combination");
  });

  it("errors on href without text", async () => {
    const html = await render({ href: "/x" }, { default: "Y" });
    expect(html).toContain("invalid combination");
  });

  it("falls back to h2 for invalid element", async () => {
    const html = await render({ text: "T", element: "table" });
    expect(html).toContain("<h2");
  });

  it("merges caller class after Heading", async () => {
    const html = await render({ text: "T", class: "extra" });
    expect(html).toContain('class="Heading extra"');
  });

  it("sets data-color only for valid colors", async () => {
    const html = await render({ text: "T", color: "primary" });
    expect(html).toContain('data-color="primary"');
    const html2 = await render({ text: "T", color: "hotpink" });
    expect(html2).not.toContain("data-color");
  });
});
