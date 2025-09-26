'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Find the Weight Loss 2 treatment
    const [treatments] = await queryInterface.sequelize.query(`
      SELECT id FROM "Treatment" WHERE name = 'Weight Loss 2'
    `);
    
    if (treatments.length === 0) {
      throw new Error('Weight Loss 2 treatment not found. Please ensure treatments are seeded first.');
    }
    
    const weightLoss2TreatmentId = treatments[0].id;

    // Create the questionnaire
    const questionnaireId = require('uuid').v4();
    await queryInterface.bulkInsert('Questionnaire', [{
      id: questionnaireId,
      title: 'Weight Loss Assessment',
      description: 'Complete your personalized weight loss evaluation',
      treatmentId: weightLoss2TreatmentId,
      checkoutStepPosition: 20, // Checkout after all questions
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // Create questionnaire steps
    const steps = [];
    
    // Step 1: Main goal
    const step1Id = require('uuid').v4();
    steps.push({
      id: step1Id,
      title: 'Your Weight Loss Goals',
      description: 'What is your main goal with weight loss medication?',
      stepOrder: 1,
      questionnaireId: questionnaireId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 2: Previous attempts
    const step2Id = require('uuid').v4();
    steps.push({
      id: step2Id,
      title: 'Weight Loss History',
      description: 'Have you tried losing weight before?',
      stepOrder: 2,
      questionnaireId: questionnaireId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 3: Main difficulty
    const step3Id = require('uuid').v4();
    steps.push({
      id: step3Id,
      title: 'Challenges You Face',
      description: 'What is the main difficulty you face when trying to lose weight?',
      stepOrder: 3,
      questionnaireId: questionnaireId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 4: Information about medication effectiveness
    const step4Id = require('uuid').v4();
    steps.push({
      id: step4Id,
      title: 'Treatment Information',
      description: '83% of HeyFeels patients report that weight loss medication helps them achieve their goals more effectively.',
      stepOrder: 4,
      questionnaireId: questionnaireId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 5: State selection
    const step5Id = require('uuid').v4();
    steps.push({
      id: step5Id,
      title: 'Location Verification',
      description: 'What state do you live in?',
      stepOrder: 5,
      questionnaireId: questionnaireId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 6: Gender
    const step6Id = require('uuid').v4();
    steps.push({
      id: step6Id,
      title: 'Personal Information',
      description: "What's your gender at birth?",
      stepOrder: 6,
      questionnaireId: questionnaireId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 7: Date of birth
    const step7Id = require('uuid').v4();
    steps.push({
      id: step7Id,
      title: 'Age Verification',
      description: "What's your date of birth?",
      stepOrder: 7,
      questionnaireId: questionnaireId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 8: Account creation
    const step8Id = require('uuid').v4();
    steps.push({
      id: step8Id,
      title: 'Create Your Account',
      description: "We'll use this information to set up your personalized care plan",
      stepOrder: 8,
      questionnaireId: questionnaireId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 9: Welcome message
    const step9Id = require('uuid').v4();
    steps.push({
      id: step9Id,
      title: 'Welcome!',
      description: "We're excited to partner with you on your personalized weight loss journey.",
      stepOrder: 9,
      questionnaireId: questionnaireId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 10: Success stories
    const step10Id = require('uuid').v4();
    steps.push({
      id: step10Id,
      title: 'Success Stories',
      description: 'Real customers who have achieved amazing results with HeyFeels',
      stepOrder: 10,
      questionnaireId: questionnaireId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 11: Height and weight
    const step11Id = require('uuid').v4();
    steps.push({
      id: step11Id,
      title: 'Body Measurements',
      description: 'What is your current height and weight?',
      stepOrder: 11,
      questionnaireId: questionnaireId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 12: Goal weight
    const step12Id = require('uuid').v4();
    steps.push({
      id: step12Id,
      title: 'Target Weight',
      description: 'What is your goal weight?',
      stepOrder: 12,
      questionnaireId: questionnaireId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 13: Medical conditions (first set)
    const step13Id = require('uuid').v4();
    steps.push({
      id: step13Id,
      title: 'Medical History - General',
      description: 'Do you have any of these medical conditions?',
      stepOrder: 13,
      questionnaireId: questionnaireId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 14: Medical conditions (second set)
    const step14Id = require('uuid').v4();
    steps.push({
      id: step14Id,
      title: 'Medical History - Specific',
      description: 'Do you have any of these medical conditions?',
      stepOrder: 14,
      questionnaireId: questionnaireId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 15: Allergies
    const step15Id = require('uuid').v4();
    steps.push({
      id: step15Id,
      title: 'Allergies',
      description: 'Are you allergic to any of the following?',
      stepOrder: 15,
      questionnaireId: questionnaireId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 16: Current medications
    const step16Id = require('uuid').v4();
    steps.push({
      id: step16Id,
      title: 'Current Medications',
      description: 'Are you currently taking any medications?',
      stepOrder: 16,
      questionnaireId: questionnaireId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 17: Specific medications
    const step17Id = require('uuid').v4();
    steps.push({
      id: step17Id,
      title: 'Diabetes Medications',
      description: 'Are you currently taking any of the following medications?',
      stepOrder: 17,
      questionnaireId: questionnaireId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 18: Weight loss medication history
    const step18Id = require('uuid').v4();
    steps.push({
      id: step18Id,
      title: 'Weight Loss Medication History',
      description: 'Have you taken weight loss medications before?',
      stepOrder: 18,
      questionnaireId: questionnaireId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 19: Treatment recommendation
    const step19Id = require('uuid').v4();
    steps.push({
      id: step19Id,
      title: 'Recommended Treatment',
      description: 'Based on your assessment, our providers recommend this treatment',
      stepOrder: 19,
      questionnaireId: questionnaireId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await queryInterface.bulkInsert('QuestionnaireStep', steps);

    // Now create questions for each step
    const questions = [];

    // Step 1 Questions
    questions.push({
      id: require('uuid').v4(),
      questionText: 'What is your main goal with weight loss medication?',
      answerType: 'radio',
      isRequired: true,
      questionOrder: 1,
      stepId: step1Id,
      helpText: 'Please select the primary reason you\'re seeking treatment.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 2 Questions
    questions.push({
      id: require('uuid').v4(),
      questionText: 'Have you tried losing weight before?',
      answerType: 'radio',
      isRequired: true,
      questionOrder: 1,
      stepId: step2Id,
      helpText: 'This helps us understand your journey.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 3 Questions
    questions.push({
      id: require('uuid').v4(),
      questionText: 'What is the main difficulty you face when trying to lose weight?',
      answerType: 'radio',
      isRequired: true,
      questionOrder: 1,
      stepId: step3Id,
      helpText: 'Select the one that applies most to you.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 4 is informational only (no questions)

    // Step 5 Questions  
    questions.push({
      id: require('uuid').v4(),
      questionText: 'What state do you live in?',
      answerType: 'select',
      isRequired: true,
      questionOrder: 1,
      stepId: step5Id,
      helpText: 'We need to verify our services are available in your location.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 6 Questions
    questions.push({
      id: require('uuid').v4(),
      questionText: 'What\'s your gender at birth?',
      answerType: 'radio',
      isRequired: true,
      questionOrder: 1,
      stepId: step6Id,
      helpText: 'This helps us provide you with personalized care.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 7 Questions
    questions.push({
      id: require('uuid').v4(),
      questionText: 'What\'s your date of birth?',
      answerType: 'date',
      isRequired: true,
      questionOrder: 1,
      stepId: step7Id,
      helpText: 'We need to verify you\'re at least 18 years old.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 8 Questions
    questions.push({
      id: require('uuid').v4(),
      questionText: 'First Name',
      answerType: 'text',
      isRequired: true,
      questionOrder: 1,
      stepId: step8Id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    questions.push({
      id: require('uuid').v4(),
      questionText: 'Last Name',
      answerType: 'text',
      isRequired: true,
      questionOrder: 2,
      stepId: step8Id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    questions.push({
      id: require('uuid').v4(),
      questionText: 'Email Address',
      answerType: 'email',
      isRequired: true,
      questionOrder: 3,
      stepId: step8Id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    questions.push({
      id: require('uuid').v4(),
      questionText: 'Mobile Number (US Only)',
      answerType: 'phone',
      isRequired: true,
      questionOrder: 4,
      stepId: step8Id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 9 is informational only (welcome message)

    // Step 10 is custom component (success stories carousel)

    // Step 11 Questions (Height and Weight - BMI calculator)
    questions.push({
      id: require('uuid').v4(),
      questionText: 'Current Weight (pounds)',
      answerType: 'number',
      isRequired: true,
      questionOrder: 1,
      stepId: step11Id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    questions.push({
      id: require('uuid').v4(),
      questionText: 'Height (feet)',
      answerType: 'number',
      isRequired: true,
      questionOrder: 2,
      stepId: step11Id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    questions.push({
      id: require('uuid').v4(),
      questionText: 'Height (inches)',
      answerType: 'number',
      isRequired: true,
      questionOrder: 3,
      stepId: step11Id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 12 Questions
    questions.push({
      id: require('uuid').v4(),
      questionText: 'Goal Weight (pounds)',
      answerType: 'number',
      isRequired: true,
      questionOrder: 1,
      stepId: step12Id,
      helpText: 'Enter your target weight in pounds.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 13 Questions (Medical conditions - first set)
    questions.push({
      id: require('uuid').v4(),
      questionText: 'Do you have any of these medical conditions?',
      answerType: 'checkbox',
      isRequired: true,
      questionOrder: 1,
      stepId: step13Id,
      helpText: 'This helps us ensure your safety and determine the best treatment option. Select all that apply.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 14 Questions (Medical conditions - second set)
    questions.push({
      id: require('uuid').v4(),
      questionText: 'Do you have any of these serious medical conditions?',
      answerType: 'checkbox',
      isRequired: true,
      questionOrder: 1,
      stepId: step14Id,
      helpText: 'This helps us ensure your safety and determine the best treatment option. Select all that apply.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 15 Questions (Allergies)
    questions.push({
      id: require('uuid').v4(),
      questionText: 'Are you allergic to any of the following?',
      answerType: 'checkbox',
      isRequired: true,
      questionOrder: 1,
      stepId: step15Id,
      helpText: 'Select all that apply to help us ensure your safety.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 16 Questions (Current medications)
    questions.push({
      id: require('uuid').v4(),
      questionText: 'Are you currently taking any medications?',
      answerType: 'radio',
      isRequired: true,
      questionOrder: 1,
      stepId: step16Id,
      helpText: 'Please list all medications, vitamins, and supplements.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    questions.push({
      id: require('uuid').v4(),
      questionText: 'Please list all medications, vitamins, and supplements',
      answerType: 'textarea',
      isRequired: false,
      questionOrder: 2,
      stepId: step16Id,
      placeholder: 'Please list all medications, vitamins, and supplements you are currently taking...',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 17 Questions (Specific medications)
    questions.push({
      id: require('uuid').v4(),
      questionText: 'Are you currently taking any of the following medications?',
      answerType: 'checkbox',
      isRequired: true,
      questionOrder: 1,
      stepId: step17Id,
      helpText: 'Select all that apply.',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 18 Questions (Weight loss medication history)
    questions.push({
      id: require('uuid').v4(),
      questionText: 'Have you taken weight loss medications before?',
      answerType: 'radio',
      isRequired: true,
      questionOrder: 1,
      stepId: step18Id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    questions.push({
      id: require('uuid').v4(),
      questionText: 'Which medication WERE YOU LAST ON?',
      answerType: 'radio',
      isRequired: false,
      questionOrder: 2,
      stepId: step18Id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Step 19 is product selection/treatment recommendation (custom component)

    await queryInterface.bulkInsert('Question', questions);

    console.log('✅ Weight Loss 2 questionnaire and questions created successfully');
  },

  async down(queryInterface, Sequelize) {
    // Delete in reverse order due to foreign key constraints
    await queryInterface.bulkDelete('Question', null, {});
    await queryInterface.bulkDelete('QuestionnaireStep', null, {});
    await queryInterface.bulkDelete('Questionnaire', { title: 'Weight Loss Assessment' }, {});
  }
};