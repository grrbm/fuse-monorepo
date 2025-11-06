#!/usr/bin/env node

/**
 * Script to update the supercheap plan maxProducts from 3 to 25
 */

const { Sequelize } = require('sequelize');
const path = require('path');

// Load database configuration
const sequelizeConfig = require('./sequelize.config.cjs');
const env = process.env.NODE_ENV || 'development';
const config = sequelizeConfig[env];

async function runMigration() {
  let sequelize;

  try {
    // Initialize Sequelize
    if (config.use_env_variable) {
      const dbUrl = process.env[config.use_env_variable];
      if (!dbUrl) {
        console.error(`❌ Environment variable ${config.use_env_variable} is not set`);
        console.log('\nPlease set your DATABASE_URL or run this from the API server context.');
        process.exit(1);
      }
      sequelize = new Sequelize(dbUrl, config);
    } else {
      sequelize = new Sequelize(config);
    }

    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Update the supercheap plan
    console.log('\n🔄 Updating supercheap plan maxProducts to 25...');
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

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.original) {
      console.error('   Database error:', error.original.message);
    }
    process.exit(1);
  } finally {
    if (sequelize) {
      await sequelize.close();
    }
  }
}

// Run the migration
runMigration();

