import { z } from 'zod';

export const createOrderSchema = z.object({
  customerName: z.string().trim().min(2, 'Ingresá tu nombre'),
  customerPhone: z.string().trim().min(6, 'Ingresá un teléfono válido'),
  customerEmail: z.string().trim().email('Ingresá un email válido'),
  customerAddress: z.string().optional(),
  customerProvince: z.string().optional(),
  customerCity: z.string().optional(),
  customerPostalCode: z.string().optional(),
  deliveryMethod: z.enum(['PICKUP', 'DELIVERY']),
  comments: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string().optional().nullable(),
        variantDescription: z.string().optional().nullable(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, 'El carrito no puede estar vacío'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED']),
});
