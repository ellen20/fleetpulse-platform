import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './playwright-ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'api',
      testDir: './playwright-ts/tests/api',
      use: {
        baseURL: 'http://localhost:3001/api/',
      },
    },
    {
      name: 'chromium',
      testDir: './playwright-ts/tests',
      testIgnore: '**/api/**',
      fullyParallel: false,
      workers: 1,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'cd dashboard && npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
});
