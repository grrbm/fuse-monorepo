import { Table, Column, DataType, Model } from 'sequelize-typescript';

@Table({
  tableName: 'FormAnalyticsDaily',
  freezeTableName: true,
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['tenantId', 'productId', 'formId', 'date'],
    },
    {
      fields: ['tenantId', 'date'],
    },
    {
      fields: ['date'],
    },
  ],
})
export default class FormAnalyticsDaily extends Model {
  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  declare date: string; // '2025-11-20'

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare tenantId: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare productId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare formId: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare views: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  declare conversions: number;
}

