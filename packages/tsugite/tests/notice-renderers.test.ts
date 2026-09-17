// The recipe is the contract: Astro and React must emit the same Notice markup.
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, it, expect } from "vitest";
import NoticeAstro from "../components/Notice/Notice.astro";
import NoticeReact from "../components/Notice/Notice.tsx";
import { resolveNotice } from "../lib/notice";

const container = await AstroContainer.create();
const normalise = (html: string) => html.replace(/<!--.*?-->/g, "").replace(/>\s+</g, "><").trim();
const viaAstro = async (props: Record<string, unknown>, slot = "<p>x</p>") =>
  normalise(await container.renderToString(NoticeAstro, { props, slots: { default: slot } }));
const viaReact = (props: Record<string, unknown>, child = createElement("p", null, "x")) =>
  normalise(renderToStaticMarkup(createElement(NoticeReact, props, child)));

const cases: Array<[string, Record<string, unknown>]> = [
  ["defaults", {}],
  ["error with title", { variant: "error", title: "Saved" }],
  ["no icon", { variant: "info", icon: false }],
  ["border and emphasis", { variant: "warning", border: true, emphasis: true }],
  ["footprint", { growInline: false, capInline: false }],
];

describe("Notice renders identically through Astro and React", () => {
  for (const [name, props] of cases) {
    it(name, async () => {
      expect(viaReact(props)).toBe(await viaAstro(props));
    });
  }

  it("every gate is always written, off values included", () => {
    const n = resolveNotice({});
    expect(n.attrs).toEqual({
      "data-variant": "neutral",
      "data-icon": "true",
      "data-border": "false",
      "data-emphasis": "false",
      "data-grow-inline": "true",
      "data-cap-inline": "true",
    });
  });

  it("an unknown variant is a dev error in both", async () => {
    // React escapes the quotes in text nodes; assert on the words, not the bytes
    expect(await viaAstro({ variant: "loud" })).toMatch(/invalid variant .loud/);
    expect(viaReact({ variant: "loud" })).toMatch(/invalid variant &quot;loud/);
  });
});
