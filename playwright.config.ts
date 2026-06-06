import { defineConfig, devices } from "@playwright/test";

// Omakase e2e config. One chromium project; Playwright owns the dev server so
// the whole suite shares a single in-memory world (a storefront checkout that
// `createOrder()`s into globalThis must be visible to the command center within
// the same process — see src/lib/data-layer/fake/store.ts).
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // Serial: the suite mutates one shared in-memory store, and the full-loop
  // spec asserts a freshly-placed order shows up in the command center. Parallel
  // workers would each demand their own server (reuseExistingServer collapses
  // them onto one) and race on that shared state.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
