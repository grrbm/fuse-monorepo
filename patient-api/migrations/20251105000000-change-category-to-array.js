'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Create a temporary column for the array
    await queryInterface.addColumn('Product', 'categories_temp', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
      comment: 'Product categories as array'
    });

    // Step 2: Migrate existing category data to the new array column
    // If a product has a category, move it to the array format
    await queryInterface.sequelize.query(`
      UPDATE "Product" 
      SET "categories_temp" = ARRAY[category::text] 
      WHERE category IS NOT NULL;
    `);

    // Step 3: Drop the old category column (and its ENUM constraint)
    await queryInterface.removeColumn('Product', 'category');

    // Step 4: Rename the temporary column to 'categories'
    await queryInterface.renameColumn('Product', 'categories_temp', 'categories');
  },

  async down(queryInterface, Sequelize) {
    // Rollback: Convert array back to single enum value
    
    // Step 1: Re-create the category ENUM type if it doesn't exist
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_Product_category" AS ENUM (
          'weight_loss',
          'hair_growth',
          'performance',
          'sexual_health',
          'skincare',
          'wellness',
          'other'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Step 2: Add back the old category column
    await queryInterface.addColumn('Product', 'category', {
      type: Sequelize.ENUM(
        'weight_loss',
        'hair_growth',
        'performance',
        'sexual_health',
        'skincare',
        'wellness',
        'other'
      ),
      allowNull: true
    });

    // Step 3: Migrate the first category from array back to single value
    await queryInterface.sequelize.query(`
      UPDATE "Product" 
      SET category = categories[1]::enum_Product_category
      WHERE categories IS NOT NULL AND array_length(categories, 1) > 0;
    `);

    // Step 4: Drop the categories array column
    await queryInterface.removeColumn('Product', 'categories');
  }
};

