-- Add Default Global Form Structures to All Clinics
-- This fixes the issue where only "preimier" clinic has global form structures
-- Run this to enable form auto-creation for all clinics

-- Update all clinics that have NULL globalFormStructures
UPDATE "Clinic"
SET "globalFormStructures" = '[
  {
    "id": "default",
    "name": "Default Flow",
    "description": "Standard questionnaire flow for all products",
    "sections": [
      {
        "id": "product",
        "type": "product_questions",
        "label": "Product Questions",
        "description": "Questions specific to each individual product",
        "order": 1,
        "enabled": true,
        "icon": "📦"
      },
      {
        "id": "category",
        "type": "category_questions",
        "label": "Standardized Category Questions",
        "description": "Questions shared across all products in a category",
        "order": 2,
        "enabled": true,
        "icon": "📋"
      },
      {
        "id": "account",
        "type": "account_creation",
        "label": "Create Account",
        "description": "Patient information collection",
        "order": 3,
        "enabled": true,
        "icon": "👤"
      },
      {
        "id": "checkout",
        "type": "checkout",
        "label": "Payment & Checkout",
        "description": "Billing and shipping",
        "order": 4,
        "enabled": true,
        "icon": "💳"
      }
    ],
    "isDefault": true,
    "createdAt": "' || NOW() || '"
  }
]'::jsonb
WHERE "globalFormStructures" IS NULL;

-- Verify the update
SELECT 
  slug,
  name,
  CASE 
    WHEN "globalFormStructures" IS NULL THEN 'NULL - NEEDS FIX'
    ELSE 'HAS STRUCTURES ✓'
  END as structure_status,
  jsonb_array_length("globalFormStructures") as structure_count
FROM "Clinic"
ORDER BY slug;

-- Check how many clinics were updated
SELECT 
  COUNT(*) as total_clinics,
  SUM(CASE WHEN "globalFormStructures" IS NOT NULL THEN 1 ELSE 0 END) as clinics_with_structures,
  SUM(CASE WHEN "globalFormStructures" IS NULL THEN 1 ELSE 0 END) as clinics_without_structures
FROM "Clinic";

