import { z } from 'zod';

/**
 * Physician validation schemas
 */

export const licenseSchema = z.object({
  state: z.string().min(1, 'State is required'),
  number: z.string().min(1, 'Number is required'),
  type: z.enum(['MEDICAL', 'CONTROLLED_SUBSTANCE_REGISTRATION_(CSR)', 'PA', 'ARNP', 'OD']),
  expires_on: z.string().min(1, 'Expires on is required'),
})

export const physicianCreateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  email: z.string().min(1, 'Email is required'),
  street: z.string().min(1, 'Street is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'Zip is required'),
  licenses: z.array(licenseSchema),
  clinicId: z.string().min(1, 'Clinic ID is required'),
});

export const physicianUpdateSchema = z.object({
  physicianId: z.string().min(1, 'Physician ID is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  email: z.string().min(1, 'Email is required'),
  street: z.string().min(1, 'Street is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'Zip is required'),
  licenses: z.array(licenseSchema),
});

/**
 * Type exports
 */

export type PhysicianCreateInput = z.infer<typeof physicianCreateSchema>;
export type PhysicianUpdateInput = z.infer<typeof physicianUpdateSchema>;
