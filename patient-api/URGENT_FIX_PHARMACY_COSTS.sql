-- URGENT: Sync pharmacy wholesale costs from PharmacyProduct to Product table
-- This ensures all products display the correct wholesale cost in the admin portal

BEGIN;

-- Show current state (products with missing pharmacyWholesaleCost)
SELECT 
    p.id,
    p.name,
    p.price as "current_price",
    p."pharmacyWholesaleCost" as "current_wholesale_cost",
    pp."pharmacyWholesaleCost" as "pharmacy_product_cost"
FROM "Product" p
LEFT JOIN "PharmacyProduct" pp ON pp."productId" = p.id
WHERE p."pharmacyWholesaleCost" IS NULL
  AND pp."pharmacyWholesaleCost" IS NOT NULL
ORDER BY p.name;

-- Update Product table with pharmacyWholesaleCost from PharmacyProduct
-- This takes the most recent pharmacy assignment for each product
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

-- Show what was updated
SELECT 
    p.id,
    p.name,
    p.price as "product_price",
    p."pharmacyWholesaleCost" as "updated_wholesale_cost",
    p."updatedAt"
FROM "Product" p
WHERE p."pharmacyWholesaleCost" IS NOT NULL
ORDER BY p."updatedAt" DESC
LIMIT 20;

-- Summary
SELECT 
    COUNT(*) as "total_products_with_wholesale_cost"
FROM "Product"
WHERE "pharmacyWholesaleCost" IS NOT NULL;

COMMIT;

-- Verification: Check BPC-157 specifically
SELECT 
    id,
    name,
    price,
    "pharmacyWholesaleCost",
    "pharmacyProductId"
FROM "Product"
WHERE name LIKE '%BPC%' OR id = '020592c6-5ec1-4873-8a4e-46a738e9127b';

