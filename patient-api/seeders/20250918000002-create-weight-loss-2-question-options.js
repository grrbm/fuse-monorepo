'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get the Weight Loss 2 questionnaire
    const [questionnaires] = await queryInterface.sequelize.query(`
      SELECT q.id as questionnaire_id, t.name as treatment_name
      FROM "Questionnaire" q
      JOIN "Treatment" t ON q."treatmentId" = t.id
      WHERE t.name = 'Weight Loss 2'
    `);
    
    if (questionnaires.length === 0) {
      throw new Error('Weight Loss 2 questionnaire not found. Please ensure questionnaire is seeded first.');
    }
    
    const questionnaireId = questionnaires[0].questionnaire_id;
    console.log('Found questionnaire ID:', questionnaireId);

    // Get all questions for this questionnaire
    const questions = await queryInterface.sequelize.query(
      `SELECT q.id, q."questionText", qs."stepOrder"
       FROM "Question" q
       JOIN "QuestionnaireStep" qs ON q."stepId" = qs.id
       WHERE qs."questionnaireId" = ?
       ORDER BY qs."stepOrder", q."questionOrder"`,
      {
        replacements: [questionnaireId],
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );

    console.log('Found questions:', questions.length);

    const questionOptions = [];

    // Helper function to add options for a question
    const addOptionsForQuestion = (questionText, options) => {
      const question = questions.find(q => q.questionText === questionText);
      if (question) {
        options.forEach((option, index) => {
          questionOptions.push({
            id: require('uuid').v4(),
            optionText: option.text,
            optionValue: option.value || option.text,
            optionOrder: index + 1,
            questionId: question.id,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        });
      }
    };

    // Step 1: Main goal options
    addOptionsForQuestion('What is your main goal with weight loss medication?', [
      { text: 'Improve health' },
      { text: 'Feel better about myself' },
      { text: 'Improve quality of life' },
      { text: 'All of the above' }
    ]);

    // Step 2: Previous attempts options
    addOptionsForQuestion('Have you tried losing weight before?', [
      { text: 'Yes, I have tried diets, exercises, or other methods.' },
      { text: 'No, this is my first time actively trying to lose weight.' }
    ]);

    // Step 3: Main difficulty options
    addOptionsForQuestion('What is the main difficulty you face when trying to lose weight?', [
      { text: 'Dealing with hunger/cravings' },
      { text: 'Not knowing what to eat' },
      { text: 'It was taking too long' },
      { text: 'Not staying motivated' },
      { text: 'All of the above' }
    ]);

    // Step 5: State options (all US states)
    const usStates = [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
      'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
      'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
      'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
      'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
      'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
      'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
      'Wisconsin', 'Wyoming'
    ];
    
    addOptionsForQuestion('What state do you live in?', 
      usStates.map(state => ({ text: state }))
    );

    // Step 6: Gender options
    addOptionsForQuestion("What's your gender at birth?", [
      { text: 'Male' },
      { text: 'Female' }
    ]);

    // Step 13: Medical conditions (first set) options
    addOptionsForQuestion('Do you have any of these medical conditions?', [
      { text: 'None of the above' },
      { text: 'Gallbladder disease or removal' },
      { text: 'Hypertension' },
      { text: 'High cholesterol or triglycerides' },
      { text: 'Sleep apnea' },
      { text: 'Osteoarthritis' },
      { text: 'Mobility issues due to weight' },
      { text: 'GERD' },
      { text: 'PCOS with insulin resistance' },
      { text: 'Liver disease or NAFLD' },
      { text: 'Heart disease' },
      { text: 'Metabolic syndrome' },
      { text: 'Chronic kidney disease (Stage 3+)' },
      { text: 'SIADH' },
      { text: 'Thyroid conditions' },
      { text: 'Prediabetes' },
      { text: 'Type 2 diabetes' },
      { text: 'Gastroparesis' },
      { text: "IBD (Crohn's or Colitis)" }
    ]);

    // Step 14: Medical conditions (second set) options
    addOptionsForQuestion('Do you have any of these serious medical conditions?', [
      { text: 'None of the above' },
      { text: 'Gastroparesis (Paralysis of your intestines)' },
      { text: 'Triglycerides over 600 at any point' },
      { text: 'Pancreatic cancer' },
      { text: 'Pancreatitis' },
      { text: 'Type 1 Diabetes' },
      { text: 'Hypoglycemia (low blood sugar)' },
      { text: 'Insulin-dependent diabetes' },
      { text: 'Thyroid cancer' },
      { text: 'Family history of thyroid cancer' },
      { text: 'Personal or family history of Multiple Endocrine Neoplasia (MEN-2) syndrome' },
      { text: 'Anorexia or bulimia' },
      { text: 'Current symptomatic gallstones' }
    ]);

    // Step 15: Allergies options
    addOptionsForQuestion('Are you allergic to any of the following?', [
      { text: 'None of the above' },
      { text: 'Ozempic (Semaglutide)' },
      { text: 'Wegovy (Semaglutide)' },
      { text: 'Zepbound (Tirzepatide)' },
      { text: 'Mounjaro (Tirzepatide)' },
      { text: 'Saxenda (Liraglutide)' },
      { text: 'Trulicity (Dulaglutide)' }
    ]);

    // Step 16: Current medications options
    addOptionsForQuestion('Are you currently taking any medications?', [
      { text: "No, I don't take any medications" },
      { text: 'Yes, I take medications' }
    ]);

    // Step 17: Specific medications options
    addOptionsForQuestion('Are you currently taking any of the following medications?', [
      { text: 'None of the above' },
      { text: 'Insulin' },
      { text: 'Glimepiride (Amaryl)' },
      { text: 'Meglitinides (e.g., repaglinide, nateglinide)' },
      { text: 'Glipizide' },
      { text: 'Glyburide' },
      { text: 'Sitagliptin' },
      { text: 'Saxagliptin' },
      { text: 'Linagliptin' },
      { text: 'Alogliptin' }
    ]);

    // Step 18: Weight loss medication history options
    addOptionsForQuestion('Have you taken weight loss medications before?', [
      { text: "No, I haven't taken weight loss medications" },
      { text: 'Yes, I have taken weight loss medications before.' }
    ]);

    addOptionsForQuestion('Which medication WERE YOU LAST ON?', [
      { text: 'Semaglutide (Ozempic, Wegovy)' },
      { text: 'Liraglutide (Saxenda, Victoza)' },
      { text: 'Tirzepatide (Mounjaro, Zepbound)' },
      { text: 'Other weight loss medication' }
    ]);

    await queryInterface.bulkInsert('QuestionOption', questionOptions);

    console.log('✅ Weight Loss 2 question options created successfully');
  },

  async down(queryInterface, Sequelize) {
    // Delete all question options for this questionnaire
    await queryInterface.sequelize.query(
      `DELETE FROM "QuestionOption" 
       WHERE "questionId" IN (
         SELECT q.id FROM "Question" q
         JOIN "QuestionnaireStep" qs ON q."stepId" = qs.id
         JOIN "Questionnaire" quest ON qs."questionnaireId" = quest.id
         JOIN "Treatment" t ON quest."treatmentId" = t.id
         WHERE t.name = ?
       )`,
      {
        replacements: ['Weight Loss 2'],
        type: queryInterface.sequelize.QueryTypes.DELETE
      }
    );
  }
};