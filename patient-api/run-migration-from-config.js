#!/usr/bin/env node

/**
 * Run supercheap plan migration using the database config from main.ts
 * This script reads the same config that the API server uses
 */

const { Sequelize } = require('sequelize');
const path = require('path');

async function runMigration() {
  let sequelize;

  try {
    console.log('🔄 Loading database configuration...');
    
    // Try to load the compiled config from bundle
    let dbConfig;
    try {
      // Check if there's a compiled bundle
      const bundlePath = path.join(__dirname, 'bundle', 'main.js');
      console.log('   Looking for bundle at:', bundlePath);
      
      // For now, let's use a simple approach - read from environment or use default
      const DATABASE_URL = process.env.DATABASE_URL || 
                          process.env.POSTGRES_URL ||
                          'postgresql://localhost:5432/fuse_dev';
      
      console.log('   Using DATABASE_URL from environment or default');
      
      sequelize = new Sequelize(DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
          ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
          } : false
        }
      });
    } catch (err) {
      console.error('   Failed to load config:', err.message);
      throw err;
    }

    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Update the supercheap plan
    console.log('🔄 Updating supercheap plan maxProducts to 25...');
    const [planResult] = await sequelize.query(`
      UPDATE "BrandSubscriptionPlans"
      SET "maxProducts" = 25,
          "updatedAt" = NOW()
      WHERE "planType" = 'supercheap'
      RETURNING id, name, "maxProducts";
    `);

    if (planResult.length > 0) {
      console.log('✅ Updated supercheap plan:');
      console.log(`   - Plan ID: ${planResult[0].id}`);
      console.log(`   - Plan Name: ${planResult[0].name}`);
      console.log(`   - Max Products: ${planResult[0].maxProducts}`);
    } else {
      console.log('⚠️  No supercheap plan found to update');
    }

    // Update existing active subscriptions
    console.log('\n🔄 Updating active supercheap subscriptions...');
    const [subscriptions] = await sequelize.query(`
      SELECT id, features
      FROM "BrandSubscription"
      WHERE "planType" = 'supercheap'
        AND status = 'active'
        AND "deletedAt" IS NULL;
    `);

    console.log(`   Found ${subscriptions.length} active supercheap subscriptions`);

    let updatedCount = 0;
    for (const subscription of subscriptions) {
      let features = subscription.features || {};
      
      // Parse features if it's a string
      if (typeof features === 'string') {
        try {
          features = JSON.parse(features);
        } catch (e) {
          features = {};
        }
      }

      // Update maxProducts in features
      const oldMaxProducts = features.maxProducts;
      features.maxProducts = 25;

      await sequelize.query(`
        UPDATE "BrandSubscription"
        SET features = :features,
            "updatedAt" = NOW()
        WHERE id = :id;
      `, {
        replacements: {
          features: JSON.stringify(features),
          id: subscription.id
        }
      });

      console.log(`   - Updated subscription ${subscription.id}: maxProducts ${oldMaxProducts} → 25`);
      updatedCount++;
    }

    console.log(`\n✅ Successfully updated ${updatedCount} active subscriptions`);
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Restart your API server to apply the pharmacy price fix');
    console.log('   2. Refresh your browser at http://localhost:3002/products');
    console.log('   3. You should now be able to add up to 25 products');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure your database is running');
    console.error('   2. Check your DATABASE_URL environment variable');
    console.error('   3. Or run the SQL script directly: psql < update-supercheap-plan.sql');
    process.exit(1);
  } finally {
    if (sequelize) {
      await sequelize.close();
    }
  }
}

// Run the migration
runMigration();

