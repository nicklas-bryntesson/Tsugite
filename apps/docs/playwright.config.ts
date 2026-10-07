import { defineConfig, devices } from "@playwright/test";

// The site's own e2e (rooms). The conformance suites live in the package.
const externalBase = process.env.BASE_URL;

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: ["**/*.e2e.test.js"],
  use: {
    baseURL: externalBase ?? "http://localhost:4321",
  },
  // Every suite runs in Chromium. Tests tagged @engines — contracts that must hold in every
  // engine, and probes that ask how engines differ — also run in Firefox and WebKit, as their
  // own projects, so the main run never needs the other two browsers installed.
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "engines-firefox", grep: /@engines/, use: { ...devices["Desktop Firefox"] } },
    { name: "engines-webkit", grep: /@engines/, use: { ...devices["Desktop Safari"] } },
  ],
  webServer: externalBase
    ? undefined
    : {
        command: "npx astro dev --port 4321",
        url: "http://localhost:4321",
        reuseExistingServer: !process.env.CI,
      },
});
