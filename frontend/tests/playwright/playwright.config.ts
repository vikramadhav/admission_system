import { defineConfig, devices } from '@playwright/test';

const isCi = process.env['CI'] !== undefined;

/**
 * Playground specs run against the playground dev server. Portal specs run against the portal
 * development build with IDAM and the API replaced by in-test mocks (support/idam-mock.ts), and
 * candidate specs run the full candidate workflows against the mock build (in-browser API,
 * persona sign-in) on its own port. Staff specs use that mock build too, with a persona per role.
 */
export default defineConfig({
  testDir: './specs',
  outputDir: './test-results',
  fullyParallel: true,
  // Specs run against the Angular dev server, which builds pages on demand; with 400+ tests in
  // parallel a first page load can be slow, so tests and assertions get more time than the defaults.
  timeout: 60_000,
  expect: { timeout: 10_000 },
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
    {
      name: 'candidate',
      testDir: './specs/candidate',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4201' },
    },
    {
      // Staff areas and roles, against the same mock build as the candidate specs.
      name: 'staff',
      testDir: './specs/staff',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4201' },
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
    {
      command: 'npx ng serve dahc-portal --configuration mock --port 4201',
      cwd: '../..',
      url: 'http://localhost:4201',
      reuseExistingServer: !isCi,
      timeout: 300_000,
    },
  ],
});
