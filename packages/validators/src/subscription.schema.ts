import { z } from 'zod';
import { brandPlanTypeSchema } from './common.schema';

/**
 * Subscription validation schemas
 */

// Brand subscription schemas
export const brandCheckoutSchema = z.object({
  planType: brandPlanTypeSchema,
  successUrl: z.string().url('Invalid success URL'),
  cancelUrl: z.string().url('Invalid cancel URL'),
});

export const brandPaymentIntentSchema = z.object({
  planType: brandPlanTypeSchema,
  planCategory: z.enum(["professional", "standard"]).optional(),
  downpaymentPlanType: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3).optional().default('usd'),
  upgrade: z.boolean().optional(),
});

export const brandConfirmPaymentSchema = z.object({
  paymentMethodId: z.string().min(1, 'Payment method ID is required'),
  planType: brandPlanTypeSchema,
  downpaymentPlanType: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3).optional().default('usd'),
});


// Treatment subscription management schemas
export const upgradeSubscriptionSchema = z.object({
  treatmentId: z.string().uuid('Invalid treatment ID'),
});

export const cancelSubscriptionSchema = z.object({
  treatmentId: z.string().uuid('Invalid treatment ID'),
});

/**
 * Type exports
 */

export type BrandCheckoutInput = z.infer<typeof brandCheckoutSchema>;
export type BrandPaymentIntentInput = z.infer<typeof brandPaymentIntentSchema>;
export type BrandConfirmPaymentInput = z.infer<typeof brandConfirmPaymentSchema>;
export type UpgradeSubscriptionInput = z.infer<typeof upgradeSubscriptionSchema>;
export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;
