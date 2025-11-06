-- Auto-create TenantProductForms for all products across all clinics
-- Each product gets 1 form per GlobalFormStructure (4 forms total per product)

-- Step 1: Create forms for all products that have questionnaires
-- Using a CTE to generate form IDs and use them in URLs
WITH FormsToCreate AS (
  SELECT 
    uuid_generate_v4() as form_id,
    tp."productId",
    tp."clinicId",
    tp."questionnaireId",
    gfs."structureId",
    gfs.id as structure_uuid,
    c.slug as clinic_slug,
    c."isCustomDomain",
    c."customDomain",
    p.slug as product_slug
  FROM "TenantProduct" tp
  CROSS JOIN "GlobalFormStructures" gfs
  JOIN "Clinic" c ON tp."clinicId" = c.id
  JOIN "Product" p ON tp."productId" = p.id
  WHERE tp."questionnaireId" IS NOT NULL
    AND tp."deletedAt" IS NULL  -- Only active tenant products
    AND gfs."clinicId" = tp."clinicId"
    AND gfs."deletedAt" IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM "TenantProductForms" tpf
      WHERE tpf."productId" = tp."productId"
        AND tpf."clinicId" = tp."clinicId"
        AND tpf."questionnaireId" = tp."questionnaireId"
        AND tpf."globalFormStructureId" = gfs."structureId"
    )
)
INSERT INTO "TenantProductForms" (
  id,
  "productId",
  "clinicId",
  "questionnaireId",
  "globalFormStructureId",
  "globalFormStructureUUID",
  "layoutTemplate",
  "publishedUrl",
  "lastPublishedAt",
  "createdAt",
  "updatedAt"
)
SELECT 
  form_id,
  "productId",
  "clinicId",
  "questionnaireId",
  "structureId",
  structure_uuid,
  'layout_a',
  CONCAT(
    clinic_slug,
    CASE 
      WHEN "isCustomDomain" AND "customDomain" IS NOT NULL 
      THEN CONCAT('.', "customDomain")
      ELSE '.localhost:3000'
    END,
    '/my-products/',
    form_id::text,
    '/',
    product_slug
  ),
  NOW(),
  NOW(),
  NOW()
FROM FormsToCreate;

-- Show results
SELECT 
  c.slug as clinic_slug,
  COUNT(DISTINCT tp."productId") as products_count,
  COUNT(DISTINCT tpf.id) as forms_count,
  COUNT(DISTINCT gfs.id) as structures_count,
  CASE 
    WHEN COUNT(DISTINCT tp."productId") > 0 
    THEN COUNT(DISTINCT tpf.id) / COUNT(DISTINCT tp."productId")
    ELSE 0 
  END as forms_per_product
FROM "Clinic" c
LEFT JOIN "TenantProduct" tp ON c.id = tp."clinicId" AND tp."questionnaireId" IS NOT NULL
LEFT JOIN "TenantProductForms" tpf ON tp."productId" = tpf."productId" AND c.id = tpf."clinicId"
LEFT JOIN "GlobalFormStructures" gfs ON c.id = gfs."clinicId" AND gfs."deletedAt" IS NULL
GROUP BY c.slug
HAVING COUNT(DISTINCT tp."productId") > 0
ORDER BY c.slug;

