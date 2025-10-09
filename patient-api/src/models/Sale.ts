import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Entity from './Entity';
import Order from './Order';
import Clinic from './Clinic';

@Table({
  freezeTableName: true,
  tableName: 'Sale',
})
export default class Sale extends Entity {
  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
  })
  declare orderId: string;

  @BelongsTo(() => Order, 'orderId')
  declare order: Order;

  @ForeignKey(() => Clinic)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare clinicId: string;

  @BelongsTo(() => Clinic, 'clinicId')
  declare clinic: Clinic;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare salePrice: number;




}
