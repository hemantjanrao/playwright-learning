import { defineConfig, devices } from '@playwright/test';
import { loadConfig } from '@utils/config-loader';
import { AUTH_STORAGE_PATH, TIMEOUTS } from '@utils/constants';

const config = loadConfig();
const useAllure = config.allureReport;
const isCi = !!process.env.CI;
const isNightly = process.env.CI_TIER === 'nightly';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCi,
  // PR/CI: zero retries — fix flakiness at the root. Nightly may retry once.
  retries: isNightly ? 1 : 0,
  workers: isCi ? 2 : undefined,
  timeout: TIMEOUTS.navigation,
  expect: {
    timeout: TIMEOUTS.expect,
  },
  reporter: useAllure
    ? [
        ['list'],
        ['html', { open: 'never', outputFolder: 'reports/html' }],
        ['allure-playwright', { resultsDir: 'reports/allure-results' }],
      ]
    : [['list'], ['html', { open: 'never', outputFolder: 'reports/html' }]],
  outputDir: 'test-results',
  use: {
    baseURL: config.baseUrl,
    headless: config.headless,
    // Sauce Demo uses data-test (not data-testid) — enables getByTestId()
    testIdAttribute: 'data-test',
    trace: isCi ? 'retain-on-failure' : 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: TIMEOUTS.action,
    navigationTimeout: TIMEOUTS.navigation,
    ignoreHTTPSErrors: true,
  },
  projects: [
    // ── Unit: pure TS / schema tests — no browser ──────────────────────────
    {
      name: 'unit',
      testMatch: /tests\/unit\/.*\.spec\.ts/,
    },
    // ── API: HTTP only — no browser, no auth setup ─────────────────────────
    {
      name: 'api',
      testMatch: /tests\/api\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    // ── UI auth: runs once, saves storageState ─────────────────────────────
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    // ── UI browsers: depend on setup, UI specs only ───────────────────────
    {
      name: 'chromium',
      testMatch: /tests\/ui\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      testMatch: /tests\/ui\/.*\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      testMatch: /tests\/ui\/.*\.spec\.ts/,
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },
  ],
  metadata: {
    environment: config.env,
    baseUrl: config.baseUrl,
    apiBaseUrl: config.apiBaseUrl,
    authStorage: AUTH_STORAGE_PATH,
    gitSha: process.env.GITHUB_SHA ?? 'local',
    ciTier: process.env.CI_TIER ?? 'local',
  },
});
