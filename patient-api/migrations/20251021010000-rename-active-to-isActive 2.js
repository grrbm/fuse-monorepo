"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = ["Clinic", "Product", "TenantProduct", "Treatment", "TreatmentPlan"];

    for (const table of tables) {
      // Step 1: Add isActive column
      await queryInterface.addColumn(table, "isActive", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: table === "Clinic" || table === "Treatment" ? false : true,
      });

      // Step 2: Copy data from active to isActive
      await queryInterface.sequelize.query(
        `UPDATE "${table}" SET "isActive" = active WHERE active IS NOT NULL`
      );

      // Step 3: Remove old active column
      await queryInterface.removeColumn(table, "active");
    }
  },

  async down(queryInterface, Sequelize) {
    const tables = ["Clinic", "Product", "TenantProduct", "Treatment", "TreatmentPlan"];

    for (const table of tables) {
      // Step 1: Add active column back
      await queryInterface.addColumn(table, "active", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: table === "Clinic" || table === "Treatment" ? false : true,
      });

      // Step 2: Copy data from isActive back to active
      await queryInterface.sequelize.query(
        `UPDATE "${table}" SET active = "isActive" WHERE "isActive" IS NOT NULL`
      );

      // Step 3: Remove isActive column
      await queryInterface.removeColumn(table, "isActive");
    }
  },
};

