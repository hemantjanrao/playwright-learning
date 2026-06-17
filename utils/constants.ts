import type { EnvironmentName } from '@models/config.types';

export const ENVIRONMENTS: readonly EnvironmentName[] = ['dev', 'qa', 'staging', 'prod'] as const;

export const ROUTES = {
  login: '/',
  inventory: '/inventory.html',
  cart: '/cart.html',
} as const;

export const API_ENDPOINTS = {
  users: '/users',
  posts: '/posts',
  userById: (id: number) => `/users/${id}`,
  postById: (id: number) => `/posts/${id}`,
} as const;

export const AUTH_STORAGE_PATH = 'auth/.auth/user.json';

export const TIMEOUTS = {
  navigation: 30_000,
  action: 15_000,
  expect: 10_000,
} as const;

export const ERROR_MESSAGES = {
  lockedOut: 'Sorry, this user has been locked out.',
  invalidCredentials: 'Epic sadface: Username and password do not match any user in this service',
  requiredUsername: 'Epic sadface: Username is required',
} as const;
