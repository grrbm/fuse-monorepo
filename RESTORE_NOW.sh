#!/bin/bash

# Quick Database Restore Script
# Fill in your DATABASE_URL below and run this script

set -e

echo "🗄️  Quick Database Restoration"
echo "=============================="
echo ""

# ========================================
# STEP 1: SET YOUR DATABASE_URL HERE
# ========================================
# 
# Replace the placeholder below with your actual database connection string
# 
# Examples:
#   Local PostgreSQL:
#     DATABASE_URL="postgresql://fusehealth_user:password@localhost:5432/fusehealth_database"
#
#   Aptible (via tunnel - run 'aptible db:tunnel your-db' first):
#     DATABASE_URL="postgresql://aptible:password@localhost:12345/db"
#
#   Remote hosted:
#     DATABASE_URL="postgresql://user:pass@host.example.com:5432/fusehealth_database"
#

# PASTE YOUR DATABASE_URL HERE:
DATABASE_URL=""

# ========================================

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL is not set!"
    echo ""
    echo "Please edit this file and add your DATABASE_URL on line 26"
    echo ""
    echo "File location: $0"
    echo ""
    echo "Don't have credentials? Try these:"
    echo "  1. Check your hosting dashboard (Aptible, Heroku, AWS RDS)"
    echo "  2. Look for .env.local in patient-api folder"
    echo "  3. Ask your team lead for database access"
    echo ""
    exit 1
fi

export DATABASE_URL

DUMP_FILE="/Users/danielmeursing/Downloads/PROD_full_database_dump_04_Nov_2025.sql"
PROJECT_DIR="/Users/danielmeursing/Library/Mobile Documents/com~apple~CloudDocs/Desktop/FUSE Dev/fuse-monorepo"

# Check dump file exists
if [ ! -f "$DUMP_FILE" ]; then
    echo "❌ Dump file not found: $DUMP_FILE"
    exit 1
fi

echo "✅ Configuration loaded"
echo "📁 Dump file: PROD_full_database_dump_04_Nov_2025.sql"
echo ""

# Confirm
read -p "Restore database and run migration? (yes/no): " -r
echo
if [[ ! $REPLY == "yes" ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Step 1: Restoring database..."
echo "⏳ This may take 5-10 minutes..."
echo ""

if ! psql "$DATABASE_URL" < "$DUMP_FILE" 2>&1 | grep -E "^(CREATE|ALTER|INSERT|COPY|ERROR)" | tail -30; then
    echo ""
    echo "❌ Restoration may have failed. Check errors above."
    exit 1
fi

echo ""
echo "✅ Database restored!"
echo ""
echo "Step 2: Running migration (category → categories)..."
echo ""

cd "$PROJECT_DIR/patient-api"

if ! npx sequelize-cli db:migrate 2>&1; then
    echo ""
    echo "⚠️  Migration may have failed. Check errors above."
    exit 1
fi

echo ""
echo "✅ Migration complete!"
echo ""

# Verify
echo "Step 3: Verifying..."
PRODUCT_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM \"Product\";" 2>/dev/null | tr -d ' ' || echo "0")
echo "  📦 Products: $PRODUCT_COUNT"

HAS_CATEGORIES=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name='Product' AND column_name='categories';" 2>/dev/null | tr -d ' ' || echo "0")

if [ "$HAS_CATEGORIES" = "1" ]; then
    echo "  ✅ Multi-category schema applied"
else
    echo "  ❌ Warning: categories column not found"
fi

echo ""
echo "🎉 RESTORATION COMPLETE!"
echo ""
echo "Next: Test your tenant portal at http://localhost:3000/products"
echo ""

