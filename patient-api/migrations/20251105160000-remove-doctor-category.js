'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Migrate existing 'doctor' category steps to 'normal'
      await queryInterface.sequelize.query(
        `UPDATE "QuestionnaireStep" SET category = 'normal' WHERE category = 'doctor';`,
        { transaction }
      );
      
      // Migrate existing 'doctor' formTemplateType questionnaires to 'normal'
      await queryInterface.sequelize.query(
        `UPDATE "Questionnaire" SET "formTemplateType" = 'normal' WHERE "formTemplateType" = 'doctor';`,
        { transaction }
      );
      
      await transaction.commit();
      console.log('✅ Migrated doctor category to normal - removed redundancy');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Note: Cannot reliably revert as we don't know which were originally 'doctor' vs 'normal'
    console.log('⚠️ Rollback not supported for this migration');
  }
};

