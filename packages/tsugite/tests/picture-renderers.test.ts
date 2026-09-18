// The plan is the contract (ADR-0018 §7). tests/fixtures/picture.json gives, per preset,
// the exact plan resolveMedia must build from a URL-template resolver — no pipeline, no
// framework. Then the two pens are held to the plan and to each other: the string pen the
// Astro renderer uses, and Picture.tsx, which takes the finished plan as a prop.
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, it, expect } from "vitest";
import { resolveMedia, mediaPlanHtml, type MediaPlan, type UrlResolver } from "../lib/media";
import { CROPS, PRESETS } from "../theme-default/media.presets";
import PictureReact from "../components/Picture/Picture.tsx";

interface Fixture {
  component: string;
  resolver: string;
  cases: Array<{
    name: string;
    input: { preset?: string; alt?: string; loading?: string; className?: string; image?: null };
    expect?: { mode: "render" | "error"; errorMessage?: string } & Partial<MediaPlan>;
    expectClassName?: string;
  }>;
}

// React writes srcSet and closes void elements with "/>"; the string pen writes HTML. Same DOM.
const normalise = (html: string) => html.replace(/srcSet=/g, "srcset=").replace(/\/>/g, ">");

const fixture: Fixture = JSON.parse(readFileSync(new URL("./fixtures/picture.json", import.meta.url), "utf8"));
const tables = { presets: PRESETS, crops: CROPS };

/** The fixture's resolver: a URL template. The image is a token; the template only needs the size. */
const templateResolver: UrlResolver<string> = async (_image, w, h, f) =>
  fixture.resolver.replace("{w}", String(w)).replace("{h}", String(h)).replace("{f}", f ?? "jpg");

const plan = (input: Fixture["cases"][number]["input"]) =>
  resolveMedia({ image: "image" in input ? input.image : "an-image", ...input }, tables, templateResolver);

describe(`${fixture.component}: resolveMedia builds every fixture plan`, () => {
  for (const { name, input, expect: want, expectClassName } of fixture.cases) {
    it(name, async () => {
      const got = await plan(input);
      if (expectClassName) {
        expect(got.mode).toBe("render");
        expect((got as MediaPlan).className).toBe(expectClassName);
        return;
      }
      expect(got.mode).toBe(want!.mode);
      if (want!.mode === "render") {
        expect(got).toEqual(want);
      } else {
        expect((got as { errorMessage: string }).errorMessage).toBe(want!.errorMessage);
      }
    });
  }
});

describe(`${fixture.component}: the string pen and the React pen write every plan identically`, () => {
  for (const { name, input, expect: want } of fixture.cases) {
    if (want?.mode !== "render") continue;
    it(name, async () => {
      const got = (await plan(input)) as MediaPlan;
      const html = mediaPlanHtml(got);
      const react = normalise(renderToStaticMarkup(createElement(PictureReact, { plan: got })));
      expect(html.startsWith(`<figure class="${want.className}">`)).toBe(true);
      expect(react).toBe(normalise(html));
    });
  }
});
