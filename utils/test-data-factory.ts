import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { faker } from '@faker-js/faker';
import type { GeneratedUserProfile, LoginTestData } from '@models/test-data.types';

const loginDataPath = resolve(process.cwd(), 'test-data/login-users.json');

export function loadLoginTestData(): LoginTestData {
  const raw = readFileSync(loginDataPath, 'utf-8');
  return JSON.parse(raw) as LoginTestData;
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

export function uniqueSuffix(): string {
  return `${Date.now()}-${faker.string.alphanumeric(6)}`;
}
