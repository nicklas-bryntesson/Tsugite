// The recipe is the contract: the Astro and React button renderers must emit the
// same markup for the same props, link and action alike.
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, it, expect } from "vitest";
import LinkAstro from "../components/Button/LinkButton.astro";
import ActionAstro from "../components/Button/ActionButton.astro";
import { LinkButton as LinkReact, ActionButton as ActionReact } from "../components/Button/Button.tsx";

const container = await AstroContainer.create();
// React writes a boolean attribute as disabled=""; Astro writes it bare. Same DOM.
const normalise = (html: string) => html.replace(/<!--.*?-->/g, "").replace(/>\s+</g, "><").replace(/ disabled=""/g, " disabled").trim();
const astro = async (C: unknown, props: Record<string, unknown>, text?: string) =>
  normalise(await container.renderToString(C as never, { props, slots: text ? { default: text } : undefined }));
const react = (C: unknown, props: Record<string, unknown>, text?: string) =>
  normalise(renderToStaticMarkup(createElement(C as never, props, text)));

// Astro props use the first codebase's kebab names; React props are camelCase.
const toReact = (p: Record<string, unknown>) => {
  const r: Record<string, unknown> = { ...p };
  if ("icon-position" in r) { r.iconPosition = r["icon-position"]; delete r["icon-position"]; }
  if ("aria-label" in r) { r.ariaLabel = r["aria-label"]; delete r["aria-label"]; }
  if ("button-type" in r) { r.buttonType = r["button-type"]; delete r["button-type"]; }
  if ("class" in r) { r.className = r.class; delete r.class; }
  return r;
};

const linkCases: Array<[string, Record<string, unknown>, string?]> = [
  ["defaults", { href: "/start" }, "Get started"],
  ["secondary pill sm", { href: "#", emphasis: "secondary", pill: true, size: "sm" }, "x"],
  ["new tab", { href: "https://x.se", target: "_blank" }, "x"],
  ["icon right", { href: "#", icon: "icon-search" }, "Search"],
  ["icon-only", { href: "/share", icon: "icon-search", "aria-label": "Share" }],
  ["grown", { href: "#", growInline: true }, "Wide"],
  ["extra class", { href: "#", class: "extra" }, "x"],
];
const actionCases: Array<[string, Record<string, unknown>, string?]> = [
  ["defaults", {}, "Save"],
  ["submit destructive", { "button-type": "submit", intent: "destructive" }, "Delete"],
  ["invalid intent dropped", { intent: "evil" }, "x"],
  ["icon left", { icon: "icon-key", "icon-position": "left" }, "Sign in"],
];

describe("Button renders identically through Astro and React", () => {
  for (const [name, props, text] of linkCases) {
    it(`link: ${name}`, async () => {
      expect(react(LinkReact, toReact(props), text)).toBe(await astro(LinkAstro, props, text));
    });
  }
  for (const [name, props, text] of actionCases) {
    it(`action: ${name}`, async () => {
      expect(react(ActionReact, toReact(props), text)).toBe(await astro(ActionAstro, props, text));
    });
  }

  it("action: disabled", async () => {
    expect(react(ActionReact, { disabled: true }, "x")).toBe(await astro(ActionAstro, { disabled: true }, "x"));
  });

  it("both suppress without label, icon and aria-label", async () => {
    expect(await astro(LinkAstro, { href: "/x" })).toBe("");
    expect(react(LinkReact, { href: "/x" })).toBe("");
  });
});
