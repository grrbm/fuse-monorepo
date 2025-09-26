import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Entity from './Entity';
import Clinic from './Clinic';
import Order from './Order';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAID = 'paid',
  PAYMENT_DUE = 'payment_due',
  CANCELLED = 'cancelled',
  SUBSCRIPTION_DELETED = 'deleted',
}



@Table({
  freezeTableName: true,
  tableName: 'Subscription',
})
export default class Subscription extends Entity {
  @ForeignKey(() => Clinic)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare clinicId?: string;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare orderId?: string;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentStatus)),
    allowNull: false,
    defaultValue: PaymentStatus.PENDING,
  })
  declare status: PaymentStatus;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare cancelledAt?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare paymentDue?: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
  })
  declare stripeSubscriptionId?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare paidAt?: Date;

  @BelongsTo(() => Clinic)
  declare clinic?: Clinic;

  @BelongsTo(() => Order)
  declare order?: Order;



  public async markSubAsPaid(): Promise<void> {
    this.status = PaymentStatus.PAID;
    this.paidAt = new Date()
    await this.save();
  }

  public async updateSubProcessing(stripeSubscriptionId: string): Promise<void> {
    this.stripeSubscriptionId = stripeSubscriptionId;
    this.status = PaymentStatus.PROCESSING;
    await this.save();
  }

  public async markSubAsCanceled(): Promise<void> {
    this.status = PaymentStatus.CANCELLED;
    this.cancelledAt = new Date()
    await this.save();
  }
   public async markSubAsDeleted(): Promise<void> {
    this.status = PaymentStatus.SUBSCRIPTION_DELETED;
    await this.save();
  }

  public async markSubAsPaymentDue(dueDate: Date): Promise<void> {
    this.status = PaymentStatus.PAYMENT_DUE;
    this.paymentDue = dueDate
    await this.save();
  }
}