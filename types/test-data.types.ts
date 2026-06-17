export interface StaticUserCredentials {
  username: string;
  password: string;
  description: string;
}

/** @deprecated Import from @schemas/test-data.schemas — types inferred from Zod. */
export type { LoginTestData } from '@schemas/test-data.schemas';

export interface GeneratedUserProfile {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}
