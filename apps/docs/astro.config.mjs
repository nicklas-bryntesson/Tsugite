// @ts-check
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vue from "@astrojs/vue";
import browserslist from "browserslist";
import { browserslistToTargets, Features } from "lightningcss";

// The support contract lives in /.browserslistrc (repo root). Lightning CSS
// lowers what the targets lack — CSS nesting first of all (ADR-0010) — and
// prefixes and minifies in the same pass, so one target governs all three.
// The `path` option anchors the browserslist lookup to this file, not to
// whichever directory pnpm happens to run from.
const targets = browserslistToTargets(
  browserslist(undefined, { path: fileURLToPath(import.meta.url) }),
);

// https://astro.build/config
export default defineConfig({
  // React and Vue render server-side only here: the renderer spike (lib/card.ts) shows
  // the same component through Astro, React and Vue on one page, against one CSS.
  // React and Vue render server-side only here: the renderer spike (lib/card.ts) shows
  // the same component through Astro, React and Vue on one page, against one CSS.
  // Keep Vue SFCs in plain JS: see the note in packages/tsugite/components/Card/Card.vue.
  integrations: [react(), vue()],
  vite: {
    css: {
      transformer: "lightningcss",
      // :dir() is NOT lowered: Lightning CSS's fallback rewrites it to :lang() lists,
      // which answers a different question (language, not direction) in every
      // browser, not only the old ones. Browsers below the target drop the rule
      // and --dir stays unset — the honest degradation, decided 2026-09-22.
      lightningcss: { targets, exclude: Features.DirSelector },
    },
    build: {
      cssMinify: "lightningcss",
    },
  },
});
