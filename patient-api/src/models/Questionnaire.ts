import { Table, Column, DataType, BelongsTo, ForeignKey, HasMany } from 'sequelize-typescript';
import Entity from './Entity';
import Treatment from './Treatment';
import QuestionnaireStep from './QuestionnaireStep';

@Table({
    freezeTableName: true,
})
export default class Questionnaire extends Entity {
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
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: -1,
    })
    declare checkoutStepPosition: number;

    @ForeignKey(() => Treatment)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare treatmentId: string;
    
    @BelongsTo(() => Treatment)
    declare treatment: Treatment;

    @HasMany(() => QuestionnaireStep)
    declare steps: QuestionnaireStep[];
}