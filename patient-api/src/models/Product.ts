import { Table, Column, DataType, BelongsToMany, HasMany } from 'sequelize-typescript';
import Entity from './Entity';
import Prescription from './Prescription';
import PrescriptionProducts from './PrescriptionProducts';
import Treatment from './Treatment';
import TreatmentProducts from './TreatmentProducts';

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
        type: DataType.UUID,
        allowNull: true,
    })
    declare clinicId?: string;

    @BelongsToMany(() => Prescription, () => PrescriptionProducts)
    declare prescriptions: Prescription[];

    @HasMany(() => PrescriptionProducts)
    declare prescriptionProducts: PrescriptionProducts[];

    @BelongsToMany(() => Treatment, () => TreatmentProducts)
    declare treatments: Treatment[];

    @HasMany(() => TreatmentProducts)
    declare treatmentProducts: TreatmentProducts[];
}
