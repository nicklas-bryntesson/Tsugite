// Contract tests for Teaser.astro — mirrors TeaserTagHelper.cs
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, it, expect } from "vitest";
import Teaser from "../components/Teaser/Teaser.astro";
// @ts-expect-error — vite resolves image imports to ImageMetadata
import img from "./media/david-becker.jpg";

const container = await AstroContainer.create();

const render = (props: Record<string, unknown>, slots?: Record<string, string>) =>
  container.renderToString(Teaser, { props, slots });

describe("Teaser", () => {
  it("default frame wraps article.Teaser in a bordered Card with no padding", async () => {
    const html = await render({ heading: "Post title", href: "#", excerpt: "Short excerpt" });
    expect(html).toContain('<div class="Card" data-padding="none" data-border="true">');
    expect(html).toContain('class="Teaser"');
    expect(html).toContain('data-button="false"');
    expect(html).toContain('data-media="false"');
    expect(html).toContain('<div class="LayoutContainer">');
  });

  it("elevated frame maps to data-elevation=sm", async () => {
    const html = await render({ frame: "elevated", heading: "T", href: "#" });
    expect(html).toContain('data-elevation="sm"');
    expect(html).not.toContain("data-border");
  });

  it("bare frame renders no Card wrapper", async () => {
    const html = await render({ frame: "bare", heading: "T", href: "#" });
    expect(html).not.toContain('class="Card"');
    expect(html).toContain('class="Teaser"');
  });

  it("stretched-link mode: heading becomes a Teaser-link", async () => {
    const html = await render({ heading: "Clickable", href: "/post" });
    expect(html).toContain(
      '<h2 class="Heading" data-variant="heading" data-size="4" data-align="left" data-wrap="balance">',
    );
    expect(html).toContain('<a class="heading-link Teaser-link" href="/post">Clickable</a>');
  });

  it("button mode: plain heading + CTA button with sr-only context", async () => {
    const html = await render({ heading: "Title", href: "/post", button: true });
    expect(html).toContain('data-button="true"');
    expect(html).toContain('<span class="heading-text">Title</span>');
    expect(html).toContain(
      '<a class="Button" href="/post" data-emphasis="primary" data-size="sm" data-pill="false">',
    );
    expect(html).toContain("Read more");
    expect(html).toContain('<span class="ScreenReaderText"> about Title</span>');
  });

  it("custom button label", async () => {
    const html = await render({ heading: "T", href: "#", button: true, "button-label": "Read the post" });
    expect(html).toContain("Read the post");
  });

  it("excerpt renders as basic/sm Prose", async () => {
    const html = await render({ heading: "T", href: "#", excerpt: "A taste" });
    expect(html).toContain('<div class="Prose" data-variant="basic" data-size="sm"><p>A taste</p></div>');
  });

  it("image renders MediaContainer figure with teaser preset pictures", async () => {
    const html = await render({ image: img, alt: "Sample", heading: "T", href: "#" });
    expect(html).toContain('data-media="true"');
    expect(html).toContain('<figure class="MediaContainer">');
    expect(html).toContain('class="Media StackedSources"');
    expect(html).toContain('class="Media HorizontalSources"');
  });

  it("child content lands in ContentContainer", async () => {
    const html = await render(
      { heading: "T" },
      { default: '<time datetime="2025-01-15">15 January 2025</time>' },
    );
    expect(html).toContain('<div class="ContentContainer">');
    expect(html).toContain('<time datetime="2025-01-15">15 January 2025</time>');
  });

  it("guard: button=true without href errors in dev", async () => {
    const html = await render({ heading: "Broken", button: true });
    expect(html).toContain("app-teaser:");
    expect(html).toContain('button="true" requires href');
  });
});
