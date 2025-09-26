import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Entity from './Entity';
import Order from './Order';
import ShippingAddress from './ShippingAddress';


export enum OrderShippingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Table({
  freezeTableName: true,
  tableName: 'ShippingOrder',
})
export default class ShippingOrder extends Entity {
  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare orderId: string;

  @BelongsTo(() => Order)
  declare order: Order;

  @ForeignKey(() => ShippingAddress)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare shippingAddressId: string;

  @BelongsTo(() => ShippingAddress)
  declare shippingAddress: ShippingAddress;

  @Column({
    type: DataType.ENUM(...Object.values(OrderShippingStatus)),
    allowNull: false,
    defaultValue: OrderShippingStatus.PENDING,
  })
  declare status: OrderShippingStatus;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare pharmacyOrderId?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare deliveredAt?: Date;

  // Update shipping status
  public async updateStatus(status: OrderShippingStatus): Promise<void> {
    this.status = status;

    if (status === OrderShippingStatus.DELIVERED) {
      this.deliveredAt = new Date();
    }

    await this.save();
  }
}