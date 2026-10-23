import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(80, 'El nombre no puede superar los 80 caracteres'),
  slug: z.string().trim().optional(),
  parentId: z.string().trim().optional().nullable(),
  order: z.number().int().optional().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();
