import { defineConfig, devices } from '@playwright/test';

const isCi = process.env['CI'] !== undefined;

/**
 * Playground specs run against the playground dev server; portal specs run against the portal
 * dev server with IDAM and the API replaced by in-test mocks (see support/idam-mock.ts).
 */
export default defineConfig({
  testDir: './specs',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: './playwright-report' }]],
  use: {
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'playground',
      testDir: './specs/playground',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4300' },
    },
    {
      name: 'portal',
      testDir: './specs/portal',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4200' },
    },
  ],
  webServer: [
    {
      command: 'npx ng serve dahc-playground --port 4300',
      cwd: '../..',
      url: 'http://localhost:4300',
      reuseExistingServer: !isCi,
      timeout: 300_000,
    },
    {
      command: 'npx ng serve dahc-portal --port 4200',
      cwd: '../..',
      url: 'http://localhost:4200',
      reuseExistingServer: !isCi,
      timeout: 300_000,
    },
  ],
});
