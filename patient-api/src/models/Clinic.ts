import { Table, Column, DataType, HasOne, HasMany } from 'sequelize-typescript';
import Entity from './Entity';
import Subscription from './Subscription';
import Treatment from './Treatment';


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
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    declare active: string;

    @Column({
        type: DataType.ENUM(...Object.values(PaymentStatus)),
        allowNull: false,
        defaultValue: PaymentStatus.PENDING,
      })
      declare status: PaymentStatus;

    @HasOne(() => Subscription)
    declare subscription?: Subscription;

    @HasMany(() => Treatment)
    declare treatments: Treatment[];

}