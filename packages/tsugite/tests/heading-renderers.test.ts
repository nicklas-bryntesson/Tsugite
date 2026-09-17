// The typography recipe is the contract: Heading through Astro and React, same bytes.
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, it, expect } from "vitest";
import HeadingAstro from "../components/Heading/Heading.astro";
import HeadingReact from "../components/Heading/Heading.tsx";

const container = await AstroContainer.create();
const normalise = (html: string) => html.replace(/<!--.*?-->/g, "").replace(/>\s+</g, "><").trim();
const viaAstro = async (props: Record<string, unknown>, slot?: string) =>
  normalise(await container.renderToString(HeadingAstro, { props, slots: slot ? { default: slot } : undefined }));
const viaReact = (props: Record<string, unknown>, child?: unknown) =>
  normalise(renderToStaticMarkup(createElement(HeadingReact, props, child)));

const cases: Array<[string, Record<string, unknown>]> = [
  ["default h2", { text: "Hello" }],
  ["h4 infers size 4", { text: "T", element: "h4" }],
  ["display 1", { text: "T", element: "h1", variant: "display", size: "1" }],
  ["body md on h3", { text: "T", element: "h3", variant: "body" }],
  ["link", { text: "Latest posts", element: "h3", href: "/blog" }],
  ["highlight", { text: "Build better with Tsugite", highlight: "Tsugite" }],
  ["align and wrap", { text: "T", align: "center", wrap: "pretty" }],
  ["escaped text", { text: "Fish & <chips>" }],
  ["extra class", { text: "T", class: "extra" }],
];

describe("Heading renders identically through Astro and React", () => {
  for (const [name, props] of cases) {
    it(name, async () => {
      const reactProps = { ...props, className: props.class };
      delete reactProps.class;
      expect(viaReact(reactProps)).toBe(await viaAstro(props));
    });
  }

  it("children pass through the engine container in both", async () => {
    const astro = await viaAstro({}, "Rich <em>content</em>");
    const react = viaReact({}, createElement("span", { dangerouslySetInnerHTML: { __html: "Rich <em>content</em>" } }));
    // the child wrapper differs by one span (React needs an element to carry raw HTML); the root and container agree
    expect(react.replace(/<span>Rich <em>content<\/em><\/span>/, "Rich <em>content</em>")).toBe(astro);
  });

  it("both suppress without words", async () => {
    expect(await viaAstro({})).toBe("");
    expect(viaReact({})).toBe("");
  });
});
