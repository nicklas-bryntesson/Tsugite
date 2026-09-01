// Contract tests for LinkButton.astro + ActionButton.astro —
// mirrors LinkButtonTagHelper.cs / ActionButtonTagHelper.cs / ButtonHelper.cs
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, it, expect } from "vitest";
import LinkButton from "../components/Button/LinkButton.astro";
import ActionButton from "../components/Button/ActionButton.astro";

const container = await AstroContainer.create();

const renderLink = (props: Record<string, unknown>, slots?: Record<string, string>) =>
  container.renderToString(LinkButton, { props, slots });
const renderAction = (props: Record<string, unknown>, slots?: Record<string, string>) =>
  container.renderToString(ActionButton, { props, slots });

describe("LinkButton", () => {
  it("renders a.Button with default emphasis/size/pill and text span", async () => {
    const html = await renderLink({ href: "/start" }, { default: "Get started" });
    expect(html).toContain("<a");
    expect(html).toContain('class="Button"');
    expect(html).toContain('href="/start"');
    expect(html).toContain('data-emphasis="primary"');
    expect(html).toContain('data-size="md"');
    expect(html).toContain('data-pill="false"');
    expect(html).toContain('<span class="Button-text">Get started</span>');
    expect(html).not.toContain("data-intent");
  });

  it("adds rel noopener for target=_blank", async () => {
    const html = await renderLink({ href: "https://x.se", target: "_blank" }, { default: "x" });
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("renders icon-only with data-icon-only and svg use", async () => {
    const html = await renderLink({ href: "/share", icon: "icon-search", "aria-label": "Share" });
    expect(html).toContain('data-icon-only="true"');
    expect(html).toContain('aria-label="Share"');
    expect(html).toContain('<svg class="Button-icon"');
    expect(html).toContain('href="#icon-search"');
    expect(html).toContain('data-icon-position="right"');
  });

  it("suppresses without content, icon and aria-label", async () => {
    const html = await renderLink({ href: "/x" });
    expect(html.trim()).toBe("");
  });

  it("passes through data-test-state", async () => {
    const html = await renderLink({ href: "#", "data-test-state": "hover" }, { default: "x" });
    expect(html).toContain('data-test-state="hover"');
  });

  it("renders pill=true as data-pill=\"true\"", async () => {
    const html = await renderLink({ href: "#", pill: true }, { default: "x" });
    expect(html).toContain('data-pill="true"');
  });
});

describe("ActionButton", () => {
  it("renders button.Button with type, intent and defaults", async () => {
    const html = await renderAction({}, { default: "Save" });
    expect(html).toContain("<button");
    expect(html).toContain('type="button"');
    expect(html).toContain('data-intent="neutral"');
    expect(html).toContain('data-emphasis="primary"');
    expect(html).toContain('<span class="Button-text">Save</span>');
    expect(html).not.toContain("disabled");
  });

  it("supports button-type submit", async () => {
    const html = await renderAction({ "button-type": "submit" }, { default: "x" });
    expect(html).toContain('type="submit"');
  });

  it("renders disabled attribute", async () => {
    const html = await renderAction({ disabled: true }, { default: "x" });
    expect(html).toContain("disabled");
  });

  it("sets destructive intent", async () => {
    const html = await renderAction({ intent: "destructive" }, { default: "x" });
    expect(html).toContain('data-intent="destructive"');
  });

  it("ignores invalid intent", async () => {
    const html = await renderAction({ intent: "evil" }, { default: "x" });
    expect(html).not.toContain("data-intent");
  });
});
