import { z } from 'zod';

/**
 * Common validation schemas
 */

// Email validation
export const emailSchema = z.string().email('Invalid email address');

// Password validation (min 8 chars, at least one letter and one number)
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Phone number validation (basic US format)
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

// UUID validation
export const uuidSchema = z.string().uuid('Invalid UUID format');

// Date validation
export const dateSchema = z.coerce.date();

// Pagination validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// Questionnaire answers validation (dynamic keys with string values)
export const questionnaireAnswersSchema = z.record(z.string(), z.string());

// Shipping information validation
export const shippingInfoSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required').max(2, 'State must be 2 characters'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid zip code format'),
});

// Brand subscription plan type validation
export const brandPlanTypeSchema = z.enum(['standard_build', 'enterprise', 'high-definition'], {
  errorMap: () => ({ message: 'Invalid plan type. Must be one of: standard_build, enterprise, high-definition' })
});

/**
 * Type exports
 */

export type EmailInput = z.infer<typeof emailSchema>;
export type PasswordInput = z.infer<typeof passwordSchema>;
export type PhoneInput = z.infer<typeof phoneSchema>;
export type UuidInput = z.infer<typeof uuidSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type QuestionnaireAnswersInput = z.infer<typeof questionnaireAnswersSchema>;
export type ShippingInfoInput = z.infer<typeof shippingInfoSchema>;
export type BrandPlanType = z.infer<typeof brandPlanTypeSchema>;
