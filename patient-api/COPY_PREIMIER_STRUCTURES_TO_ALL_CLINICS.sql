-- Copy Preimier's 4 Global Form Structures to All Other Clinics
-- This gives all clinics the same professional set of form flow options

UPDATE "Clinic"
SET "globalFormStructures" = '[
  {
    "id": "default",
    "name": "Default - Short form",
    "description": "Standard questionnaire flow for all products",
    "sections": [
      {
        "id": "product",
        "icon": "📦",
        "type": "product_questions",
        "label": "Product Questions",
        "order": 1,
        "enabled": true,
        "description": "Questions specific to each individual product"
      },
      {
        "id": "account",
        "icon": "👤",
        "type": "account_creation",
        "label": "Create Account",
        "order": 2,
        "enabled": true,
        "description": "Patient information collection"
      },
      {
        "id": "checkout",
        "icon": "💳",
        "type": "checkout",
        "label": "Payment & Checkout",
        "order": 3,
        "enabled": true,
        "description": "Billing and shipping"
      },
      {
        "id": "category",
        "icon": "📋",
        "type": "category_questions",
        "label": "Standardized Category Questions",
        "order": 4,
        "enabled": false,
        "description": "Questions shared across all products in a category"
      }
    ],
    "createdAt": "2025-11-06T00:00:00.000Z"
  },
  {
    "id": "1762381752300",
    "name": "Personalized Long",
    "description": "Category questions first for comprehensive intake",
    "sections": [
      {
        "id": "category",
        "icon": "📋",
        "type": "category_questions",
        "label": "Standardized Category Questions",
        "order": 1,
        "enabled": true,
        "description": "Questions shared across all products in a category"
      },
      {
        "id": "product",
        "icon": "📦",
        "type": "product_questions",
        "label": "Product Questions",
        "order": 2,
        "enabled": true,
        "description": "Questions specific to each individual product"
      },
      {
        "id": "account",
        "icon": "👤",
        "type": "account_creation",
        "label": "Create Account",
        "order": 3,
        "enabled": true,
        "description": "Patient information collection"
      },
      {
        "id": "checkout",
        "icon": "💳",
        "type": "checkout",
        "label": "Payment & Checkout",
        "order": 4,
        "enabled": true,
        "description": "Billing information and payment processing"
      }
    ],
    "createdAt": "2025-11-06T00:00:00.000Z"
  },
  {
    "id": "1762382187889",
    "name": "Personalized and Payment First",
    "description": "Payment after category questions",
    "sections": [
      {
        "id": "category",
        "icon": "📋",
        "type": "category_questions",
        "label": "Standardized Category Questions",
        "order": 1,
        "enabled": true,
        "description": "Questions shared across all products in a category"
      },
      {
        "id": "account",
        "icon": "👤",
        "type": "account_creation",
        "label": "Create Account",
        "order": 2,
        "enabled": true,
        "description": "Patient information collection"
      },
      {
        "id": "checkout",
        "icon": "💳",
        "type": "checkout",
        "label": "Payment & Checkout",
        "order": 3,
        "enabled": true,
        "description": "Billing information and payment processing"
      },
      {
        "id": "product",
        "icon": "📦",
        "type": "product_questions",
        "label": "Product Questions",
        "order": 4,
        "enabled": true,
        "description": "Questions specific to each individual product"
      }
    ],
    "createdAt": "2025-11-06T00:00:00.000Z"
  },
  {
    "id": "1762382604408",
    "name": "Payment First",
    "description": "Collect payment before medical questions",
    "sections": [
      {
        "id": "checkout",
        "icon": "💳",
        "type": "checkout",
        "label": "Payment & Checkout",
        "order": 1,
        "enabled": true,
        "description": "Billing information and payment processing"
      },
      {
        "id": "account",
        "icon": "👤",
        "type": "account_creation",
        "label": "Create Account",
        "order": 2,
        "enabled": true,
        "description": "Patient information collection"
      },
      {
        "id": "product",
        "icon": "📦",
        "type": "product_questions",
        "label": "Product Questions",
        "order": 3,
        "enabled": true,
        "description": "Questions specific to each individual product"
      },
      {
        "id": "category",
        "icon": "📋",
        "type": "category_questions",
        "label": "Standardized Category Questions",
        "order": 4,
        "enabled": false,
        "description": "Questions shared across all products in a category"
      }
    ],
    "createdAt": "2025-11-06T00:00:00.000Z"
  }
]'::jsonb
WHERE slug != 'preimier';  -- Don't overwrite preimier's custom structures

-- Verify all clinics now have 4 structures
SELECT 
  slug,
  jsonb_array_length("globalFormStructures") as structure_count,
  "globalFormStructures"->0->>'name' as first_structure,
  "globalFormStructures"->1->>'name' as second_structure,
  "globalFormStructures"->2->>'name' as third_structure,
  "globalFormStructures"->3->>'name' as fourth_structure
FROM "Clinic"
ORDER BY slug;

