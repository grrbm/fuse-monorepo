# 🚀 Run Updates Now - Quick Guide

## Two Issues to Fix

1. **Supercheap Plan**: Update max products from 3 → 25
2. **Pharmacy Wholesale Cost**: Fix $1 showing instead of $150

---

## ⚡ Quick Fix (Recommended)

### Option 1: Use Your Database GUI

If you have a database GUI (TablePlus, pgAdmin, DBeaver, etc.):

1. **Open your database connection**
2. **Run this SQL**:

```sql
-- Update supercheap plan
UPDATE "BrandSubscriptionPlans"
SET "maxProducts" = 25, "updatedAt" = NOW()
WHERE "planType" = 'supercheap';

-- Update active subscriptions
UPDATE "BrandSubscription"
SET features = jsonb_set(
    COALESCE(features::jsonb, '{}'::jsonb),
    '{maxProducts}',
    '25'
),
    "updatedAt" = NOW()
WHERE "planType" = 'supercheap'
  AND status = 'active'
  AND "deletedAt" IS NULL;

-- Verify
SELECT "planType", name, "maxProducts" 
FROM "BrandSubscriptionPlans" 
WHERE "planType" = 'supercheap';
```

3. **Restart your API server**
4. **Refresh your browser**

✅ Done!

---

### Option 2: Use psql Command Line

If you have `psql` installed:

```bash
cd patient-api

# Run the SQL file
psql YOUR_DATABASE_URL -f update-supercheap-plan.sql

# Or connect interactively
psql YOUR_DATABASE_URL
# Then paste the SQL from Option 1
```

Replace `YOUR_DATABASE_URL` with your actual database connection string, like:
```
postgresql://user:password@localhost:5432/database_name
```

---

### Option 3: Find Your DATABASE_URL First

Your API server must be connecting to the database somehow. Let's find the connection string:

**Check these locations:**

1. **In your terminal where API runs**, look for:
   - `DATABASE_URL=...`
   - `POSTGRES_URL=...`
   - Connection logs when API starts

2. **Check your deployment platform**:
   - Heroku: `heroku config:get DATABASE_URL`
   - Render: Check environment variables in dashboard
   - Railway: Check environment variables in dashboard
   - Docker: Check docker-compose.yml or .env

3. **Check your API startup logs**:
   - Look for database connection messages
   - Should show the host/database name

Once you find it:
```bash
cd patient-api
export DATABASE_URL="your_connection_string_here"
node run-migration-from-config.js
```

---

## 🔧 What Each Fix Does

### Fix 1: Supercheap Plan (Database Update)
- Updates `BrandSubscriptionPlans` table
- Updates active subscriptions' features
- **Result**: You can add up to 25 products instead of 3

### Fix 2: Pharmacy Wholesale Cost (Code Update - Already Done)
- API now syncs `pharmacyWholesaleCost` from `PharmacyProduct` table
- Automatically fixes missing wholesale costs
- **Result**: BPC-157 shows $150 instead of $1

---

## ✅ Verification Steps

After running the database update and restarting API:

1. **Check Products Page**: http://localhost:3002/products
   - Try to enable more than 3 products
   - Should now allow up to 25

2. **Check BPC-157 Product**: http://localhost:3002/products/020592c6-5ec1-4873-8a4e-46a738e9127b
   - "Pharmacy Wholesale Cost" should show $150.00
   - Not $1.00

3. **Check Database** (optional):
```sql
-- Verify plan
SELECT "planType", "maxProducts" 
FROM "BrandSubscriptionPlans" 
WHERE "planType" = 'supercheap';
-- Should show: maxProducts = 25

-- Verify subscriptions
SELECT features->>'maxProducts' as max_products
FROM "BrandSubscription"
WHERE "planType" = 'supercheap' AND status = 'active';
-- Should show: 25
```

---

## 🆘 Still Having Issues?

### Issue: "Can't find DATABASE_URL"

**Solution**: Your API server is running, so it must have a database connection. 

Try this:
1. Stop your API server
2. Look at the startup logs - they should show database connection info
3. Or check where you normally set environment variables for the API
4. Common locations:
   - `.env` file in patient-api folder
   - Docker compose file
   - Deployment platform dashboard
   - Shell export commands

### Issue: "Permission denied"

**Solution**: Make sure you're using a database user with UPDATE permissions.

### Issue: "Still showing 3 products limit"

**Solution**: 
1. Make sure the SQL ran successfully (check for errors)
2. Restart your API server (important!)
3. Hard refresh your browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
4. Check browser console for errors

### Issue: "Still showing $1.00"

**Solution**:
1. **Restart your API server** (this is required for the code fix)
2. Clear browser cache
3. Check that the product has a PharmacyProduct record:
```sql
SELECT * FROM "PharmacyProduct" 
WHERE "productId" = '020592c6-5ec1-4873-8a4e-46a738e9127b';
```

---

## 📞 Need Help?

If you're still stuck, provide:
1. How you normally start your API server
2. Where your database is hosted (local, Heroku, Render, etc.)
3. Any error messages you see

---

**TL;DR**: 
1. Run the SQL in `update-supercheap-plan.sql` against your database
2. Restart your API server
3. Refresh your browser

