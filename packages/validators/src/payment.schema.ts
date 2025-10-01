import { z } from 'zod';
import { emailSchema, questionnaireAnswersSchema, shippingInfoSchema } from './common.schema';

/**
 * Payment validation schemas
 */

export const treatmentSubscriptionSchema = z.object({
  treatmentId: z.string().uuid('Invalid treatment ID'),
  stripePriceId: z.string().min(1, 'Stripe price ID is required'),
  userDetails: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: emailSchema,
    phoneNumber: z.string().optional(),
  }).optional(),
  questionnaireAnswers: questionnaireAnswersSchema.optional(),
  shippingInfo: shippingInfoSchema.optional(),
});

export const clinicSubscriptionSchema = z.object({
  clinicId: z.string().uuid('Invalid clinic ID'),
});

/**
 * Type exports
 */

export type TreatmentSubscriptionInput = z.infer<typeof treatmentSubscriptionSchema>;
export type ClinicSubscriptionInput = z.infer<typeof clinicSubscriptionSchema>;
