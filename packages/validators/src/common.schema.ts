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

/**
 * Type exports
 */

export type EmailInput = z.infer<typeof emailSchema>;
export type PasswordInput = z.infer<typeof passwordSchema>;
export type PhoneInput = z.infer<typeof phoneSchema>;
export type UuidInput = z.infer<typeof uuidSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
