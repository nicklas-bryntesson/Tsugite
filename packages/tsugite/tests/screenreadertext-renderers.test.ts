// The recipe is a table read by lib/recipe.ts (ADR-0018). tests/fixtures/screenreadertext.json
// lists inputs and the exact resolution each must produce. This file holds the recipe to it,
// then Astro and React to the recipe — the same span for the same props, nothing for an empty
// one, the same message for an invalid one — and holds the Astro renderer to the one rule the
// table cannot carry: interactive content inside the hidden span is refused.
import { readFileSync } from "node:fs";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, it, expect } from "vitest";
import { resolve } from "../lib/recipe";
import { screenReaderText } from "../recipes/screenreadertext.recipe";
import { hiddenInteractive } from "../lib/screenreadertext";
import Astro from "../components/primitives/ScreenReaderText/ScreenReaderText.astro";
import React from "../components/primitives/ScreenReaderText/ScreenReaderText.tsx";

interface Fixture {
  component: string;
  cases: Array<{
    name: string;
    input: Record<string, unknown> & { children: boolean };
    expect: { mode: "render" | "suppress" | "error"; tag?: string; className?: string; attrs?: Record<string, string>; errorMessage?: string };
  }>;
}

const fixture: Fixture = JSON.parse(readFileSync(new URL("./fixtures/screenreadertext.json", import.meta.url), "utf8"));
const container = await AstroContainer.create();
const CHILD = "about <em>Widgets</em>";
const normalise = (html: string) => html.replace(/<!--.*?-->/g, "").replace(/>\s+</g, "><").replace(/&quot;/g, '"').trim();
const propsOf = (input: Record<string, unknown>) => {
  const { children, ...props } = input;
  return props;
};

const viaAstro = async (props: Record<string, unknown>, children: boolean, child = CHILD) =>
  normalise(await container.renderToString(Astro, { props, slots: children ? { default: child } : undefined }));

const viaReact = (props: Record<string, unknown>, children: boolean) => {
  const { class: className, ...rest } = props;
  const reactProps = className === undefined ? rest : { ...rest, className };
  return normalise(renderToStaticMarkup(createElement(React, reactProps, children ? ["about ", createElement("em", { key: "e" }, "Widgets")] : undefined)));
};

describe(`${fixture.component}: the recipe resolves every fixture case`, () => {
  for (const { name, input, expect: want } of fixture.cases) {
    it(name, () => {
      const got = resolve(screenReaderText, propsOf(input), { slots: { children: input.children } });
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

describe(`${fixture.component}: Astro and React render every fixture case identically`, () => {
  for (const { name, input, expect: want } of fixture.cases) {
    it(name, async () => {
      const props = propsOf(input);
      const astro = await viaAstro(props, input.children);
      const react = viaReact(props, input.children);
      if (want.mode === "render") {
        const words = input.children ? CHILD : String(input.text);
        expect(astro).toBe(`<span class="${want.className}">${words}</span>`);
        expect(react, "react").toBe(astro);
      } else if (want.mode === "suppress") {
        expect(astro).toBe("");
        expect(react, "react").toBe("");
      } else {
        expect(astro).toContain(want.errorMessage!);
        expect(react, "react").toContain(want.errorMessage!);
      }
    });
  }
});

describe(`${fixture.component}: what the table cannot hold`, () => {
  it("passes host attributes through — a live region is a hidden span with aria-live", async () => {
    const html = await viaAstro({ text: "Saved", "aria-live": "polite" }, false);
    expect(html).toBe('<span class="ScreenReaderText" aria-live="polite">Saved</span>');
  });

  it("refuses interactive content inside the hidden span (dev error)", async () => {
    for (const child of ['<a href="/x">x</a>', "<button>x</button>", '<input type="text">', '<span tabindex="0">x</span>']) {
      expect(hiddenInteractive(child), child).not.toBeNull();
      const html = await viaAstro({}, true, child);
      expect(html, child).toContain("focus trap");
      expect(html, child).not.toContain('class="ScreenReaderText"');
    }
    expect(hiddenInteractive("about <em>Widgets</em>")).toBeNull();
  });
});
