#!/usr/bin/env node

/**
 * URGENT: Sync pharmacy wholesale costs from PharmacyProduct to Product table
 * This fixes the critical issue where wholesale costs are not displaying correctly
 */

const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

async function syncPharmacyCosts() {
  let sequelize;

  try {
    console.log('🚨 URGENT: Syncing Pharmacy Wholesale Costs');
    console.log('==========================================\n');

    // Load environment from ../.env.local
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
      console.log('✅ Loading environment from ../.env.local');
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          }
        }
      });
    }

    const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!DATABASE_URL) {
      console.error('❌ DATABASE_URL not found!');
      console.error('\nPlease run the SQL file directly:');
      console.error('  psql YOUR_DATABASE_URL -f URGENT_FIX_PHARMACY_COSTS.sql');
      process.exit(1);
    }

    console.log('✅ DATABASE_URL found');
    console.log('🔄 Connecting to database...\n');

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

    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Step 1: Show products that need syncing
    console.log('📊 Checking products with missing wholesale costs...');
    const [productsNeedingSync] = await sequelize.query(`
      SELECT 
        p.id,
        p.name,
        p.price as "current_price",
        p."pharmacyWholesaleCost" as "current_wholesale_cost",
        pp."pharmacyWholesaleCost" as "pharmacy_product_cost"
      FROM "Product" p
      LEFT JOIN "PharmacyProduct" pp ON pp."productId" = p.id
      WHERE p."pharmacyWholesaleCost" IS NULL
        AND pp."pharmacyWholesaleCost" IS NOT NULL
      ORDER BY p.name;
    `);

    console.log(`   Found ${productsNeedingSync.length} products needing sync\n`);

    if (productsNeedingSync.length > 0) {
      console.log('   Products to update:');
      productsNeedingSync.forEach(p => {
        console.log(`   - ${p.name}: $${p.pharmacy_product_cost}`);
      });
      console.log('');
    }

    // Step 2: Perform the sync
    console.log('🔄 Syncing pharmacy wholesale costs...');
    const [updateResult] = await sequelize.query(`
      WITH LatestPharmacyPrices AS (
        SELECT DISTINCT ON ("productId")
          "productId",
          "pharmacyWholesaleCost"
        FROM "PharmacyProduct"
        WHERE "pharmacyWholesaleCost" IS NOT NULL
        ORDER BY "productId", "createdAt" DESC
      )
      UPDATE "Product" p
      SET 
        "pharmacyWholesaleCost" = lpp."pharmacyWholesaleCost",
        "updatedAt" = NOW()
      FROM LatestPharmacyPrices lpp
      WHERE p.id = lpp."productId"
        AND p."pharmacyWholesaleCost" IS NULL
      RETURNING p.id, p.name, p."pharmacyWholesaleCost";
    `);

    console.log(`✅ Updated ${updateResult.length} products\n`);

    if (updateResult.length > 0) {
      console.log('   Updated products:');
      updateResult.forEach(p => {
        console.log(`   ✓ ${p.name}: $${p.pharmacyWholesaleCost}`);
      });
      console.log('');
    }

    // Step 3: Check BPC-157 specifically
    console.log('🔍 Checking BPC-157 specifically...');
    const [bpcProducts] = await sequelize.query(`
      SELECT 
        id,
        name,
        price,
        "pharmacyWholesaleCost",
        "pharmacyProductId"
      FROM "Product"
      WHERE name LIKE '%BPC%' OR id = '020592c6-5ec1-4873-8a4e-46a738e9127b';
    `);

    if (bpcProducts.length > 0) {
      bpcProducts.forEach(p => {
        console.log(`   ${p.name}:`);
        console.log(`     - Product Price: $${p.price}`);
        console.log(`     - Wholesale Cost: $${p.pharmacyWholesaleCost || 'NOT SET'}`);
        console.log(`     - Pharmacy Product ID: ${p.pharmacyProductId || 'N/A'}`);
      });
    } else {
      console.log('   ⚠️  BPC-157 not found');
    }
    console.log('');

    // Step 4: Summary
    const [summary] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM "Product"
      WHERE "pharmacyWholesaleCost" IS NOT NULL;
    `);

    console.log('📊 Summary:');
    console.log(`   Total products with wholesale cost: ${summary[0].count}`);
    console.log('');

    console.log('✅ SYNC COMPLETE!');
    console.log('==========================================');
    console.log('');
    console.log('📝 Next Steps:');
    console.log('   1. Restart your API server (npm run pm2:reload or restart dev server)');
    console.log('   2. Hard refresh your browser (Cmd+Shift+R or Ctrl+Shift+R)');
    console.log('   3. Check http://localhost:3002/products/020592c6-5ec1-4873-8a4e-46a738e9127b');
    console.log('   4. Wholesale cost should now show $150.00');
    console.log('');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message || 'Unknown error');
    console.error('Full error details:', error);
    console.error('\n💡 Alternative: Run the SQL file directly:');
    console.error('   psql YOUR_DATABASE_URL -f URGENT_FIX_PHARMACY_COSTS.sql');
    process.exit(1);
  } finally {
    if (sequelize) {
      await sequelize.close();
    }
  }
}

// Run immediately
syncPharmacyCosts();

