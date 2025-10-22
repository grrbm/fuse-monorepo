'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add conditionalLogic column to QuestionnaireStep table (only if it doesn't exist)
    const tableDescription = await queryInterface.describeTable('QuestionnaireStep');
    if (!tableDescription.conditionalLogic) {
      await queryInterface.addColumn('QuestionnaireStep', 'conditionalLogic', {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove conditionalLogic column
    await queryInterface.removeColumn('QuestionnaireStep', 'conditionalLogic');
  }
};

