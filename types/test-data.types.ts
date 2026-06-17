export interface StaticUserCredentials {
  username: string;
  password: string;
  description: string;
}

export interface LoginTestData {
  validUser: StaticUserCredentials;
  lockedUser: StaticUserCredentials;
  invalidPassword: StaticUserCredentials;
}

export interface GeneratedUserProfile {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}
