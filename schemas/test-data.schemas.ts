import { z } from 'zod';
import { CreatePostSchema } from '@schemas/api.schemas';

const StaticUserCredentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  description: z.string(),
});

export const LoginTestDataSchema = z.object({
  validUser: StaticUserCredentialsSchema,
  lockedUser: StaticUserCredentialsSchema,
  invalidPassword: StaticUserCredentialsSchema,
});

export const ApiPayloadsFileSchema = z.object({
  samplePost: CreatePostSchema,
  sampleUserId: z.number().int().positive(),
});

export type LoginTestData = z.infer<typeof LoginTestDataSchema>;
export type ApiPayloadsFile = z.infer<typeof ApiPayloadsFileSchema>;
