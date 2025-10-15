import { z } from 'zod';

/**
 * Tenant Product validation schemas
 */

export const productSelectionItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  questionnaireId: z.string().uuid('Invalid questionnaire ID').optional().nullable(),
});

export const updateSelectionSchema = z.object({
  products: z
    .array(productSelectionItemSchema)
    .min(1, 'At least one product is required')
    .max(100, 'Maximum 100 products allowed per request'),
});

export const tenantProductCreateSchema = z.object({
  clinicId: z.string().uuid('Invalid clinic ID'),
  productId: z.string().uuid('Invalid product ID'),
  questionnaireId: z.string().uuid('Invalid questionnaire ID'),
  active: z.boolean().optional().default(true),
  customPrice: z.number().positive('Custom price must be positive').optional(),
});

export const tenantProductUpdateSchema = z.object({
  questionnaireId: z.string().uuid('Invalid questionnaire ID').optional(),
  active: z.boolean().optional(),
  customPrice: z.number().positive('Custom price must be positive').optional().nullable(),
});

/**
 * Type exports
 */

export type ProductSelectionItem = z.infer<typeof productSelectionItemSchema>;
export type UpdateSelectionInput = z.infer<typeof updateSelectionSchema>;
export type TenantProductCreateInput = z.infer<typeof tenantProductCreateSchema>;
export type TenantProductUpdateInput = z.infer<typeof tenantProductUpdateSchema>;
