import Questionnaire from '../models/Questionnaire';
import QuestionnaireStep from '../models/QuestionnaireStep';
import Question from '../models/Question';
import QuestionOption from '../models/QuestionOption';
import Treatment from '../models/Treatment';

class QuestionnaireService {

    async createDefaultQuestionnaire(treatmentId: string): Promise<Questionnaire> {
        const treatment = await Treatment.findByPk(treatmentId);

        if (!treatment) {
            throw new Error('Treatment not found');
        }

        const questionnaire = await Questionnaire.create({
            title: `${treatment.name} Intake Form`,
            description: `Medical intake questionnaire for ${treatment.name} treatment`,
            checkoutStepPosition: -1,
            treatmentId: treatmentId
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
        const questionnaire = await Questionnaire.findOne({
            where: { treatmentId },
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
            ]
        });

        if (!questionnaire) {
            throw new Error('Questionnaire not found for this treatment');
        }

        return questionnaire;
    }
}

export default QuestionnaireService;