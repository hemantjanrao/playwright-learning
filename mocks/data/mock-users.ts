import type { ApiUser } from '@schemas/api.schemas';

/**
 * Shared mock user payloads for MSW handlers and (conceptually) WireMock mappings.
 *
 * Keep `id` / shape aligned with {@link ApiUserSchema} so mocked and live contract
 * tests exercise the same Zod validations.
 */
export const MOCK_USER: ApiUser = {
  id: 1,
  name: 'Mock SDET User',
  username: 'mock_sdet',
  email: 'mock.sdet@framework.test',
  phone: '555-0100',
  website: 'framework.test',
  address: {
    street: '1 Test Lane',
    suite: 'Apt 42',
    city: 'Automation',
    zipcode: '12345',
    geo: { lat: '0', lng: '0' },
  },
  company: {
    name: 'Mock Corp',
    catchPhrase: 'Mock all the things',
    bs: 'contract-driven testing',
  },
};

/** Default list response for `GET /users` mocks. */
export const MOCK_USERS: ApiUser[] = [MOCK_USER];
