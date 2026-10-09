// @ts-check
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import browserslist from "browserslist";
import { browserslistToTargets, Features } from "lightningcss";

// The bench app (ADR-0026): renders every component's <Name>.bench.astro, one page each,
// so the package's suites run without the docs app. The CSS pipeline is the docs app's,
// line for line — the same browserslist target and the same Lightning CSS lowering
// (ADR-0010) — or the benches would test a different system from the one that ships.
const targets = browserslistToTargets(
  browserslist(undefined, { path: fileURLToPath(import.meta.url) }),
);

export default defineConfig({
  vite: {
    css: {
      transformer: "lightningcss",
      // :dir() is not lowered — see apps/docs/astro.config.mjs for the reason.
      lightningcss: { targets, exclude: Features.DirSelector },
    },
    build: {
      cssMinify: "lightningcss",
    },
  },
});
