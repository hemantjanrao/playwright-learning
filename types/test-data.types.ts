/**
 * Test-data related types.
 * Prefer Zod-inferred types from `@schemas/test-data.schemas` for JSON fixtures.
 */

/** Static username/password persona used in login-users.json. */
export interface StaticUserCredentials {
  username: string;
  password: string;
  description: string;
}

/** @deprecated Import from @schemas/test-data.schemas — types inferred from Zod. */
export type { LoginTestData } from '@schemas/test-data.schemas';

/**
 * Dynamically generated user profile from {@link generateUserProfile}.
 * Used when tests need unique identities without touching static JSON.
 */
export interface GeneratedUserProfile {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}
