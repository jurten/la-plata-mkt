import { defineConfig } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4321';
process.env.PUBLIC_SITE_URL ??= baseURL;
process.env.PUBLIC_CASE_STUDIES_APPROVED ??= 'true';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { viewport: { width: 1440, height: 1000 } } },
  ],
});
