#!/bin/bash

# Verification script to check the state of Product URLs and TenantProductForm URLs
# Run this BEFORE and AFTER migration to see the changes

echo "🔍 Product URL Verification Report"
echo "===================================="
echo ""

# Check if we're in the patient-api directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must be run from the patient-api directory"
    exit 1
fi

# Create a temporary SQL script
cat > /tmp/verify_urls.sql <<'EOF'
-- Summary of Products without slugs
SELECT 
    COUNT(*) as "Products without slugs"
FROM "Products"
WHERE slug IS NULL AND "deletedAt" IS NULL;

-- Summary of TenantProductForms without publishedUrl
SELECT 
    COUNT(*) as "Forms without publishedUrl"
FROM "TenantProductForms"
WHERE "publishedUrl" IS NULL AND "deletedAt" IS NULL;

-- Summary of TenantProductForms with publishedUrl
SELECT 
    COUNT(*) as "Forms with publishedUrl"
FROM "TenantProductForms"
WHERE "publishedUrl" IS NOT NULL AND "deletedAt" IS NULL;

-- Sample of Products without slugs
SELECT 
    id,
    name,
    "isActive"
FROM "Products"
WHERE slug IS NULL AND "deletedAt" IS NULL
LIMIT 5;

-- Sample of TenantProductForms without publishedUrl
SELECT 
    tpf.id,
    p.name as "Product Name",
    c.name as "Clinic Name",
    c.slug as "Clinic Slug"
FROM "TenantProductForms" tpf
LEFT JOIN "Products" p ON tpf."productId" = p.id
LEFT JOIN "Clinics" c ON tpf."clinicId" = c.id
WHERE tpf."publishedUrl" IS NULL 
  AND tpf."deletedAt" IS NULL
LIMIT 5;

-- Sample of TenantProductForms with publishedUrl
SELECT 
    tpf.id,
    p.name as "Product Name",
    tpf."publishedUrl",
    tpf."lastPublishedAt"
FROM "TenantProductForms" tpf
LEFT JOIN "Products" p ON tpf."productId" = p.id
WHERE tpf."publishedUrl" IS NOT NULL 
  AND tpf."deletedAt" IS NULL
LIMIT 5;
EOF

# Run the verification using the database connection from .env
echo "📊 Running database verification..."
echo ""

# Use node to run the SQL with proper database credentials
node -e "
const { Sequelize } = require('sequelize');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    logging: false,
    dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
        } : false
    }
});

const sql = fs.readFileSync('/tmp/verify_urls.sql', 'utf8');

(async () => {
    try {
        await sequelize.authenticate();
        
        const queries = sql.split(';').filter(q => q.trim());
        
        console.log('📈 Summary Statistics:');
        console.log('=====================');
        const [productsNoSlug] = await sequelize.query(queries[0]);
        console.log('Products without slugs:', productsNoSlug[0]['Products without slugs']);
        
        const [formsNoUrl] = await sequelize.query(queries[1]);
        console.log('Forms without publishedUrl:', formsNoUrl[0]['Forms without publishedUrl']);
        
        const [formsWithUrl] = await sequelize.query(queries[2]);
        console.log('Forms with publishedUrl:', formsWithUrl[0]['Forms with publishedUrl']);
        
        console.log('\\n📋 Sample Products without slugs:');
        console.log('==================================');
        const [sampleProducts] = await sequelize.query(queries[3]);
        if (sampleProducts.length === 0) {
            console.log('  ✅ All products have slugs!');
        } else {
            console.table(sampleProducts);
        }
        
        console.log('\\n📋 Sample Forms without publishedUrl:');
        console.log('======================================');
        const [sampleFormsNoUrl] = await sequelize.query(queries[4]);
        if (sampleFormsNoUrl.length === 0) {
            console.log('  ✅ All forms have publishedUrl!');
        } else {
            console.table(sampleFormsNoUrl);
        }
        
        console.log('\\n📋 Sample Forms with publishedUrl:');
        console.log('===================================');
        const [sampleFormsWithUrl] = await sequelize.query(queries[5]);
        if (sampleFormsWithUrl.length === 0) {
            console.log('  ⚠️  No forms have publishedUrl yet');
        } else {
            console.table(sampleFormsWithUrl);
        }
        
        await sequelize.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
})();
"

# Clean up
rm /tmp/verify_urls.sql

echo ""
echo "✅ Verification complete!"
echo ""
echo "💡 Tip: Run this script again after migration to see the changes"

