#!/bin/bash

# Migration script to backfill TenantProductForm publishedUrl fields
# This ensures all existing product forms have proper preview URLs

echo "🚀 Running TenantProductForm URL Migration"
echo "=========================================="
echo ""

# Check if we're in the patient-api directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must be run from the patient-api directory"
    exit 1
fi

# Confirm with user
echo "This migration will:"
echo "  ✅ Add publishedUrl to all existing TenantProductForm records"
echo "  ✅ Generate slugs for any Products missing them"
echo "  ✅ Set lastPublishedAt timestamps"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled"
    exit 1
fi

echo ""
echo "🔄 Running migration..."
echo ""

# Run the migration
npx sequelize-cli db:migrate --migrations-path migrations --name 20250106000000-backfill-tenant-product-form-urls.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "  1. Test preview URLs in the tenant portal"
    echo "  2. Verify forms are showing as 'Live' status"
    echo "  3. Check that all product slugs are set"
    echo ""
else
    echo ""
    echo "❌ Migration failed. Check the errors above."
    exit 1
fi

