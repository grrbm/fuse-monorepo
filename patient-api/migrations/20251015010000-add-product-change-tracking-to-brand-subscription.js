"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add lastProductChangeAt (timestamp) and productsChangedAmountOnCurrentCycle (int)
    await queryInterface.addColumn("BrandSubscription", "lastProductChangeAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn(
      "BrandSubscription",
      "productsChangedAmountOnCurrentCycle",
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("BrandSubscription", "productsChangedAmountOnCurrentCycle");
    await queryInterface.removeColumn("BrandSubscription", "lastProductChangeAt");
  },
};


