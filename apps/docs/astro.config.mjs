// @ts-check
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import tsugiteCapabilities from "tsugite/vite/capabilities.js";

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
  vite: {
    // Capability probes (RFC 0001): a no-op unless CAP_MODE=probe, when the
    // `@supports` pairs become style queries and the virtual head is emitted.
    plugins: [tsugiteCapabilities()],
    css: {
      transformer: "lightningcss",
      lightningcss: { targets },
    },
    build: {
      cssMinify: "lightningcss",
    },
  },
});
