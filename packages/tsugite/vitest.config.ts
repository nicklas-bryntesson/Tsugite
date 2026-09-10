/// <reference types="vitest" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  esbuild: { jsx: "automatic", jsxImportSource: "react" },
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
