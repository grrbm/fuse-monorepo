import { Table, Column, DataType, HasMany, BelongsTo, ForeignKey } from 'sequelize-typescript';
import Entity from './Entity';
import Clinic from './Clinic';
import UserTag from './UserTag';

@Table({
  freezeTableName: true,
  tableName: 'tags',
})
export default class Tag extends Entity {
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100],
    },
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description?: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    validate: {
      len: [0, 50],
    },
  })
  declare category?: string; // 'treatment', 'status', 'engagement', 'custom'

  @Column({
    type: DataType.STRING(7),
    allowNull: true,
    defaultValue: '#3B82F6', // Default blue color
    validate: {
      is: /^#[0-9A-Fa-f]{6}$/i, // Hex color validation
    },
  })
  declare color?: string;

  @ForeignKey(() => Clinic)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare clinicId: string;

  @BelongsTo(() => Clinic)
  declare clinic: Clinic;

  @HasMany(() => UserTag)
  declare userTags: UserTag[];

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare isActive: boolean;

  /**
   * Get count of users with this tag
   */
  async getUserCount(): Promise<number> {
    const count = await UserTag.count({
      where: { tagId: this.id }
    });
    return count;
  }
}

