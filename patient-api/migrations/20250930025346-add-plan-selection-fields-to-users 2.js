'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'selectedPlanCategory', { type: Sequelize.STRING(100), allowNull: true })
    await queryInterface.addColumn('users', 'selectedPlanType', { type: Sequelize.STRING(100), allowNull: true })
    await queryInterface.addColumn('users', 'selectedPlanName', { type: Sequelize.STRING(255), allowNull: true })
    await queryInterface.addColumn('users', 'selectedPlanPrice', { type: Sequelize.DECIMAL(10, 2), allowNull: true })
    await queryInterface.addColumn('users', 'selectedDownpaymentType', { type: Sequelize.STRING(100), allowNull: true })
    await queryInterface.addColumn('users', 'selectedDownpaymentName', { type: Sequelize.STRING(255), allowNull: true })
    await queryInterface.addColumn('users', 'selectedDownpaymentPrice', { type: Sequelize.DECIMAL(10, 2), allowNull: true })
    await queryInterface.addColumn('users', 'planSelectionTimestamp', { type: Sequelize.DATE, allowNull: true })
    await queryInterface.addColumn('users', 'businessType', { type: Sequelize.STRING(100), allowNull: true })
    await queryInterface.addColumn('clinics', 'businessType', { type: Sequelize.STRING(100), allowNull: true })
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('users', 'selectedPlanCategory')
    await queryInterface.removeColumn('users', 'selectedPlanType')
    await queryInterface.removeColumn('users', 'selectedPlanName')
    await queryInterface.removeColumn('users', 'selectedPlanPrice')
    await queryInterface.removeColumn('users', 'selectedDownpaymentType')
    await queryInterface.removeColumn('users', 'selectedDownpaymentName')
    await queryInterface.removeColumn('users', 'selectedDownpaymentPrice')
    await queryInterface.removeColumn('users', 'planSelectionTimestamp')
    await queryInterface.removeColumn('users', 'businessType')
    await queryInterface.removeColumn('clinics', 'businessType')
  }
}
