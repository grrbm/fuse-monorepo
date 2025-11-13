import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript'
import Entity from './Entity'
import Sequence from './Sequence'
import Clinic from './Clinic'

export type SequenceRunStatus = 'pending' | 'processing' | 'completed' | 'failed'

@Table({
  freezeTableName: true,
  tableName: 'SequenceRuns'
})
export default class SequenceRun extends Entity {
  @ForeignKey(() => Sequence)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare sequenceId: string

  @BelongsTo(() => Sequence)
  declare sequence: Sequence

  @ForeignKey(() => Clinic)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  declare clinicId: string

  @BelongsTo(() => Clinic)
  declare clinic: Clinic

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  declare triggerEvent: string

  @Column({
    type: DataType.ENUM('pending', 'processing', 'completed', 'failed'),
    allowNull: false,
    defaultValue: 'pending'
  })
  declare status: SequenceRunStatus

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0
  })
  declare currentStepIndex: number

  @Column({
    type: DataType.JSONB,
    allowNull: true
  })
  declare payload?: Record<string, unknown> | null

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare startedAt?: Date | null

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare completedAt?: Date | null

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  declare failureReason?: string | null

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0
  })
  declare emailsSent: number

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0
  })
  declare smsSent: number

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0
  })
  declare emailsOpened: number

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0
  })
  declare emailsClicked: number
}

