import { z } from 'zod';
import { brandPlanTypeSchema } from './common.schema';

/**
 * Subscription validation schemas
 */

export const brandPaymentIntentSchema = z.object({
  brandSubscriptionPlanId: z.string()
});

// Treatment subscription management schemas
export const upgradeSubscriptionSchema = z.object({
  treatmentId: z.string().uuid('Invalid treatment ID'),
});

export const cancelSubscriptionSchema = z.object({
  treatmentId: z.string().uuid('Invalid treatment ID'),
});

// Update brand subscription features schema
export const updateBrandSubscriptionFeaturesSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  features: z.object({
    apiAccess: z.boolean().optional(),
    whiteLabel: z.boolean().optional(),
    maxProducts: z.number().int().nonnegative('Max products must be non-negative').optional(),
    maxCampaigns: z.number().int().nonnegative('Max campaigns must be non-negative').optional(),
    customBranding: z.boolean().optional(),
    analyticsAccess: z.boolean().optional(),
    customerSupport: z.string().optional(),
    customIntegrations: z.boolean().optional(),
  }),
});

/**
 * Type exports
 */

export type BrandPaymentIntentInput = z.infer<typeof brandPaymentIntentSchema>;
export type UpgradeSubscriptionInput = z.infer<typeof upgradeSubscriptionSchema>;
export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;
export type UpdateBrandSubscriptionFeaturesInput = z.infer<typeof updateBrandSubscriptionFeaturesSchema>;
