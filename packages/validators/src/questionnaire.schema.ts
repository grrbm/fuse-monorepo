import { z } from 'zod';

/**
 * Questionnaire Step validation schemas
 */

export const questionnaireStepCreateSchema = z.object({
  questionnaireId: z.string().uuid('Invalid questionnaire ID'),
});

export const questionnaireStepUpdateSchema = z.object({
  stepId: z.string().uuid('Invalid step ID'),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
}).refine(data => data.title !== undefined || data.description !== undefined, {
  message: 'At least one field (title or description) must be provided'
});

export const questionnaireStepOrderSchema = z.object({
  questionnaireId: z.string().uuid('Invalid questionnaire ID'),
  steps: z.array(z.object({
    id: z.string().uuid(),
    stepOrder: z.number().int().nonnegative(),
  })),
});

/**
 * Type exports
 */

export type QuestionnaireStepCreateInput = z.infer<typeof questionnaireStepCreateSchema>;
export type QuestionnaireStepUpdateInput = z.infer<typeof questionnaireStepUpdateSchema>;
export type QuestionnaireStepOrderInput = z.infer<typeof questionnaireStepOrderSchema>;
