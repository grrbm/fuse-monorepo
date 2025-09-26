import Question from '../models/Question';
import QuestionOption from '../models/QuestionOption';
import QuestionnaireStep from '../models/QuestionnaireStep';
import Questionnaire from '../models/Questionnaire';
import Treatment from '../models/Treatment';
import User from '../models/User';

class QuestionService {
    async validateQuestionOperation(questionnaireStepId: string, userId: string) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const step = await QuestionnaireStep.findByPk(questionnaireStepId, {
            include: [
                {
                    model: Questionnaire,
                    as: 'questionnaire',
                    include: [
                        {
                            model: Treatment,
                            as: 'treatment'
                        }
                    ]
                }
            ]
        });

        if (!step) {
            throw new Error('Questionnaire step not found');
        }

        if (step.questionnaire.treatment.clinicId !== user.clinicId) {
            throw new Error('Questionnaire does not belong to your clinic');
        }

        return { user, step };
    }

    async listQuestions(stepId: string, userId: string) {
        // Validate question operation permission
        await this.validateQuestionOperation(stepId, userId);

        const questions = await Question.findAll({
            where: { stepId },
            include: [
                {
                    model: QuestionOption,
                    as: 'options',
                    order: [['optionOrder', 'ASC']]
                }
            ],
            order: [['questionOrder', 'ASC']]
        });

        return questions;
    }

    async createQuestion(stepId: string, questionData: {
        questionText: string;
        answerType: string;
        isRequired?: boolean;
        placeholder?: string;
        helpText?: string;
        footerNote?: string;
        options?: Array<{ optionText: string; optionValue?: string }>;
    }, userId: string) {
        // Validate question operation permission
        await this.validateQuestionOperation(stepId, userId);

        // Get the highest question order for this step
        const existingQuestions = await Question.findAll({
            where: { stepId },
            order: [['questionOrder', 'DESC']],
            limit: 1
        });

        const nextQuestionOrder = existingQuestions.length > 0 ? existingQuestions[0].questionOrder + 1 : 1;

        // Create the question
        const question = await Question.create({
            questionText: questionData.questionText,
            answerType: questionData.answerType,
            isRequired: questionData.isRequired || false,
            questionOrder: nextQuestionOrder,
            stepId: stepId,
            placeholder: questionData.placeholder || null,
            helpText: questionData.helpText || null,
            footerNote: questionData.footerNote || null
        });

        // Create options if provided
        if (questionData.options && questionData.options.length > 0) {
            const optionPromises = questionData.options.map((option, index) =>
                QuestionOption.create({
                    optionText: option.optionText,
                    optionValue: option.optionValue || option.optionText,
                    optionOrder: index + 1,
                    questionId: question.id
                })
            );

            await Promise.all(optionPromises);
        }

        // Return question with options
        return await Question.findByPk(question.id, {
            include: [
                {
                    model: QuestionOption,
                    as: 'options',
                    order: [['optionOrder', 'ASC']]
                }
            ]
        });
    }

    async updateQuestion(questionId: string, updateData: {
        questionText?: string;
        answerType?: string;
        isRequired?: boolean;
        placeholder?: string;
        helpText?: string;
        footerNote?: string;
        options?: Array<{ id?: string; optionText: string; optionValue?: string }>;
    }, userId: string) {
        const question = await Question.findByPk(questionId);
        if (!question) {
            throw new Error('Question not found');
        }

        // Validate question operation permission
        await this.validateQuestionOperation(question.stepId, userId);

        // Update question fields
        await question.update({
            ...(updateData.questionText !== undefined && { questionText: updateData.questionText }),
            ...(updateData.answerType !== undefined && { answerType: updateData.answerType }),
            ...(updateData.isRequired !== undefined && { isRequired: updateData.isRequired }),
            ...(updateData.placeholder !== undefined && { placeholder: updateData.placeholder }),
            ...(updateData.helpText !== undefined && { helpText: updateData.helpText }),
            ...(updateData.footerNote !== undefined && { footerNote: updateData.footerNote })
        });

        // Update options if provided
        if (updateData.options) {
            // Delete existing options
            await QuestionOption.destroy({
                where: { questionId: questionId },
                force: true
            });

            // Create new options
            if (updateData.options.length > 0) {
                const optionPromises = updateData.options.map((option, index) =>
                    QuestionOption.create({
                        optionText: option.optionText,
                        optionValue: option.optionValue || option.optionText,
                        optionOrder: index + 1,
                        questionId: questionId
                    })
                );

                await Promise.all(optionPromises);
            }
        }

        // Return updated question with options
        return await Question.findByPk(questionId, {
            include: [
                {
                    model: QuestionOption,
                    as: 'options',
                    order: [['optionOrder', 'ASC']]
                }
            ]
        });
    }

    async deleteQuestion(questionId: string, userId: string) {
        const question = await Question.findByPk(questionId);
        if (!question) {
            throw new Error('Question not found');
        }

        // Validate question operation permission
        await this.validateQuestionOperation(question.stepId, userId);

        // Delete question options first
        await QuestionOption.destroy({
            where: { questionId: questionId }
        });

        // Delete the question
        await Question.destroy({
            where: { id: questionId }
        });

        return { deleted: true, questionId };
    }

    async saveQuestionsOrder(questions: Array<{ id: string; questionOrder: number }>, stepId: string, userId: string) {
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            throw new Error('Questions array is required and cannot be empty');
        }

        // Validate question operation permission
        await this.validateQuestionOperation(stepId, userId);

        // Get all question IDs to validate they exist and belong to the step
        const questionIds = questions.map(q => q.id);

        // Update question orders
        const updatePromises = questions.map(question =>
            Question.update(
                { questionOrder: question.questionOrder },
                { where: { id: question.id } }
            )
        );

        await Promise.all(updatePromises);

        // Return updated questions
        const updatedQuestions = await Question.findAll({
            where: { id: questionIds },
            include: [
                {
                    model: QuestionOption,
                    as: 'options',
                    order: [['optionOrder', 'ASC']]
                }
            ],
            order: [['questionOrder', 'ASC']]
        });

        return updatedQuestions;
    }
}

export default QuestionService;