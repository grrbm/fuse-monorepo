import { z } from 'zod';

/**
 * Question validation schemas
 */

export const questionCreateSchema = z.object({
  stepId: z.string().uuid('Invalid step ID'),
  questionText: z.string().min(1, 'Question text is required'),
  answerType: z.enum(['text', 'textarea', 'radio', 'checkbox', 'select', 'date', 'number']),
  isRequired: z.boolean().optional().default(false),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  footerNote: z.string().optional(),
  conditionalLogic: z.string().optional(),
  conditionalLevel: z.number().int().nonnegative().optional().default(0),
  subQuestionOrder: z.number().int().nonnegative().optional(),
  parentQuestionId: z.string().uuid().optional(),
  options: z.array(z.object({
    optionText: z.string().min(1, 'Option text is required'),
    optionValue: z.string().optional(),
  })).optional(),
});

export const questionUpdateSchema = z.object({
  questionId: z.string().uuid('Invalid question ID'),
  questionText: z.string().min(1).optional(),
  answerType: z.enum(['text', 'textarea', 'radio', 'checkbox', 'select', 'date', 'number']).optional(),
  isRequired: z.boolean().optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  footerNote: z.string().optional(),
  conditionalLogic: z.string().optional(),
  conditionalLevel: z.number().int().nonnegative().optional(),
  subQuestionOrder: z.number().int().nonnegative().optional(),
  parentQuestionId: z.string().uuid().optional(),
  options: z.array(z.object({
    id: z.string().uuid('Invalid option ID').optional(),
    optionText: z.string().min(1, 'Option text is required'),
    optionValue: z.string().optional(),
  })).optional(),
});

export const questionOrderSchema = z.object({
  stepId: z.string().uuid('Invalid step ID'),
  questions: z.array(z.object({
    id: z.string().uuid(),
    questionOrder: z.number().int().nonnegative(),
  })).min(1, 'At least one question is required'),
});

/**
 * Type exports
 */

export type QuestionCreateInput = z.infer<typeof questionCreateSchema>;
export type QuestionUpdateInput = z.infer<typeof questionUpdateSchema>;
export type QuestionOrderInput = z.infer<typeof questionOrderSchema>;
