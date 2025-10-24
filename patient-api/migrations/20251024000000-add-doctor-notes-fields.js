'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add doctorNotes column (JSONB array to store multiple notes with timestamps)
    await queryInterface.addColumn('Order', 'doctorNotes', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: null,
      comment: 'Array of doctor notes with timestamp, doctorId, and note text'
    });

    // Add autoApproved column (boolean to track if order was auto-approved)
    await queryInterface.addColumn('Order', 'autoApproved', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      comment: 'Indicates if order was automatically approved by the system'
    });

    // Add autoApprovalReason column (text to store reason for auto-approval)
    await queryInterface.addColumn('Order', 'autoApprovalReason', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
      comment: 'Reason why the order was automatically approved'
    });

    console.log('✅ Added doctorNotes, autoApproved, and autoApprovalReason columns to Order table');
  },

  async down(queryInterface, Sequelize) {
    // Remove columns in reverse order
    await queryInterface.removeColumn('Order', 'autoApprovalReason');
    await queryInterface.removeColumn('Order', 'autoApproved');
    await queryInterface.removeColumn('Order', 'doctorNotes');

    console.log('✅ Removed doctorNotes, autoApproved, and autoApprovalReason columns from Order table');
  }
};

