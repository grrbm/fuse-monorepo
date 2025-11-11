'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('TenantProductForms', 'globalFormStructureId', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Links form to a specific Global Form Structure'
    });
    
    // Create index for better query performance
    await queryInterface.addIndex('TenantProductForms', ['globalFormStructureId'], {
      name: 'tenant_product_forms_structure_id_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('TenantProductForms', 'tenant_product_forms_structure_id_idx');
    await queryInterface.removeColumn('TenantProductForms', 'globalFormStructureId');
  }
};
