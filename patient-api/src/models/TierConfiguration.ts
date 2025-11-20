import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Entity from './Entity';
import BrandSubscriptionPlans from './BrandSubscriptionPlans';

@Table({
  freezeTableName: true,
  tableName: 'TierConfiguration',
})
export default class TierConfiguration extends Entity {
  @ForeignKey(() => BrandSubscriptionPlans)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
  })
  declare brandSubscriptionPlanId: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare canAddCustomProducts: boolean;

  @BelongsTo(() => BrandSubscriptionPlans)
  declare plan?: BrandSubscriptionPlans;

  // Helper method to get all tier features as an object
  public getFeatures() {
    return {
      canAddCustomProducts: this.canAddCustomProducts,
    };
  }
}

