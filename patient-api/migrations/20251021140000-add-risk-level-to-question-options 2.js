'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add riskLevel ENUM type (only if it doesn't exist)
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_QuestionOption_riskLevel" AS ENUM ('safe', 'review', 'reject');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Add riskLevel column to QuestionOption table (only if it doesn't exist)
    const tableDescription = await queryInterface.describeTable('QuestionOption');
    if (!tableDescription.riskLevel) {
      await queryInterface.addColumn('QuestionOption', 'riskLevel', {
        type: Sequelize.ENUM('safe', 'review', 'reject'),
        allowNull: true,
        defaultValue: null,
      });

      // Add index for efficient filtering by riskLevel
      await queryInterface.addIndex('QuestionOption', ['riskLevel'], {
        name: 'idx_question_option_risk_level',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove index
    await queryInterface.removeIndex('QuestionOption', 'idx_question_option_risk_level');

    // Remove riskLevel column
    await queryInterface.removeColumn('QuestionOption', 'riskLevel');

    // Drop the ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_QuestionOption_riskLevel";
    `);
  }
};

