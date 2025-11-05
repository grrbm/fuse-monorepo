'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Clinic', 'globalFormStructures', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
    
    console.log('✅ Added globalFormStructures column to Clinic table');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Clinic', 'globalFormStructures');
    
    console.log('✅ Removed globalFormStructures column from Clinic table');
  }
};

