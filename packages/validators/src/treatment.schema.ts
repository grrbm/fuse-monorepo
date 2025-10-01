import { z } from 'zod';

/**
 * Treatment validation schemas
 */

export const treatmentCreateSchema = z.object({
  name: z.string().min(1, 'Treatment name is required').max(200),
  defaultQuestionnaire: z.boolean().optional(),
});

export const treatmentUpdateSchema = z.object({
  treatmentId: z.string().uuid('Invalid treatment ID'),
  name: z.string().min(1).max(200).optional(),
  active: z.boolean().optional(),
  treatmentLogo: z.string().url().optional(),
  productsPrice: z.number().optional(),
});

/**
 * Type exports
 */

export type TreatmentCreateInput = z.infer<typeof treatmentCreateSchema>;
export type TreatmentUpdateInput = z.infer<typeof treatmentUpdateSchema>;
