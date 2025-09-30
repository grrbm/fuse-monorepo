import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript'
import Entity from './Entity'
import User from './User'
import Treatment from './Treatment'

@Table({
    freezeTableName: true,
    tableName: 'BrandTreatments',
    indexes: [
        {
            unique: true,
            fields: ['userId', 'treatmentId'],
            name: 'brand_treatments_user_treatment_unique',
        },
    ],
})
export default class BrandTreatment extends Entity {
    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare userId: string

    @BelongsTo(() => User)
    declare user: User

    @ForeignKey(() => Treatment)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare treatmentId: string

    @BelongsTo(() => Treatment)
    declare treatment: Treatment

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare brandLogo?: string

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare brandColor?: string
}
