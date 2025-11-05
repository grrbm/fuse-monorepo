# Production Database Restoration Instructions

## Overview
You have a production database dump from **November 4, 2025** that needs to be restored and then migrated to support the new multi-category feature.

**Important**: The dump has the **OLD schema** with single `category` field. After restoration, you **MUST** run the migration to convert to `categories` array.

## Prerequisites

1. ✅ Database dump file: `/Users/danielmeursing/Downloads/PROD_full_database_dump_04_Nov_2025.sql`
2. ✅ Migration file created: `patient-api/migrations/20251105000000-change-category-to-array.js`
3. ⚠️  **NEEDED**: Database connection credentials

## Method 1: Direct PostgreSQL Connection (Recommended)

If you have direct database access:

```bash
# 1. Set your database connection string
export DATABASE_URL="postgresql://user:password@host:port/fusehealth_database"

# 2. Extract connection details
# You can find these in your .env.local file or hosting provider dashboard

# 3. Restore the database
psql "${DATABASE_URL}" < "/Users/danielmeursing/Downloads/PROD_full_database_dump_04_Nov_2025.sql"

# 4. Verify restoration succeeded
psql "${DATABASE_URL}" -c "SELECT COUNT(*) FROM \"Product\";"

# 5. Run the migration to convert category → categories
cd patient-api
npx sequelize-cli db:migrate

# 6. Verify migration succeeded
psql "${DATABASE_URL}" -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='Product' AND column_name IN ('category', 'categories');"
```

## Method 2: Using Aptible CLI

If your database is hosted on Aptible:

```bash
# 1. Install Aptible CLI if not already installed
# brew install aptible/tap/aptible-cli

# 2. Login to Aptible
aptible login

# 3. List your databases
aptible db:list

# 4. Create a database tunnel
aptible db:tunnel <your-database-handle>
# This will give you a local connection URL like: postgresql://aptible:password@localhost:PORT/db

# 5. In a NEW terminal, restore the database
psql "postgresql://aptible:password@localhost:PORT/db" < "/Users/danielmeursing/Downloads/PROD_full_database_dump_04_Nov_2025.sql"

# 6. Run the migration
cd patient-api
npx sequelize-cli db:migrate --url "postgresql://aptible:password@localhost:PORT/db"
```

## Method 3: Using Database GUI Tool

If you prefer a GUI tool (like Postico, TablePlus, pgAdmin):

1. **Connect to your database** using your credentials
2. **Open SQL query window**
3. **Execute the dump file**:
   - In most tools: File → Execute SQL File
   - Select: `/Users/danielmeursing/Downloads/PROD_full_database_dump_04_Nov_2025.sql`
4. **Wait for completion** (may take several minutes)
5. **Run migration** (see below)

## Running the Migration (CRITICAL!)

After restoration, you **MUST** run the migration:

```bash
cd patient-api

# Make sure you have the right DATABASE_URL
# Option 1: Set in .env.local file
# Option 2: Export as environment variable
export DATABASE_URL="your-connection-string"

# Run the migration
npx sequelize-cli db:migrate

# You should see output like:
# == 20251105000000-change-category-to-array: migrating =======
# == 20251105000000-change-category-to-array: migrated (XXXms)
```

## Verification Steps

After migration, verify everything worked:

### 1. Check the schema changed
```bash
psql "${DATABASE_URL}" -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='Product' AND column_name LIKE 'categor%';"
```

**Expected output:**
```
 column_name |   data_type
-------------+---------------
 categories  | ARRAY
```

### 2. Check data was migrated
```bash
psql "${DATABASE_URL}" -c "SELECT name, categories FROM \"Product\" LIMIT 5;"
```

**Expected output:**
Products should have arrays like: `{weight_loss}` or `{wellness,performance}`

### 3. Verify API still works
```bash
cd patient-api
pnpm dev
# Test the products endpoints
```

## Troubleshooting

### Problem: "relation already exists" errors
**Solution**: The dump tries to create tables that may already exist. This is usually fine - it will fail gracefully.

### Problem: Permission denied
**Solution**: Ensure your database user has CREATE/DROP permissions on the database.

### Problem: Migration fails with "column already exists"
**Solution**: Check if migration already ran:
```bash
psql "${DATABASE_URL}" -c "SELECT * FROM \"SequelizeMeta\" WHERE name LIKE '%category%';"
```

### Problem: Can't connect to database
**Solution**: 
1. Check your DATABASE_URL is correct
2. Check if you need a tunnel/proxy (Aptible)
3. Verify firewall/security group settings

## What the Migration Does

The migration will:

1. ✅ Create temporary `categories_temp` column (ARRAY type)
2. ✅ Copy existing `category` values → `categories_temp` as single-element arrays
3. ✅ Drop the old `category` column and its ENUM type
4. ✅ Rename `categories_temp` → `categories`

**Example transformation:**
- Before: `category: 'weight_loss'`
- After: `categories: ['weight_loss']`

## Rollback (If Needed)

If something goes wrong, you can rollback:

```bash
cd patient-api
npx sequelize-cli db:migrate:undo
```

This will convert the array back to the single category field.

## Next Steps After Successful Restoration

1. ✅ **Test the tenant portal** - Verify products show checkboxes for categories
2. ✅ **Test filtering** - Ensure category filters work with multi-select
3. ✅ **Test API** - Verify products return `categories` array
4. ✅ **Update production** - Deploy the new code when ready

## Getting Help

If you need database credentials:
- Check your hosting provider dashboard (Aptible, Heroku, AWS RDS, etc.)
- Check `.env.local` file (if it exists and has DEV_DATABASE_URL)
- Check password manager or secure notes

---

**Created**: November 5, 2025  
**Author**: AI Assistant  
**Related**: MULTI_CATEGORY_IMPLEMENTATION.md

