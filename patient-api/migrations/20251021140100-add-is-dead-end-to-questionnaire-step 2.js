'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add isDeadEnd column to QuestionnaireStep table (only if it doesn't exist)
    const tableDescription = await queryInterface.describeTable('QuestionnaireStep');
    if (!tableDescription.isDeadEnd) {
      await queryInterface.addColumn('QuestionnaireStep', 'isDeadEnd', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });

      // Add index for efficient filtering of dead end steps
      await queryInterface.addIndex('QuestionnaireStep', ['isDeadEnd'], {
        name: 'idx_questionnaire_step_is_dead_end',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove index
    await queryInterface.removeIndex('QuestionnaireStep', 'idx_questionnaire_step_is_dead_end');

    // Remove isDeadEnd column
    await queryInterface.removeColumn('QuestionnaireStep', 'isDeadEnd');
  }
};

