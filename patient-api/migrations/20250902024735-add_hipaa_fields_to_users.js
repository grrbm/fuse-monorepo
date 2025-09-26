"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "dob", {
      type: Sequelize.DATEONLY, // Only date, no time
      allowNull: true,
    });

    await queryInterface.addColumn("users", "phoneNumber", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("users", "address", {
      type: Sequelize.TEXT, // can hold full address
      allowNull: true,
    });

    await queryInterface.addColumn("users", "role", {
      type: Sequelize.ENUM("patient", "doctor", "admin"),
      allowNull: false,
      defaultValue: "patient",
    });

    await queryInterface.addColumn("users", "lastLoginAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("users", "consentGivenAt", {
      type: Sequelize.DATE,
      allowNull: true, // set when patient accepts HIPAA consent
    });

    await queryInterface.addColumn("users", "emergencyContact", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "dob");
    await queryInterface.removeColumn("users", "phoneNumber");
    await queryInterface.removeColumn("users", "address");
    await queryInterface.removeColumn("users", "role");
    await queryInterface.removeColumn("users", "lastLoginAt");
    await queryInterface.removeColumn("users", "consentGivenAt");
    await queryInterface.removeColumn("users", "emergencyContact");
  },
};
