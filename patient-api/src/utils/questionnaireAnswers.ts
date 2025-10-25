/**
 * Utility functions for handling questionnaire answers in both structured and legacy formats
 */

export interface StructuredAnswer {
    questionId: string;
    stepId: string;
    questionText: string;
    answerType: string;
    answer: any;
    selectedOptions?: Array<{
        optionId: string;
        optionText: string;
        optionValue: string;
    }>;
    answeredAt: string;
}

export interface StructuredQuestionnaireAnswers {
    answers: StructuredAnswer[];
    metadata: {
        questionnaireId?: string;
        completedAt: string;
        version: string;
    };
}

export interface LegacyQuestionnaireAnswers {
    [questionText: string]: string;
}

export type QuestionnaireAnswers = StructuredQuestionnaireAnswers | LegacyQuestionnaireAnswers;

/**
 * Determines if the questionnaire answers are in the new structured format
 */
export function isStructuredFormat(answers: any): answers is StructuredQuestionnaireAnswers {
    return answers &&
        typeof answers === 'object' &&
        Array.isArray(answers.answers) &&
        answers.metadata &&
        typeof answers.metadata === 'object';
}

/**
 * Converts structured answers to legacy format for backward compatibility
 */
export function toLegacyFormat(structuredAnswers: StructuredQuestionnaireAnswers): LegacyQuestionnaireAnswers {
    const legacyAnswers: LegacyQuestionnaireAnswers = {};

    structuredAnswers.answers.forEach(answer => {
        if (answer.selectedOptions && answer.selectedOptions.length > 0) {
            // For option-based questions, use the option text
            const optionTexts = answer.selectedOptions.map(option => option.optionText);
            legacyAnswers[answer.questionText] = optionTexts.join(', ');
        } else {
            // For text-based questions, use the answer directly
            legacyAnswers[answer.questionText] = String(answer.answer);
        }
    });

    return legacyAnswers;
}

/**
 * Converts legacy format to structured format
 */
export function toStructuredFormat(legacyAnswers: LegacyQuestionnaireAnswers): StructuredQuestionnaireAnswers {
    const answers: StructuredAnswer[] = [];

    Object.entries(legacyAnswers).forEach(([questionText, answer]) => {
        answers.push({
            questionId: `legacy-${questionText.replace(/\s+/g, '-').toLowerCase()}`,
            stepId: 'legacy-step',
            questionText,
            answerType: 'text',
            answer,
            answeredAt: new Date().toISOString()
        });
    });

    return {
        answers,
        metadata: {
            completedAt: new Date().toISOString(),
            version: "1.0"
        }
    };
}

/**
 * Gets the legacy format from either structured or legacy format
 */
export function getLegacyFormat(answers: QuestionnaireAnswers): LegacyQuestionnaireAnswers {
    if (isStructuredFormat(answers)) {
        return toLegacyFormat(answers);
    }
    return answers as LegacyQuestionnaireAnswers;
}

/**
 * Gets the structured format from either structured or legacy format
 */
export function getStructuredFormat(answers: QuestionnaireAnswers): StructuredQuestionnaireAnswers {
    if (isStructuredFormat(answers)) {
        return answers;
    }
    return toStructuredFormat(answers as LegacyQuestionnaireAnswers);
}

/**
 * Extracts case questions for MD Integration from either format
 */
export function extractCaseQuestions(answers: QuestionnaireAnswers): Array<{
    question: string;
    answer: string;
    type: string;
}> {
    const legacyAnswers = getLegacyFormat(answers);

    return Object.entries(legacyAnswers).map(([question, answer]) => ({
        question: String(question),
        answer: String(answer),
        type: 'string'
    }));
}
