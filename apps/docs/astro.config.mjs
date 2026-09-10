// @ts-check
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vue from "@astrojs/vue";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";

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
  integrations: [react(), vue()],
  vite: {
    css: {
      transformer: "lightningcss",
      lightningcss: { targets },
    },
    build: {
      cssMinify: "lightningcss",
    },
  },
});
