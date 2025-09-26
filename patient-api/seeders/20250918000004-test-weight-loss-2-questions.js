'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Find the Weight Loss 2 questionnaire and get the first step
    const [questionnaires] = await queryInterface.sequelize.query(`
      SELECT q.id as questionnaire_id, qs.id as step_id, qs.title as step_title
      FROM "Questionnaire" q
      JOIN "Treatment" t ON q."treatmentId" = t.id
      JOIN "QuestionnaireStep" qs ON qs."questionnaireId" = q.id
      WHERE t.name = 'Weight Loss 2'
      ORDER BY qs."stepOrder"
      LIMIT 1
    `);
    
    if (questionnaires.length === 0) {
      throw new Error('Weight Loss 2 questionnaire or steps not found.');
    }
    
    const stepId = questionnaires[0].step_id;
    console.log('Found step ID:', stepId);

    // Create just one test question
    const testQuestion = {
      id: require('uuid').v4(),
      questionText: 'What is your main goal with weight loss medication?',
      answerType: 'radio',
      isRequired: true,
      questionOrder: 1,
      stepId: stepId,
      helpText: 'Please select the primary reason you\'re seeking treatment.',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await queryInterface.bulkInsert('Question', [testQuestion]);
    console.log('✅ Test question created successfully');
  },

  async down(queryInterface, Sequelize) {
    // Delete test questions
    await queryInterface.bulkDelete('Question', { 
      questionText: 'What is your main goal with weight loss medication?' 
    });
  }
};