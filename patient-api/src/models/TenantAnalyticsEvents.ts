import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Entity from './Entity';
import User from './User';
import Product from './Product';

@Table({
  freezeTableName: true,
  tableName: 'TenantAnalyticsEvents',
})
export default class TenantAnalyticsEvents extends Entity {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare productId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare formId: string;

  @Column({
    type: DataType.ENUM('view', 'conversion'),
    allowNull: false,
  })
  declare eventType: 'view' | 'conversion';

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare sessionId?: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare metadata?: Record<string, any>;

  @BelongsTo(() => User)
  declare user?: User;

  @BelongsTo(() => Product)
  declare product?: Product;
}

