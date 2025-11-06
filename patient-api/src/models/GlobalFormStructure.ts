import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript'
import Entity from './Entity'
import Clinic from './Clinic'

@Table({
  freezeTableName: true,
  tableName: 'GlobalFormStructures',
  paranoid: true, // Enables soft deletes
})
export default class GlobalFormStructure extends Entity {
  @ForeignKey(() => Clinic)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare clinicId: string

  @BelongsTo(() => Clinic)
  declare clinic: Clinic

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare structureId: string // e.g., "default", "payment-first"

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description?: string

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: [],
  })
  declare sections: Array<{
    id: string
    type: 'product_questions' | 'category_questions' | 'account_creation' | 'checkout'
    label: string
    description: string
    order: number
    enabled: boolean
    icon: string
  }>

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isDefault: boolean

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare isActive: boolean
}

