'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Find the Weight Loss 2 questionnaire steps
    const [steps] = await queryInterface.sequelize.query(`
      SELECT qs.id, qs.title, qs."stepOrder"
      FROM "QuestionnaireStep" qs
      JOIN "Questionnaire" q ON qs."questionnaireId" = q.id
      JOIN "Treatment" t ON q."treatmentId" = t.id
      WHERE t.name = 'Weight Loss 2'
      ORDER BY qs."stepOrder"
    `);
    
    if (steps.length === 0) {
      throw new Error('Weight Loss 2 questionnaire steps not found.');
    }
    
    console.log(`Found ${steps.length} steps`);

    // Map steps by their order for easier access
    const stepMap = {};
    steps.forEach(step => {
      stepMap[step.stepOrder] = step.id;
    });

    // Create questions in smaller batches
    const questions = [];

    // Step 1 Questions (Main goal)
    if (stepMap[1]) {
      questions.push({
        id: require('uuid').v4(),
        questionText: 'What is your main goal with weight loss medication?',
        answerType: 'radio',
        isRequired: true,
        questionOrder: 1,
        stepId: stepMap[1],
        helpText: 'Please select the primary reason you\'re seeking treatment.',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Step 2 Questions (Previous attempts)
    if (stepMap[2]) {
      questions.push({
        id: require('uuid').v4(),
        questionText: 'Have you tried losing weight before?',
        answerType: 'radio',
        isRequired: true,
        questionOrder: 1,
        stepId: stepMap[2],
        helpText: 'This helps us understand your journey.',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Step 3 Questions (Main difficulty)
    if (stepMap[3]) {
      questions.push({
        id: require('uuid').v4(),
        questionText: 'What is the main difficulty you face when trying to lose weight?',
        answerType: 'radio',
        isRequired: true,
        questionOrder: 1,
        stepId: stepMap[3],
        helpText: 'Select the one that applies most to you.',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Step 5 Questions (State selection)
    if (stepMap[5]) {
      questions.push({
        id: require('uuid').v4(),
        questionText: 'What state do you live in?',
        answerType: 'select',
        isRequired: true,
        questionOrder: 1,
        stepId: stepMap[5],
        helpText: 'We need to verify our services are available in your location.',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Step 6 Questions (Gender)
    if (stepMap[6]) {
      questions.push({
        id: require('uuid').v4(),
        questionText: "What's your gender at birth?",
        answerType: 'radio',
        isRequired: true,
        questionOrder: 1,
        stepId: stepMap[6],
        helpText: 'This helps us provide you with personalized care.',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Step 7 Questions (Date of birth)
    if (stepMap[7]) {
      questions.push({
        id: require('uuid').v4(),
        questionText: "What's your date of birth?",
        answerType: 'date',
        isRequired: true,
        questionOrder: 1,
        stepId: stepMap[7],
        helpText: 'We need to verify you\'re at least 18 years old.',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Step 8 Questions (Account creation)
    if (stepMap[8]) {
      questions.push(
        {
          id: require('uuid').v4(),
          questionText: 'First Name',
          answerType: 'text',
          isRequired: true,
          questionOrder: 1,
          stepId: stepMap[8],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: require('uuid').v4(),
          questionText: 'Last Name',
          answerType: 'text',
          isRequired: true,
          questionOrder: 2,
          stepId: stepMap[8],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: require('uuid').v4(),
          questionText: 'Email Address',
          answerType: 'email',
          isRequired: true,
          questionOrder: 3,
          stepId: stepMap[8],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: require('uuid').v4(),
          questionText: 'Mobile Number (US Only)',
          answerType: 'phone',
          isRequired: true,
          questionOrder: 4,
          stepId: stepMap[8],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      );
    }

    // Step 11 Questions (Height and Weight - BMI calculator)
    if (stepMap[11]) {
      questions.push(
        {
          id: require('uuid').v4(),
          questionText: 'Current Weight (pounds)',
          answerType: 'number',
          isRequired: true,
          questionOrder: 1,
          stepId: stepMap[11],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: require('uuid').v4(),
          questionText: 'Height (feet)',
          answerType: 'number',
          isRequired: true,
          questionOrder: 2,
          stepId: stepMap[11],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: require('uuid').v4(),
          questionText: 'Height (inches)',
          answerType: 'number',
          isRequired: true,
          questionOrder: 3,
          stepId: stepMap[11],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      );
    }

    // Step 12 Questions (Goal weight)
    if (stepMap[12]) {
      questions.push({
        id: require('uuid').v4(),
        questionText: 'Goal Weight (pounds)',
        answerType: 'number',
        isRequired: true,
        questionOrder: 1,
        stepId: stepMap[12],
        helpText: 'Enter your target weight in pounds.',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Step 13 Questions (Medical conditions - first set)
    if (stepMap[13]) {
      questions.push({
        id: require('uuid').v4(),
        questionText: 'Do you have any of these medical conditions?',
        answerType: 'checkbox',
        isRequired: true,
        questionOrder: 1,
        stepId: stepMap[13],
        helpText: 'This helps us ensure your safety and determine the best treatment option. Select all that apply.',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Step 14 Questions (Medical conditions - second set)
    if (stepMap[14]) {
      questions.push({
        id: require('uuid').v4(),
        questionText: 'Do you have any of these serious medical conditions?',
        answerType: 'checkbox',
        isRequired: true,
        questionOrder: 1,
        stepId: stepMap[14],
        helpText: 'This helps us ensure your safety and determine the best treatment option. Select all that apply.',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Step 15 Questions (Allergies)
    if (stepMap[15]) {
      questions.push({
        id: require('uuid').v4(),
        questionText: 'Are you allergic to any of the following?',
        answerType: 'checkbox',
        isRequired: true,
        questionOrder: 1,
        stepId: stepMap[15],
        helpText: 'Select all that apply to help us ensure your safety.',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Step 16 Questions (Current medications)
    if (stepMap[16]) {
      questions.push(
        {
          id: require('uuid').v4(),
          questionText: 'Are you currently taking any medications?',
          answerType: 'radio',
          isRequired: true,
          questionOrder: 1,
          stepId: stepMap[16],
          helpText: 'Please list all medications, vitamins, and supplements.',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: require('uuid').v4(),
          questionText: 'Please list all medications, vitamins, and supplements',
          answerType: 'textarea',
          isRequired: false,
          questionOrder: 2,
          stepId: stepMap[16],
          placeholder: 'Please list all medications, vitamins, and supplements you are currently taking...',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      );
    }

    // Step 17 Questions (Specific medications)
    if (stepMap[17]) {
      questions.push({
        id: require('uuid').v4(),
        questionText: 'Are you currently taking any of the following medications?',
        answerType: 'checkbox',
        isRequired: true,
        questionOrder: 1,
        stepId: stepMap[17],
        helpText: 'Select all that apply.',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Step 18 Questions (Weight loss medication history)
    if (stepMap[18]) {
      questions.push(
        {
          id: require('uuid').v4(),
          questionText: 'Have you taken weight loss medications before?',
          answerType: 'radio',
          isRequired: true,
          questionOrder: 1,
          stepId: stepMap[18],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: require('uuid').v4(),
          questionText: 'Which medication WERE YOU LAST ON?',
          answerType: 'radio',
          isRequired: false,
          questionOrder: 2,
          stepId: stepMap[18],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      );
    }

    console.log(`Inserting ${questions.length} questions`);

    // Insert questions in batches of 5 to avoid issues
    const batchSize = 5;
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);
      try {
        await queryInterface.bulkInsert('Question', batch);
        console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1} (${batch.length} questions)`);
      } catch (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
        throw error;
      }
    }

    console.log('✅ All Weight Loss 2 questions created successfully');
  },

  async down(queryInterface, Sequelize) {
    // Delete all questions for Weight Loss 2 questionnaire
    await queryInterface.sequelize.query(`
      DELETE FROM "Question" 
      WHERE "stepId" IN (
        SELECT qs.id FROM "QuestionnaireStep" qs
        JOIN "Questionnaire" q ON qs."questionnaireId" = q.id
        JOIN "Treatment" t ON q."treatmentId" = t.id
        WHERE t.name = 'Weight Loss 2'
      )
    `);
  }
};