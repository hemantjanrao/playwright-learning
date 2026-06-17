import { defineConfig, devices } from '@playwright/test';
import { loadConfig } from '@utils/config-loader';
import { AUTH_STORAGE_PATH, TIMEOUTS } from '@utils/constants';

const config = loadConfig();
const useAllure = config.allureReport;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
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
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: TIMEOUTS.action,
    navigationTimeout: TIMEOUTS.navigation,
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testIgnore: /auth\.setup\.ts/,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
      testIgnore: /auth\.setup\.ts/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
      testIgnore: /auth\.setup\.ts/,
    },
  ],
  metadata: {
    environment: config.env,
    baseUrl: config.baseUrl,
    apiBaseUrl: config.apiBaseUrl,
    authStorage: AUTH_STORAGE_PATH,
  },
});
