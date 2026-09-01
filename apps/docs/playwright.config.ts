import { defineConfig, devices } from "@playwright/test";

// The site's own e2e (rooms). The conformance suites live in the package.
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
        command: "npx astro dev --port 4321",
        url: "http://localhost:4321",
        reuseExistingServer: !process.env.CI,
      },
});
