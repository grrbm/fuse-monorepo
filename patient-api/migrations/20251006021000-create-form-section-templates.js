'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FormSectionTemplates', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      sectionType: {
        type: Sequelize.ENUM('personalization', 'account', 'doctor'),
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      treatmentId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Treatments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      schema: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      version: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      publishedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      isActive: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
    })

    await queryInterface.addIndex('FormSectionTemplates', ['sectionType'])
    await queryInterface.addIndex('FormSectionTemplates', ['category'])
    await queryInterface.addIndex('FormSectionTemplates', ['treatmentId'])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('FormSectionTemplates', ['treatmentId'])
    await queryInterface.removeIndex('FormSectionTemplates', ['category'])
    await queryInterface.removeIndex('FormSectionTemplates', ['sectionType'])
    await queryInterface.dropTable('FormSectionTemplates')
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_FormSectionTemplates_sectionType\";")
  },
}

