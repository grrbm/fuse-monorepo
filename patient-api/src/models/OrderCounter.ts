import { Table, Column, DataType, Model } from 'sequelize-typescript';

/**
 * OrderCounter - Platform-wide sequential counter for order numbers
 * Format: ORD-1-000-000
 * 
 * This table contains a single row that tracks the global order count
 * across all tenants/clinics on the platform.
 */
@Table({
    freezeTableName: true,
    tableName: 'OrderCounter',
})
export default class OrderCounter extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
    })
    declare id: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
    })
    declare counter: number;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    declare lastUpdated: Date;

    /**
     * Increment the counter and return the new value
     * This is atomic to prevent race conditions
     */
    static async getNextOrderNumber(): Promise<string> {
        const counterRecord = await OrderCounter.findByPk('00000000-0000-0000-0000-000000000001');
        
        if (!counterRecord) {
            throw new Error('OrderCounter not initialized');
        }

        // Increment counter atomically
        await counterRecord.increment('counter');
        await counterRecord.reload();

        const orderNum = counterRecord.counter;
        
        // Format: ORD-1-000-000 (pad to 6 digits)
        const paddedNumber = orderNum.toString().padStart(6, '0');
        return `ORD-1-${paddedNumber}`;
    }
}

