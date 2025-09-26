import { Table, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Entity from './Entity';
import User from './User';

@Table({
  freezeTableName: true,
  tableName: 'ShippingAddress',
})
export default class ShippingAddress extends Entity {
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;


  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare address: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare apartment?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare city: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare state: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare zipCode: string;

  @Column({
    type: DataType.STRING(2),
    allowNull: false,
    defaultValue: 'US',
  })
  declare country: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare isDefault: boolean;



  // Format full address as string
  public getFormattedAddress(): string {
    let formatted = this.address;
    
    if (this.apartment) {
      formatted += `, ${this.apartment}`;
    }
    
    formatted += `\n${this.city}, ${this.state} ${this.zipCode}`;
    
    if (this.country && this.country !== 'US') {
      formatted += `\n${this.country}`;
    }
    
    return formatted;
  }

  // Validate US address format
  public validateUSAddress(): boolean {
    if (this.country !== 'US') return true;
    
    // Basic US zip code validation (5 digits or 5+4 format)
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(this.zipCode)) return false;
    
    // Basic state validation (2 letter code)
    const stateRegex = /^[A-Z]{2}$/;
    if (!stateRegex.test(this.state)) return false;
    
    return true;
  }
}