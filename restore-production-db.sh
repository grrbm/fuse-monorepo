#!/bin/bash

# Database Restoration Script for Production Dump
# Created: November 5, 2025

set -e  # Exit on error

echo "🗄️  Production Database Restoration Script"
echo "=========================================="
echo ""

# Configuration
DB_NAME="fusehealth_database"
DB_USER="fusehealth_user"
PROD_DUMP="/Users/danielmeursing/Downloads/PROD_full_database_dump_04_Nov_2025.sql"
BACKUP_DIR="/Users/danielmeursing/Library/Mobile Documents/com~apple~CloudDocs/Desktop/FUSE Dev/fuse-monorepo/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "📋 Configuration:"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Dump File: $PROD_DUMP"
echo ""

# Step 1: Backup current database (optional)
read -p "⚠️  Do you want to backup your CURRENT database first? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Creating backup of current database..."
    BACKUP_FILE="$BACKUP_DIR/backup_before_restore_$TIMESTAMP.sql"
    
    # Check if database exists
    if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        pg_dump -U postgres $DB_NAME > "$BACKUP_FILE"
        echo "✅ Backup saved to: $BACKUP_FILE"
    else
        echo "ℹ️  Database doesn't exist yet, skipping backup"
    fi
    echo ""
fi

# Step 2: Confirm restoration
echo "⚠️  WARNING: This will DROP and RECREATE the database!"
echo "   All current data in '$DB_NAME' will be LOST!"
echo ""
read -p "Are you sure you want to proceed? (type 'yes' to confirm): " -r
echo

if [[ ! $REPLY == "yes" ]]; then
    echo "❌ Restoration cancelled."
    exit 1
fi

# Step 3: Drop existing connections to the database
echo "🔌 Closing existing connections to $DB_NAME..."
psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" 2>/dev/null || true

# Step 4: Restore the database
echo "📥 Restoring production database dump..."
echo "   This may take a few minutes..."
echo ""

psql -U postgres < "$PROD_DUMP"

echo ""
echo "✅ Database restored successfully!"
echo ""

# Step 5: Reminder about migrations
echo "📝 IMPORTANT NEXT STEPS:"
echo "   1. The restored database has the OLD schema (single 'category' field)"
echo "   2. You MUST run the migration to convert to multi-category:"
echo ""
echo "      cd patient-api"
echo "      npx sequelize-cli db:migrate"
echo ""
echo "   3. This will convert 'category' → 'categories' (array)"
echo ""
echo "🎉 Restoration complete!"

