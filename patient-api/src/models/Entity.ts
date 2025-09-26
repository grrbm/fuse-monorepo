import {
  Column,
  Model,
  DataType,
  Table,
  DeletedAt,
} from "sequelize-typescript";

@Table({
  freezeTableName: true,
})
export default class Entity extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
        allowNull: false,
    })
    declare id: string;

    @DeletedAt
    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    declare deletedAt: Date | null;
}

type IEntity = typeof Entity;

export { IEntity };
