// The recipe is a table read by lib/recipe.ts (ADR-0018). tests/fixtures/teaser.json lists
// inputs and the exact resolution each must produce — attributes, and for the frame axis
// the Card INPUT it maps to. This file holds the recipe to it, then the Astro renderer to
// the recipe's root: the article's class and attributes, and whether a Card wraps it.
import { readFileSync } from "node:fs";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, it, expect } from "vitest";
import { resolve } from "../lib/recipe";
import { teaser } from "../recipes/teaser.recipe";
import { teaserDerive } from "../lib/teaser";
import TeaserAstro from "../components/Teaser/Teaser.astro";

interface Fixture {
  component: string;
  cases: Array<{
    name: string;
    input: Record<string, unknown> & { media: boolean; body: boolean };
    expect: {
      mode: "render" | "error";
      tag?: string;
      className?: string;
      attrs?: Record<string, string>;
      maps?: Record<string, unknown>;
      parts?: Record<string, string>;
      errorMessage?: string;
    };
  }>;
}

const fixture: Fixture = JSON.parse(readFileSync(new URL("./fixtures/teaser.json", import.meta.url), "utf8"));
const container = await AstroContainer.create();
const image = { src: "/img/a.jpg", width: 1600, height: 900, format: "jpg" } as const;

const propsOf = (input: Record<string, unknown>) => {
  const { media, body, buttonLabel, ...props } = input;
  return { props, media: media as boolean, body: body as boolean, buttonLabel: buttonLabel as string | undefined };
};

describe(`${fixture.component}: the recipe resolves every fixture case`, () => {
  for (const { name, input, expect: want } of fixture.cases) {
    it(name, () => {
      const { props, media, body, buttonLabel } = propsOf(input);
      const got = resolve(teaser, { ...props, buttonLabel }, { slots: { media, body, action: false }, derive: teaserDerive });
      expect(got.mode).toBe(want.mode);
      if (want.mode === "render") {
        expect(got.tag).toBe(want.tag);
        expect(got.className).toBe(want.className);
        expect(got.attrs).toEqual(want.attrs);
        expect(Object.keys(got.attrs), "attribute order").toEqual(Object.keys(want.attrs!));
        if (want.maps) expect(got.maps).toEqual(want.maps);
        for (const [part, value] of Object.entries(want.parts ?? {})) expect(got.parts[part], part).toBe(value);
      } else expect(got.errorMessage).toBe(want.errorMessage);
    });
  }
});

describe(`${fixture.component}: the Astro renderer writes the recipe's root`, () => {
  for (const { name, input, expect: want } of fixture.cases) {
    it(name, async () => {
      const { props, media, body, buttonLabel } = propsOf(input);
      const html = await container.renderToString(TeaserAstro, {
        props: { ...props, "button-label": buttonLabel, image: media ? image : null },
        slots: body ? { default: "<p>x</p>" } : undefined,
      });
      if (want.mode === "render") {
        const root = `<${want.tag} class="${want.className}"` + Object.entries(want.attrs!).map(([k, v]) => ` ${k}="${v}"`).join("") + ">";
        expect(html, "root").toContain(root);
        const card = want.maps?.frame as Record<string, unknown> | null | undefined;
        if (card === null) expect(html).not.toContain('class="Card"');
        if (card) for (const [k, v] of Object.entries(card)) if (k !== "element") expect(html).toMatch(new RegExp(`<${card.element} class="Card"[^>]*data-${k}="${v}"`));
      } else {
        expect(html).toContain(want.errorMessage!);
        expect(html).not.toContain('class="Teaser"');
      }
    });
  }
});
