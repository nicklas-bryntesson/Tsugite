import { defineConfig, devices } from "@playwright/test";

// Conformance suite copied from reference-components (see PORTING.md there):
// the e2e + axe tests are the durable contract and outlive the submodule.
// BASE_URL points at an already-running server; otherwise astro dev is started.
const externalBase = process.env.BASE_URL;

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: ["**/*.e2e.test.js"],
  use: {
    baseURL: externalBase ?? "http://localhost:4321",
    ...devices["Desktop Chrome"],
  },
  webServer: externalBase
    ? undefined
    : {
        command: "pnpm --dir ../../apps/docs exec astro dev --port 4321",
        url: "http://localhost:4321",
        reuseExistingServer: !process.env.CI,
      },
});
