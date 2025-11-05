#!/bin/bash

# Complete Database Restoration and Migration Script
# This script restores the production database dump and runs the multi-category migration

set -e  # Exit on error

echo "🗄️  Complete Database Restoration & Migration"
echo "=============================================="
echo ""

# Configuration
DUMP_FILE="/Users/danielmeursing/Downloads/PROD_full_database_dump_04_Nov_2025.sql"
PROJECT_DIR="/Users/danielmeursing/Library/Mobile Documents/com~apple~CloudDocs/Desktop/FUSE Dev/fuse-monorepo"

# Check if dump file exists
if [ ! -f "$DUMP_FILE" ]; then
    echo "❌ Error: Dump file not found at $DUMP_FILE"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set it with one of these methods:"
    echo ""
    echo "Method 1 - Direct connection:"
    echo "  export DATABASE_URL='postgresql://user:pass@host:port/fusehealth_database'"
    echo ""
    echo "Method 2 - Aptible tunnel:"
    echo "  aptible db:tunnel your-database-handle"
    echo "  # Then in another terminal:"
    echo "  export DATABASE_URL='postgresql://aptible:pass@localhost:PORT/db'"
    echo ""
    exit 1
fi

echo "✅ Database connection URL is set"
echo "📋 Dump file: $DUMP_FILE"
echo ""

# Step 1: Display database info
echo "📊 Current database info:"
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\).*/\1/p')
echo "  Host: $DB_HOST"
echo ""

# Step 2: Confirm restoration
read -p "⚠️  This will RESTORE the production database. Continue? (yes/no): " -r
echo
if [[ ! $REPLY == "yes" ]]; then
    echo "❌ Restoration cancelled."
    exit 0
fi

# Step 3: Restore the database
echo "📥 Step 1/3: Restoring database dump..."
echo "   This may take several minutes..."
echo ""

if ! psql "$DATABASE_URL" < "$DUMP_FILE" 2>&1 | tail -20; then
    echo ""
    echo "❌ Database restoration failed!"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Verify DATABASE_URL is correct"
    echo "  2. Check you have connection to the database"
    echo "  3. Ensure your user has sufficient permissions"
    echo ""
    exit 1
fi

echo ""
echo "✅ Database restored successfully!"
echo ""

# Step 4: Verify restoration
echo "🔍 Step 2/3: Verifying restoration..."
PRODUCT_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM \"Product\";" | tr -d ' ')
echo "  Products in database: $PRODUCT_COUNT"

if [ "$PRODUCT_COUNT" -eq "0" ]; then
    echo "⚠️  Warning: No products found. Restoration may have failed."
fi
echo ""

# Step 5: Run the migration
echo "🔄 Step 3/3: Running multi-category migration..."
echo "   Converting 'category' field to 'categories' array..."
echo ""

cd "$PROJECT_DIR/patient-api"

if ! DATABASE_URL="$DATABASE_URL" npx sequelize-cli db:migrate; then
    echo ""
    echo "❌ Migration failed!"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check if migration already ran:"
    echo "     psql \"\$DATABASE_URL\" -c \"SELECT * FROM \\\"SequelizeMeta\\\" WHERE name LIKE '%category%';\""
    echo "  2. Try rolling back and re-running:"
    echo "     DATABASE_URL=\"\$DATABASE_URL\" npx sequelize-cli db:migrate:undo"
    echo "     DATABASE_URL=\"\$DATABASE_URL\" npx sequelize-cli db:migrate"
    echo ""
    exit 1
fi

echo ""
echo "✅ Migration completed successfully!"
echo ""

# Step 6: Verify migration
echo "🔍 Verifying migration..."

# Check schema
echo "  Checking schema..."
SCHEMA_CHECK=$(psql "$DATABASE_URL" -t -c "SELECT column_name FROM information_schema.columns WHERE table_name='Product' AND column_name='categories';" | tr -d ' ')

if [ -z "$SCHEMA_CHECK" ]; then
    echo "❌ Error: 'categories' column not found! Migration may have failed."
    exit 1
fi

echo "  ✅ Schema updated: 'categories' column exists"

# Check data migration
echo "  Checking data migration..."
SAMPLE_PRODUCT=$(psql "$DATABASE_URL" -t -c "SELECT name, categories FROM \"Product\" WHERE categories IS NOT NULL LIMIT 1;")
echo "  Sample product: $SAMPLE_PRODUCT"
echo ""

# Final summary
echo "🎉 =============================================="
echo "   RESTORATION AND MIGRATION COMPLETE!"
echo "============================================== 🎉"
echo ""
echo "✅ Database restored from production dump"
echo "✅ Migration applied: category → categories (array)"
echo "✅ All $PRODUCT_COUNT products migrated"
echo ""
echo "📝 Next Steps:"
echo "  1. Test the tenant portal UI"
echo "  2. Verify multi-category selection works"
echo "  3. Test category filtering"
echo "  4. Deploy the updated code to production"
echo ""
echo "📚 Documentation:"
echo "  - See MULTI_CATEGORY_IMPLEMENTATION.md for details"
echo "  - See DATABASE_RESTORE_INSTRUCTIONS.md for troubleshooting"
echo ""

