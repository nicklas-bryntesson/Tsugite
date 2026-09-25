// The recipe is a table read by lib/recipe.ts (ADR-0018). tests/fixtures/heading.json lists
// inputs and the exact resolution each must produce. This file holds the recipe to it, then
// holds the Astro and React renderers to the recipe and to each other — byte-identical
// markup for the same props, nothing without words, the same message for a refusal.
import { readFileSync } from "node:fs";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, it, expect } from "vitest";
import { resolve } from "../lib/recipe";
import { heading } from "../recipes/heading.recipe";
import { headingDefaults, headingDerive } from "../lib/heading";
import HeadingAstro from "../components/primitives/typography/Heading/Heading.astro";
import HeadingReact from "../components/primitives/typography/Heading/Heading.tsx";

interface Fixture {
  component: string;
  cases: Array<{
    name: string;
    input: Record<string, unknown> & { children: boolean };
    expect: { mode: "render" | "suppress" | "error"; tag?: string; className?: string; attrs?: Record<string, string>; parts?: Record<string, string>; errorMessage?: string };
  }>;
}

const fixture: Fixture = JSON.parse(readFileSync(new URL("./fixtures/heading.json", import.meta.url), "utf8"));
const container = await AstroContainer.create();
const CHILD = "Rich <em>content</em>";
const normalise = (html: string) => html.replace(/<!--.*?-->/g, "").replace(/>\s+</g, "><").replace(/&quot;/g, '"').trim();

const propsOf = (input: Record<string, unknown>) => {
  const { children, ...props } = input;
  return props;
};
const ctx = (children: boolean) => ({ slots: { children }, derive: headingDerive, defaults: headingDefaults });

const viaAstro = async (props: Record<string, unknown>, children: boolean) =>
  normalise(await container.renderToString(HeadingAstro, { props, slots: children ? { default: CHILD } : undefined }));
const viaReact = (props: Record<string, unknown>, children: boolean) => {
  const { class: className, ...rest } = props;
  const p = className === undefined ? rest : { ...rest, className };
  const child = children ? createElement("span", { dangerouslySetInnerHTML: { __html: CHILD } }) : undefined;
  return normalise(renderToStaticMarkup(createElement(HeadingReact, p as never, child)));
};
const openingTag = (tag: string, className: string, attrs: Record<string, string>) =>
  `<${tag} class="${className}"` + Object.entries(attrs).map(([k, v]) => ` ${k}="${v}"`).join("") + ">";

describe(`${fixture.component}: the recipe resolves every fixture case`, () => {
  for (const { name, input, expect: want } of fixture.cases) {
    it(name, () => {
      const got = resolve(heading, propsOf(input), ctx(input.children));
      expect(got.mode).toBe(want.mode);
      if (want.mode === "render") {
        expect(got.tag).toBe(want.tag);
        expect(got.className).toBe(want.className);
        expect(got.attrs).toEqual(want.attrs);
        expect(Object.keys(got.attrs), "attribute order").toEqual(Object.keys(want.attrs!));
        for (const [part, value] of Object.entries(want.parts ?? {})) expect(got.parts[part], part).toBe(value);
      }
      if (want.mode === "error") expect(got.errorMessage).toBe(want.errorMessage);
    });
  }
});

describe(`${fixture.component}: Astro and React render every fixture case identically`, () => {
  for (const { name, input, expect: want } of fixture.cases) {
    it(name, async () => {
      const props = propsOf(input);
      const astro = await viaAstro(props, input.children);
      const react = viaReact(props, input.children);
      if (want.mode === "render") {
        expect(astro.startsWith(openingTag(want.tag!, want.className!, want.attrs!)), `astro root\n${astro}`).toBe(true);
        if (input.href) expect(astro).toContain(`<a href="${input.href}" class="heading-link">`);
        else expect(astro).toContain('<span class="heading-text">');
        if (input.highlight) expect(astro).toContain(`<mark>${input.highlight}</mark>`);
        // the child wrapper differs by one span (React needs an element to carry raw HTML); the root and container agree
        expect(react.replace(`<span>${CHILD}</span>`, CHILD), "react").toBe(astro);
      } else if (want.mode === "suppress") {
        expect(astro, "astro").toBe("");
        expect(react, "react").toBe("");
      } else {
        expect(astro, "astro").toContain(want.errorMessage!);
        expect(react, "react").toContain(want.errorMessage!);
      }
    });
  }
});
