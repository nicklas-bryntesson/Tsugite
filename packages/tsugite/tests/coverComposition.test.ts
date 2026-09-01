// Contract tests for CoverComposition.astro — mirrors _CoverComposition.cshtml
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, it, expect } from "vitest";
import CoverComposition from "../components/CoverComposition/CoverComposition.astro";
// @ts-expect-error — vite resolves image imports to ImageMetadata
import img from "./media/amal-s.jpg";

const container = await AstroContainer.create();

const render = (props: Record<string, unknown>) =>
  container.renderToString(CoverComposition, { props });

const videoProps = {
  title: "Hero title",
  preamble: "A short preamble.",
  headingLevel: "h1",
  videoSrc: "/media/bg.mp4",
  poster: "/media/poster.webp",
  buttons: [
    { url: "#a", text: "Primary", emphasis: "primary" },
    { url: "#b", text: "Secondary", emphasis: "secondary" },
  ],
};

describe("CoverComposition — video variant", () => {
  it("renders the full-bleed video hero with policy-governed autoplay hooks", async () => {
    const html = await render(videoProps);
    expect(html).toContain('class="CoverComposition grid-container"');
    expect(html).toContain('data-component="CoverCompositionVideo"');
    expect(html).toContain('data-autoplay="policy"');
    expect(html).toContain('<span class="overlay"');
    expect(html).toContain('class="enhancedVideo"');
    expect(html).toContain("<noscript>");
    expect(html).toContain('poster="/media/poster.webp"');
  });

  it("content is display-1 heading on the requested element + basic prose + lg buttons", async () => {
    const html = await render(videoProps);
    expect(html).toContain("<h1");
    expect(html).toContain('data-variant="display"');
    expect(html).toContain('data-size="1"');
    expect(html).toContain('data-variant="basic"');
    expect(html).toContain("A short preamble.");
    expect(html).toContain('data-size="lg"');
    expect(html).toContain('data-emphasis="secondary"');
    expect(html).toContain('<div class="link-group">');
  });
});

describe("CoverComposition — image variant", () => {
  it("renders the hero picture preset without the video hooks", async () => {
    const html = await render({ title: "Image hero", image: img, preamble: "Text." });
    expect(html).toContain('class="CoverComposition"');
    expect(html).not.toContain("CoverCompositionVideo");
    expect(html).toContain('<figure class="Media grid-container-full">');
    expect(html).toContain('loading="eager"');
    expect(html).toContain('alt="Image hero"');
  });

  it("renders no composition markup without media (script tag ships regardless)", async () => {
    const html = await render({ title: "No media" });
    expect(html).not.toContain("CoverComposition ");
    expect(html).not.toContain("media-container");
  });
});
