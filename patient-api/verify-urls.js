// Verification script to check Product URLs and TenantProductForm URLs
// Run with: node verify-urls.js

const { Sequelize } = require('sequelize');
const path = require('path');

// Load sequelize config
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, 'sequelize.config.cjs'))[env];

// Create sequelize instance
const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable], {
      dialect: config.dialect,
      dialectOptions: config.dialectOptions,
      logging: false
    })
  : new Sequelize({
      database: config.database,
      username: config.username,
      password: config.password,
      host: config.host,
      port: config.port,
      dialect: config.dialect,
      dialectOptions: config.dialectOptions,
      logging: false
    });

async function verify() {
  try {
    console.log('🔍 Product URL Verification Report');
    console.log('====================================\n');

    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Check Products without slugs
    const [productsNoSlug] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM "Products"
      WHERE slug IS NULL AND "deletedAt" IS NULL
    `);

    // Check TenantProductForms without publishedUrl
    const [formsNoUrl] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM "TenantProductForms"
      WHERE "publishedUrl" IS NULL AND "deletedAt" IS NULL
    `);

    // Check TenantProductForms with publishedUrl
    const [formsWithUrl] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM "TenantProductForms"
      WHERE "publishedUrl" IS NOT NULL AND "deletedAt" IS NULL
    `);

    console.log('📈 Summary Statistics:');
    console.log('=====================');
    console.log(`Products without slugs: ${productsNoSlug[0].count}`);
    console.log(`Forms without publishedUrl: ${formsNoUrl[0].count}`);
    console.log(`Forms with publishedUrl: ${formsWithUrl[0].count}\n`);

    // Sample Products without slugs
    console.log('📋 Sample Products without slugs:');
    console.log('==================================');
    const [sampleProducts] = await sequelize.query(`
      SELECT id, name, "isActive"
      FROM "Products"
      WHERE slug IS NULL AND "deletedAt" IS NULL
      LIMIT 5
    `);
    
    if (sampleProducts.length === 0) {
      console.log('  ✅ All products have slugs!\n');
    } else {
      console.table(sampleProducts);
    }

    // Sample Forms without publishedUrl
    console.log('📋 Sample Forms without publishedUrl:');
    console.log('======================================');
    const [sampleFormsNoUrl] = await sequelize.query(`
      SELECT 
        tpf.id,
        p.name as "productName",
        c.name as "clinicName",
        c.slug as "clinicSlug"
      FROM "TenantProductForms" tpf
      LEFT JOIN "Products" p ON tpf."productId" = p.id
      LEFT JOIN "Clinics" c ON tpf."clinicId" = c.id
      WHERE tpf."publishedUrl" IS NULL 
        AND tpf."deletedAt" IS NULL
      LIMIT 5
    `);
    
    if (sampleFormsNoUrl.length === 0) {
      console.log('  ✅ All forms have publishedUrl!\n');
    } else {
      console.table(sampleFormsNoUrl);
    }

    // Sample Forms with publishedUrl
    console.log('📋 Sample Forms with publishedUrl:');
    console.log('===================================');
    const [sampleFormsWithUrl] = await sequelize.query(`
      SELECT 
        tpf.id,
        p.name as "productName",
        tpf."publishedUrl",
        tpf."lastPublishedAt"
      FROM "TenantProductForms" tpf
      LEFT JOIN "Products" p ON tpf."productId" = p.id
      WHERE tpf."publishedUrl" IS NOT NULL 
        AND tpf."deletedAt" IS NULL
      LIMIT 5
    `);
    
    if (sampleFormsWithUrl.length === 0) {
      console.log('  ⚠️  No forms have publishedUrl yet\n');
    } else {
      console.table(sampleFormsWithUrl);
    }

    console.log('✅ Verification complete!');
    console.log('\n💡 Tip: Run the migration with ./MIGRATE_PRODUCT_URLS.sh\n');

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

verify();

