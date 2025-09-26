import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Entity from './Entity';
import Product from './Product';
import Treatment from './Treatment';

@Table({
    freezeTableName: true,
})
export default class TreatmentProducts extends Entity {
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare dosage: string;

    // @Column({
    //     type: DataType.INTEGER,
    //     allowNull: false,
    // })
    // declare numberOfDoses: number;

    // @Column({
    //     type: DataType.DATE,
    //     allowNull: false,
    // })
    // declare nextDose: Date;

    @ForeignKey(() => Product)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare productId: string;

    @BelongsTo(() => Product)
    declare product: Product;

    @ForeignKey(() => Treatment)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare treatmentId: string;

    @BelongsTo(() => Treatment)
    declare treatment: Treatment;
}