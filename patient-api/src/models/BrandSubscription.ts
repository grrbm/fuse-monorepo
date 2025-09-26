import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Entity from './Entity';
import User from './User';

export enum BrandSubscriptionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  ACTIVE = 'active',
  PAYMENT_DUE = 'payment_due',
  CANCELLED = 'cancelled',
}

export enum BrandSubscriptionPlanType {
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

@Table({
  freezeTableName: true,
  tableName: 'BrandSubscription',
})
export default class BrandSubscription extends Entity {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare planType: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: BrandSubscriptionStatus.PENDING,
  })
  declare status: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
  })
  declare stripeSubscriptionId?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare stripeCustomerId?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare stripePriceId?: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare monthlyPrice: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare currentPeriodStart?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare currentPeriodEnd?: Date;

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
    type: DataType.DATE,
    allowNull: true,
  })
  declare trialStart?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare trialEnd?: Date;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare features?: Record<string, any>;

  @BelongsTo(() => User)
  declare user?: User;

  // Instance methods
  public async activate(stripeData: {
    subscriptionId: string;
    customerId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  }): Promise<void> {
    await this.update({
      status: BrandSubscriptionStatus.ACTIVE,
      stripeSubscriptionId: stripeData.subscriptionId,
      stripeCustomerId: stripeData.customerId,
      currentPeriodStart: stripeData.currentPeriodStart,
      currentPeriodEnd: stripeData.currentPeriodEnd,
    });
  }

  public async cancel(): Promise<void> {
    await this.update({
      status: BrandSubscriptionStatus.CANCELLED,
      cancelledAt: new Date(),
    });
  }

  public isActive(): boolean {
    return this.status === BrandSubscriptionStatus.ACTIVE;
  }

  public isTrialing(): boolean {
    if (!this.trialStart || !this.trialEnd) return false;
    const now = new Date();
    return now >= this.trialStart && now <= this.trialEnd;
  }

  public daysUntilRenewal(): number {
    if (!this.currentPeriodEnd) return 0;
    const now = new Date();
    const diffTime = this.currentPeriodEnd.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public async getPlanDetails() {
    // Import here to avoid circular dependency
    const BrandSubscriptionPlans = await import('./BrandSubscriptionPlans');
    return await BrandSubscriptionPlans.default.getPlanByType(this.planType);
  }

  public async updateProcessing(subscriptionId: string): Promise<void> {
    await this.update({
      status: BrandSubscriptionStatus.PROCESSING,
      stripeSubscriptionId: subscriptionId,
    });
  }

  public async markPaymentDue(validUntil: Date): Promise<void> {
    await this.update({
      status: BrandSubscriptionStatus.PAYMENT_DUE,
      paymentDue: validUntil,
    });
  }

  public async markPastDue(): Promise<void> {
    await this.update({
      status: BrandSubscriptionStatus.PAYMENT_DUE, // Using PAYMENT_DUE as past due status
      paymentDue: new Date(),
    });
  }
}