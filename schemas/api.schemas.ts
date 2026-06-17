import { z } from 'zod';

/** Single source of truth: runtime validation + compile-time types via z.infer. */
export const ApiGeoSchema = z.object({
  lat: z.string(),
  lng: z.string(),
});

export const ApiAddressSchema = z.object({
  street: z.string(),
  suite: z.string(),
  city: z.string(),
  zipcode: z.string(),
  geo: ApiGeoSchema,
});

export const ApiCompanySchema = z.object({
  name: z.string(),
  catchPhrase: z.string(),
  bs: z.string(),
});

export const ApiUserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  username: z.string().min(1),
  email: z.string().email(),
  phone: z.string(),
  website: z.string(),
  address: ApiAddressSchema,
  company: ApiCompanySchema,
});

export const ApiPostSchema = z.object({
  userId: z.number().int().positive(),
  id: z.number().int().positive().optional(),
  title: z.string().min(1),
  body: z.string().min(1),
});

export const CreatePostSchema = ApiPostSchema.omit({ id: true });

export const ApiUsersSchema = z.array(ApiUserSchema).min(1);

export const ApiErrorResponseSchema = z.object({
  message: z.string().optional(),
  statusCode: z.number().optional(),
});

export type ApiUser = z.infer<typeof ApiUserSchema>;
export type ApiPost = z.infer<typeof ApiPostSchema>;
export type CreatePostPayload = z.infer<typeof CreatePostSchema>;
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
