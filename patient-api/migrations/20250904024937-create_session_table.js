'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // HIPAA-compliant session storage table
    await queryInterface.createTable('session', {
      sid: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },
      sess: {
        type: Sequelize.JSONB, // Use JSONB for better performance
        allowNull: false,
      },
      expire: {
        type: Sequelize.DATE(6), // Include milliseconds for precision
        allowNull: false,
      },
    });

    // Add index for automatic session cleanup
    await queryInterface.addIndex('session', ['expire'], {
      name: 'idx_session_expire'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('session');
  }
};
