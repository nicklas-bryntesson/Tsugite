// Contract tests for Teaser.astro — behaviour, not markup strings: Teaser composes
// Card, Heading, Prose and LinkButton as components (ADR-0015), so their markup is
// theirs to change.
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, it, expect } from "vitest";
import Teaser from "../components/Teaser/Teaser.astro";

const container = await AstroContainer.create();

const render = (props: Record<string, unknown>, slots?: Record<string, string>) =>
  container.renderToString(Teaser, { props, slots });

describe("Teaser", () => {
  it("default frame: a bordered, unpadded, flat Card around article.Teaser", async () => {
    const html = await render({ heading: "Post title", href: "#", excerpt: "Short excerpt" });
    expect(html).toMatch(/<div class="Card"[^>]*data-border="true"/);
    expect(html).toMatch(/<div class="Card"[^>]*data-padding="none"/);
    expect(html).toMatch(/<div class="Card"[^>]*data-elevation="none"/);
    expect(html).toMatch(/<article class="Teaser"[^>]*data-button="false"/);
    expect(html).toMatch(/<article class="Teaser"[^>]*data-media="false"/);
    expect(html).toContain('<div class="LayoutContainer">');
  });

  it("elevated frame: elevation sm, no border", async () => {
    const html = await render({ frame: "elevated", heading: "T", href: "#" });
    expect(html).toMatch(/<div class="Card"[^>]*data-elevation="sm"/);
    expect(html).toMatch(/<div class="Card"[^>]*data-border="false"/);
  });

  it("bare frame renders no Card wrapper", async () => {
    const html = await render({ frame: "bare", heading: "T", href: "#" });
    expect(html).not.toContain('class="Card"');
    expect(html).toContain('class="Teaser"');
  });

  it("stretched-link mode: Teaser's own link wraps a plain Heading", async () => {
    const html = await render({ heading: "Clickable", href: "/post" });
    expect(html).toMatch(/<a class="Teaser-link" href="\/post">\s*<h2 class="Heading"/);
    expect(html).toContain("Clickable");
    expect(html).not.toContain('class="Button"');
  });

  it("the heading goes through the typography engine (data-run, ADR-0012)", async () => {
    const html = await render({ heading: "Engine", href: "/post" });
    expect(html).toMatch(/<h2 class="Heading"[^>]*data-variant="heading"/);
    expect(html).toMatch(/<h2 class="Heading"[^>]*data-size="4"/);
    expect(html).toMatch(/<h2 class="Heading"[^>]*data-run="block"/);
  });

  it("button mode: plain heading, a LinkButton in .Actions with sr-only context", async () => {
    const html = await render({ heading: "Title", href: "/post", button: true });
    expect(html).toMatch(/<article class="Teaser"[^>]*data-button="true"/);
    expect(html).not.toContain('class="Teaser-link"');
    expect(html).toMatch(/<div class="Actions">\s*<a class="Button"[^>]*href="\/post"/);
    expect(html).toMatch(/<a class="Button"[^>]*data-emphasis="primary"/);
    expect(html).toMatch(/<a class="Button"[^>]*data-size="sm"/);
    // the button may grow; Teaser's Actions region decides per container state what it is given
    expect(html).toMatch(/<a class="Button"[^>]*data-grow-inline="true"/);
    expect(html).toContain("Read more");
    // the sr-only context is Button's part now: Teaser supplies the words, Button the hiding
    expect(html).toContain('<span class="Button-text">Read more<span class="Button-srText"> about Title</span></span>');
  });

  it("custom button label", async () => {
    const html = await render({ heading: "T", href: "#", button: true, "button-label": "Read the post" });
    expect(html).toContain("Read the post");
  });

  it("excerpt renders as basic/sm Prose", async () => {
    const html = await render({ heading: "T", href: "#", excerpt: "A taste" });
    expect(html).toMatch(/<div class="Prose"[^>]*data-variant="basic"/);
    expect(html).toMatch(/<div class="Prose"[^>]*data-size="sm"/);
    expect(html).toContain("<p>A taste</p>");
  });

  it("image renders a Picture (figure.Picture) with the teaser preset's two pictures", async () => {
    const image = { src: "/img/a.jpg", width: 1600, height: 900, format: "jpg" } as const;
    const html = await render({ heading: "T", href: "#", image, alt: "Alt" });
    expect(html).toMatch(/<article class="Teaser"[^>]*data-media="true"/);
    expect(html).toContain('<figure class="Picture">');
    expect(html).toContain('class="group StackedSources"');
    expect(html).toContain('class="group HorizontalSources"');
  });

  it("an unknown frame is refused (ADR-0019), not silently bordered", async () => {
    const html = await render({ heading: "T", href: "#", frame: "glass" });
    expect(html).toContain('invalid frame "glass"');
    expect(html).not.toContain('class="Teaser"');
  });

  it("child content lands in ContentContainer", async () => {
    const html = await render(
      { heading: "T", href: "#" },
      { default: '<time datetime="2025-01-15">15 January 2025</time>' },
    );
    expect(html).toContain('<div class="ContentContainer">');
    expect(html).toContain('<time datetime="2025-01-15">15 January 2025</time>');
  });

  it("guard: button=true without href errors in dev", async () => {
    const html = await render({ heading: "T", button: true });
    expect(html).toContain("Teaser:");
    expect(html).toContain('button="true" requires href');
  });
});
