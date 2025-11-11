# Global Form Structure - Quick Reference

## 🎯 Core Concept

**One Simple Rule**: 
```
Number of Global Form Structures = Number of Forms per Product
```

4 structures → 4 forms per product  
5 structures → 5 forms per product

## 📊 Data Flow

```
Clinic.globalFormStructures (JSONB)
    ↓
Admin creates Product
    ↓
Auto-creates TenantProductForms (one per structure)
    ↓
Each form has unique publishedUrl
    ↓
Patient opens form URL
    ↓
Renders sections in structure's defined order
```

## 🗂️ Section Types

| Type | What It Is | Example |
|------|-----------|---------|
| `product_questions` | Product-specific questions | "Have you taken NAD+ before?" |
| `category_questions` | Shared category questions | Weight loss template for all weight loss products |
| `account_creation` | User signup info | Name, email, phone |
| `checkout` | Payment & shipping | Credit card, address |

## 🔑 Key Fields

### Clinic Model
```typescript
globalFormStructures: Array<{
  id: string                // "default", "1762382604408", etc.
  name: string              // "Payment First"
  description: string       // "Payment before questions"
  sections: Array<{
    id: string              // "checkout", "account", etc.
    type: string            // Section type
    order: number           // Display order (1, 2, 3, 4)
    enabled: boolean        // Show/hide
    icon: string            // "💳"
  }>
}>
```

### TenantProductForm Model
```typescript
{
  id: UUID
  productId: UUID
  clinicId: UUID
  questionnaireId: UUID
  globalFormStructureId: string     // Links to structure
  publishedUrl: string              // Patient-facing URL
  currentFormVariant: string | null // Deprecated
}
```

## 📍 URL Format

```
{clinicSlug}.localhost:3000/my-products/{formId}/{productSlug}
                                           ^^^^^^  ^^^^^^^^^^^
                                           FIRST   SECOND

Example:
preimier.localhost:3000/my-products/8251d1fb-641c-4df1-ad87-3531fa0e4781/nad
```

## 🔧 Key API Endpoints

### Get Global Structures
```http
GET /global-form-structures
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "default",
      "name": "Default Flow",
      "sections": [...]
    }
  ]
}
```

### Save Global Structures
```http
POST /global-form-structures
Authorization: Bearer {token}
Content-Type: application/json

{
  "structures": [...]
}
```

### Create Form for Product
```http
POST /admin/tenant-product-forms
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "uuid",
  "questionnaireId": "uuid",
  "globalFormStructureId": "default",
  "currentFormVariant": null
}
```

## 🎨 Example Structures

### Default Structure
```json
{
  "id": "default",
  "name": "Default Flow",
  "sections": [
    { "type": "product_questions", "order": 1, "enabled": true },
    { "type": "category_questions", "order": 2, "enabled": true },
    { "type": "account_creation", "order": 3, "enabled": true },
    { "type": "checkout", "order": 4, "enabled": true }
  ]
}
```

### Payment First Structure
```json
{
  "id": "1762382604408",
  "name": "Payment First",
  "sections": [
    { "type": "checkout", "order": 1, "enabled": true },
    { "type": "account_creation", "order": 2, "enabled": true },
    { "type": "product_questions", "order": 3, "enabled": true },
    { "type": "category_questions", "order": 4, "enabled": false }
  ]
}
```

### Short Form (No Categories)
```json
{
  "id": "short",
  "name": "Short Form",
  "sections": [
    { "type": "product_questions", "order": 1, "enabled": true },
    { "type": "account_creation", "order": 2, "enabled": true },
    { "type": "checkout", "order": 3, "enabled": true },
    { "type": "category_questions", "order": 4, "enabled": false }
  ]
}
```

## 🏃 Quick Start

### 1. Create a New Global Structure (Tenant Portal)

1. Navigate to Forms → Global Structure tab
2. Click "Add New Structure"
3. Name it (e.g., "Payment First")
4. Drag sections to reorder
5. Toggle sections on/off
6. Click Save

### 2. View Forms in Admin Portal

1. Navigate to Products
2. Click on any product
3. Scroll to "Form Configurations" section
4. See one card per global structure
5. Each shows preview URL

### 3. Test Patient Form

1. Copy preview URL from admin
2. Open in incognito/private window
3. Verify sections appear in correct order
4. Test full checkout flow

## 🐛 Common Issues

### Forms Not Auto-Creating?
**Check**: Does clinic have global structures?
```sql
SELECT "globalFormStructures" FROM "Clinic" WHERE id = 'clinic-uuid';
```

### Wrong Section Order?
**Check**: QuestionnaireModal using globalFormStructure prop
```typescript
// Should sort sections by structure.sections[].order
```

### URL 404 Error?
**Check**: URL format is `{formId}/{productSlug}` not `{productSlug}/{formId}`

### Duplicate Forms?
**Check**: Auto-enable logic only creates if `existingForms.length === 0`

## 📂 File Locations

| What | Where |
|------|-------|
| Create Structures | `fuse-tenant-portal-frontend/pages/forms/index.tsx` |
| View Forms | `fuse-admin-frontend/pages/products/[id].tsx` |
| Patient Form | `patient-frontend/pages/my-products/[extra]/[slug].tsx` |
| Structure CRUD | `patient-api/src/main.ts` lines 1244-1318 |
| Form Creation | `patient-api/src/main.ts` lines ~9800-9900 |
| Clinic Model | `patient-api/src/models/Clinic.ts` |
| Form Model | `patient-api/src/models/TenantProductForm.ts` |

## 💡 Pro Tips

1. **Always start with "default" structure** - It's created automatically
2. **Use descriptive structure names** - "Payment First" not "Structure 2"
3. **Test URLs in incognito** - Avoids auth/cache issues
4. **Check console logs** - Auto-enable logic is verbose
5. **One structure = one use case** - E.g., "High-intent buyers", "Hesitant shoppers"

## 🔍 SQL Queries

### View All Structures for Clinic
```sql
SELECT "globalFormStructures" 
FROM "Clinic" 
WHERE slug = 'preimier';
```

### View Forms for Product
```sql
SELECT 
  id,
  "globalFormStructureId",
  "publishedUrl",
  "questionnaireId"
FROM "TenantProductForms"
WHERE "productId" = 'product-uuid'
ORDER BY "globalFormStructureId";
```

### Count Forms Per Structure
```sql
SELECT 
  "globalFormStructureId",
  COUNT(*) as form_count
FROM "TenantProductForms"
WHERE "clinicId" = 'clinic-uuid'
GROUP BY "globalFormStructureId";
```

## 📚 Related Docs

- `GLOBAL_FORM_STRUCTURE_DEVELOPER_GUIDE.md` - Full technical documentation
- `GLOBAL_FORM_STRUCTURE_IMPLEMENTATION.md` - Implementation details
- `GLOBAL_FORM_STRUCTURE_SUPPORT.md` - Support history
- `CORRECTED_FORM_MODEL.md` - Data model explanation

---

**Questions?** Check the full Developer Guide or contact the platform team.

