import { Table, Column, DataType, BelongsTo, ForeignKey, HasMany, Index } from 'sequelize-typescript';
import Entity from './Entity';
import Treatment from './Treatment';
import QuestionnaireStep from './QuestionnaireStep';
import User from './User';
import TenantProduct from './TenantProduct';
import Product from './Product';

@Table({
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ['title', 'userId'],
            name: 'questionnaire_title_user_unique',
        },
    ],
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
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    declare personalizationQuestionsSetup: boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    declare createAccountQuestionsSetup: boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    declare doctorQuestionsSetup: boolean;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: -1,
    })
    declare checkoutStepPosition: number;

    @ForeignKey(() => Treatment)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    declare treatmentId: string | null;

    @BelongsTo(() => Treatment)
    declare treatment?: Treatment | null;

    @Column({
        type: DataType.ENUM('normal', 'user_profile', 'doctor', 'master_template'),
        allowNull: true,
        defaultValue: null,
    })
    //NOTE: Master template should only be assigned for a SINGLE Questionnaire !!!
    declare formTemplateType: 'normal' | 'user_profile' | 'doctor' | 'master_template' | null;

    @Column({
        // Use explicit literals to avoid runtime import/init issues
        type: DataType.ENUM(
            'weight_loss',
            'hair_growth',
            'performance',
            'sexual_health',
            'skincare',
            'wellness',
            'other'
        ),
        allowNull: true,
    })
    declare category?:
        | 'weight_loss'
        | 'hair_growth'
        | 'performance'
        | 'sexual_health'
        | 'skincare'
        | 'wellness'
        | 'other'
        | null;


    @ForeignKey(() => Product)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    declare productId: string | null;

    @BelongsTo(() => Product)
    declare product?: Product | null;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    declare userId: string | null;

    @BelongsTo(() => User)
    declare user?: User | null;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    declare isTemplate: boolean;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare color: string | null;

    @HasMany(() => QuestionnaireStep)
    declare steps: QuestionnaireStep[];

    @HasMany(() => TenantProduct)
    declare tenantProducts: TenantProduct[];
}