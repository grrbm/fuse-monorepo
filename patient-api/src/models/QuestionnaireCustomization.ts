import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Entity from './Entity';
import User from './User';
import Questionnaire from './Questionnaire';

@Table({
    freezeTableName: true,
    paranoid: true, // Enables soft deletes (deletedAt)
})
export default class QuestionnaireCustomization extends Entity {
    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare userId: string;

    @ForeignKey(() => Questionnaire)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare questionnaireId: string;

    @Column({
        type: DataType.STRING(7), // Hex color format #RRGGBB
        allowNull: true,
    })
    declare customColor?: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    })
    declare isActive: boolean;

    // Relations
    @BelongsTo(() => User)
    declare user: User;

    @BelongsTo(() => Questionnaire)
    declare questionnaire: Questionnaire;
}

