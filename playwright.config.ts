import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
/** Point the suite at a deployment instead of a local build: BASE_URL=... npm test */
const EXTERNAL = process.env.BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : [["list"]],
  use: {
    baseURL: EXTERNAL ?? `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Skipped when BASE_URL points at an already-running deployment.
  webServer: EXTERNAL
    ? undefined
    : {
        command: `npx next start --port ${PORT}`,
        port: PORT,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
