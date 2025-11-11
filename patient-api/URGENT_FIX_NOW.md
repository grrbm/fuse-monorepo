# 🚨 URGENT FIX: Pharmacy Wholesale Costs Not Displaying

## Critical Issue
Pharmacy wholesale costs (e.g., $150 for BPC-157) are stored in the `PharmacyProduct` table but NOT synced to the `Product` table, causing the admin portal to show incorrect prices (e.g., $1 instead of $150).

## Immediate Fix - Choose ONE Method

---

### ⚡ METHOD 1: Run the Sync Script (Fastest)

```bash
cd patient-api
node URGENT_sync_pharmacy_costs.js
```

This will:
- ✅ Load your database connection from `../.env.local`
- ✅ Sync ALL pharmacy wholesale costs to Product table
- ✅ Show you exactly what was updated
- ✅ Verify BPC-157 specifically

**Then restart your API:**
```bash
# If using pm2:
npm run pm2:reload

# If using npm run dev:
# Stop it (Ctrl+C) and restart
```

---

### ⚡ METHOD 2: Run SQL Directly (If Method 1 Fails)

Open your database GUI (TablePlus, pgAdmin, etc.) or use `psql`:

```sql
-- Sync pharmacy wholesale costs
WITH LatestPharmacyPrices AS (
    SELECT DISTINCT ON ("productId")
        "productId",
        "pharmacyWholesaleCost"
    FROM "PharmacyProduct"
    WHERE "pharmacyWholesaleCost" IS NOT NULL
    ORDER BY "productId", "createdAt" DESC
)
UPDATE "Product" p
SET 
    "pharmacyWholesaleCost" = lpp."pharmacyWholesaleCost",
    "updatedAt" = NOW()
FROM LatestPharmacyPrices lpp
WHERE p.id = lpp."productId"
  AND p."pharmacyWholesaleCost" IS NULL;

-- Verify BPC-157
SELECT 
    name,
    price,
    "pharmacyWholesaleCost"
FROM "Product"
WHERE name LIKE '%BPC%';
```

**Then restart your API server.**

---

### ⚡ METHOD 3: Use the Complete SQL File

```bash
cd patient-api
psql YOUR_DATABASE_URL -f URGENT_FIX_PHARMACY_COSTS.sql
```

Replace `YOUR_DATABASE_URL` with your actual connection string.

**Then restart your API server.**

---

## What This Fixes

### Before Fix:
```
Product Table:
- BPC-157: price=$1.00, pharmacyWholesaleCost=NULL

PharmacyProduct Table:
- BPC-157: pharmacyWholesaleCost=$150.00

Admin Portal Shows: $1.00 ❌
```

### After Fix:
```
Product Table:
- BPC-157: price=$1.00, pharmacyWholesaleCost=$150.00

PharmacyProduct Table:
- BPC-157: pharmacyWholesaleCost=$150.00

Admin Portal Shows: $150.00 ✅
```

---

## Verification Steps

After running the fix and restarting API:

1. **Go to**: http://localhost:3002/products/020592c6-5ec1-4873-8a4e-46a738e9127b

2. **Check "Pharmacy Wholesale Cost"** section:
   - Should show: **$150.00**
   - NOT: $1.00

3. **Check profit calculations**:
   - Should use $150.00 as the cost basis
   - Margins should be calculated correctly

4. **Check database** (optional):
```sql
SELECT name, price, "pharmacyWholesaleCost"
FROM "Product"
WHERE name LIKE '%BPC%';
```
Should show: `pharmacyWholesaleCost: 150.00`

---

## Why This Happened

The system has two tables storing cost data:

1. **`PharmacyProduct`** (junction table): Stores pharmacy-specific data per state
   - Has the correct wholesale cost from pharmacy API

2. **`Product`** (main table): Main product record
   - Was missing the `pharmacyWholesaleCost` field

The admin portal reads from the `Product` table, so it was showing the fallback `price` field ($1.00) instead of the correct wholesale cost ($150.00).

---

## What the Fix Does

1. **Finds all products** with pharmacy assignments that have wholesale costs
2. **Copies the wholesale cost** from `PharmacyProduct` → `Product` table
3. **Updates the Product record** so the admin portal can display it correctly
4. **Future-proofs**: The API code (already updated) will auto-sync new products

---

## Troubleshooting

### "DATABASE_URL not found"
**Solution**: Run Method 2 (SQL directly) using your database GUI

### "Still showing $1.00"
**Solution**: 
1. Make sure you **restarted the API server** (critical!)
2. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
3. Check browser console for errors
4. Verify the database was actually updated (see verification SQL above)

### "Permission denied"
**Solution**: Make sure your database user has UPDATE permissions

---

## Impact

- ✅ Fixes pricing display for ALL products with pharmacy assignments
- ✅ Ensures accurate profit margin calculations
- ✅ Prevents underpricing that could harm the business
- ✅ Provides correct information for decision-making

---

## Run This NOW

```bash
cd patient-api
node URGENT_sync_pharmacy_costs.js
```

Then restart your API and refresh your browser.

---

**Time to fix: < 2 minutes**
**Impact: Critical - Fixes pricing for all products**

