import { z } from 'zod';

/**
 * Brand Treatment validation schemas
 */

export const brandTreatmentSchema = z.object({
  treatmentId: z.string().uuid('Invalid treatment ID'),
  brandLogo: z.string().url().optional(),
  brandColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
});

/**
 * Type exports
 */

export type BrandTreatmentInput = z.infer<typeof brandTreatmentSchema>;
