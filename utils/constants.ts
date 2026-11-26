import type { EnvironmentName } from '@models/config.types';
import type {
  PostsCollectionPath,
  PostByIdPath,
  UserByIdPath,
  UsersCollectionPath,
} from '@models/api-endpoints.types';
import type { PostId, UserId } from '@models/branded.types';

/**
 * Shared constants for routes, API paths, timeouts, auth storage, and UI error copy.
 *
 * Prefer importing from here instead of scattering magic strings across specs
 * and page objects. Template-literal types on API paths catch bad concatenations
 * at compile time when used with branded IDs.
 */

/** Allowed `TEST_ENV` values — must stay in sync with `EnvironmentName`. */
export const ENVIRONMENTS = [
  'dev',
  'qa',
  'staging',
  'prod',
] as const satisfies readonly EnvironmentName[];

/** UI routes for Sauce Demo (relative to Playwright `baseURL`). */
export const ROUTES = {
  login: '/',
  inventory: '/inventory.html',
  cart: '/cart.html',
} as const satisfies Record<string, `/${string}` | string>;

/**
 * REST path helpers for the JSONPlaceholder-style demo API.
 * Use with {@link ApiClient} / {@link FetchApiClient} and branded IDs.
 */
export const API_ENDPOINTS = {
  users: '/users',
  posts: '/posts',
  userById: (id: UserId | number): UserByIdPath => `/users/${id}`,
  postById: (id: PostId | number): PostByIdPath => `/posts/${id}`,
} as const satisfies {
  users: UsersCollectionPath;
  posts: PostsCollectionPath;
  userById: (id: UserId | number) => UserByIdPath;
  postById: (id: PostId | number) => PostByIdPath;
};

/**
 * Path where the `setup` project persists browser `storageState`.
 * Must stay gitignored (`auth/.auth/`).
 */
export const AUTH_STORAGE_PATH = 'auth/.auth/user.json' as const;

/** Default Playwright timeouts (ms) — mirrored in `playwright.config.ts`. */
export const TIMEOUTS = {
  navigation: 30_000,
  action: 15_000,
  expect: 10_000,
} as const satisfies Record<'navigation' | 'action' | 'expect', number>;

/** Expected Sauce Demo error banner copy for negative UI tests. */
export const ERROR_MESSAGES = {
  lockedOut: 'Sorry, this user has been locked out.',
  invalidCredentials: 'Epic sadface: Username and password do not match any user in this service',
  requiredUsername: 'Epic sadface: Username is required',
  requiredPassword: 'Epic sadface: Password is required',
} as const satisfies Record<string, string>;
