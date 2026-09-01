// Contract tests for CtaLinkButton.astro — mirrors CtaLinkButtonTagHelper.cs
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, it, expect } from "vitest";
import CtaLinkButton from "../components/CtaLinkButton/CtaLinkButton.astro";

const container = await AstroContainer.create();

const render = (props: Record<string, unknown>, slots?: Record<string, string>) =>
  container.renderToString(CtaLinkButton, { props, slots });

describe("CtaLinkButton", () => {
  it("renders a.CtaButton with glow variant and layered spans in order", async () => {
    const html = await render({ href: "/signup" }, { default: "Start free trial" });
    expect(html).toContain('class="CtaButton"');
    expect(html).toContain('data-variant="glow"');
    expect(html).toContain('href="/signup"');
    const glowIdx = html.indexOf('class="CtaButton-glow"');
    const borderIdx = html.indexOf('class="CtaButton-border"');
    const textIdx = html.indexOf('class="CtaButton-text"');
    expect(glowIdx).toBeGreaterThan(-1);
    expect(borderIdx).toBeGreaterThan(glowIdx);
    expect(textIdx).toBeGreaterThan(borderIdx);
    expect(html).toContain("Start free trial");
  });

  it("renders icon always on the right", async () => {
    const html = await render({ href: "/demo", icon: "icon-info" }, { default: "Watch" });
    const textIdx = html.indexOf('class="CtaButton-text"');
    const iconIdx = html.indexOf('class="CtaButton-icon"');
    expect(iconIdx).toBeGreaterThan(textIdx);
    expect(html).toContain('href="#icon-info"');
  });

  it("suppresses without child content and aria-label", async () => {
    const html = await render({ href: "/x" });
    expect(html.trim()).toBe("");
  });

  it("passes through data-test-state", async () => {
    const html = await render({ href: "#", "data-test-state": "focus" }, { default: "x" });
    expect(html).toContain('data-test-state="focus"');
  });
});
