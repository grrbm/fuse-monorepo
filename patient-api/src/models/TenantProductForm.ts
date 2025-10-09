import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript'
import Entity from './Entity'
import User from './User'
import Treatment from './Treatment'
import FormSectionTemplate from './FormSectionTemplate'

@Table({
  freezeTableName: true,
  tableName: 'TenantProductForms',
})
export default class TenantProductForm extends Entity {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare tenantId: string

  @BelongsTo(() => User)
  declare tenant: User

  @ForeignKey(() => Treatment)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare treatmentId: string

  @BelongsTo(() => Treatment)
  declare treatment: Treatment

  @ForeignKey(() => FormSectionTemplate)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare personalizationTemplateId: string

  @BelongsTo(() => FormSectionTemplate, 'personalizationTemplateId')
  declare personalizationTemplate: FormSectionTemplate

  @ForeignKey(() => FormSectionTemplate)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare accountTemplateId: string

  @BelongsTo(() => FormSectionTemplate, 'accountTemplateId')
  declare accountTemplate: FormSectionTemplate

  @ForeignKey(() => FormSectionTemplate)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare doctorTemplateId: string

  @BelongsTo(() => FormSectionTemplate, 'doctorTemplateId')
  declare doctorTemplate: FormSectionTemplate

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'layout_a',
  })
  declare layoutTemplate: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare themeId?: string | null

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare lockedUntil?: Date | null

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare publishedUrl?: string | null

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare lastPublishedAt?: Date | null

}

