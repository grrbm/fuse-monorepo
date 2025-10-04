import Questionnaire from '../models/Questionnaire';
import QuestionnaireStep from '../models/QuestionnaireStep';
import Question from '../models/Question';
import QuestionOption from '../models/QuestionOption';
import Treatment from '../models/Treatment';
import User from '../models/User';
import { Transaction } from 'sequelize';

class QuestionnaireService {

    async listTemplates() {
        return Questionnaire.findAll({
            where: { isTemplate: true },
            include: [
                {
                    model: QuestionnaireStep,
                    as: 'steps',
                    include: [
                        {
                            model: Question,
                            as: 'questions',
                            include: [
                                {
                                    model: QuestionOption,
                                    as: 'options',
                                },
                            ],
                        },
                    ],
                },
            ],
            order: [
                [{ model: QuestionnaireStep, as: 'steps' }, 'stepOrder', 'ASC'],
                [{ model: QuestionnaireStep, as: 'steps' }, { model: Question, as: 'questions' }, 'questionOrder', 'ASC'],
                [
                    { model: QuestionnaireStep, as: 'steps' },
                    { model: Question, as: 'questions' },
                    { model: QuestionOption, as: 'options' },
                    'optionOrder',
                    'ASC',
                ],
            ],
        });
    }

    async listForUser(userId: string) {
        return Questionnaire.findAll({
            where: {
                userId,
                isTemplate: false,
            },
            include: [
                {
                    model: QuestionnaireStep,
                    as: 'steps',
                    include: [
                        {
                            model: Question,
                            as: 'questions',
                            include: [
                                {
                                    model: QuestionOption,
                                    as: 'options',
                                },
                            ],
                        },
                    ],
                },
            ],
            order: [
                [{ model: QuestionnaireStep, as: 'steps' }, 'stepOrder', 'ASC'],
                [{ model: QuestionnaireStep, as: 'steps' }, { model: Question, as: 'questions' }, 'questionOrder', 'ASC'],
                [
                    { model: QuestionnaireStep, as: 'steps' },
                    { model: Question, as: 'questions' },
                    { model: QuestionOption, as: 'options' },
                    'optionOrder',
                    'ASC',
                ],
            ],
        });
    }

    async getByIdForUser(questionnaireId: string, userId: string) {
        return Questionnaire.findOne({
            where: {
                id: questionnaireId,
                userId,
                isTemplate: false,
            },
            include: [
                {
                    model: QuestionnaireStep,
                    as: 'steps',
                    include: [
                        {
                            model: Question,
                            as: 'questions',
                            include: [
                                {
                                    model: QuestionOption,
                                    as: 'options',
                                },
                            ],
                        },
                    ],
                },
            ],
            order: [
                [{ model: QuestionnaireStep, as: 'steps' }, 'stepOrder', 'ASC'],
                [{ model: QuestionnaireStep, as: 'steps' }, { model: Question, as: 'questions' }, 'questionOrder', 'ASC'],
                [
                    { model: QuestionnaireStep, as: 'steps' },
                    { model: Question, as: 'questions' },
                    { model: QuestionOption, as: 'options' },
                    'optionOrder',
                    'ASC',
                ],
            ],
        });
    }

    async listForTreatment(treatmentId: string, userId: string) {
        return Questionnaire.findAll({
            where: {
                treatmentId,
                userId,
                isTemplate: false,
            },
            order: [['createdAt', 'DESC']],
        });
    }

    async updateColor(questionnaireId: string, userId: string, color: string | null) {
        const questionnaire = await Questionnaire.findByPk(questionnaireId);

        if (!questionnaire) {
            throw new Error('Questionnaire not found');
        }

        if (questionnaire.userId !== userId) {
            throw new Error('Questionnaire does not belong to your account');
        }

        await questionnaire.update({ color: color ?? null });

        return questionnaire;
    }

    async duplicateTemplate(questionnaireId: string, userId: string) {
        const template = await Questionnaire.findByPk(questionnaireId, {
            include: [
                {
                    model: QuestionnaireStep,
                    as: 'steps',
                    include: [
                        {
                            model: Question,
                            as: 'questions',
                            include: [
                                {
                                    model: QuestionOption,
                                    as: 'options',
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        if (!template) {
            throw new Error('Template not found');
        }

        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const treatment = await Treatment.findOne({ where: { clinicId: user.clinicId } });

        const sequelize = Questionnaire.sequelize;
        if (!sequelize) {
            throw new Error('Database connection not available');
        }

        const transaction: Transaction = await sequelize.transaction();

        try {
            const clone = await Questionnaire.create(
                {
                    title: template.title,
                    description: template.description,
                    checkoutStepPosition: template.checkoutStepPosition,
                    treatmentId: treatment ? treatment.id : template.treatmentId,
                    isTemplate: false,
                    userId,
                    color: template.color,
                },
                { transaction }
            );

            for (const step of template.steps || []) {
                const clonedStep = await QuestionnaireStep.create(
                    {
                        title: step.title,
                        description: step.description,
                        stepOrder: step.stepOrder,
                        questionnaireId: clone.id,
                    },
                    { transaction }
                );

                for (const question of step.questions || []) {
                    const clonedQuestion = await Question.create(
                        {
                            questionText: question.questionText,
                            answerType: question.answerType,
                            isRequired: question.isRequired,
                            questionOrder: question.questionOrder,
                            stepId: clonedStep.id,
                        },
                        { transaction }
                    );

                    if (question.options?.length) {
                        await QuestionOption.bulkCreate(
                            question.options.map((option) => ({
                                optionText: option.optionText,
                                optionValue: option.optionValue,
                                optionOrder: option.optionOrder,
                                questionId: clonedQuestion.id,
                            })),
                            { transaction }
                        );
                    }
                }
            }

            await transaction?.commit();

            const fullClone = await Questionnaire.findByPk(clone.id, {
                include: [
                    {
                        model: QuestionnaireStep,
                        as: 'steps',
                        include: [
                            {
                                model: Question,
                                as: 'questions',
                                include: [
                                    {
                                        model: QuestionOption,
                                        as: 'options',
                                    },
                                ],
                            },
                        ],
                    },
                ],
                order: [
                    [{ model: QuestionnaireStep, as: 'steps' }, 'stepOrder', 'ASC'],
                    [{ model: QuestionnaireStep, as: 'steps' }, { model: Question, as: 'questions' }, 'questionOrder', 'ASC'],
                    [
                        { model: QuestionnaireStep, as: 'steps' },
                        { model: Question, as: 'questions' },
                        { model: QuestionOption, as: 'options' },
                        'optionOrder',
                        'ASC',
                    ],
                ],
            });

            return fullClone ?? clone;
        } catch (error) {
            await transaction?.rollback();
            throw error;
        }
    }

    async createDefaultQuestionnaire(treatmentId: string, isTemplate = false, userId?: string | null): Promise<Questionnaire> {
        const treatment = await Treatment.findByPk(treatmentId);

        if (!treatment) {
            throw new Error('Treatment not found');
        }

        const questionnaire = await Questionnaire.create({
            title: `${treatment.name} Intake Form`,
            description: `Medical intake questionnaire for ${treatment.name} treatment`,
            checkoutStepPosition: -1,
            treatmentId: treatmentId,
            isTemplate,
            userId: userId ?? null,
        });

        // Step 1: How are you feeling?
        const step1 = await QuestionnaireStep.create({
            title: 'How are you feeling?',
            description: '',
            stepOrder: 1,
            questionnaireId: questionnaire.id
        });

        const question1 = await Question.create({
            questionText: 'How are you feeling?',
            answerType: 'select',
            isRequired: true,
            questionOrder: 1,
            stepId: step1.id
        });

        await QuestionOption.bulkCreate([
            { optionText: 'Low Energy', optionValue: 'low_energy', optionOrder: 1, questionId: question1.id },
            { optionText: 'Brain Fog', optionValue: 'brain_fog', optionOrder: 2, questionId: question1.id },
            { optionText: 'Bad sleep', optionValue: 'bad_sleep', optionOrder: 3, questionId: question1.id }
        ]);

        // Step 2: Treatment Information
        const step2 = await QuestionnaireStep.create({
            title: 'Treatment Information',
            description: 'Treatment Information 83% of limitless patients report that Performance medication makes them more motivated',
            stepOrder: 2,
            questionnaireId: questionnaire.id
        });

        await Question.create({
            questionText: 'Treatment Information',
            answerType: 'text',
            isRequired: true,
            questionOrder: 1,
            stepId: step2.id
        });

        // Step 3: What state do you live in?
        const step3 = await QuestionnaireStep.create({
            title: 'Location Information',
            description: '',
            stepOrder: 3,
            questionnaireId: questionnaire.id
        });

        await Question.create({
            questionText: 'What state do you live in?',
            answerType: 'select',
            isRequired: true,
            questionOrder: 1,
            stepId: step3.id
        });

        // Step 4: Gender at birth
        const step4 = await QuestionnaireStep.create({
            title: 'Personal Information',
            description: '',
            stepOrder: 4,
            questionnaireId: questionnaire.id
        });

        const question4 = await Question.create({
            questionText: "What's your gender at birth?",
            answerType: 'radio',
            isRequired: true,
            questionOrder: 1,
            stepId: step4.id
        });

        await QuestionOption.bulkCreate([
            { optionText: 'Male', optionValue: 'male', optionOrder: 1, questionId: question4.id },
            { optionText: 'Female', optionValue: 'female', optionOrder: 2, questionId: question4.id }
        ]);

        // Step 5: Date of birth
        const step5 = await QuestionnaireStep.create({
            title: 'Date of Birth',
            description: '',
            stepOrder: 5,
            questionnaireId: questionnaire.id
        });

        await Question.create({
            questionText: 'Date of birth',
            answerType: 'date',
            isRequired: true,
            questionOrder: 1,
            stepId: step5.id
        });

        // Step 6: Personal information
        const step6 = await QuestionnaireStep.create({
            title: 'Personal information',
            description: '',
            stepOrder: 6,
            questionnaireId: questionnaire.id
        });

        await Question.bulkCreate([
            {
                questionText: 'First name',
                answerType: 'text',
                isRequired: true,
                questionOrder: 1,
                stepId: step6.id
            },
            {
                questionText: 'Last name',
                answerType: 'text',
                isRequired: true,
                questionOrder: 2,
                stepId: step6.id
            },
            {
                questionText: 'Email',
                answerType: 'email',
                isRequired: true,
                questionOrder: 3,
                stepId: step6.id
            },
            {
                questionText: 'Phone number',
                answerType: 'phone',
                isRequired: true,
                questionOrder: 4,
                stepId: step6.id
            }
        ]);

        return questionnaire;
    }

    async getQuestionnaireByTreatment(treatmentId: string) {
        const baseQuery = {
            include: [
                {
                    model: QuestionnaireStep,
                    as: 'steps',
                    include: [
                        {
                            model: Question,
                            as: 'questions',
                            include: [
                                {
                                    model: QuestionOption,
                                    as: 'options'
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [
                [{ model: QuestionnaireStep, as: 'steps' }, 'stepOrder', 'ASC'],
                [{ model: QuestionnaireStep, as: 'steps' }, { model: Question, as: 'questions' }, 'questionOrder', 'ASC'],
                [{ model: QuestionnaireStep, as: 'steps' }, { model: Question, as: 'questions' }, { model: QuestionOption, as: 'options' }, 'optionOrder', 'ASC']
            ] as any
        };

        const nonTemplate = await Questionnaire.findOne({
            where: { treatmentId, isTemplate: false },
            ...baseQuery,
            order: [
                ['updatedAt', 'DESC'],
                ...baseQuery.order,
            ]
        });

        if (nonTemplate) {
            return nonTemplate;
        }

        const template = await Questionnaire.findOne({
            where: { treatmentId },
            ...baseQuery,
            order: [
                ['updatedAt', 'DESC'],
                ...baseQuery.order,
            ]
        });

        if (!template) {
            throw new Error('Questionnaire not found for this treatment');
        }

        return template;
    }

    async deleteQuestionnaire(questionnaireId: string, userId: string) {
        const questionnaire = await Questionnaire.findByPk(questionnaireId, {
            include: [
                {
                    model: QuestionnaireStep,
                    as: 'steps',
                    include: [
                        {
                            model: Question,
                            as: 'questions',
                            include: [
                                {
                                    model: QuestionOption,
                                    as: 'options',
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        if (!questionnaire) {
            throw new Error('Questionnaire not found');
        }

        // Ensure user owns this questionnaire and it's not a template
        if (questionnaire.userId !== userId) {
            throw new Error('Questionnaire does not belong to your account');
        }

        if (questionnaire.isTemplate) {
            throw new Error('Cannot delete template questionnaires');
        }

        const sequelize = Questionnaire.sequelize;
        if (!sequelize) {
            throw new Error('Database connection not available');
        }

        const transaction: Transaction = await sequelize.transaction();

        try {
            // Delete in reverse order due to foreign key constraints
            for (const step of questionnaire.steps || []) {
                for (const question of step.questions || []) {
                    // Delete question options first (hard delete)
                    await QuestionOption.destroy({
                        where: { questionId: question.id },
                        transaction,
                        force: true
                    });

                    // Then delete the question (hard delete)
                    await Question.destroy({
                        where: { id: question.id },
                        transaction,
                        force: true
                    });
                }

                // Delete the step (hard delete)
                await QuestionnaireStep.destroy({
                    where: { id: step.id },
                    transaction,
                    force: true
                });
            }

            // Finally delete the questionnaire (hard delete)
            await Questionnaire.destroy({
                where: { id: questionnaireId },
                transaction,
                force: true
            });

            await transaction.commit();

            return { deleted: true, questionnaireId };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

export default QuestionnaireService;