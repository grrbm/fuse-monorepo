# Product URL Migration Guide

## Overview

This guide explains how to migrate existing products and forms to the new unified URL structure where all product forms automatically get published URLs.

## What Changed?

### Before
- ❌ TenantProductForm records had no `publishedUrl`
- ❌ Forms showed as "pending" instead of "live"
- ❌ Manual URL construction was needed
- ❌ Inconsistent product slugs

### After
- ✅ All TenantProductForm records automatically get `publishedUrl` on creation
- ✅ Forms show as "live" immediately
- ✅ Uniform URL structure across all products
- ✅ Product slugs can be manually set or auto-generated

## URL Structure

```
Format: {clinicSlug}.{domain}/my-products/{productSlug}/{formId}

Examples:
Development: http://preimier.localhost:3000/my-products/semaglutide-2-5mg/uuid-abc-123
Production:  https://preimier.fuse.health/my-products/semaglutide-2-5mg/uuid-abc-123
```

## Migration Steps

### Step 1: Verify Current State (Optional)

Run the verification script to see which records need migration:

```bash
cd patient-api
node verify-urls.js
```

This will show you:
- How many products are missing slugs
- How many forms are missing publishedUrl
- Sample data from your database

### Step 2: Run the Migration

The migration will:
1. Generate slugs for any Products without them
2. Create publishedUrl for all TenantProductForm records
3. Set lastPublishedAt timestamps

```bash
cd patient-api
./MIGRATE_PRODUCT_URLS.sh
```

Or run manually:

```bash
cd patient-api
npx sequelize-cli db:migrate --name 20250106000000-backfill-tenant-product-form-urls.js
```

### Step 3: Verify Migration Success

Run the verification script again:

```bash
node verify-urls.js
```

You should see:
- ✅ All products have slugs
- ✅ All forms have publishedUrl
- ✅ Sample URLs are properly formatted

## Files Created

1. **Migration Script**: `migrations/20250106000000-backfill-tenant-product-form-urls.js`
   - Backfills publishedUrl for existing TenantProductForm records
   - Generates slugs for Products missing them
   - Safe to run multiple times (idempotent)

2. **Migration Runner**: `MIGRATE_PRODUCT_URLS.sh`
   - Interactive script with confirmation prompt
   - Runs the migration safely

3. **Verification Script**: `verify-urls.js`
   - Checks database state before/after migration
   - Shows statistics and sample data

4. **This Guide**: `PRODUCT_URL_MIGRATION_GUIDE.md`
   - Complete documentation

## Manual Product Slug Management

After migration, you can manually edit product slugs:

1. Go to Product Editor: `http://localhost:3030/products/editor/{productId}`
2. Edit the "URL Slug" field
3. Save changes
4. **Important**: This will NOT update existing publishedUrl values
5. New TenantProductForm records will use the updated slug

## Rollback (If Needed)

To rollback the migration:

```bash
cd patient-api
npx sequelize-cli db:migrate:undo --name 20250106000000-backfill-tenant-product-form-urls.js
```

This will clear all publishedUrl fields (but won't remove product slugs).

## Future Behavior

Going forward, when a brand activates a product:

1. POST to `/admin/tenant-product-forms` creates a TenantProductForm
2. System automatically:
   - Generates publishedUrl using product slug
   - Sets lastPublishedAt to current time
   - Makes form immediately "live"
3. Preview URLs work instantly in both dev and production

## Troubleshooting

### Issue: Migration fails with "Product not found"
**Solution**: Ensure all TenantProductForm records have valid productId references

### Issue: Migration fails with "Clinic not found"  
**Solution**: Ensure all TenantProductForm records have valid clinicId references

### Issue: Verification script shows DATABASE_URL undefined
**Solution**: Ensure you have a .env file with DATABASE_URL set, or the database is running locally

### Issue: URLs not working after migration
**Solution**: 
1. Check the publishedUrl format in database
2. Verify product slugs are set correctly
3. Ensure patient-frontend is running
4. Check browser console for errors

## Need Help?

If you encounter issues:
1. Check the migration logs
2. Run `node verify-urls.js` to see current state
3. Check database directly: `SELECT * FROM "TenantProductForms" WHERE "publishedUrl" IS NULL`
4. Review this guide for common issues

## Summary

This migration ensures **all existing products and forms** are organized with the same URL structure as newly created ones. After running the migration, every product form will have a working preview URL that's immediately live for both development and production environments.

