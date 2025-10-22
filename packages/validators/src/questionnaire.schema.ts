import { z } from 'zod';

/**
 * Questionnaire validation schemas
 */

export const createQuestionnaireSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  treatmentId: z.string().uuid('Invalid treatment ID').optional(),
  checkoutStepPosition: z.number().int().optional(),
  isTemplate: z.boolean().optional(),
  color: z.string().max(50).optional(),
  productId: z.string().uuid('Invalid product ID').optional(),
});

export const updateQuestionnaireSchema = z.object({
  id: z.string().uuid('Invalid questionnaire ID'),
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters').optional(),
  description: z.string().optional(),
  treatmentId: z.string().uuid('Invalid treatment ID').optional(),
  checkoutStepPosition: z.number().int().optional(),
  isTemplate: z.boolean().optional(),
  color: z.string().max(50).optional(),
  productId: z.string().uuid('Invalid product ID').optional(),
});

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
  isDeadEnd: z.boolean().optional(),
  conditionalLogic: z.string().optional(),
}).refine(data => data.title !== undefined || data.description !== undefined || data.isDeadEnd !== undefined || data.conditionalLogic !== undefined, {
  message: 'At least one field (title, description, isDeadEnd, or conditionalLogic) must be provided'
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

export type CreateQuestionnaireInput = z.infer<typeof createQuestionnaireSchema>;
export type UpdateQuestionnaireInput = z.infer<typeof updateQuestionnaireSchema>;
export type QuestionnaireStepCreateInput = z.infer<typeof questionnaireStepCreateSchema>;
export type QuestionnaireStepUpdateInput = z.infer<typeof questionnaireStepUpdateSchema>;
export type QuestionnaireStepOrderInput = z.infer<typeof questionnaireStepOrderSchema>;
