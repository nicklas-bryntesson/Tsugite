// The renderers are adapters; the recipe is the contract (ADR-0017), and the recipe is a
// table read by lib/recipe.ts (ADR-0018). tests/fixtures/modal.json lists inputs and the
// exact resolution each must produce. This file holds the recipe to it, then Astro, React and
// Vue to the recipe — the same dialog for the same props, nothing for an empty one, the same
// message for an invalid one — and Astro to the one rule the table cannot carry: something
// must name the modal. That check reads rendered child markup, which only Astro has before
// it renders.
import { readFileSync } from "node:fs";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, it, expect } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString as renderVue } from "vue/server-renderer";
import { resolve } from "../lib/recipe";
import { modal } from "../recipes/modal.recipe";
import { modalDerive, unnamed } from "../lib/modal";
import Astro from "../components/regions/Modal/Modal.astro";
import React from "../components/regions/Modal/Modal.tsx";
import Vue from "../components/regions/Modal/Modal.vue";

interface Fixture {
  component: string;
  cases: Array<{
    name: string;
    input: Record<string, unknown> & { children: boolean };
    expect: { mode: "render" | "suppress" | "error"; tag?: string; className?: string; attrs?: Record<string, string>; errorMessage?: string };
  }>;
}

const fixture: Fixture = JSON.parse(readFileSync(new URL("./fixtures/modal.json", import.meta.url), "utf8"));
const container = await AstroContainer.create();
const CHILD = '<h2 data-channel="title">Title</h2><p>Body</p>';
// Astro adds the kernel's script; Vue SSR leaves comments; an empty attribute value and a
// bare attribute are the same DOM (data-region), written differently per host.
const normalise = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<!--.*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/&quot;/g, '"')
    .replace(/=""/g, "")
    .trim();
const propsOf = (input: Record<string, unknown>) => {
  const { children, ...props } = input;
  return props;
};
const viaAstro = async (props: Record<string, unknown>, children: boolean, child = CHILD) =>
  normalise(await container.renderToString(Astro, { props, slots: children ? { default: child } : undefined }));
const childNodes = () => [createElement("h2", { key: "t", "data-channel": "title" }, "Title"), createElement("p", { key: "b" }, "Body")];
const viaReact = (props: Record<string, unknown>, children: boolean) => {
  const { class: className, ...rest } = props;
  const reactProps = className === undefined ? rest : { ...rest, className };
  return normalise(renderToStaticMarkup(createElement(React, reactProps, children ? childNodes() : undefined)));
};
const viaVue = async (props: Record<string, unknown>, children: boolean) =>
  normalise(
    await renderVue(
      createSSRApp({
        render: () => h(Vue, props, children ? { default: () => [h("h2", { "data-channel": "title" }, "Title"), h("p", null, "Body")] } : undefined),
      }),
    ),
  );

describe(`${fixture.component}: the recipe resolves every fixture case`, () => {
  for (const { name, input, expect: want } of fixture.cases) {
    it(name, () => {
      const got = resolve(modal, propsOf(input), { hasContent: input.children, derive: modalDerive });
      expect(got.mode).toBe(want.mode);
      if (want.mode === "render") {
        expect(got.tag).toBe(want.tag);
        expect(got.className).toBe(want.className);
        expect(got.attrs).toEqual(want.attrs);
      }
      if (want.mode === "error") expect(got.errorMessage).toBe(want.errorMessage);
    });
  }
});

describe(`${fixture.component}: Astro, React and Vue render every fixture case identically`, () => {
  for (const { name, input, expect: want } of fixture.cases) {
    it(name, async () => {
      const props = propsOf(input);
      const astro = await viaAstro(props, input.children);
      const react = viaReact(props, input.children);
      const vue = await viaVue(props, input.children);
      if (want.mode === "render") {
        const attrs = Object.entries(want.attrs!).map(([k, v]) => (v === "" ? ` ${k}` : ` ${k}="${v}"`)).join("");
        expect(astro).toBe(`<dialog class="${want.className}"${attrs}>${CHILD}</dialog>`);
        expect(react, "react").toBe(astro);
        expect(vue, "vue").toBe(astro);
      } else if (want.mode === "suppress") {
        expect(astro).toBe("");
        expect(react, "react").toBe("");
        expect(vue, "vue").toBe("");
      } else {
        expect(astro).toContain(want.errorMessage!);
        expect(react, "react").toContain(want.errorMessage!);
        expect(vue, "vue").toContain(want.errorMessage!);
      }
    });
  }
});

describe(`${fixture.component}: what the table cannot hold`, () => {
  const NAMELESS = "nothing names the modal";

  it("is named by a title channel in its content", async () => {
    expect(unnamed(CHILD, undefined)).toBeNull();
    expect(await viaAstro({ id: "m" }, true)).toContain('<dialog class="Modal"');
  });

  it("is named by its label when the content shows no title", async () => {
    expect(unnamed("<video></video>", "Video")).toBeNull();
    const html = await viaAstro({ id: "m", label: "Video" }, true, "<p>Body</p>");
    expect(html).toContain('aria-label="Video"');
  });

  it("refuses to render with nothing to name it (dev error)", async () => {
    for (const label of [undefined, "", "  "]) {
      expect(unnamed("<p>Body</p>", label), String(label)).toContain(NAMELESS);
      const html = await viaAstro({ id: "m", label }, true, "<p>Body</p>");
      expect(html, String(label)).toContain(NAMELESS);
      expect(html, String(label)).not.toContain("<dialog");
    }
  });
});
