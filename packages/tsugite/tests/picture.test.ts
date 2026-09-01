// Contract tests for Picture.astro — mirrors PictureTagHelper.cs + MediaHelper.cs
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, it, expect } from "vitest";
import Picture from "../components/Picture/Picture.astro";
// @ts-expect-error — vite resolves image imports to ImageMetadata
import img from "./media/amal-s.jpg";

const container = await AstroContainer.create();

const render = (props: Record<string, unknown>) =>
  container.renderToString(Picture, { props });

describe("Picture", () => {
  it("teaser preset renders figure.Media with stacked + horizontal pictures", async () => {
    const html = await render({ image: img, preset: "teaser", alt: "Test" });
    expect(html).toContain('<figure class="Media">');
    expect(html).toContain('class="Media-picture StackedSources"');
    expect(html).toContain('class="Media-picture HorizontalSources"');
    expect(html).toContain('type="image/avif"');
    expect(html).toContain('type="image/webp"');
    expect(html).toContain("400w");
    expect(html).toContain("800w");
    expect(html).toContain("320w");
    expect(html).toContain("640w");
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('alt="Test"');
    expect(html).toContain('decoding="async"');
  });

  it("hero preset renders one art-directed picture with 4 media queries, eager", async () => {
    const html = await render({ image: img, preset: "hero", alt: "Hero" });
    expect(html).toContain('<figure class="Media grid-container-full">');
    expect(html).toContain('media="(max-width: 21.24999rem)"');
    expect(html).toContain('media="(max-width: 48rem)"');
    expect(html).toContain('media="(max-width: 64rem)"');
    expect(html).toContain('media="(min-width: 64rem)"');
    expect(html).toContain('loading="eager"');
    // art direction → img has no srcset
    const imgTag = html.match(/<img[^>]*>/)?.[0] ?? "";
    expect(imgTag).not.toContain("srcset");
  });

  it("loading prop overrides preset default", async () => {
    const html = await render({ image: img, preset: "hero", alt: "", loading: "lazy" });
    expect(html).toContain('loading="lazy"');
  });

  it("errors in dev when image is missing", async () => {
    const html = await render({ preset: "hero" });
    expect(html).toContain("image is required");
  });

  it("errors in dev on unknown preset", async () => {
    const html = await render({ image: img, preset: "banner" });
    expect(html).toContain('unknown preset "banner"');
  });

  it("appends caller class to the figure", async () => {
    const html = await render({ image: img, preset: "teaser", alt: "", class: "extra" });
    expect(html).toContain('<figure class="Media extra">');
  });
});
