'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Fix questionnaires that have a productId but are marked as templates
    // These should be product-specific forms, not reusable templates
    await queryInterface.sequelize.query(`
      UPDATE "Questionnaire"
      SET "isTemplate" = false
      WHERE "productId" IS NOT NULL
        AND "isTemplate" = true
        AND "formTemplateType" = 'normal';
    `);

    console.log('✅ Fixed product-specific questionnaires: set isTemplate=false for forms with productId');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert: set back to isTemplate = true for questionnaires with productId
    await queryInterface.sequelize.query(`
      UPDATE "Questionnaire"
      SET "isTemplate" = true
      WHERE "productId" IS NOT NULL
        AND "isTemplate" = false
        AND "formTemplateType" = 'normal';
    `);

    console.log('✅ Reverted product-specific questionnaires back to isTemplate=true');
  }
};


