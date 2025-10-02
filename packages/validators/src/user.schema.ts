import { z } from 'zod';
import { shippingInfoSchema } from './common.schema';

/**
 * User validation schemas
 */


export const patientUpdateSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phoneNumber: z.string().optional(),
  dob: z.string().optional(),
  address: shippingInfoSchema.optional(),
});

/**
 * Type exports
 */

export type PatientUpdateInput = z.infer<typeof patientUpdateSchema>;
