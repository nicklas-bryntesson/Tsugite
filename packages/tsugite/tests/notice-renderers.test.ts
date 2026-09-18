// The recipe is a table read by lib/recipe.ts (ADR-0018). tests/fixtures/notice.json lists
// inputs and the exact resolution each must produce. This file holds the recipe to it, then
// holds the Astro and React renderers to the recipe and to each other — byte-identical
// markup for the same props and the same slots, the same message for a refusal.
import { readFileSync } from "node:fs";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, it, expect } from "vitest";
import { resolve } from "../lib/recipe";
import { notice } from "../recipes/notice.recipe";
import { noticeDerive } from "../lib/notice";
import NoticeAstro from "../components/Notice/Notice.astro";
import NoticeReact from "../components/Notice/Notice.tsx";

interface Fixture {
  component: string;
  cases: Array<{
    name: string;
    input: Record<string, unknown> & { body: boolean; actions: boolean; dismiss: boolean };
    expect: { mode: "render" | "error"; tag?: string; className?: string; attrs?: Record<string, string>; parts?: Record<string, string>; errorMessage?: string };
  }>;
}

const fixture: Fixture = JSON.parse(readFileSync(new URL("./fixtures/notice.json", import.meta.url), "utf8"));
const container = await AstroContainer.create();
const BODY = "<p>x</p>";
const ACTIONS = '<a class="Button" href="#">Go</a>';
const DISMISS = '<button class="Button" type="button">×</button>';
const normalise = (html: string) => html.replace(/<!--.*?-->/g, "").replace(/>\s+</g, "><").replace(/&quot;/g, '"').trim();

const split = (input: Record<string, unknown>) => {
  const { body, actions, dismiss, ...props } = input;
  return { props, body: body as boolean, actions: actions as boolean, dismiss: dismiss as boolean };
};

const viaAstro = async (input: Record<string, unknown>) => {
  const { props, body, actions, dismiss } = split(input);
  const slots: Record<string, string> = {};
  if (body) slots.default = BODY;
  if (actions) slots.actions = ACTIONS;
  if (dismiss) slots.dismiss = DISMISS;
  return normalise(await container.renderToString(NoticeAstro, { props, slots: Object.keys(slots).length ? slots : undefined }));
};
const raw = (html: string) => createElement("span", { dangerouslySetInnerHTML: { __html: html } });
const viaReact = (input: Record<string, unknown>) => {
  const { props, body, actions, dismiss } = split(input);
  const { class: className, ...rest } = props;
  const p: Record<string, unknown> = className === undefined ? rest : { ...rest, className };
  if (actions) p.actions = raw(ACTIONS);
  if (dismiss) p.dismiss = raw(DISMISS);
  return normalise(renderToStaticMarkup(createElement(NoticeReact, p as never, body ? raw(BODY) : undefined)));
};
// React needs an element to carry raw HTML; the wrapper spans are the one difference per slot.
const unwrap = (html: string) => html.replace(/<span>(.*?)<\/span>/g, "$1");
const openingTag = (tag: string, className: string, attrs: Record<string, string>) =>
  `<${tag} class="${className}"` + Object.entries(attrs).map(([k, v]) => ` ${k}="${v}"`).join("") + ">";

describe(`${fixture.component}: the recipe resolves every fixture case`, () => {
  for (const { name, input, expect: want } of fixture.cases) {
    it(name, () => {
      const { props, body, actions, dismiss } = split(input);
      const got = resolve(notice, props, { slots: { body, actions, dismiss }, derive: noticeDerive });
      expect(got.mode).toBe(want.mode);
      if (want.mode === "render") {
        expect(got.tag).toBe(want.tag);
        expect(got.className).toBe(want.className);
        expect(got.attrs).toEqual(want.attrs);
        expect(Object.keys(got.attrs), "attribute order").toEqual(Object.keys(want.attrs!));
        for (const [part, value] of Object.entries(want.parts ?? {})) expect(got.parts[part], part).toBe(value);
      } else expect(got.errorMessage).toBe(want.errorMessage);
    });
  }
});

describe(`${fixture.component}: Astro and React render every fixture case identically`, () => {
  for (const { name, input, expect: want } of fixture.cases) {
    it(name, async () => {
      const astro = await viaAstro(input);
      const react = viaReact(input);
      if (want.mode === "render") {
        expect(astro.startsWith(openingTag(want.tag!, want.className!, want.attrs!)), `astro root\n${astro}`).toBe(true);
        if (input.actions) expect(astro).toContain(`<div class="actions">${ACTIONS}</div>`);
        else expect(astro).not.toContain('class="actions"');
        if (input.dismiss) expect(astro).toContain(`<div class="dismiss">${DISMISS}</div>`);
        else expect(astro).not.toContain('class="dismiss"');
        if (want.parts?.title) expect(astro).toContain(`<strong class="title">${want.parts.title}</strong>`);
        expect(unwrap(react), "react").toBe(astro);
      } else {
        expect(astro, "astro").toContain(want.errorMessage!);
        expect(react, "react").toContain(want.errorMessage!);
      }
    });
  }
});
