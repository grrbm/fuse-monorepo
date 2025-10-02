import { z } from 'zod';

/**
 * Product validation schemas
 */

export const productCreateSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  price: z.number().positive('Price must be positive'),
  description: z.string().optional(),
  pharmacyProductId: z.string().optional(),
  dosage: z.string().optional(),
  activeIngredients: z.array(z.string()).optional(),
  active: z.boolean().optional().default(true),
});

export const productUpdateSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  price: z.number().positive('Price must be positive'),
  description: z.string().optional(),
  pharmacyProductId: z.string().optional(),
  dosage: z.string().optional(),
  activeIngredients: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});

/**
 * Type exports
 */

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
