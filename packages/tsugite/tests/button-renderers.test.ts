// The renderers are adapters; the recipe is a table read by lib/recipe.ts (ADR-0018).
// tests/fixtures/button.json lists inputs and the exact resolution each must produce.
// This file holds the recipe to it, then holds the Astro and React front doors to the
// recipe — byte-identical markup for the same props, nothing for an empty button, the
// same message for a refused one.
import { readFileSync } from "node:fs";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, it, expect } from "vitest";
import { resolve } from "../lib/recipe";
import { button } from "../recipes/button.recipe";
import { buttonDerive } from "../lib/button";
import LinkAstro from "../components/primitives/buttons/Button/LinkButton.astro";
import ActionAstro from "../components/primitives/buttons/Button/ActionButton.astro";
import { LinkButton as LinkReact, ActionButton as ActionReact } from "../components/primitives/buttons/Button/Button.tsx";

interface Fixture {
  component: string;
  cases: Array<{
    name: string;
    input: Record<string, unknown> & { text: boolean };
    expect: {
      mode: "render" | "suppress" | "error";
      tag?: string;
      className?: string;
      attrs?: Record<string, string | true>;
      parts?: Record<string, string>;
      errorMessage?: string;
    };
  }>;
}

const fixture: Fixture = JSON.parse(readFileSync(new URL("./fixtures/button.json", import.meta.url), "utf8"));

const container = await AstroContainer.create();

// React writes a boolean attribute as disabled=""; Astro writes it bare. Same DOM. Text
// content escapes quotes differently per host; the message is compared decoded.
const normalise = (html: string) =>
  html
    .replace(/<!--.*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/ disabled=""/g, " disabled")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();

/** the recipe takes the element; a front door supplies it, so the renderers do not */
const propsOf = (input: Record<string, unknown>) => {
  const { text, ...props } = input;
  return props;
};
const withoutElement = (props: Record<string, unknown>) => {
  const { element, ...rest } = props;
  return rest;
};

// The Astro front doors keep the first codebase's kebab names; React's are camelCase.
const toAstro = (p: Record<string, unknown>) => {
  const r: Record<string, unknown> = { ...p };
  if ("iconPosition" in r) { r["icon-position"] = r.iconPosition; delete r.iconPosition; }
  if ("type" in r) { r["button-type"] = r.type; delete r.type; }
  return r;
};
const toReact = (p: Record<string, unknown>) => {
  const r: Record<string, unknown> = { ...p };
  if ("aria-label" in r) { r.ariaLabel = r["aria-label"]; delete r["aria-label"]; }
  if ("type" in r) { r.buttonType = r.type; delete r.type; }
  if ("class" in r) { r.className = r.class; delete r.class; }
  return r;
};

const viaAstro = async (element: string, props: Record<string, unknown>, text: boolean) =>
  normalise(await container.renderToString(element === "button" ? ActionAstro : LinkAstro, { props: toAstro(props), slots: text ? { default: "x" } : undefined }));
const viaReact = (element: string, props: Record<string, unknown>, text: boolean) =>
  normalise(renderToStaticMarkup(createElement(element === "button" ? ActionReact : LinkReact, toReact(props) as never, text ? "x" : undefined)));

const openingTag = (tag: string, className: string, attrs: Record<string, string | true>) =>
  `<${tag} class="${className}"` + Object.entries(attrs).map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${v}"`)).join("") + ">";

describe(`${fixture.component}: the recipe resolves every fixture case`, () => {
  for (const { name, input, expect: want } of fixture.cases) {
    it(name, () => {
      const got = resolve(button, propsOf(input) as Record<string, unknown> & { element?: string }, { slots: { text: input.text }, derive: buttonDerive });
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

describe(`${fixture.component}: the Astro and React front doors render every fixture case identically`, () => {
  for (const { name, input, expect: want } of fixture.cases) {
    const element = input.element as string | undefined;
    if (!element) continue; // the front door supplies the element; no renderer can omit it
    it(name, async () => {
      const props = withoutElement(propsOf(input));
      const astro = await viaAstro(element, props, input.text);
      const react = viaReact(element, props, input.text);
      if (want.mode === "render") {
        expect(astro.startsWith(openingTag(want.tag!, want.className!, want.attrs!)), `astro opening tag\n${astro}`).toBe(true);
        if (input.text) expect(astro).toContain('<span class="Button-text">x');
        if (want.parts?.screenReaderPrefix) expect(astro).toContain(`<span class="ScreenReaderText">${want.parts.screenReaderPrefix}</span>${input.text ? '<span class="Button-text">' : ""}`);
        if (want.parts?.screenReaderSuffix) expect(astro).toContain(`${input.text ? "</span>" : ""}<span class="ScreenReaderText">${want.parts.screenReaderSuffix}</span>`);
        if (input.icon) expect(astro).toContain(`<svg class="Button-icon" aria-hidden="true" focusable="false"><use href="#${input.icon}"></use></svg>`);
        expect(react, "react").toBe(astro);
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
