import type { EnvironmentName } from '@models/config.types';
import type {
  PostsCollectionPath,
  PostByIdPath,
  UserByIdPath,
  UsersCollectionPath,
} from '@models/api-endpoints.types';
import type { PostId, UserId } from '@models/branded.types';

export const ENVIRONMENTS = ['dev', 'qa', 'staging', 'prod'] as const satisfies readonly EnvironmentName[];

export const ROUTES = {
  login: '/',
  inventory: '/inventory.html',
  cart: '/cart.html',
} as const satisfies Record<string, `/${string}` | string>;

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

export const AUTH_STORAGE_PATH = 'auth/.auth/user.json' as const;

export const TIMEOUTS = {
  navigation: 30_000,
  action: 15_000,
  expect: 10_000,
} as const satisfies Record<'navigation' | 'action' | 'expect', number>;

export const ERROR_MESSAGES = {
  lockedOut: 'Sorry, this user has been locked out.',
  invalidCredentials: 'Epic sadface: Username and password do not match any user in this service',
  requiredUsername: 'Epic sadface: Username is required',
} as const satisfies Record<string, string>;
