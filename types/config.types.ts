export type EnvironmentName = 'dev' | 'qa' | 'staging' | 'prod';

export interface AppConfig {
  env: EnvironmentName;
  baseUrl: string;
  apiBaseUrl: string;
  credentials: {
    username: string;
    password: string;
  };
  headless: boolean;
  allureReport: boolean;
}

export interface ConfigValidationError {
  variable: string;
  message: string;
}
