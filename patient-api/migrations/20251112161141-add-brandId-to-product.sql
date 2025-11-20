-- Add brandId column to Product table to track which brand created the product
ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "brandId" UUID;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS "idx_product_brandId" ON "Product"("brandId");

-- Add comment to explain the column
COMMENT ON COLUMN "Product"."brandId" IS 'ID of the brand user who created this custom product. NULL for standard platform products.';
