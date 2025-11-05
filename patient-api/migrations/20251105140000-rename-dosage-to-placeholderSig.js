'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Rename dosage column to placeholderSig in Product table using raw SQL
      await queryInterface.sequelize.query(
        'ALTER TABLE "Product" RENAME COLUMN "dosage" TO "placeholderSig";',
        { transaction }
      );
      
      // Rename dosage column to placeholderSig in TreatmentProducts table
      await queryInterface.sequelize.query(
        'ALTER TABLE "TreatmentProducts" RENAME COLUMN "dosage" TO "placeholderSig";',
        { transaction }
      );
      
      // Rename dosage column to placeholderSig in OrderItem table
      await queryInterface.sequelize.query(
        'ALTER TABLE "OrderItem" RENAME COLUMN "dosage" TO "placeholderSig";',
        { transaction }
      );
      
      await transaction.commit();
      console.log('✅ Renamed dosage columns to placeholderSig across Product, TreatmentProducts, and OrderItem tables');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Revert: Rename placeholderSig back to dosage in OrderItem table
      await queryInterface.sequelize.query(
        'ALTER TABLE "OrderItem" RENAME COLUMN "placeholderSig" TO "dosage";',
        { transaction }
      );
      
      // Revert: Rename placeholderSig back to dosage in TreatmentProducts table
      await queryInterface.sequelize.query(
        'ALTER TABLE "TreatmentProducts" RENAME COLUMN "placeholderSig" TO "dosage";',
        { transaction }
      );
      
      // Revert: Rename placeholderSig back to dosage in Product table
      await queryInterface.sequelize.query(
        'ALTER TABLE "Product" RENAME COLUMN "placeholderSig" TO "dosage";',
        { transaction }
      );
      
      await transaction.commit();
      console.log('✅ Reverted placeholderSig columns back to dosage');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};

