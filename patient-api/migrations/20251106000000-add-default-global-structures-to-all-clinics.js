'use strict';

/**
 * Migration: Add default global form structures to all clinics
 * 
 * Purpose: Ensure all clinics have at least the default global form structure
 * so that form auto-creation works uniformly across all tenants.
 * 
 * Date: November 6, 2025
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔄 Adding default global form structures to clinics without them...');

    // Default global form structure that all clinics should have
    const defaultStructure = JSON.stringify([
      {
        id: 'default',
        name: 'Default Flow',
        description: 'Standard questionnaire flow for all products',
        sections: [
          {
            id: 'product',
            type: 'product_questions',
            label: 'Product Questions',
            description: 'Questions specific to each individual product',
            order: 1,
            enabled: true,
            icon: '📦'
          },
          {
            id: 'category',
            type: 'category_questions',
            label: 'Standardized Category Questions',
            description: 'Questions shared across all products in a category',
            order: 2,
            enabled: true,
            icon: '📋'
          },
          {
            id: 'account',
            type: 'account_creation',
            label: 'Create Account',
            description: 'Patient information collection',
            order: 3,
            enabled: true,
            icon: '👤'
          },
          {
            id: 'checkout',
            type: 'checkout',
            label: 'Payment & Checkout',
            description: 'Billing and shipping',
            order: 4,
            enabled: true,
            icon: '💳'
          }
        ],
        isDefault: true,
        createdAt: new Date().toISOString()
      }
    ]);

    // Update all clinics that have NULL globalFormStructures
    await queryInterface.sequelize.query(`
      UPDATE "Clinic"
      SET "globalFormStructures" = '${defaultStructure}'::jsonb
      WHERE "globalFormStructures" IS NULL;
    `);

    // Count how many were updated
    const [results] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) as count
      FROM "Clinic"
      WHERE "globalFormStructures" IS NOT NULL;
    `);

    console.log(`✅ Updated clinics. Total clinics with global structures: ${results[0].count}`);

    // Set default value for future clinics
    await queryInterface.sequelize.query(`
      ALTER TABLE "Clinic" 
      ALTER COLUMN "globalFormStructures" 
      SET DEFAULT '${defaultStructure}'::jsonb;
    `);

    console.log('✅ Set default value for globalFormStructures column');
    console.log('✅ All future clinics will automatically get default structure');
  },

  down: async (queryInterface, Sequelize) => {
    console.log('⚠️  Rolling back default global structures...');

    // Remove the default value
    await queryInterface.sequelize.query(`
      ALTER TABLE "Clinic" 
      ALTER COLUMN "globalFormStructures" 
      DROP DEFAULT;
    `);

    console.log('✅ Removed default value from globalFormStructures column');
    console.log('⚠️  Note: Existing clinic structures were NOT removed (data safety)');
  }
};

