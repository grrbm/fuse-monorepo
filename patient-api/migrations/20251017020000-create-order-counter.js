'use strict';

/**
 * Migration: Create OrderCounter table for platform-wide sequential order numbering
 * Format: ORD-1-000-000
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OrderCounter', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      counter: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Global sequential counter for all orders across platform',
      },
      lastUpdated: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create a single row to hold the counter
    await queryInterface.bulkInsert('OrderCounter', [{
      id: '00000000-0000-0000-0000-000000000001',
      counter: 0,
      lastUpdated: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('OrderCounter');
  }
};

