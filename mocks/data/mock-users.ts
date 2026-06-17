import type { ApiUser } from '@schemas/api.schemas';

/** Shared mock payloads — used by MSW handlers and WireMock mappings. */
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

export const MOCK_USERS: ApiUser[] = [MOCK_USER];
