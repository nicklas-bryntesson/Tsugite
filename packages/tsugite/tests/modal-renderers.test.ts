// The recipe is a table read by lib/recipe.ts (ADR-0018). tests/fixtures/modal.json lists
// inputs and the exact resolution each must produce. This file holds the recipe to it, then
// the Astro renderer to the recipe, and to the one rule the table cannot carry: something
// must name the modal. Modal is Astro only for now; the React and Vue renderers
// join this file when they are built (ADR-0029, consequences).
import { readFileSync } from "node:fs";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, it, expect } from "vitest";
import { resolve } from "../lib/recipe";
import { modal } from "../recipes/modal.recipe";
import { modalDerive, unnamed } from "../lib/modal";
import Astro from "../components/regions/Modal/Modal.astro";

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
const normalise = (html: string) =>
  html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<!--.*?-->/g, "").replace(/>\s+</g, "><").replace(/&quot;/g, '"').trim();
const propsOf = (input: Record<string, unknown>) => {
  const { children, ...props } = input;
  return props;
};
const viaAstro = async (props: Record<string, unknown>, children: boolean, child = CHILD) =>
  normalise(await container.renderToString(Astro, { props, slots: children ? { default: child } : undefined }));

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

describe(`${fixture.component}: Astro renders every fixture case`, () => {
  for (const { name, input, expect: want } of fixture.cases) {
    it(name, async () => {
      const html = await viaAstro(propsOf(input), input.children);
      if (want.mode === "render") {
        // Astro writes an empty value as a bare attribute (data-region).
        const attrs = Object.entries(want.attrs!).map(([k, v]) => (v === "" ? ` ${k}` : ` ${k}="${v}"`)).join("");
        expect(html).toBe(`<dialog class="${want.className}"${attrs}>${CHILD}</dialog>`);
      } else if (want.mode === "suppress") {
        expect(html).toBe("");
      } else {
        expect(html).toContain(want.errorMessage!);
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
