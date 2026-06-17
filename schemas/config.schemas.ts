import { z } from 'zod';

const EnvironmentNameSchema = z.enum(['dev', 'qa', 'staging', 'prod']);

export const AppConfigSchema = z.object({
  env: EnvironmentNameSchema,
  baseUrl: z.string().url(),
  apiBaseUrl: z.string().url(),
  credentials: z.object({
    username: z.string().min(1),
    password: z.string().min(1),
  }),
  headless: z.boolean(),
  allureReport: z.boolean(),
});

export type ParsedAppConfig = z.infer<typeof AppConfigSchema>;
