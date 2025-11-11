-- Fix Glutathione product slug (remove trailing 't')
-- Current: "glutathionet" -> Should be: "glutathione"

-- First, check current value
SELECT id, name, slug FROM "Products" WHERE name = 'Glutathione';

-- Update the slug
UPDATE "Products" 
SET slug = 'glutathione' 
WHERE name = 'Glutathione' AND slug = 'glutathionet';

-- Update all published URLs for Glutathione to use the corrected slug
UPDATE "TenantProductForms" tpf
SET "publishedUrl" = REPLACE("publishedUrl", '/glutathionet', '/glutathione')
WHERE tpf."productId" IN (SELECT id FROM "Products" WHERE name = 'Glutathione')
  AND "publishedUrl" LIKE '%/glutathionet%';

-- Verify the changes
SELECT id, name, slug FROM "Products" WHERE name = 'Glutathione';
SELECT id, "publishedUrl" FROM "TenantProductForms" 
WHERE "productId" IN (SELECT id FROM "Products" WHERE name = 'Glutathione');

