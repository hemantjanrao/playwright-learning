/**
 * Environment and application config types used by `loadConfig()` and fixtures.
 * Runtime validation lives in `@schemas/config.schemas` ({@link AppConfigSchema}).
 */

/** Allowed deployment targets for `TEST_ENV`. */
export type EnvironmentName = 'dev' | 'qa' | 'staging' | 'prod';

/**
 * Fully loaded test configuration after env file + Zod validation.
 * Injected as the `config` fixture in specs.
 */
export interface AppConfig {
  env: EnvironmentName;
  /** UI origin for Playwright `baseURL` (Sauce Demo). */
  baseUrl: string;
  /** API origin for contract tests (JSONPlaceholder-style). */
  apiBaseUrl: string;
  credentials: {
    username: string;
    password: string;
  };
  headless: boolean;
  allureReport: boolean;
}

/** Structured missing-variable error collected before Zod parse. */
export interface ConfigValidationError {
  variable: string;
  message: string;
}
