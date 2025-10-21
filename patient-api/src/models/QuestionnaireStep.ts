import { Table, Column, DataType, BelongsTo, ForeignKey, HasMany } from 'sequelize-typescript';
import Entity from './Entity';
import Questionnaire from './Questionnaire';
import Question from './Question';

@Table({
    freezeTableName: true,
})
export default class QuestionnaireStep extends Entity {
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare title: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare description: string;

    @Column({
        type: DataType.ENUM('normal', 'user_profile', 'doctor'),
        allowNull: false,
        defaultValue: 'normal',
    })
    declare category: 'normal' | 'user_profile' | 'doctor';

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare stepOrder: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    declare isDeadEnd: boolean;

    @ForeignKey(() => Questionnaire)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare questionnaireId: string;

    @BelongsTo(() => Questionnaire)
    declare questionnaire: Questionnaire;

    @HasMany(() => Question)
    declare questions: Question[];
}