import { config as loadDotenv } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { AppConfig, ConfigValidationError, EnvironmentName } from '@models/config.types';
import { AppConfigSchema } from '@schemas/config.schemas';
import { ENVIRONMENTS } from '@utils/constants';

function resolveEnvFile(envName: string): string {
  const root = process.cwd();
  const candidates = [`.env.${envName}`, '.env'];

  for (const file of candidates) {
    const fullPath = resolve(root, file);
    if (existsSync(fullPath)) {
      return fullPath;
    }
  }

  return resolve(root, '.env');
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === 'true';
}

function isEnvironmentName(value: string): value is EnvironmentName {
  return (ENVIRONMENTS as readonly string[]).includes(value);
}

function validateRequired(
  entries: Array<{ key: keyof AppConfig | string; value: string | undefined }>,
): ConfigValidationError[] {
  return entries
    .filter((entry) => !entry.value?.trim())
    .map((entry) => ({
      variable: String(entry.key),
      message: `Missing required environment variable: ${String(entry.key)}`,
    }));
}

/**
 * Loads and validates environment configuration.
 * Two validation layers: required env vars, then Zod schema (URLs, types).
 */
export function loadConfig(overrides?: Partial<AppConfig>): AppConfig {
  const envName = (process.env.TEST_ENV ?? 'dev').toLowerCase();

  if (!isEnvironmentName(envName)) {
    throw new Error(`Invalid TEST_ENV "${envName}". Expected one of: ${ENVIRONMENTS.join(', ')}`);
  }

  loadDotenv({ path: resolveEnvFile(envName), override: true });

  const rawConfig: AppConfig = {
    env: envName,
    baseUrl: process.env.BASE_URL ?? '',
    apiBaseUrl: process.env.API_BASE_URL ?? '',
    credentials: {
      username: process.env.E2E_USERNAME ?? '',
      password: process.env.E2E_PASSWORD ?? '',
    },
    headless: parseBoolean(process.env.HEADLESS, true),
    allureReport: parseBoolean(process.env.ALLURE_REPORT, false),
    ...overrides,
  };

  const errors = validateRequired([
    { key: 'baseUrl', value: rawConfig.baseUrl },
    { key: 'apiBaseUrl', value: rawConfig.apiBaseUrl },
    { key: 'E2E_USERNAME', value: rawConfig.credentials.username },
    { key: 'E2E_PASSWORD', value: rawConfig.credentials.password },
  ]);

  if (errors.length > 0) {
    const details = errors.map((error) => `- ${error.message}`).join('\n');
    throw new Error(`Environment configuration is invalid:\n${details}`);
  }

  const parsed = AppConfigSchema.safeParse(rawConfig);
  if (!parsed.success) {
    throw new Error(`Config schema validation failed:\n${parsed.error.message}`);
  }

  return parsed.data;
}
