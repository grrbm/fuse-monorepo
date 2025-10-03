import { Table, Column, DataType, ForeignKey, BelongsTo, Model, CreatedAt, UpdatedAt, DeletedAt } from 'sequelize-typescript';
import User from './User';
import { PharmacyProvider } from './Product';

/**
 * UserPatient model
 * Stores pharmacy provider-specific patient IDs for users
 * Composite primary key: (userId, pharmacyProvider)
 */
@Table({
  freezeTableName: true,
  tableName: 'UserPatient',
})
export default class UserPatient extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
  })
  declare userId: string;

  @Column({
    type: DataType.ENUM(...Object.values(PharmacyProvider)),
    allowNull: false,
    primaryKey: true,
  })
  declare pharmacyProvider: PharmacyProvider;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare pharmacyPatientId: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare metadata?: Record<string, any>;

  @BelongsTo(() => User)
  declare user: User;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare updatedAt: Date;

  @DeletedAt
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare deletedAt: Date | null;
}
