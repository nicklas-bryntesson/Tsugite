/// <reference types="vitest" />
import { getViteConfig } from "astro/config";
import vue from "@vitejs/plugin-vue";

export default getViteConfig({
  plugins: [vue()],
  esbuild: { jsx: "automatic", jsxImportSource: "react" },
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
