import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript'
import Entity from './Entity'
import Treatment from './Treatment'
import User from './User'

export type FormSectionType = 'personalization' | 'account' | 'doctor'

@Table({
  freezeTableName: true,
})
export default class FormSectionTemplate extends Entity {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description?: string | null

  @Column({
    type: DataType.ENUM('personalization', 'account', 'doctor'),
    allowNull: false,
  })
  declare sectionType: FormSectionType

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare category?: string | null

  @ForeignKey(() => Treatment)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare treatmentId?: string | null

  @BelongsTo(() => Treatment)
  declare treatment?: Treatment | null

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  declare schema: Record<string, any>

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
  })
  declare version: number

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare publishedAt?: Date | null

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare isActive: boolean

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isGlobal: boolean

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare tenantId?: string | null

  @BelongsTo(() => User)
  declare tenant?: User | null
}

