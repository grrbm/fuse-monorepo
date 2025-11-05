import { Table, Column, DataType, HasOne, HasMany } from 'sequelize-typescript';
import Entity from './Entity';
import Subscription from './Subscription';
import Treatment from './Treatment';
import TenantProduct from './TenantProduct';
import Sale from './Sale';


export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    PAYMENT_DUE = 'payment_due',
    CANCELLED = 'cancelled',
  }

@Table({
    freezeTableName: true,
})
export default class Clinic extends Entity {
    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    declare slug: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    declare logo: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare name: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
    })
    declare businessType?: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    declare isActive: boolean;

    @Column({
        type: DataType.ENUM(...Object.values(PaymentStatus)),
        allowNull: false,
        defaultValue: PaymentStatus.PENDING,
      })
      declare status: PaymentStatus;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    declare isCustomDomain: boolean;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare customDomain?: string;

    @Column({
        type: DataType.JSONB,
        allowNull: true,
    })
    declare globalFormStructures?: any[];

    // Stripe Connect fields
    @Column({
        type: DataType.STRING,
        allowNull: true,
        unique: true,
    })
    declare stripeAccountId?: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    declare stripeOnboardingComplete: boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    declare stripeDetailsSubmitted: boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    declare stripeChargesEnabled: boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    declare stripePayoutsEnabled: boolean;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare stripeAccountType?: string;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    declare stripeOnboardedAt?: Date;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare defaultFormColor?: string;

    @HasOne(() => Subscription)
    declare subscription?: Subscription;

    @HasMany(() => Treatment)
    declare treatments: Treatment[];

    @HasMany(() => TenantProduct)
    declare tenantProducts: TenantProduct[];

    @HasMany(() => Sale)
    declare sales: Sale[];

}