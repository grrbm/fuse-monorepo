import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript'
import Entity from './Entity'
import User from './User'
import Treatment from './Treatment'
import Product from './Product'
import Questionnaire from './Questionnaire'
import Clinic from './Clinic'

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

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare productId: string

  @BelongsTo(() => Product)
  declare product: Product

  @ForeignKey(() => Questionnaire)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare questionnaireId: string

  @BelongsTo(() => Questionnaire)
  declare questionnaire: Questionnaire

  @ForeignKey(() => Clinic)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare clinicId: string

  @BelongsTo(() => Clinic)
  declare clinic: Clinic

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

