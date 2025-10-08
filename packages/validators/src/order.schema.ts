import { z } from 'zod';
import { questionnaireAnswersSchema, shippingInfoSchema } from './common.schema';

/**
 * Order validation schemas
 */

export const createPaymentIntentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3).optional().default('usd'),
  treatmentId: z.string().uuid('Invalid treatment ID'),
  selectedProducts: z.record(z.string(), z.number().int().positive('Quantity must be positive')),
  selectedPlan: z.string().optional().default('monthly'),
  shippingInfo: shippingInfoSchema,
  questionnaireAnswers: questionnaireAnswersSchema.optional(),
});

/**
 * Type exports
 */

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
