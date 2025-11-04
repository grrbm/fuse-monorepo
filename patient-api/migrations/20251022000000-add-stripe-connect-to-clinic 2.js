"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add Stripe Connect fields to Clinic table
    await queryInterface.addColumn("Clinic", "stripeAccountId", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
      comment: "Stripe Connect account ID for receiving payouts"
    });

    await queryInterface.addColumn("Clinic", "stripeOnboardingComplete", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Whether Stripe Connect onboarding is complete"
    });

    await queryInterface.addColumn("Clinic", "stripeDetailsSubmitted", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Whether account details have been submitted to Stripe"
    });

    await queryInterface.addColumn("Clinic", "stripeChargesEnabled", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Whether the account can receive charges"
    });

    await queryInterface.addColumn("Clinic", "stripePayoutsEnabled", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Whether the account can receive payouts"
    });

    await queryInterface.addColumn("Clinic", "stripeAccountType", {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "Type of Stripe Connect account (express, standard, custom)"
    });

    await queryInterface.addColumn("Clinic", "stripeOnboardedAt", {
      type: Sequelize.DATE,
      allowNull: true,
      comment: "Timestamp when Stripe onboarding was completed"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Clinic", "stripeOnboardedAt");
    await queryInterface.removeColumn("Clinic", "stripeAccountType");
    await queryInterface.removeColumn("Clinic", "stripePayoutsEnabled");
    await queryInterface.removeColumn("Clinic", "stripeChargesEnabled");
    await queryInterface.removeColumn("Clinic", "stripeDetailsSubmitted");
    await queryInterface.removeColumn("Clinic", "stripeOnboardingComplete");
    await queryInterface.removeColumn("Clinic", "stripeAccountId");
  },
};

