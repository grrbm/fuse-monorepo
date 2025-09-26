'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Find the NAD+ treatment
    const [treatments] = await queryInterface.sequelize.query(`
      SELECT id FROM "Treatment" WHERE name = 'Anti Aging NAD+'
    `);
    
    if (treatments.length === 0) {
      throw new Error('NAD+ treatment not found. Please ensure treatments are seeded first.');
    }
    
    const nadTreatmentId = treatments[0].id;

    // Create the questionnaire
    const questionnaireId = require('uuid').v4();
    await queryInterface.bulkInsert('Questionnaire', [{
      id: questionnaireId,
      title: 'NAD+ Intake Questionnaire',
      description: 'Complete intake questionnaire for NAD+ treatment',
      treatmentId: nadTreatmentId,
      checkoutStepPosition: -1, // Checkout steps at the end
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // Create all steps
    const steps = [
      {
        id: require('uuid').v4(),
        title: 'Welcome',
        description: "We'll ask a few quick questions about your health, lifestyle, and goals. This helps your provider design the safest and most effective NAD+ plan for you.",
        stepOrder: 1,
        questionnaireId: questionnaireId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: require('uuid').v4(),
        title: 'Basics',
        description: 'Basic personal information',
        stepOrder: 2,
        questionnaireId: questionnaireId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: require('uuid').v4(),
        title: 'Body Metrics',
        description: 'Height and weight information',
        stepOrder: 3,
        questionnaireId: questionnaireId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: require('uuid').v4(),
        title: 'Medical Background',
        description: 'Medical history and current conditions',
        stepOrder: 4,
        questionnaireId: questionnaireId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: require('uuid').v4(),
        title: 'Lifestyle & Habits',
        description: 'Lifestyle and daily habits',
        stepOrder: 5,
        questionnaireId: questionnaireId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: require('uuid').v4(),
        title: 'NAD+ Goals & Motivation',
        description: 'Your goals and motivations for NAD+ treatment',
        stepOrder: 6,
        questionnaireId: questionnaireId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: require('uuid').v4(),
        title: 'NAD+ Experience',
        description: 'Previous experience with NAD+',
        stepOrder: 7,
        questionnaireId: questionnaireId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: require('uuid').v4(),
        title: 'Treatment Preferences',
        description: 'Your treatment preferences and expectations',
        stepOrder: 8,
        questionnaireId: questionnaireId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: require('uuid').v4(),
        title: 'Final Step',
        description: 'Thanks for completing your NAD+ intake! Your information will be reviewed by your provider to create your personalized NAD+ plan.',
        stepOrder: 9,
        questionnaireId: questionnaireId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('QuestionnaireStep', steps);

    // Now create questions for each step
    const questions = [];
    const questionOptions = [];

    // Step 2 - Basics
    const basicsStepId = steps[1].id;
    
    // Date of Birth
    questions.push({
      id: require('uuid').v4(),
      questionText: 'Date of Birth',
      answerType: 'date',
      isRequired: true,
      questionOrder: 1,
      stepId: basicsStepId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Sex assigned at birth
    const sexQuestionId = require('uuid').v4();
    questions.push({
      id: sexQuestionId,
      questionText: 'Sex assigned at birth',
      answerType: 'radio',
      isRequired: true,
      questionOrder: 2,
      stepId: basicsStepId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Sex options
    ['Male', 'Female', 'Other'].forEach((option, index) => {
      questionOptions.push({
        id: require('uuid').v4(),
        optionText: option,
        optionValue: option.toLowerCase(),
        optionOrder: index + 1,
        questionId: sexQuestionId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Phone Number
    questions.push({
      id: require('uuid').v4(),
      questionText: 'Phone Number',
      answerType: 'phone',
      isRequired: true,
      questionOrder: 3,
      stepId: basicsStepId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Zip Code
    questions.push({
      id: require('uuid').v4(),
      questionText: 'Zip Code',
      answerType: 'text',
      isRequired: true,
      questionOrder: 4,
      stepId: basicsStepId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 3 - Body Metrics
    const bodyMetricsStepId = steps[2].id;

    // Height
    questions.push({
      id: require('uuid').v4(),
      questionText: 'Height',
      answerType: 'height',
      isRequired: true,
      questionOrder: 1,
      stepId: bodyMetricsStepId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Weight
    questions.push({
      id: require('uuid').v4(),
      questionText: 'Weight',
      answerType: 'weight',
      isRequired: true,
      questionOrder: 2,
      stepId: bodyMetricsStepId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 4 - Medical Background
    const medicalStepId = steps[3].id;

    // Medical conditions
    const medicalConditionsId = require('uuid').v4();
    questions.push({
      id: medicalConditionsId,
      questionText: 'Have you ever been diagnosed with any of the following?',
      answerType: 'checkbox',
      isRequired: true,
      questionOrder: 1,
      stepId: medicalStepId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const medicalConditions = ['Stroke', 'Heart Disease', 'High Blood Pressure', 'Diabetes', 'Seizures', 'Fatty Liver', 'Gallstones', 'Obstructive Sleep Apnea', 'Kidney Disease', 'Cancer', 'None'];
    medicalConditions.forEach((condition, index) => {
      questionOptions.push({
        id: require('uuid').v4(),
        optionText: condition,
        optionValue: condition.toLowerCase().replace(/\s+/g, '_'),
        optionOrder: index + 1,
        questionId: medicalConditionsId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Allergies
    questions.push({
      id: require('uuid').v4(),
      questionText: 'Do you have any allergies? (Food, medications, supplements, dyes, other)',
      answerType: 'textarea',
      isRequired: false,
      questionOrder: 2,
      stepId: medicalStepId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Current medications
    questions.push({
      id: require('uuid').v4(),
      questionText: 'Please list current medications, herbals, or supplements (Name, dose, reason)',
      answerType: 'textarea',
      isRequired: false,
      questionOrder: 3,
      stepId: medicalStepId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Recent surgeries
    const surgeriesQuestionId = require('uuid').v4();
    questions.push({
      id: surgeriesQuestionId,
      questionText: 'Have you had any recent surgeries or hospitalizations?',
      answerType: 'radio',
      isRequired: true,
      questionOrder: 4,
      stepId: medicalStepId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    ['Yes', 'No'].forEach((option, index) => {
      questionOptions.push({
        id: require('uuid').v4(),
        optionText: option,
        optionValue: option.toLowerCase(),
        optionOrder: index + 1,
        questionId: surgeriesQuestionId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Pregnancy
    const pregnancyQuestionId = require('uuid').v4();
    questions.push({
      id: pregnancyQuestionId,
      questionText: 'Are you currently pregnant, breastfeeding, or planning pregnancy?',
      answerType: 'radio',
      isRequired: true,
      questionOrder: 5,
      stepId: medicalStepId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    ['Yes', 'No'].forEach((option, index) => {
      questionOptions.push({
        id: require('uuid').v4(),
        optionText: option,
        optionValue: option.toLowerCase(),
        optionOrder: index + 1,
        questionId: pregnancyQuestionId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Step 5 - Lifestyle & Habits
    const lifestyleStepId = steps[4].id;

    // Smoking
    const smokingQuestionId = require('uuid').v4();
    questions.push({
      id: smokingQuestionId,
      questionText: 'Do you smoke or vape?',
      answerType: 'radio',
      isRequired: true,
      questionOrder: 1,
      stepId: lifestyleStepId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    ['Yes', 'No'].forEach((option, index) => {
      questionOptions.push({
        id: require('uuid').v4(),
        optionText: option,
        optionValue: option.toLowerCase(),
        optionOrder: index + 1,
        questionId: smokingQuestionId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Alcohol
    const alcoholQuestionId = require('uuid').v4();
    questions.push({
      id: alcoholQuestionId,
      questionText: 'Do you consume alcohol?',
      answerType: 'radio',
      isRequired: true,
      questionOrder: 2,
      stepId: lifestyleStepId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    ['Yes', 'Occasionally', 'No'].forEach((option, index) => {
      questionOptions.push({
        id: require('uuid').v4(),
        optionText: option,
        optionValue: option.toLowerCase(),
        optionOrder: index + 1,
        questionId: alcoholQuestionId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Exercise
    const exerciseQuestionId = require('uuid').v4();
    questions.push({
      id: exerciseQuestionId,
      questionText: 'How often do you exercise?',
      answerType: 'radio',
      isRequired: true,
      questionOrder: 3,
      stepId: lifestyleStepId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    ['Daily', 'Few times a week', 'Rarely', 'Never'].forEach((option, index) => {
      questionOptions.push({
        id: require('uuid').v4(),
        optionText: option,
        optionValue: option.toLowerCase().replace(/\s+/g, '_'),
        optionOrder: index + 1,
        questionId: exerciseQuestionId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Stress level
    const stressQuestionId = require('uuid').v4();
    questions.push({
      id: stressQuestionId,
      questionText: 'How would you describe your stress level?',
      answerType: 'radio',
      isRequired: true,
      questionOrder: 4,
      stepId: lifestyleStepId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    ['Low', 'Moderate', 'High'].forEach((option, index) => {
      questionOptions.push({
        id: require('uuid').v4(),
        optionText: option,
        optionValue: option.toLowerCase(),
        optionOrder: index + 1,
        questionId: stressQuestionId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Sleep hours
    const sleepQuestionId = require('uuid').v4();
    questions.push({
      id: sleepQuestionId,
      questionText: 'How many hours of sleep do you typically get?',
      answerType: 'radio',
      isRequired: true,
      questionOrder: 5,
      stepId: lifestyleStepId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    ['<5', '5–7', '7–9', '>9'].forEach((option, index) => {
      questionOptions.push({
        id: require('uuid').v4(),
        optionText: option + ' hours',
        optionValue: option.replace(/[<>–]/g, '').replace(/\s/g, ''),
        optionOrder: index + 1,
        questionId: sleepQuestionId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Step 6 - NAD+ Goals & Motivation
    const goalsStepId = steps[5].id;

    const goalsQuestionId = require('uuid').v4();
    questions.push({
      id: goalsQuestionId,
      questionText: 'What are your goals with NAD+ treatment? (Select all that apply)',
      answerType: 'checkbox',
      isRequired: true,
      questionOrder: 1,
      stepId: goalsStepId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const goals = [
      'To boost daily energy and reduce fatigue',
      'To improve focus, memory, and mental clarity',
      'To support healthy aging / longevity',
      'To restore cellular health and repair DNA',
      'To speed up recovery from stress or overexertion',
      'To stabilize mood and emotional balance',
      'To improve metabolism and weight management',
      'To improve sleep quality',
      'To detox and support overall wellness',
      'To feel good and function at my best'
    ];

    goals.forEach((goal, index) => {
      questionOptions.push({
        id: require('uuid').v4(),
        optionText: goal,
        optionValue: goal.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_'),
        optionOrder: index + 1,
        questionId: goalsQuestionId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Step 7 - NAD+ Experience
    const experienceStepId = steps[6].id;

    // Previous NAD+ experience
    const previousNadQuestionId = require('uuid').v4();
    questions.push({
      id: previousNadQuestionId,
      questionText: 'Have you ever tried NAD+ before?',
      answerType: 'radio',
      isRequired: true,
      questionOrder: 1,
      stepId: experienceStepId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    ['Yes', 'No'].forEach((option, index) => {
      questionOptions.push({
        id: require('uuid').v4(),
        optionText: option,
        optionValue: option.toLowerCase(),
        optionOrder: index + 1,
        questionId: previousNadQuestionId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Benefits noticed
    questions.push({
      id: require('uuid').v4(),
      questionText: 'If yes, what benefits did you notice?',
      answerType: 'textarea',
      isRequired: false,
      questionOrder: 2,
      stepId: experienceStepId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Interest in NAD+
    questions.push({
      id: require('uuid').v4(),
      questionText: 'If no, what interests you most about NAD+?',
      answerType: 'textarea',
      isRequired: false,
      questionOrder: 3,
      stepId: experienceStepId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 8 - Treatment Preferences
    const preferencesStepId = steps[7].id;

    // Frequency
    const frequencyQuestionId = require('uuid').v4();
    questions.push({
      id: frequencyQuestionId,
      questionText: 'How often are you looking to use NAD+?',
      answerType: 'radio',
      isRequired: true,
      questionOrder: 1,
      stepId: preferencesStepId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const frequencies = ['One-time session (trial)', 'Monthly maintenance', 'Bi-weekly optimization', 'Weekly peak results'];
    frequencies.forEach((freq, index) => {
      questionOptions.push({
        id: require('uuid').v4(),
        optionText: freq,
        optionValue: freq.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_'),
        optionOrder: index + 1,
        questionId: frequencyQuestionId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Expected results
    const resultsQuestionId = require('uuid').v4();
    questions.push({
      id: resultsQuestionId,
      questionText: 'What kind of results are you hoping to achieve in the first 30 days?',
      answerType: 'checkbox',
      isRequired: true,
      questionOrder: 2,
      stepId: preferencesStepId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const expectedResults = ['More energy + focus', 'Better sleep + recovery', 'Longevity + anti-aging support', 'Mood + stress balance'];
    expectedResults.forEach((result, index) => {
      questionOptions.push({
        id: require('uuid').v4(),
        optionText: result,
        optionValue: result.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_'),
        optionOrder: index + 1,
        questionId: resultsQuestionId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Other results
    questions.push({
      id: require('uuid').v4(),
      questionText: 'Other results you hope to achieve (optional)',
      answerType: 'textarea',
      isRequired: false,
      questionOrder: 3,
      stepId: preferencesStepId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Insert all questions and options
    if (questions.length > 0) {
      await queryInterface.bulkInsert('Question', questions);
    }
    
    if (questionOptions.length > 0) {
      await queryInterface.bulkInsert('QuestionOption', questionOptions);
    }
  },

  async down(queryInterface, Sequelize) {
    // Delete in reverse order due to foreign key constraints
    await queryInterface.bulkDelete('QuestionOption', null, {});
    await queryInterface.bulkDelete('Question', null, {});
    await queryInterface.bulkDelete('QuestionnaireStep', null, {});
    await queryInterface.bulkDelete('Questionnaire', { title: 'NAD+ Intake Questionnaire' }, {});
  }
};