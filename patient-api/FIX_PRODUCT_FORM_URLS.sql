-- Fix TenantProductForm URLs - swap productSlug and formId in the URL path
-- Old format: /my-products/{productSlug}/{formId}
-- New format: /my-products/{formId}/{productSlug}

BEGIN;

-- Show current URLs before update
SELECT 
    tpf.id as "formId",
    p.slug as "productSlug",
    c.slug as "clinicSlug",
    tpf."publishedUrl" as "currentUrl"
FROM "TenantProductForms" tpf
LEFT JOIN "Product" p ON p.id = tpf."productId"
LEFT JOIN "Clinic" c ON c.id = tpf."clinicId"
WHERE tpf."publishedUrl" IS NOT NULL
ORDER BY c.slug, p.slug
LIMIT 20;

-- Update URLs by swapping the last two path segments
UPDATE "TenantProductForms" tpf
SET 
    "publishedUrl" = CASE
        WHEN tpf."publishedUrl" ~ '^https?://[^/]+/my-products/[^/]+/[^/]+$' THEN
            -- Extract protocol, domain, and path segments
            regexp_replace(
                tpf."publishedUrl",
                '^(https?://[^/]+/my-products/)([^/]+)/([^/]+)$',
                '\1\3/\2'
            )
        ELSE
            tpf."publishedUrl"
    END,
    "updatedAt" = NOW()
WHERE tpf."publishedUrl" IS NOT NULL
  AND tpf."publishedUrl" ~ '^https?://[^/]+/my-products/[^/]+/[^/]+$';

-- Show updated URLs
SELECT 
    tpf.id as "formId",
    p.slug as "productSlug",
    c.slug as "clinicSlug",
    tpf."publishedUrl" as "updatedUrl"
FROM "TenantProductForms" tpf
LEFT JOIN "Product" p ON p.id = tpf."productId"
LEFT JOIN "Clinic" c ON c.id = tpf."clinicId"
WHERE tpf."publishedUrl" IS NOT NULL
ORDER BY c.slug, p.slug
LIMIT 20;

-- Summary
SELECT 
    COUNT(*) as "total_forms_with_urls",
    COUNT(CASE WHEN "publishedUrl" ~ '^https?://[^/]+/my-products/[a-f0-9\-]{36}/[^/]+$' THEN 1 END) as "urls_with_uuid_format"
FROM "TenantProductForms"
WHERE "publishedUrl" IS NOT NULL;

COMMIT;

