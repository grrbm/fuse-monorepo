# Supercheap Plan Update Guide

## Overview

This guide explains how to update the **Super Cheap** plan's product limit from **3 products** to **25 products**.

## What Gets Updated

1. **BrandSubscriptionPlans Table**: The `maxProducts` field for the `supercheap` plan type
2. **Active Subscriptions**: All active subscriptions using the `supercheap` plan will have their `features.maxProducts` updated to 25

## Quick Start

### Option 1: Run the Shell Script (Recommended)

```bash
cd patient-api
./UPDATE_SUPERCHEAP_PLAN.sh
```

This script will:
- Load environment variables from `.env` if it exists
- Verify DATABASE_URL is set
- Run the migration
- Show detailed progress and results

### Option 2: Run the Node.js Script Directly

```bash
cd patient-api
node run-supercheap-migration.js
```

**Note**: Make sure `DATABASE_URL` is set in your environment.

### Option 3: Use Sequelize CLI Migration

```bash
cd patient-api
npx sequelize-cli db:migrate --migrations-path migrations --config sequelize.config.cjs
```

This will run the migration file: `migrations/20250106120000-update-supercheap-plan-max-products.js`

## Environment Setup

The script requires the `DATABASE_URL` environment variable. You can set it in one of these ways:

### 1. Create/Update `.env` file

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

### 2. Export in your shell

```bash
export DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

### 3. Run from API server context

If your API server is already running with the correct DATABASE_URL, you can run the script in that context.

## What the Migration Does

### Step 1: Update Plan Definition

```sql
UPDATE "BrandSubscriptionPlans"
SET "maxProducts" = 25,
    "updatedAt" = NOW()
WHERE "planType" = 'supercheap';
```

### Step 2: Update Active Subscriptions

For each active subscription with `planType = 'supercheap'`:
- Reads the current `features` JSON
- Updates `features.maxProducts` to 25
- Saves the updated features back to the database

## Verification

After running the migration, you can verify the changes:

### Check Plan Definition

```sql
SELECT "planType", name, "maxProducts", "updatedAt"
FROM "BrandSubscriptionPlans"
WHERE "planType" = 'supercheap';
```

Expected result:
- `maxProducts`: 25

### Check Active Subscriptions

```sql
SELECT id, "userId", "planType", features, status
FROM "BrandSubscription"
WHERE "planType" = 'supercheap'
  AND status = 'active'
  AND "deletedAt" IS NULL;
```

Expected result:
- All active supercheap subscriptions should have `features.maxProducts = 25`

## Rollback

If you need to revert the changes:

### Using Sequelize CLI

```bash
npx sequelize-cli db:migrate:undo --migrations-path migrations --config sequelize.config.cjs
```

### Manual Rollback

```sql
-- Revert plan definition
UPDATE "BrandSubscriptionPlans"
SET "maxProducts" = 3,
    "updatedAt" = NOW()
WHERE "planType" = 'supercheap';

-- Revert active subscriptions (you'll need to update each one manually)
UPDATE "BrandSubscription"
SET features = jsonb_set(features, '{maxProducts}', '3')
WHERE "planType" = 'supercheap'
  AND status = 'active'
  AND "deletedAt" IS NULL;
```

## Impact

### Before
- Supercheap plan users could enable up to **3 products**
- Existing subscriptions had `features.maxProducts = 3`

### After
- Supercheap plan users can enable up to **25 products**
- All active subscriptions have `features.maxProducts = 25`
- Users will immediately see the updated limit in their dashboard

## Troubleshooting

### Error: "DATABASE_URL is not set"

**Solution**: Set the DATABASE_URL environment variable (see Environment Setup section above)

### Error: "No supercheap plan found"

**Solution**: Verify the plan exists in your database:

```sql
SELECT * FROM "BrandSubscriptionPlans" WHERE "planType" = 'supercheap';
```

### Migration Already Run

If you see "SequelizeMeta" errors, the migration may have already been applied. Check:

```sql
SELECT * FROM "SequelizeMeta" WHERE name = '20250106120000-update-supercheap-plan-max-products.js';
```

## Files Created

1. **Migration File**: `migrations/20250106120000-update-supercheap-plan-max-products.js`
   - Sequelize migration for version control
   - Includes both `up` and `down` migrations

2. **Node.js Script**: `run-supercheap-migration.js`
   - Standalone script to run the migration
   - Can be run independently of Sequelize CLI

3. **Shell Script**: `UPDATE_SUPERCHEAP_PLAN.sh`
   - Convenience wrapper
   - Handles environment setup

4. **This Guide**: `SUPERCHEAP_PLAN_UPDATE_GUIDE.md`
   - Documentation and instructions

## Support

If you encounter any issues:
1. Check the database connection is working
2. Verify you have write permissions on the database
3. Check the API logs for any related errors
4. Ensure no other processes are modifying the same records

---

**Last Updated**: January 6, 2025
**Migration Version**: 20250106120000

