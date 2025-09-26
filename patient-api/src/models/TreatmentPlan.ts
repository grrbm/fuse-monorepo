import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Entity from './Entity';
import Treatment from './Treatment';

export enum BillingInterval {
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    BIANNUAL = 'biannual',
    ANNUAL = 'annual'
}

@Table({
    freezeTableName: true,
})
export default class TreatmentPlan extends Entity {
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare name: string; // e.g., "Monthly Plan", "Quarterly Plan"

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare description?: string;

    @Column({
        type: DataType.ENUM(...Object.values(BillingInterval)),
        allowNull: false,
    })
    declare billingInterval: BillingInterval;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare stripePriceId: string; // Stripe price ID for this plan

    @Column({
        type: DataType.FLOAT,
        allowNull: false,
    })
    declare price: number; // Price for display purposes

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    })
    declare active: boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    declare popular: boolean; // Mark as "Most Popular" plan

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
    })
    declare sortOrder: number; // For ordering plans in UI

    @ForeignKey(() => Treatment)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare treatmentId: string;

    @BelongsTo(() => Treatment)
    declare treatment: Treatment;
}