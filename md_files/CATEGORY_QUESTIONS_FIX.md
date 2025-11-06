# Category Questions + Global Form Structure Fix

## Problem
The "Performance Personalization Questions" (category-level standardized questions) weren't showing up in the patient-facing form, even though the product has category: "performance".

## Root Cause
The Global Form Structure ordering logic was overwriting the standardized steps before they could be properly categorized and included.

## Solution

### Refactored Logic Flow

**OLD (Broken)**:
1. Load questionnaire steps
2. Merge standardized steps into questionnaire
3. Apply Global Form Structure ordering (overwrote standardized steps)

**NEW (Fixed)**:
1. Load questionnaire steps
2. Load standardized category steps **separately** (stored in `categoryQuestionSteps`)
3. If Global Form Structure exists:
   - Categorize steps: normal, userProfile, category (from API), others
   - Build ordered steps based on Global Form Structure sections
   - Include category steps when `category_questions` section is enabled
4. If no Global Form Structure:
   - Use default ordering with category questions included

### Code Changes

**File**: `patient-frontend/components/QuestionnaireModal/index.tsx`

**Lines 291-304**: Load category questions separately
```typescript
let categoryQuestionSteps: any[] = []
if (productCategory) {
  const stdRes = await fetch(`/api/public/questionnaires/standardized?category=${productCategory}`)
  categoryQuestionSteps = stdData.data.flatMap((q: any) => q.steps || [])
  console.log(`✅ Loaded ${categoryQuestionSteps.length} category question steps`)
}
```

**Lines 306-378**: Apply Global Form Structure ordering
```typescript
if (globalFormStructure) {
  for (const section of enabledSections) {
    switch (section.type) {
      case 'product_questions':
        orderedSteps.push(...normalSteps)
      case 'category_questions':
        orderedSteps.push(...categoryQuestionSteps) // Now includes category questions!
      case 'account_creation':
        orderedSteps.push(...userProfileSteps)
      case 'checkout':
        // Handled via checkoutStepPosition
    }
  }
}
```

## Testing

### Payment First Structure
URL: `http://preimier.localhost:3000/my-products/8251d1fb-641c-4df1-ad87-3531fa0e4781/nad`

**Expected Order** (based on Payment First structure):
1. 💳 **Payment & Checkout** (checkout section - order: 1)
2. 👤 **Create Account** (account_creation section - order: 2)
3. 📦 **Product Questions** (product_questions section - order: 3)
   - "Have you taken NAD+ medication before?"
4. ❌ **No category questions** (category_questions section is **disabled** in Payment First)

### Personalized Long Structure
URL: `http://preimier.localhost:3000/my-products/e027d614-c828-4995-bd2e-83796fdd9836/nad`

**Expected Order** (based on Personalized Long structure):
1. 📋 **Standardized Category Questions** (order: 1, **enabled**)
   - "What are you looking to accomplish?"
   - "More Energy", "Better Sleep", etc.
2. 📦 **Product Questions** (order: 2)
   - "Have you taken NAD+ medication before?"
3. 👤 **Create Account** (order: 3)
4. 💳 **Payment & Checkout** (order: 4)

## Expected Console Logs

For **Payment First**:
```
🎯 Product data received with Global Form Structure: Payment First
✅ Loaded 4 category question steps for performance
🎯 Applying Global Form Structure ordering: Payment First
  Enabled sections: ["1. Payment & Checkout (checkout)", "2. Create Account (account_creation)", "3. Product Questions (product_questions)"]
  Available steps - normal: 1 userProfile: 8 category: 4
  → Checkout section (handled separately)
  → Adding 8 account creation steps
  → Adding 1 product question steps
✅ Checkout position set to: 0
```

For **Personalized Long**:
```
🎯 Product data received with Global Form Structure: Personalized Long
✅ Loaded 4 category question steps for performance
🎯 Applying Global Form Structure ordering: Personalized Long
  Enabled sections: ["1. Standardized Category Questions (category_questions)", "2. Product Questions (product_questions)", ...]
  Available steps - normal: 1 userProfile: 8 category: 4
  → Adding 4 category question steps
  → Adding 1 product question steps
  → Adding 8 account creation steps
✅ Checkout position set to: 4
```

## Verification

After refreshing with **Cmd+Shift+R**, check:
- ✅ Category questions appear in forms where `category_questions` section is **enabled**
- ✅ Category questions DON'T appear where section is **disabled** (like Payment First)
- ✅ Section order matches the Global Form Structure configuration

