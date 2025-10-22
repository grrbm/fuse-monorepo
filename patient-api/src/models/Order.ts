import { Table, Column, DataType, ForeignKey, BelongsTo, HasMany, HasOne } from 'sequelize-typescript';
import Entity from './Entity';
import User from './User';
import Treatment from './Treatment';
import Clinic from './Clinic';
import Questionnaire from './Questionnaire';
import OrderItem from './OrderItem';
import ShippingAddress from './ShippingAddress';
import ShippingOrder from './ShippingOrder';
import Subscription from './Subscription';
import Payment from './Payment';
import Sale from './Sale';
import TreatmentPlan, { BillingInterval } from './TreatmentPlan';
import Physician from './Physician';
import TenantProduct from './TenantProduct';

export enum OrderStatus {
  PENDING = 'pending',
  PAYMENT_PROCESSING = 'payment_processing',
  PAID = 'paid',
  PAYMENT_DUE = 'payment_due',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}


@Table({
  freezeTableName: true,
  tableName: 'Order',
})
export default class Order extends Entity {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare orderNumber: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;

  @ForeignKey(() => Treatment)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare treatmentId?: string;

  @BelongsTo(() => Treatment)
  declare treatment?: Treatment;

  @ForeignKey(() => Clinic)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare clinicId?: string;

  @BelongsTo(() => Clinic)
  declare clinic?: Clinic;

  @ForeignKey(() => Questionnaire)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare questionnaireId?: string;

  @BelongsTo(() => Questionnaire)
  declare questionnaire?: Questionnaire;

  @ForeignKey(() => TreatmentPlan)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare treatmentPlanId?: string;

  @BelongsTo(() => TreatmentPlan)
  declare treatmentPlan?: TreatmentPlan;

  @ForeignKey(() => Physician)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare physicianId?: string;

  @BelongsTo(() => Physician)
  declare physician?: Physician;

  @Column({
    type: DataType.ENUM(...Object.values(OrderStatus)),
    allowNull: false,
    defaultValue: OrderStatus.PENDING,
  })
  declare status: OrderStatus;

  @Column({
    type: DataType.ENUM(...Object.values(BillingInterval)),
    allowNull: true,
  })
  declare billingInterval?: BillingInterval;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare subtotalAmount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  declare discountAmount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  declare taxAmount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  declare shippingAmount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare totalAmount: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare notes?: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare questionnaireAnswers?: Record<string, any>;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare shippedAt?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare deliveredAt?: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare paymentIntentId: string;

  @HasOne(() => Subscription)
  declare subscription?: Subscription;

  @HasOne(() => Payment, 'orderId')
  declare payment?: Payment;

  @HasMany(() => OrderItem)
  declare orderItems: OrderItem[];

  @HasOne(() => Sale, 'orderId')
  declare sale?: Sale;


  @ForeignKey(() => ShippingAddress)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare shippingAddressId?: string;

  @BelongsTo(() => ShippingAddress)
  declare shippingAddress: ShippingAddress;

  @HasMany(() => ShippingOrder)
  declare shippingOrders: ShippingOrder[];

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare mdCaseId?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare stripePriceId?: string;


  @ForeignKey(() => TenantProduct)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare tenantProductId?: string;

  @BelongsTo(() => TenantProduct)
  declare tenantProduct?: TenantProduct;




  // Static method to generate order number
  /**
   * Generate an order number without relying on OrderCounter
   * Format: ORD-YYYYMMDD-HHMMSS-XXXXXX
   */
  public static async generateOrderNumber(): Promise<string> {
    const now = new Date();
    const pad = (n: number, w: number = 2) => n.toString().padStart(w, '0');
    const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const rand = Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0');
    return `ORD-${date}-${time}-${rand}`;
  }

  // Calculate total amount from items
  public calculateTotal(): number {
    const subtotal = this.subtotalAmount || 0;
    const discount = this.discountAmount || 0;
    const tax = this.taxAmount || 0;
    const shipping = this.shippingAmount || 0;

    return subtotal - discount + tax + shipping;
  }

  // Update order status
  public async updateStatus(status: OrderStatus): Promise<void> {
    this.status = status;

    if (status === OrderStatus.SHIPPED) {
      this.shippedAt = new Date();
    } else if (status === OrderStatus.DELIVERED) {
      this.deliveredAt = new Date();
    }

    await this.save();
  }


}