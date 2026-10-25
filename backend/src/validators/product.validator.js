import { z } from 'zod';

export const productVariantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().trim().min(1, 'El SKU de la variante es obligatorio'),
  type: z.string().trim().optional().nullable(),
  size: z.string().trim().optional().nullable(),
  color: z.string().trim().optional().nullable(),
  flavor: z.string().trim().optional().nullable(),
  volume: z.string().trim().optional().nullable(),
  price: z.number({ required_error: 'El precio de la variante es obligatorio' }).nonnegative('El precio no puede ser negativo'),
  stock: z.number().int().nonnegative().optional().default(0),
  active: z.boolean().optional().default(true),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  price: z.number({ required_error: 'El precio es obligatorio' }).nonnegative('El precio no puede ser negativo'),
  transferPrice: z.number().positive().optional().nullable(),
  stock: z.number().int().nonnegative().optional().default(0),
  sku: z.string().trim().optional().nullable(),
  categoryId: z.string().trim().optional().nullable(),
  badge: z.string().trim().optional().nullable(),
  featured: z.boolean().optional(),
  brand: z.string().trim().optional().nullable(),
  imageUrl: z.string().trim().optional().nullable(),
  description: z.string().optional().nullable().default(''),
  active: z.boolean().optional().default(true),
  variants: z.array(productVariantSchema).optional(),
});

export const updateProductSchema = createProductSchema.partial();
