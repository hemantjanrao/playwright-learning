import type { EnvironmentName } from '@models/config.types';

export const ENVIRONMENT_DEFAULTS: Record<
  EnvironmentName,
  { baseUrl: string; apiBaseUrl: string }
> = {
  dev: {
    baseUrl: 'https://www.saucedemo.com',
    apiBaseUrl: 'https://jsonplaceholder.typicode.com',
  },
  qa: {
    baseUrl: 'https://www.saucedemo.com',
    apiBaseUrl: 'https://jsonplaceholder.typicode.com',
  },
  staging: {
    baseUrl: 'https://www.saucedemo.com',
    apiBaseUrl: 'https://jsonplaceholder.typicode.com',
  },
  prod: {
    baseUrl: 'https://www.saucedemo.com',
    apiBaseUrl: 'https://jsonplaceholder.typicode.com',
  },
};
