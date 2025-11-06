import { Table, Column, DataType, ForeignKey, BelongsTo, Model } from 'sequelize-typescript';
import Pharmacy from './Pharmacy';
import Product from './Product';

@Table({
    freezeTableName: true,
    tableName: 'PharmacyProduct',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['productId', 'state'],
            name: 'unique_product_state'
        }
    ]
})
export default class PharmacyProduct extends Model {
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

    @ForeignKey(() => Pharmacy)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare pharmacyId: string;

    @Column({
        type: DataType.STRING(2), // US state code (e.g., 'CA', 'NY')
        allowNull: false,
    })
    declare state: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare pharmacyProductId?: string; // SKU or ID from pharmacy system

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare pharmacyProductName?: string; // Product name from pharmacy system

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: true,
    })
    declare pharmacyWholesaleCost?: number;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare sig?: string; // Medication instructions (Sig) from pharmacy

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare rxId?: string; // RX ID from pharmacy

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare form?: string; // Medication form (e.g., Injectable)

    @BelongsTo(() => Product)
    declare product: Product;

    @BelongsTo(() => Pharmacy)
    declare pharmacy: Pharmacy;
}

