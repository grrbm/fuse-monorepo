// Re-export all schemas
export * from './common.schema';
export * from './auth.schema';

/**
 * Validation helper function
 */
import { z } from 'zod';

export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
