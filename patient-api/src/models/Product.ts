import { Table, Column, DataType, BelongsToMany, HasMany } from 'sequelize-typescript';
import Entity from './Entity';
import Prescription from './Prescription';
import PrescriptionProducts from './PrescriptionProducts';
import Treatment from './Treatment';
import TreatmentProducts from './TreatmentProducts';
import TenantProduct from './TenantProduct';

export enum PharmacyProvider {
    ABSOLUTERX = 'absoluterx',
    TRUEPILL = 'truepill',
    PILLPACK = 'pillpack',
}




@Table({
    freezeTableName: true,
})
export default class Product extends Entity {
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare name: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare description: string;

    @Column({
        type: DataType.FLOAT,
        allowNull: false,
    })
    declare price: number;

    @Column({
        type: DataType.ARRAY(DataType.STRING),
        allowNull: false,
    })
    declare activeIngredients: string[];

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare dosage: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare imageUrl?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare pharmacyProductId?: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    })
    declare active: boolean;


    @Column({
        type: DataType.ENUM(...Object.values(PharmacyProvider)),
        allowNull: false,
        defaultValue: PharmacyProvider.ABSOLUTERX
    })
    declare pharmacyProvider: PharmacyProvider;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare pharmacyVendor?: string;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: true,
    })
    declare pharmacyWholesaleCost?: number;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare medicationSize?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare category?: string;

    @Column({
        type: DataType.JSONB,
        allowNull: true,
        defaultValue: [],
    })
    declare requiredDoctorQuestions?: any[];

    @Column({
        type: DataType.JSONB,
        allowNull: true,
    })
    declare pharmacyApiConfig?: Record<string, any>;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    })
    declare isActive: boolean;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: true,
    })
    declare suggestedRetailPrice?: number;

    @BelongsToMany(() => Prescription, () => PrescriptionProducts)
    declare prescriptions: Prescription[];

    @HasMany(() => PrescriptionProducts)
    declare prescriptionProducts: PrescriptionProducts[];

    @BelongsToMany(() => Treatment, () => TreatmentProducts)
    declare treatments: Treatment[];

    @HasMany(() => TreatmentProducts)
    declare treatmentProducts: TreatmentProducts[];

    @HasMany(() => TenantProduct)
    declare tenantProducts: TenantProduct[];
}
