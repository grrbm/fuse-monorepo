import { z } from 'zod';

export const organizationUpdateSchema = z.object({
  businessName: z.string().min(1).max(200).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid zip code format').optional(),
  website: z.string().optional(),
  isCustomDomain: z.boolean().optional(),
  customDomain: z.string().optional(),
});
