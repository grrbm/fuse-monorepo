-- Clean up duplicate TenantProductForm records
-- Keep only the most recent form for each (productId, clinicId, questionnaireId, currentFormVariant) combination

BEGIN;

-- Show what we have before cleanup
SELECT 
    COUNT(*) as total_forms,
    COUNT(DISTINCT ("productId"::text || '-' || "clinicId"::text || '-' || COALESCE("questionnaireId"::text, '') || '-' || COALESCE("currentFormVariant", ''))) as unique_combinations
FROM "TenantProductForms";

-- Delete duplicate forms, keeping only the most recent one for each combination
DELETE FROM "TenantProductForms"
WHERE id IN (
    SELECT id
    FROM (
        SELECT 
            id,
            ROW_NUMBER() OVER (
                PARTITION BY "productId", "clinicId", "questionnaireId", COALESCE("currentFormVariant", '')
                ORDER BY "createdAt" DESC
            ) as rn
        FROM "TenantProductForms"
    ) t
    WHERE rn > 1
);

-- Show what we have after cleanup
SELECT 
    COUNT(*) as total_forms,
    COUNT(DISTINCT ("productId"::text || '-' || "clinicId"::text || '-' || COALESCE("questionnaireId"::text, '') || '-' || COALESCE("currentFormVariant", ''))) as unique_combinations
FROM "TenantProductForms";

-- Show remaining forms for NAD+ product specifically
SELECT 
    tpf.id,
    p.name as product_name,
    tpf."currentFormVariant",
    tpf."createdAt",
    tpf."publishedUrl"
FROM "TenantProductForms" tpf
LEFT JOIN "Product" p ON p.id = tpf."productId"
WHERE tpf."productId" = '21b1daa1-7218-47c0-9f60-dc9bb77e3db1'
ORDER BY tpf."currentFormVariant" NULLS FIRST;

COMMIT;

