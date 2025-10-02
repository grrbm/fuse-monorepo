import { z } from 'zod';

/**
 * Clinic validation schemas
 */

export const clinicUpdateSchema = z.object({
  name: z.string().min(1, 'Clinic name is required').max(200),
  logo: z.string().optional(),
});

/**
 * Type exports
 */

export type ClinicUpdateInput = z.infer<typeof clinicUpdateSchema>;
