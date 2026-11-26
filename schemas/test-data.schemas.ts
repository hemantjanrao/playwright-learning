import { z } from 'zod';
import { CreatePostSchema } from '@schemas/api.schemas';

/**
 * Zod schemas for static JSON under `test-data/`.
 * Loaders in `utils/test-data-factory.ts` parse files through these schemas
 * so fixture drift fails fast at runtime.
 */

const StaticUserCredentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  description: z.string(),
});

/** Shape of `test-data/login-users.json` (valid / locked / invalid personas). */
export const LoginTestDataSchema = z.object({
  validUser: StaticUserCredentialsSchema,
  lockedUser: StaticUserCredentialsSchema,
  invalidPassword: StaticUserCredentialsSchema,
});

/** Shape of `test-data/api-payloads.json` (sample post + user id). */
export const ApiPayloadsFileSchema = z.object({
  samplePost: CreatePostSchema,
  sampleUserId: z.number().int().positive(),
});

export type LoginTestData = z.infer<typeof LoginTestDataSchema>;
export type ApiPayloadsFile = z.infer<typeof ApiPayloadsFileSchema>;
