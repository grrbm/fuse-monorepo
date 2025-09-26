import { Table, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import Entity from './Entity';
import Question from './Question';

@Table({
    freezeTableName: true,
})
export default class QuestionOption extends Entity {
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare optionText: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare optionValue: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare optionOrder: number;

    @ForeignKey(() => Question)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare questionId: string;
    
    @BelongsTo(() => Question)
    declare question: Question;
}