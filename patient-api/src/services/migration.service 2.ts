import { Sequelize } from 'sequelize-typescript';

export class MigrationService {
    constructor(private sequelize: Sequelize) { }

    /**
     * Run the active to isActive field migration
     * This migration renames the 'active' field to 'isActive' across multiple tables
     */
    async runActiveToIsActiveMigration(): Promise<void> {
        try {
            console.log('🔄 Running active to isActive migration...');
            const tables = ["Clinic", "Product", "TenantProduct", "Treatment", "TreatmentPlan"];

            for (const table of tables) {
                await this.migrateTable(table);
            }

            console.log('✅ Active to isActive migration completed');
        } catch (error) {
            console.error('❌ Error during active to isActive migration:', error);
            throw error; // Re-throw to let caller handle
        }
    }

    /**
     * Migrate a single table from active to isActive field
     */
    private async migrateTable(table: string): Promise<void> {
        try {
            // Check if active column exists and isActive doesn't
            const [columns] = await this.sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = '${table}' AND column_name IN ('active', 'isActive')
      `);

            const hasActive = columns.some((col: any) => col.column_name === 'active');
            const hasIsActive = columns.some((col: any) => col.column_name === 'isActive');

            if (hasActive && !hasIsActive) {
                console.log(`📝 Migrating ${table} table...`);

                // Step 1: Add isActive column
                await this.sequelize.query(`
          ALTER TABLE "${table}" 
          ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT ${table === "Clinic" || table === "Treatment" ? 'false' : 'true'}
        `);

                // Step 2: Copy data from active to isActive
                await this.sequelize.query(`
          UPDATE "${table}" SET "isActive" = active WHERE active IS NOT NULL
        `);

                // Step 3: Remove old active column
                await this.sequelize.query(`
          ALTER TABLE "${table}" DROP COLUMN active
        `);

                console.log(`✅ ${table} migration completed`);
            } else if (hasActive && hasIsActive) {
                console.log(`⚠️  ${table} has both active and isActive columns - skipping migration`);
            } else if (!hasActive && hasIsActive) {
                console.log(`✅ ${table} already migrated`);
            } else {
                console.log(`ℹ️  ${table} doesn't have active column - skipping`);
            }
        } catch (error) {
            console.error(`❌ Error migrating ${table}:`, error);
            throw error;
        }
    }

    /**
     * Check if migration is needed for any table
     */
    async isMigrationNeeded(): Promise<boolean> {
        try {
            const tables = ["Clinic", "Product", "TenantProduct", "Treatment", "TreatmentPlan"];

            for (const table of tables) {
                const [columns] = await this.sequelize.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = '${table}' AND column_name = 'active'
        `);

                if (columns.length > 0) {
                    return true; // At least one table has active column
                }
            }

            return false; // No tables need migration
        } catch (error) {
            console.error('❌ Error checking migration status:', error);
            return false; // Assume no migration needed on error
        }
    }
}
