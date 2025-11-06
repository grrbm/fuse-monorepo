# Global Form Structure Section Ordering - Implementation Guide

## Current Issue
The "Payment First" form structure shows sections in the wrong order. Payment should be first, but it's appearing in the default order.

## Solution Overview

The Global Form Structure defines the section order like this:

```json
{
  "id": "1762382604408",
  "name": "Payment First",
  "sections": [
    { "id": "checkout", "type": "checkout", "order": 1, "enabled": true },
    { "id": "account", "type": "account_creation", "order": 2, "enabled": true },
    { "id": "product", "type": "product_questions", "order": 3, "enabled": true },
    { "id": "category", "type": "category_questions", "order": 4, "enabled": false }
  ]
}
```

## Section Type Mapping

- **`product_questions`** → Normal questionnaire steps (category: 'normal' or null)
- **`category_questions`** → Standardized category template steps  
- **`account_creation`** → User profile steps (category: 'user_profile')
- **`checkout`** → Payment/checkout step (handled separately via checkoutStepPosition)

## What Was Done

### ✅ Backend (patient-api/src/main.ts)
- Updated `/public/brand-products/:clinicSlug/:slug` endpoint
- Now returns `globalFormStructureId` and `globalFormStructure` in the response
- The structure is fetched from the Clinic's `globalFormStructures` JSON field

### ✅ Frontend (patient-frontend)
- Updated `PublicProduct` interface to include `globalFormStructure`
- Passes `globalFormStructure` to `QuestionnaireModal`
- Added `globalFormStructure` prop to `QuestionnaireModalProps`

### 🔧 TODO: QuestionnaireModal Section Reordering

The `QuestionnaireModal` component needs to be updated to use the Global Form Structure to reorder sections.

**Current logic** (lines 260-320 in index.tsx):
```typescript
// Current: Default ordering
const normal = steps.filter(s => s.category === 'normal').sort(by stepOrder)
const userProfile = steps.filter(s => s.category === 'user_profile').sort(by stepOrder)
const standardized = standardizedSteps.sort(by stepOrder)
const merged = [...normal, ...userProfile, ...standardized]
```

**New logic** (needs implementation):
```typescript
if (globalFormStructure && globalFormStructure.sections) {
  // Use Global Form Structure to determine order
  const enabledSections = globalFormStructure.sections
    .filter(s => s.enabled)
    .sort((a, b) => a.order - b.order)
  
  const orderedSteps = []
  
  for (const section of enabledSections) {
    switch (section.type) {
      case 'product_questions':
        // Add normal questionnaire steps
        orderedSteps.push(...normalSteps)
        break
      case 'category_questions':
        // Add standardized category steps
        orderedSteps.push(...standardizedSteps)
        break
      case 'account_creation':
        // Add user profile steps
        orderedSteps.push(...userProfileSteps)
        break
      case 'checkout':
        // Checkout handled separately by checkoutStepPosition
        break
    }
  }
  
  questionnaireData.steps = orderedSteps
} else {
  // Fall back to default ordering
  questionnaireData.steps = [...normalSteps, ...userProfileSteps, ...standardizedSteps]
}
```

## Testing

After implementation:
1. Open: `http://preimier.localhost:3000/my-products/8251d1fb-641c-4df1-ad87-3531fa0e4781/nad`
2. The first step should be **Payment & Checkout** (not Product Questions)
3. Second step should be **Create Account**
4. Third step should be **Product Questions**

## Files to Modify

- ✅ `patient-api/src/main.ts` - DONE
- ✅ `patient-frontend/pages/my-products/[extra]/[slug].tsx` - DONE  
- ✅ `patient-frontend/components/QuestionnaireModal/types.ts` - DONE
- 🔧 `patient-frontend/components/QuestionnaireModal/index.tsx` - NEEDS IMPLEMENTATION

The last file is quite large (~2600 lines) and complex, so implementing the section reordering logic requires careful modification.

