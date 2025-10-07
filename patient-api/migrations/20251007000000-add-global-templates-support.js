'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add isGlobal flag to FormSectionTemplate
    await queryInterface.addColumn('FormSectionTemplate', 'isGlobal', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'If true, this template is a master template available to all tenants'
    });

    // Add tenantId to FormSectionTemplate
    await queryInterface.addColumn('FormSectionTemplate', 'tenantId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'User',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'The tenant that created this template. NULL for global templates.'
    });

    // Create index for faster queries
    await queryInterface.addIndex('FormSectionTemplate', ['isGlobal']);
    await queryInterface.addIndex('FormSectionTemplate', ['tenantId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('FormSectionTemplate', ['tenantId']);
    await queryInterface.removeIndex('FormSectionTemplate', ['isGlobal']);
    await queryInterface.removeColumn('FormSectionTemplate', 'tenantId');
    await queryInterface.removeColumn('FormSectionTemplate', 'isGlobal');
  }
};

