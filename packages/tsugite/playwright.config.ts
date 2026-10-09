import { defineConfig, devices } from "@playwright/test";

// Conformance suite copied from reference-components (see PORTING.md there):
// the e2e + axe tests are the durable contract and outlive the submodule.
//
// A suite runs on its component's bench (ADR-0026), served by the package's own bench app.
// Suites not yet moved still run against the docs app's kitchen sink; each move adds the
// file to ON_BENCH, and the last one takes the kitchen-sink project and its server with it.
// BENCH_URL / BASE_URL point at an already-running server; otherwise one is started.
const ON_BENCH = ["button.e2e.test.js", "notice.e2e.test.js", "choicefield.e2e.test.js", "choicegroup.e2e.test.js"];

const benchBase = process.env.BENCH_URL ?? "http://localhost:4340";
const docsBase = process.env.BASE_URL ?? "http://localhost:4321";

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: ["**/*.e2e.test.js"],
  use: { ...devices["Desktop Chrome"] },
  projects: [
    { name: "bench", testMatch: ON_BENCH, use: { baseURL: benchBase } },
    { name: "kitchen-sink", testIgnore: ON_BENCH, use: { baseURL: docsBase } },
  ],
  webServer: [
    ...(process.env.BENCH_URL
      ? []
      : [{ command: "pnpm bench", url: benchBase, reuseExistingServer: !process.env.CI }]),
    ...(process.env.BASE_URL
      ? []
      : [
          {
            command: "pnpm --dir ../../apps/docs exec astro dev --port 4321",
            url: docsBase,
            reuseExistingServer: !process.env.CI,
          },
        ]),
  ],
});
