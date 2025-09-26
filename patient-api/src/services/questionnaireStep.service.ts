import Questionnaire from '../models/Questionnaire';
import QuestionnaireStep from '../models/QuestionnaireStep';
import Question from '../models/Question';
import QuestionOption from '../models/QuestionOption';
import Treatment from '../models/Treatment';
import User from '../models/User';

class QuestionnaireStepService {
    async validateQuestionnaireOperation(questionnaireId: string, userId: string) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const questionnaire = await Questionnaire.findByPk(questionnaireId, {
            include: [
                {
                    model: Treatment,
                    as: 'treatment'
                }
            ]
        });

        if (!questionnaire) {
            throw new Error('Questionnaire not found');
        }

        if (questionnaire.treatment.clinicId !== user.clinicId) {
            throw new Error('Questionnaire does not belong to your clinic');
        }

        return { user, questionnaire };
    }

    async addQuestionnaireStep(questionnaireId: string, userId: string) {
        // Validate questionnaire operation permission
        await this.validateQuestionnaireOperation(questionnaireId, userId);

        const existingSteps = await QuestionnaireStep.findAll({
            where: { questionnaireId },
            order: [['stepOrder', 'DESC']],
            limit: 1
        });

        const nextStepOrder = existingSteps.length > 0 ? existingSteps[0].stepOrder + 1 : 1;

        const newStep = await QuestionnaireStep.create({
            title: 'New Step',
            description: '',
            stepOrder: nextStepOrder,
            questionnaireId: questionnaireId
        });

        return newStep;
    }

    async updateQuestionnaireStep(stepId: string, updateData: { title?: string; description?: string }, userId: string) {
        const step = await QuestionnaireStep.findByPk(stepId);
        if (!step) {
            throw new Error('Questionnaire step not found');
        }

        // Validate questionnaire operation permission
        await this.validateQuestionnaireOperation(step.questionnaireId, userId);

        // Update step with provided data
        const updatedStep = await step.update({
            ...(updateData.title !== undefined && { title: updateData.title }),
            ...(updateData.description !== undefined && { description: updateData.description })
        });

        return updatedStep;
    }

    async deleteQuestionnaireStep(stepId: string, userId: string) {
        const step = await QuestionnaireStep.findByPk(stepId, {
            include: [
                {
                    model: Question,
                    as: 'questions'
                }
            ]
        });

        if (!step) {
            throw new Error('Questionnaire step not found');
        }

        // Validate questionnaire operation permission
        await this.validateQuestionnaireOperation(step.questionnaireId, userId);

        // Delete all questions associated with this step first
        if (step.questions && step.questions.length > 0) {
            for (const question of step.questions) {
                // Delete question options first
                await QuestionOption.destroy({
                    where: { questionId: question.id }
                });

                // Then delete the question
                await Question.destroy({
                    where: { id: question.id }
                });
            }
        }

        // Delete the step
        await QuestionnaireStep.destroy({
            where: { id: stepId }
        });

        return { deleted: true, stepId };
    }

    async saveStepsOrder(steps: Array<{ id: string; stepOrder: number }>, questionnaireId: string, userId: string) {
        if (!steps || !Array.isArray(steps) || steps.length === 0) {
            throw new Error('Steps array is required and cannot be empty');
        }

        // Validate questionnaire operation permission
        await this.validateQuestionnaireOperation(questionnaireId, userId);

        // Get all step IDs to validate they exist and belong to the questionnaire
        const stepIds = steps.map(step => step.id);
        // Update step orders
        const updatePromises = steps.map(step =>
            QuestionnaireStep.update(
                { stepOrder: step.stepOrder },
                { where: { id: step.id } }
            )
        );

        await Promise.all(updatePromises);

        // Return updated steps
        const updatedSteps = await QuestionnaireStep.findAll({
            where: { id: stepIds },
            order: [['stepOrder', 'ASC']]
        });

        return updatedSteps;
    }
}

export default QuestionnaireStepService;