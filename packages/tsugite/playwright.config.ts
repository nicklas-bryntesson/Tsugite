import { defineConfig, devices } from "@playwright/test";

// Conformance suite copied from reference-components (see PORTING.md there):
// the e2e + axe tests are the durable contract and outlive the submodule.
//
// Every suite runs on its component's bench (ADR-0026), served by the package's own bench
// app; the docs app is not needed. BENCH_URL points at an already-running bench server;
// otherwise one is started.
const benchBase = process.env.BENCH_URL ?? "http://localhost:4340";

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: ["**/*.e2e.test.js"],
  use: { ...devices["Desktop Chrome"], baseURL: benchBase },
  webServer: process.env.BENCH_URL
    ? undefined
    : { command: "pnpm bench", url: benchBase, reuseExistingServer: !process.env.CI },
});
