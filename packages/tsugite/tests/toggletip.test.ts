// Contract tests for ToggleTip.astro — the server end-state. The runtime used to
// build this DOM with innerHTML; now the markup is authored, so it can be
// asserted without a browser. Behaviour (open/close/position/dismiss) is the
// e2e suite's job.
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, it, expect } from "vitest";
import ToggleTip from "../components/ToggleTip/ToggleTip.astro";

const container = await AstroContainer.create();

const render = (props: Record<string, unknown>, slot = "") =>
  container.renderToString(ToggleTip, { props, slots: { default: slot } });

describe("ToggleTip.astro", () => {
  it("renders the house root: div.ToggleTip with data-component, id, icon and direction", async () => {
    const html = await render({ id: "tip" });
    expect(html).toContain('class="ToggleTip"');
    expect(html).toContain('data-component="ToggleTip"');
    expect(html).toContain('id="tip"');
    expect(html).toContain('data-icon="info"');
    expect(html).toContain('data-direction="top"');
    expect(html).toMatch(/^\s*<div /);
  });

  it("wires the trigger to the bubble: aria-controls names the popup id, closed state authored", async () => {
    const html = await render({ id: "tip" });
    expect(html).toContain('aria-controls="tip-popup"');
    expect(html).toContain('id="tip-popup"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('type="button"');
  });

  it("puts slotted rich content inside the bubble — the empty-bubble bug's assertion", async () => {
    const html = await render({ id: "tip" }, "<p>First run.</p><ul><li>A list</li></ul>");
    const popup = html.slice(html.indexOf('class="popup"'));
    expect(popup).toContain("<p>First run.</p>");
    expect(popup).toContain("<li>A list</li>");
  });

  it("renders the heading only when given, names the dialog by it, and never writes a title attribute", async () => {
    const without = await render({ id: "tip" });
    expect(without).not.toContain('role="heading"');
    expect(without).toContain('aria-label="More information"');
    expect(without).not.toMatch(/\stitle=/);

    const withHeading = await render({ id: "tip", heading: "Why this?", headingLevel: 4 });
    expect(withHeading).toContain('role="heading"');
    expect(withHeading).toContain('aria-level="4"');
    expect(withHeading).toContain('id="tip-heading"');
    expect(withHeading).toContain('aria-labelledby="tip-heading"');
    expect(withHeading).toContain(">Why this?<");
    expect(withHeading).not.toMatch(/\stitle=/);
  });

  it("switches glyph and announced name with icon=question", async () => {
    const html = await render({ id: "tip", icon: "question" });
    expect(html).toContain('data-icon="question"');
    expect(html).toContain('aria-label="Learn more"');
    expect(html).toContain("M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3");
  });

  it("passes extra attributes to the root (data-id is the e2e anchor)", async () => {
    const html = await render({ id: "tip", "data-id": "inline" });
    expect(html).toMatch(/<div[^>]*data-id="inline"/);
  });
});
