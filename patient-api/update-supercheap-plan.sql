-- Update Supercheap Plan: Max Products 3 → 25
-- Run this SQL script directly against your database

BEGIN;

-- Step 1: Update the plan definition
UPDATE "BrandSubscriptionPlans"
SET "maxProducts" = 25,
    "updatedAt" = NOW()
WHERE "planType" = 'supercheap';

-- Verify the plan update
SELECT 
    "planType", 
    name, 
    "maxProducts", 
    "monthlyPrice",
    "updatedAt"
FROM "BrandSubscriptionPlans"
WHERE "planType" = 'supercheap';

-- Step 2: Update active subscriptions
-- First, let's see what we're updating
SELECT 
    id,
    "userId",
    "planType",
    status,
    features
FROM "BrandSubscription"
WHERE "planType" = 'supercheap'
  AND status = 'active'
  AND "deletedAt" IS NULL;

-- Update the features JSON to set maxProducts to 25
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

-- Verify the subscription updates
SELECT 
    id,
    "userId",
    "planType",
    status,
    features,
    "updatedAt"
FROM "BrandSubscription"
WHERE "planType" = 'supercheap'
  AND status = 'active'
  AND "deletedAt" IS NULL;

COMMIT;

-- Summary
SELECT 
    'Plan Updated' as status,
    COUNT(*) as affected_rows
FROM "BrandSubscriptionPlans"
WHERE "planType" = 'supercheap'
  AND "maxProducts" = 25
UNION ALL
SELECT 
    'Subscriptions Updated' as status,
    COUNT(*) as affected_rows
FROM "BrandSubscription"
WHERE "planType" = 'supercheap'
  AND status = 'active'
  AND "deletedAt" IS NULL
  AND features->>'maxProducts' = '25';

