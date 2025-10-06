// Re-export all schemas
export * from './common.schema';
export * from './auth.schema';
export * from './clinic.schema';
export * from './user.schema';
export * from './product.schema';
export * from './treatment.schema';
export * from './treatmentPlan.schema';
export * from './order.schema';
export * from './payment.schema';
export * from './subscription.schema';
export * from './questionnaire.schema';
export * from './question.schema';
export * from './message.schema';
export * from './brandTreatment.schema';
export * from './organization.schema';
export * from './tenantProduct.schema';

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
