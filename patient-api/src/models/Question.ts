import { Table, Column, DataType, BelongsTo, ForeignKey, HasMany } from 'sequelize-typescript';
import Entity from './Entity';
import QuestionnaireStep from './QuestionnaireStep';
import QuestionOption from './QuestionOption';

@Table({
    freezeTableName: true,
})
export default class Question extends Entity {
    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    declare questionText: string;

    @Column({
        type: DataType.ENUM('text', 'number', 'email', 'phone', 'date', 'checkbox', 'radio', 'select', 'textarea', 'height', 'weight'),
        allowNull: false,
    })
    declare answerType: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare questionSubtype: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    declare isRequired: boolean;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare questionOrder: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    declare subQuestionOrder: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        defaultValue: 0,
    })
    declare conditionalLevel: number;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare placeholder: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare helpText: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare footerNote: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare conditionalLogic: string;

    @ForeignKey(() => QuestionnaireStep)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare stepId: string;
    
    @BelongsTo(() => QuestionnaireStep)
    declare step: QuestionnaireStep;

    @HasMany(() => QuestionOption)
    declare options: QuestionOption[];
}