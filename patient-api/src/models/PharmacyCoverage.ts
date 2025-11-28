import { Table, Column, DataType, ForeignKey, BelongsTo, HasMany, Model } from 'sequelize-typescript';
import Product from './Product';
import Pharmacy from './Pharmacy';
import PharmacyProduct from './PharmacyProduct';

@Table({
    freezeTableName: true,
    tableName: 'PharmacyCoverage',
    timestamps: true,
})
export default class PharmacyCoverage extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    declare id: string;

    @ForeignKey(() => Product)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare productId: string;

    @BelongsTo(() => Product)
    declare product: Product;

    @ForeignKey(() => Pharmacy)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare pharmacyId: string;

    @BelongsTo(() => Pharmacy)
    declare pharmacy: Pharmacy;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare customName: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    declare customSig: string;

    @HasMany(() => PharmacyProduct)
    declare assignments: PharmacyProduct[];
}


