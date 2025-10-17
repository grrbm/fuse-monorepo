'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Product', 'pharmacyVendor', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Pharmacy provider (e.g., AbsoluteRx, PharmacyA, PharmacyB)',
    });

    await queryInterface.addColumn('Product', 'pharmacyWholesaleCost', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Wholesale cost from pharmacy (what tenant pays)',
    });

    await queryInterface.addColumn('Product', 'medicationSize', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Medication size/strength (e.g., "10mg", "50ml", "100 tablets")',
    });

    await queryInterface.addColumn('Product', 'category', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Product category (weight_loss, hair_growth, performance, sexual_health, etc)',
    });

    await queryInterface.addColumn('Product', 'requiredDoctorQuestions', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of mandatory doctor question IDs or schema for this product',
    });

    await queryInterface.addColumn('Product', 'pharmacyApiConfig', {
      type: Sequelize.JSONB,
      allowNull: true,
      comment: 'Pharmacy-specific API configuration and metadata',
    });

    await queryInterface.addColumn('Product', 'isActive', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether product is currently available for selection',
    });

    await queryInterface.addColumn('Product', 'suggestedRetailPrice', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Suggested retail price for tenant reference',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Product', 'pharmacyVendor');
    await queryInterface.removeColumn('Product', 'pharmacyWholesaleCost');
    await queryInterface.removeColumn('Product', 'medicationSize');
    await queryInterface.removeColumn('Product', 'category');
    await queryInterface.removeColumn('Product', 'requiredDoctorQuestions');
    await queryInterface.removeColumn('Product', 'pharmacyApiConfig');
    await queryInterface.removeColumn('Product', 'isActive');
    await queryInterface.removeColumn('Product', 'suggestedRetailPrice');
  }
};


