import { test, expect } from '@playwright/test';
import { loadConfig } from '@utils/config-loader';
import { loadLoginTestData, loadApiPayloads } from '@utils/test-data-factory';

test.describe('Unit — config loader', () => {
  test('loadConfig accepts valid overrides', () => {
    const config = loadConfig({
      env: 'dev',
      baseUrl: 'https://www.example.com',
      apiBaseUrl: 'https://api.example.com',
      credentials: { username: 'user', password: 'pass' },
      headless: true,
      allureReport: false,
    });

    expect(config.baseUrl).toBe('https://www.example.com');
    expect(config.credentials.username).toBe('user');
  });

  test('loadConfig rejects invalid TEST_ENV', () => {
    const original = process.env.TEST_ENV;
    process.env.TEST_ENV = 'invalid-env';

    expect(() => loadConfig()).toThrow(/Invalid TEST_ENV/);

    process.env.TEST_ENV = original;
  });

  test('loadConfig rejects missing credentials', () => {
    expect(() =>
      loadConfig({
        env: 'dev',
        baseUrl: 'https://www.example.com',
        apiBaseUrl: 'https://api.example.com',
        credentials: { username: '', password: '' },
        headless: true,
        allureReport: false,
      }),
    ).toThrow(/Environment configuration is invalid/);
  });
});

test.describe('Unit — test data schemas', () => {
  test('loadLoginTestData parses valid JSON fixture', () => {
    const data = loadLoginTestData();
    expect(data.validUser.username).toBe('standard_user');
    expect(data.lockedUser.username).toBe('locked_out_user');
  });

  test('loadApiPayloads parses valid JSON fixture', () => {
    const data = loadApiPayloads();
    expect(data.sampleUserId).toBe(1);
    expect(data.samplePost.title).toBeTruthy();
  });
});
