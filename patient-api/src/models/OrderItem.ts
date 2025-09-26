import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Entity from './Entity';
import Order from './Order';
import Product from './Product';

@Table({
  freezeTableName: true,
  tableName: 'OrderItem',
})
export default class OrderItem extends Entity {
  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare orderId: string;

  @BelongsTo(() => Order)
  declare order: Order;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare productId: string;

  @BelongsTo(() => Product)
  declare product: Product;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  })
  declare quantity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare unitPrice: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare totalPrice: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare dosage?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare notes?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
})
declare pharmacyProductId: string;
// TODO: review and Add these fields here
  //   refills
  // days_supply
  // sig

  // Calculate total price based on quantity and unit price
  public calculateTotalPrice(): number {
    return this.quantity * this.unitPrice;
  }

  // Hook to automatically calculate total price before saving
  public async beforeSave(): Promise<void> {
    this.totalPrice = this.calculateTotalPrice();
  }
}