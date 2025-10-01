import { z } from 'zod';

/**
 * Treatment Plan validation schemas
 */

export const billingIntervalEnum = z.enum(['monthly', 'quarterly', 'annual', 'biannual'], {
  errorMap: () => ({ message: 'Invalid billing interval' })
});


export const treatmentPlanCreateSchema = z.object({
  name: z.string().min(1, 'Plan name is required').max(200),
  description: z.string().optional(),
  billingInterval: billingIntervalEnum,
  price: z.number().positive('Price must be positive'),
  active: z.boolean().optional().default(true),
  popular: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional(),
  treatmentId: z.string().uuid('Invalid treatment ID'),
});

export const treatmentPlanUpdateSchema = z.object({
  planId: z.string().uuid('Invalid plan ID'),
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  billingInterval: billingIntervalEnum,
  price: z.number().positive().optional(),
  active: z.boolean().optional(),
  popular: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

/**
 * Type exports
 */

export type TreatmentPlanCreateInput = z.infer<typeof treatmentPlanCreateSchema>;
export type TreatmentPlanUpdateInput = z.infer<typeof treatmentPlanUpdateSchema>;
export type BillingIntervalEnum = z.infer<typeof billingIntervalEnum>;
