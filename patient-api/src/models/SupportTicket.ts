import { Table, Column, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import Entity from './Entity';
import User from './User';
import Clinic from './Clinic';
import TicketMessage from './TicketMessage';

export enum TicketStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TicketCategory {
  TECHNICAL = 'technical',
  BILLING = 'billing',
  GENERAL = 'general',
  FEATURE_REQUEST = 'feature_request'
}

@Table({
  freezeTableName: true,
  tableName: 'support_tickets',
})
export default class SupportTicket extends Entity {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200],
    },
  })
  declare title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  })
  declare description: string;

  @Column({
    type: DataType.ENUM(...Object.values(TicketStatus)),
    allowNull: false,
    defaultValue: TicketStatus.NEW,
  })
  declare status: TicketStatus;

  @Column({
    type: DataType.ENUM(...Object.values(TicketPriority)),
    allowNull: false,
    defaultValue: TicketPriority.MEDIUM,
  })
  declare priority: TicketPriority;

  @Column({
    type: DataType.ENUM(...Object.values(TicketCategory)),
    allowNull: false,
    defaultValue: TicketCategory.GENERAL,
  })
  declare category: TicketCategory;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare authorId: string;

  @BelongsTo(() => User, 'authorId')
  declare author: User;

  @ForeignKey(() => Clinic)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare clinicId?: string;

  @BelongsTo(() => Clinic, 'clinicId')
  declare clinic?: Clinic;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare assignedToId?: string;

  @BelongsTo(() => User, 'assignedToId')
  declare assignedTo?: User;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare assignedTeam?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare resolvedAt?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare closedAt?: Date;

  @HasMany(() => TicketMessage, 'ticketId')
  declare messages: TicketMessage[];

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare messageCount: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: [],
  })
  declare tags?: string[];

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare metadata?: Record<string, any>;
}

