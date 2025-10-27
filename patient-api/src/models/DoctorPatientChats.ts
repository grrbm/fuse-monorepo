import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Entity from './Entity';
import User from './User';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderRole: 'doctor' | 'patient';
  message: string;
  createdAt: string;
  read: boolean;
}

@Table({
  freezeTableName: true,
  tableName: 'DoctorPatientChats',
})
export default class DoctorPatientChats extends Entity {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare doctorId: string;

  @BelongsTo(() => User, 'doctorId')
  declare doctor: User;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true, // Un paciente solo puede tener un doctor
  })
  declare patientId: string;

  @BelongsTo(() => User, 'patientId')
  declare patient: User;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: [],
  })
  declare messages: ChatMessage[];

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare lastMessageAt?: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare unreadCountDoctor: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare unreadCountPatient: number;
}

