import { z } from 'zod'

export const listTemplatesQuerySchema = z.object({
  sectionType: z.enum(['personalization', 'account', 'doctor']).optional(),
  category: z.string().optional(),
  treatmentId: z.string().uuid().optional(),
})

export const assignTemplatesSchema = z.object({
  treatmentId: z.string().uuid(),
  personalizationTemplateId: z.string().uuid(),
  accountTemplateId: z.string().uuid(),
  doctorTemplateId: z.string().uuid(),
  layoutTemplate: z.string(),
  themeId: z.string().optional().nullable(),
})

export type ListTemplatesQuery = z.infer<typeof listTemplatesQuerySchema>
export type AssignTemplatesInput = z.infer<typeof assignTemplatesSchema>


