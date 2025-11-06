# Global Form Structure System - Developer Guide

## Overview

The Global Form Structure system allows clinics to create multiple form flow templates (structures) that determine how questionnaire sections are ordered and displayed. Each product in the admin portal automatically gets one form instance per global form structure.

**Key Principle**: `Number of Global Form Structures = Number of Forms per Product`

## Architecture

### 1. Data Models

#### Clinic Model (`patient-api/src/models/Clinic.ts`)

```typescript
@Column({
  type: DataType.JSONB,
  allowNull: true,
})
declare globalFormStructures?: any[]
```

**Purpose**: Stores an array of global form structure configurations as JSONB in the database.

**Example Structure**:
```json
[
  {
    "id": "default",
    "name": "Default Flow",
    "description": "Standard questionnaire flow",
    "sections": [
      {
        "id": "product",
        "type": "product_questions",
        "label": "Product Questions",
        "order": 1,
        "enabled": true,
        "icon": "📦"
      },
      {
        "id": "category",
        "type": "category_questions", 
        "label": "Standardized Category Questions",
        "order": 2,
        "enabled": true,
        "icon": "📋"
      },
      {
        "id": "account",
        "type": "account_creation",
        "label": "Create Account",
        "order": 3,
        "enabled": true,
        "icon": "👤"
      },
      {
        "id": "checkout",
        "type": "checkout",
        "label": "Payment & Checkout",
        "order": 4,
        "enabled": true,
        "icon": "💳"
      }
    ],
    "isDefault": true
  },
  {
    "id": "1762382604408",
    "name": "Payment First",
    "description": "Payment before questions",
    "sections": [
      {
        "id": "checkout",
        "type": "checkout",
        "order": 1,
        "enabled": true
      },
      {
        "id": "account",
        "type": "account_creation",
        "order": 2,
        "enabled": true
      },
      {
        "id": "product",
        "type": "product_questions",
        "order": 3,
        "enabled": true
      }
    ]
  }
]
```

#### TenantProductForm Model (`patient-api/src/models/TenantProductForm.ts`)

```typescript
@Column({
  type: DataType.STRING,
  allowNull: true,
})
declare globalFormStructureId?: string | null
```

**Purpose**: Links each form instance to a specific global form structure.

**Uniqueness Constraint**: Each product gets exactly ONE form per structure:
```typescript
{
  productId: UUID,
  clinicId: UUID,
  questionnaireId: UUID,
  globalFormStructureId: "default" | "1762382604408" | etc.
}
```

### 2. Section Types

The system supports four section types:

| Type | Description | Category Mapping | Database Field |
|------|-------------|------------------|----------------|
| `product_questions` | Product-specific questions | `category: 'normal'` or `null` | In Questionnaire steps |
| `category_questions` | Standardized category questions shared across products | Template system | FormSectionTemplate |
| `account_creation` | User profile/account creation | `category: 'user_profile'` | In Questionnaire steps |
| `checkout` | Payment & checkout | Handled separately | N/A (special handling) |

## System Flow

### 1. Creating Global Form Structures (Tenant Portal)

**Location**: `fuse-tenant-portal-frontend/pages/forms/index.tsx` (Global Structure Tab)

**Features**:
- Drag & drop section reordering
- Enable/disable sections
- Multiple structure creation
- Real-time preview

**API Endpoints**:
```typescript
// GET structures
GET /global-form-structures
Response: { success: true, data: GlobalStructure[] }

// SAVE structures  
POST /global-form-structures
Body: { structures: GlobalStructure[] }
Response: { success: true, message: 'Structures saved successfully' }
```

**Backend Implementation** (`patient-api/src/main.ts` lines 1244-1318):
- Fetches structures from `clinic.globalFormStructures`
- Returns default structure if none exist
- Saves array of structures to clinic JSONB field

### 2. Auto-Creating Forms per Structure (Admin Portal)

**Location**: `fuse-admin-frontend/pages/products/[id].tsx` (lines 313-368)

**Auto-Enable Logic**:
```typescript
// For EACH global form structure
for (const structure of globalStructures) {
  const structureId = structure.id
  const questionnaireId = product.questionnaireId
  
  // Check if form already exists
  const existingForm = enabledForms.find(f => 
    f.questionnaireId === questionnaireId &&
    f.globalFormStructureId === structureId
  )
  
  // Create if missing
  if (!existingForm) {
    await POST('/admin/tenant-product-forms', {
      productId,
      questionnaireId,
      currentFormVariant: null,
      globalFormStructureId: structureId
    })
  }
}
```

**Result**: Each product automatically gets one form per global structure on page load.

**Display Logic** (lines 851-864):
```typescript
// Show each structure with its form
for (const structure of globalStructures) {
  const formsForStructure = enabledForms.filter(f => 
    f.globalFormStructureId === structure.id
  )
  
  // Display structure card with:
  // - Structure name
  // - Preview URL
  // - Copy URL button
}
```

### 3. Backend Form Creation

**Endpoint**: `POST /admin/tenant-product-forms`

**Location**: `patient-api/src/main.ts` (lines ~9800-9900)

**Key Logic**:
```typescript
const [form, created] = await TenantProductForm.findOrCreate({
  where: {
    productId,
    clinicId,
    questionnaireId,
    globalFormStructureId: req.body.globalFormStructureId || 'default',
    currentFormVariant: req.body.currentFormVariant || null
  },
  defaults: {
    tenantId,
    layoutTemplate: 'layout_a',
    publishedUrl: generatePublishedUrl(), // Auto-generated
    lastPublishedAt: new Date()
  }
})
```

**URL Generation** (from memory):
```
Format: {clinicSlug}.localhost:3000/my-products/{formId}/{productSlug}
Example: preimier.localhost:3000/my-products/8251d1fb-641c-4df1-ad87-3531fa0e4781/nad
```

### 4. Patient-Facing Form Rendering

**Location**: `patient-frontend/pages/my-products/[extra]/[slug].tsx`

**Receives**:
```typescript
interface PublicProduct {
  id: string
  name: string
  slug: string
  questionnaireId: string
  globalFormStructureId: string
  globalFormStructure: {
    id: string
    name: string
    sections: FormSection[]
  }
}
```

**Rendering** (`patient-frontend/components/QuestionnaireModal/index.tsx`):

Currently the section ordering logic uses the global form structure to determine order:

```typescript
if (globalFormStructure && globalFormStructure.sections) {
  const enabledSections = globalFormStructure.sections
    .filter(s => s.enabled)
    .sort((a, b) => a.order - b.order)
  
  const orderedSteps = []
  
  for (const section of enabledSections) {
    switch (section.type) {
      case 'product_questions':
        orderedSteps.push(...normalQuestionSteps)
        break
      case 'category_questions':
        orderedSteps.push(...standardizedCategorySteps)
        break
      case 'account_creation':
        orderedSteps.push(...userProfileSteps)
        break
      case 'checkout':
        // Handled via checkoutStepPosition
        break
    }
  }
  
  questionnaireData.steps = orderedSteps
}
```

## Database Schema

### Migration: Add globalFormStructures to Clinic

**File**: `patient-api/migrations/20251105170000-add-global-form-structures-to-clinic.js`

```javascript
await queryInterface.addColumn('Clinic', 'globalFormStructures', {
  type: Sequelize.JSONB,
  allowNull: true,
});
```

### Migration: Add globalFormStructureId to TenantProductForms

**File**: `patient-api/migrations/20251105173658-add-global-form-structure-id-to-tenant-product-forms.js`

```javascript
await queryInterface.addColumn('TenantProductForms', 'globalFormStructureId', {
  type: Sequelize.STRING,
  allowNull: true,
});

await queryInterface.addIndex('TenantProductForms', ['globalFormStructureId'], {
  name: 'tenant_product_forms_structure_id_idx'
});
```

## Example Scenarios

### Scenario 1: Clinic with 4 Global Form Structures

**Structures**:
1. Default - Short form
2. Personalized Long
3. Personalized and Payment First
4. Payment First

**Product**: NAD+ IV Therapy

**Result**: 
- 4 TenantProductForm records created automatically
- Each with unique `globalFormStructureId`
- Each with unique `publishedUrl`
- Admin sees 4 different preview URLs

### Scenario 2: Adding a 5th Structure

**Action**: Clinic creates "Medical Intake First" structure

**Automatic Result**:
- Next time admin visits ANY product page
- System detects missing form for new structure
- Auto-creates 5th form for that product
- All products now have 5 forms each

### Scenario 3: A/B Testing Different Flows

**Use Case**: Compare conversion rates

**Setup**:
1. Create "Payment First" structure
2. Create "Questions First" structure
3. Each gets unique URL
4. Send 50% of traffic to each URL
5. Compare conversion in analytics

## Key Files Reference

### Backend (`patient-api`)
- `src/models/Clinic.ts` - Clinic model with globalFormStructures JSONB
- `src/models/TenantProductForm.ts` - Form model with globalFormStructureId
- `src/main.ts` lines 1244-1318 - Global structure CRUD endpoints
- `src/main.ts` lines ~9800-9900 - TenantProductForm creation
- `src/main.ts` lines ~10030-10060 - Product endpoint with structure data
- `migrations/20251105170000-add-global-form-structures-to-clinic.js`
- `migrations/20251105173658-add-global-form-structure-id-to-tenant-product-forms.js`

### Admin Portal (`fuse-admin-frontend`)
- `pages/products/[id].tsx` lines 313-368 - Auto-enable logic
- `pages/products/[id].tsx` lines 851-864 - Structure display

### Tenant Portal (`fuse-tenant-portal-frontend`)
- `pages/forms/index.tsx` lines 923-1374 - Global structure management UI
- `pages/forms/structure.tsx` - Standalone structure editor (deprecated)

### Patient Frontend (`patient-frontend`)
- `pages/my-products/[extra]/[slug].tsx` - Public product page
- `components/QuestionnaireModal/index.tsx` - Form rendering with structure ordering
- `components/QuestionnaireModal/types.ts` - Type definitions

## Testing Checklist

### ✅ Backend
- [ ] GET `/global-form-structures` returns structures for clinic
- [ ] POST `/global-form-structures` saves to `clinic.globalFormStructures`
- [ ] POST `/admin/tenant-product-forms` accepts `globalFormStructureId`
- [ ] Forms have unique constraint on (productId, clinicId, questionnaireId, globalFormStructureId)
- [ ] `publishedUrl` generated correctly with formId before productSlug

### ✅ Admin Portal
- [ ] Product page loads all global structures from clinic
- [ ] Auto-creates exactly 1 form per structure per product
- [ ] Displays one card per structure
- [ ] Each structure shows its form's preview URL
- [ ] No duplicate forms created on page refresh

### ✅ Tenant Portal  
- [ ] Global Structure tab shows all structures
- [ ] Can create new structures
- [ ] Can edit existing structures
- [ ] Can reorder sections via drag & drop
- [ ] Can enable/disable sections
- [ ] Save persists to backend

### ✅ Patient Frontend
- [ ] URL format: `{clinicSlug}.{domain}/my-products/{formId}/{productSlug}`
- [ ] Receives globalFormStructure in product data
- [ ] Sections render in correct order based on structure
- [ ] "Payment First" structure shows payment first
- [ ] Disabled sections don't render

## Common Issues & Solutions

### Issue 1: Forms duplicating on page refresh
**Cause**: Auto-enable logic creating multiple forms  
**Fix**: Check for existing forms before creating
```typescript
if (existingFormsForStructure.length === 0) {
  // Only create if none exist
}
```

### Issue 2: Wrong section order in patient form
**Cause**: QuestionnaireModal not using globalFormStructure  
**Fix**: Implement section reordering logic based on structure.sections[].order

### Issue 3: publishedUrl format incorrect
**Cause**: Old URL format had productSlug before formId  
**Fix**: Use format `{formId}/{productSlug}` per memory [[memory:10824743]]

### Issue 4: TypeScript type errors with globalFormStructure
**Cause**: Type narrowing to `never`  
**Fix**: Explicitly type: `let globalFormStructure: any | null = null`

## Future Enhancements

1. **Structure Analytics**: Track conversion rates per structure
2. **A/B Testing UI**: Built-in traffic splitting
3. **Structure Templates**: Shareable structure presets
4. **Conditional Logic**: Enable sections based on product category
5. **Version Control**: Track structure changes over time
6. **Structure Cloning**: Duplicate structures for quick variants

## Questions for Your Team

1. **Multi-tenancy**: Should structures be shared across clinics or isolated?
   - Current: Each clinic has its own structures ✅
   
2. **Form Variants**: Should `currentFormVariant` field be deprecated?
   - Current: Set to `null` for all forms
   
3. **Migration Path**: How to handle products created before global structures?
   - Current: Auto-creates forms with `globalFormStructureId: 'default'`

4. **Structure Deletion**: What happens to forms when a structure is deleted?
   - Recommendation: Soft delete or prevent deletion if forms exist

---

**Last Updated**: November 6, 2025  
**Maintainer**: Daniel Meursing  
**Version**: 1.0

