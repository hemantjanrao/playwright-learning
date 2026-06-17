import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { faker } from '@faker-js/faker';
import type { GeneratedUserProfile } from '@models/test-data.types';
import {
  ApiPayloadsFileSchema,
  LoginTestDataSchema,
  type ApiPayloadsFile,
  type LoginTestData,
} from '@schemas/test-data.schemas';

const loginDataPath = resolve(process.cwd(), 'test-data/login-users.json');
const apiPayloadsPath = resolve(process.cwd(), 'test-data/api-payloads.json');

/** Parse and validate static JSON fixtures at runtime (contract-driven test data). */
export function loadLoginTestData(): LoginTestData {
  const raw = readFileSync(loginDataPath, 'utf-8');
  return LoginTestDataSchema.parse(JSON.parse(raw));
}

export function loadApiPayloads(): ApiPayloadsFile {
  const raw = readFileSync(apiPayloadsPath, 'utf-8');
  return ApiPayloadsFileSchema.parse(JSON.parse(raw));
}

export function generateUserProfile(): GeneratedUserProfile {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    firstName,
    lastName,
    email: faker.internet.email({ firstName, lastName }),
    username: faker.internet.username({ firstName, lastName }),
  };
}

/**
 * Parallel-safe unique suffix — includes Playwright worker index when available.
 * Prevents data collisions when tests run with multiple workers.
 */
export function uniqueSuffix(): string {
  const worker = process.env.TEST_PARALLEL_INDEX ?? '0';
  return `w${worker}-${Date.now()}-${faker.string.alphanumeric(6)}`;
}
