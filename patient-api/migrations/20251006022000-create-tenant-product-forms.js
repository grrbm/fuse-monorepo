'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TenantProductForms', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true,
      },
      tenantId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      treatmentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Treatments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      doctorTemplateId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'FormSectionTemplates',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      personalizationTemplateId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'FormSectionTemplates',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      accountTemplateId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'FormSectionTemplates',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      layoutTemplate: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'layout_a',
      },
      themeId: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      lockedUntil: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      publishedUrl: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      lastPublishedAt: {
        type: Sequelize.DATE,
        allowNull: true,
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
    })

    await queryInterface.addConstraint('TenantProductForms', {
      fields: ['tenantId', 'treatmentId'],
      type: 'unique',
      name: 'tenant_product_forms_tenant_treatment_unique',
    })

    await queryInterface.addIndex('TenantProductForms', ['tenantId'])
    await queryInterface.addIndex('TenantProductForms', ['treatmentId'])
    await queryInterface.addIndex('TenantProductForms', ['layoutTemplate'])
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('TenantProductForms', ['layoutTemplate'])
    await queryInterface.removeIndex('TenantProductForms', ['treatmentId'])
    await queryInterface.removeIndex('TenantProductForms', ['tenantId'])
    await queryInterface.removeConstraint('TenantProductForms', 'tenant_product_forms_tenant_treatment_unique')
    await queryInterface.dropTable('TenantProductForms')
  },
}


