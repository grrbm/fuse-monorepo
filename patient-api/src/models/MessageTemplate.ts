import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Entity from './Entity';
import Clinic from './Clinic';
import User from './User';

@Table({
    freezeTableName: true,
    tableName: 'MessageTemplates',
    paranoid: true, // Enable soft delete
})
export default class MessageTemplate extends Entity {
    @ForeignKey(() => Clinic)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare clinicId: string;

    @BelongsTo(() => Clinic)
    declare clinic: Clinic;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    declare name: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare description?: string;

    @Column({
        type: DataType.STRING(10),
        allowNull: false,
    })
    declare type: 'email' | 'sms';

    @Column({
        type: DataType.STRING(500),
        allowNull: true,
    })
    declare subject?: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    declare body: string;

    @Column({
        type: DataType.STRING(50),
        allowNull: true,
    })
    declare category?: string;

    @Column({
        type: DataType.ARRAY(DataType.TEXT),
        allowNull: true,
        defaultValue: [],
    })
    declare mergeFields: string[];

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    })
    declare isActive: boolean;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 1,
    })
    declare version: number;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare createdBy: string;

    @BelongsTo(() => User, 'createdBy')
    declare creator: User;
}

