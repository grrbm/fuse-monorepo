'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add separate address fields for better data structure
    await queryInterface.addColumn('users', 'city', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'User city for HIPAA-compliant address management'
    });

    await queryInterface.addColumn('users', 'state', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'User state for HIPAA-compliant address management'
    });

    await queryInterface.addColumn('users', 'zipCode', {
      type: Sequelize.STRING(10),
      allowNull: true,
      comment: 'User ZIP code for HIPAA-compliant address management'
    });
  },

  async down (queryInterface) {
    // Remove the added address fields
    await queryInterface.removeColumn('users', 'city');
    await queryInterface.removeColumn('users', 'state');
    await queryInterface.removeColumn('users', 'zipCode');
  }
};
