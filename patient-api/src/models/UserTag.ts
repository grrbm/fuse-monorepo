import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Entity from './Entity';
import User from './User';
import Tag from './Tag';

@Table({
  freezeTableName: true,
  tableName: 'user_tags',
})
export default class UserTag extends Entity {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;

  @ForeignKey(() => Tag)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare tagId: string;

  @BelongsTo(() => Tag)
  declare tag: Tag;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare assignedBy?: string; // User ID of who assigned this tag

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare assignedAt: Date;
}

