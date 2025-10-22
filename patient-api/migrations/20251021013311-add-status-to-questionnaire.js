'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add status ENUM type (only if it doesn't exist)
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_Questionnaire_status" AS ENUM ('in_progress', 'ready_for_review', 'ready');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Add status column to Questionnaire table (only if it doesn't exist)
    const tableDescription = await queryInterface.describeTable('Questionnaire');
    if (!tableDescription.status) {
      await queryInterface.addColumn('Questionnaire', 'status', {
        type: Sequelize.ENUM('in_progress', 'ready_for_review', 'ready'),
        allowNull: false,
        defaultValue: 'in_progress',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove status column
    await queryInterface.removeColumn('Questionnaire', 'status');

    // Drop the ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_Questionnaire_status";
    `);
  }
};

