import { defineConfig, devices } from "@playwright/test";

// A dedicated port, never reused, so a `pnpm dev` or `pnpm preview` server on 4321 is never
// mistaken for the built site.
const port = 8788;
const baseURL = `http://127.0.0.1:${port}`;

// Tests run against `wrangler dev` serving the already-built dist/, so redirects, the 404 page
// and trailing-slash handling behave as they do on Cloudflare. Run `pnpm build` first.
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm exec wrangler dev --port ${port} --ip 127.0.0.1`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60_000,
    env: { WRANGLER_SEND_METRICS: "false" },
  },
});
