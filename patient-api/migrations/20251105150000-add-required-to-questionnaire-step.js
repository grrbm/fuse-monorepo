'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('QuestionnaireStep', 'required', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
    
    console.log('✅ Added required column to QuestionnaireStep table (default: true)');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('QuestionnaireStep', 'required');
    
    console.log('✅ Removed required column from QuestionnaireStep table');
  }
};

