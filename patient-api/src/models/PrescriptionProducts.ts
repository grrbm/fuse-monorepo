import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Entity from './Entity';
import Product from './Product';
import Prescription from './Prescription';

@Table({
    freezeTableName: true,
})
export default class PrescriptionProducts extends Entity {
    @ForeignKey(() => Prescription)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare prescriptionId: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare quantity: number;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare pharmacyProductId?: string;

    @ForeignKey(() => Product)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare productId: string;

    @BelongsTo(() => Product)
    declare product: Product;

    @BelongsTo(() => Prescription)
    declare prescription: Prescription;
}