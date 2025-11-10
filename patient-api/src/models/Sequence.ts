import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript'
import Entity from './Entity'
import Clinic from './Clinic'
import User from './User'

@Table({
  freezeTableName: true,
  tableName: 'Sequences'
})
export default class Sequence extends Entity {
  @ForeignKey(() => Clinic)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare clinicId: string

  @BelongsTo(() => Clinic)
  declare clinic: Clinic

  @Column({
    type: DataType.STRING(150),
    allowNull: false
  })
  declare name: string

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  declare description?: string

  @Column({
    type: DataType.ENUM('draft', 'active', 'paused', 'archived'),
    allowNull: false,
    defaultValue: 'draft'
  })
  declare status: 'draft' | 'active' | 'paused' | 'archived'

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: {}
  })
  declare trigger: Record<string, unknown>

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: []
  })
  declare steps: Array<Record<string, unknown>>

  @Column({
    type: DataType.JSONB,
    allowNull: true
  })
  declare audience?: Record<string, unknown>

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: {}
  })
  declare analytics: Record<string, unknown>

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true
  })
  declare isActive: boolean

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare createdBy: string

  @BelongsTo(() => User, 'createdBy')
  declare creator: User

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true
  })
  declare updatedBy?: string

  @BelongsTo(() => User, 'updatedBy')
  declare updater?: User
}


