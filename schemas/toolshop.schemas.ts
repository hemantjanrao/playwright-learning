import { z } from 'zod';

/** Toolshop resource ids are 26-char ULIDs. */
const ToolshopIdSchema = z.string().regex(/^[0-9A-HJKMNP-TV-Z]{26}$/);

export const ToolshopProductImageSchema = z.object({
  id: ToolshopIdSchema,
  by_name: z.string().min(1),
  by_url: z.string().url(),
  source_name: z.string().min(1),
  source_url: z.string().url(),
  file_name: z.string().min(1),
  title: z.string().min(1),
});

export const ToolshopCategorySchema = z.object({
  id: ToolshopIdSchema,
  name: z.string().min(1),
  slug: z.string().min(1),
});

export const ToolshopBrandSchema = z.object({
  id: ToolshopIdSchema,
  name: z.string().min(1),
});

export const ToolshopProductSchema = z.object({
  id: ToolshopIdSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  is_location_offer: z.boolean(),
  is_rental: z.boolean(),
  co2_rating: z.enum(['A', 'B', 'C', 'D', 'E']),
  in_stock: z.boolean(),
  is_eco_friendly: z.boolean(),
  product_image: ToolshopProductImageSchema,
  category: ToolshopCategorySchema,
  brand: ToolshopBrandSchema,
});

/** Laravel page. `from` and `to` are null when `data` is empty. */
export const ToolshopProductPageSchema = z.object({
  current_page: z.number().int().positive(),
  data: z.array(ToolshopProductSchema),
  from: z.number().int().positive().nullable(),
  last_page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  to: z.number().int().positive().nullable(),
  total: z.number().int().nonnegative(),
});

export type ToolshopProduct = z.infer<typeof ToolshopProductSchema>;
export type ToolshopProductPage = z.infer<typeof ToolshopProductPageSchema>;