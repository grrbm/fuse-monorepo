# Global Form Structure - Troubleshooting Guide

## 🔍 Diagnostic Tools

### Check Clinic's Global Form Structures
```sql
SELECT 
  slug,
  "globalFormStructures"
FROM "Clinic"
WHERE slug = 'preimier';
```

Expected result: JSONB array with structures

### Check Forms for a Product
```sql
SELECT 
  id,
  "productId",
  "globalFormStructureId",
  "publishedUrl",
  "createdAt"
FROM "TenantProductForms"
WHERE "productId" = 'YOUR-PRODUCT-UUID'
ORDER BY "globalFormStructureId";
```

Expected: One row per global structure

### Check Form Count by Structure
```sql
SELECT 
  "globalFormStructureId",
  COUNT(*) as form_count
FROM "TenantProductForms"
WHERE "clinicId" = 'YOUR-CLINIC-UUID'
GROUP BY "globalFormStructureId";
```

Expected: Equal counts across all structures

---

## 🐛 Common Issues

### Issue 1: Forms Not Auto-Creating in Admin Portal

**Symptoms:**
- Open product page in admin
- No forms shown under "Form Configurations"
- Console shows no auto-enable attempts

**Diagnosis:**

1. **Check if clinic has global structures:**
```sql
SELECT "globalFormStructures" FROM "Clinic" WHERE id = 'clinic-uuid';
```

2. **Check browser console:**
```javascript
// Should see:
"Auto-enabling form for structure default with questionnaire abc-123"
"✅ Form created for structure default"
```

**Solutions:**

**A. Clinic has no structures (NULL or [])**
```sql
-- Create default structure
UPDATE "Clinic"
SET "globalFormStructures" = '[
  {
    "id": "default",
    "name": "Default Flow",
    "sections": [
      {"id": "product", "type": "product_questions", "order": 1, "enabled": true},
      {"id": "category", "type": "category_questions", "order": 2, "enabled": true},
      {"id": "account", "type": "account_creation", "order": 3, "enabled": true},
      {"id": "checkout", "type": "checkout", "order": 4, "enabled": true}
    ],
    "isDefault": true
  }
]'::jsonb
WHERE id = 'clinic-uuid';
```

**B. Product has no questionnaire:**
```sql
-- Check if product has questionnaireId
SELECT id, name, "questionnaireId" FROM "Product" WHERE id = 'product-uuid';

-- If NULL, product needs a questionnaire assigned
```

**C. Auto-enable logic not running:**
- Check `fuse-admin-frontend/pages/products/[id].tsx` lines 313-368
- Ensure `useEffect` dependencies include `[token, id, user]`
- Clear browser cache and reload

---

### Issue 2: Duplicate Forms Created

**Symptoms:**
- Same structure has 2+ forms for one product
- Admin shows multiple "Default Flow" cards

**Diagnosis:**
```sql
SELECT 
  "productId",
  "globalFormStructureId",
  COUNT(*) as duplicate_count
FROM "TenantProductForms"
GROUP BY "productId", "globalFormStructureId"
HAVING COUNT(*) > 1;
```

**Solutions:**

**A. Delete duplicates (keep newest):**
```sql
WITH RankedForms AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "productId", "globalFormStructureId"
      ORDER BY "createdAt" DESC
    ) as rn
  FROM "TenantProductForms"
  WHERE "productId" = 'product-uuid'
)
DELETE FROM "TenantProductForms"
WHERE id IN (
  SELECT id FROM RankedForms WHERE rn > 1
);
```

**B. Fix auto-enable logic:**
Check that this condition is in place:
```typescript
if (existingFormsForStructure.length === 0) {
  // Only create if ZERO exist
}
```

---

### Issue 3: Wrong Section Order in Patient Form

**Symptoms:**
- "Payment First" structure still shows products first
- Sections not in order defined by structure

**Diagnosis:**

1. **Check structure definition:**
```sql
SELECT "globalFormStructures"
FROM "Clinic"
WHERE slug = 'preimier';
```

Look for structure with correct `order` values:
```json
{
  "sections": [
    {"type": "checkout", "order": 1},      // Should be first
    {"type": "account_creation", "order": 2},
    {"type": "product_questions", "order": 3}
  ]
}
```

2. **Check if globalFormStructure is passed to frontend:**
Open browser console on patient form:
```javascript
// Check network tab for /public/brand-products response
// Should include: globalFormStructure: { name: "...", sections: [...] }
```

3. **Check QuestionnaireModal props:**
```typescript
// In patient-frontend/components/QuestionnaireModal/index.tsx
console.log('globalFormStructure:', globalFormStructure)
```

**Solutions:**

**A. Structure order incorrect:**
- Go to Tenant Portal → Forms → Global Structure tab
- Drag sections to correct order
- Save

**B. Backend not returning structure:**
Check `patient-api/src/main.ts` endpoint `/public/brand-products/:clinicSlug/:slug`:
```typescript
// Should include:
const globalFormStructure = structures.find(
  s => s.id === selectedForm.globalFormStructureId
) || null

return res.json({
  // ...
  globalFormStructure: globalFormStructure
})
```

**C. Frontend not using structure:**
Check `patient-frontend/components/QuestionnaireModal/index.tsx`:
```typescript
// Should reorder sections based on structure.sections[].order
if (globalFormStructure?.sections) {
  const enabledSections = globalFormStructure.sections
    .filter(s => s.enabled)
    .sort((a, b) => a.order - b.order)
  
  // Build steps in order
}
```

---

### Issue 4: Published URL 404 Error

**Symptoms:**
- Click preview URL from admin
- Gets 404 or "Product not found"

**Diagnosis:**

1. **Check URL format:**
```
Correct:   preimier.localhost:3000/my-products/{formId}/{productSlug}
Incorrect: preimier.localhost:3000/my-products/{productSlug}/{formId}
                                                 ^^^^^^^^^^^^^ ^^^^^^
                                                 WRONG ORDER
```

2. **Check publishedUrl in database:**
```sql
SELECT "publishedUrl" FROM "TenantProductForms" WHERE id = 'form-uuid';
```

3. **Check route in frontend:**
```
Should be: patient-frontend/pages/my-products/[extra]/[slug].tsx
Where [extra] = formId, [slug] = productSlug
```

**Solutions:**

**A. URL format wrong:**
```sql
-- Regenerate URLs with correct format
UPDATE "TenantProductForms" tpf
SET "publishedUrl" = CONCAT(
  c.slug,
  CASE 
    WHEN c."isCustomDomain" THEN CONCAT('.', c."customDomain")
    ELSE '.localhost:3000'
  END,
  '/my-products/',
  tpf.id,              -- formId FIRST
  '/',
  p.slug               -- productSlug SECOND
)
FROM "Clinic" c, "Product" p
WHERE tpf."clinicId" = c.id
  AND tpf."productId" = p.id;
```

**B. Route not matching:**
Check `patient-frontend/pages/my-products/[extra]/[slug].tsx`:
```typescript
const { extra, slug } = router.query
// extra should be formId
// slug should be productSlug
```

---

### Issue 5: New Global Structure Not Creating Forms

**Symptoms:**
- Created 4th structure in tenant portal
- Existing products still only show 3 forms
- New structure not appearing in admin

**Diagnosis:**

1. **Check if structure was saved:**
```sql
SELECT "globalFormStructures" FROM "Clinic" WHERE slug = 'preimier';
```

Should see 4 structures in array.

2. **Check admin product page console:**
```javascript
// Should show:
"Auto-enabling form for structure new-structure-id with questionnaire..."
```

**Solutions:**

**A. Structure not saved:**
- Tenant Portal → Forms → Global Structure tab
- Ensure you clicked "Save"
- Check network tab for successful POST response

**B. Auto-enable not triggered:**
- Hard refresh admin product page (Cmd+Shift+R / Ctrl+Shift+R)
- Clear browser cache
- Check that `globalStructures` state includes new structure

**C. Manual form creation:**
```typescript
// POST to /admin/tenant-product-forms
{
  "productId": "product-uuid",
  "questionnaireId": "questionnaire-uuid",
  "globalFormStructureId": "new-structure-id",
  "currentFormVariant": null
}
```

---

### Issue 6: TypeScript Build Errors

**Symptoms:**
```
error TS2339: Property 'name' does not exist on type 'never'.
```

**Diagnosis:**
TypeScript is narrowing type to `never` due to missing type annotations.

**Solutions:**

**A. Add explicit type annotation:**
```typescript
// Before (causes error):
let globalFormStructure = null

// After (works):
let globalFormStructure: any | null = null
```

**B. Common locations:**
- `patient-api/src/main.ts` (backend endpoints)
- `fuse-admin-frontend/pages/products/[id].tsx` (admin portal)
- `patient-frontend/components/QuestionnaireModal/index.tsx` (patient form)

---

### Issue 7: Sections Not Showing for Some Users

**Symptoms:**
- Admin sees forms
- Patients see "No questionnaire available"
- Or some sections are blank

**Diagnosis:**

1. **Check if questionnaire has steps:**
```sql
SELECT 
  q.id,
  q.name,
  q.schema
FROM "Questionnaire" q
WHERE q.id = 'questionnaire-uuid';
```

Schema should have `steps` array.

2. **Check section enablement:**
```sql
SELECT "globalFormStructures" FROM "Clinic" WHERE slug = 'preimier';
```

Ensure sections have `"enabled": true`.

**Solutions:**

**A. Questionnaire has no steps:**
- Go to Tenant Portal → Forms → Products tab
- Click "Edit" on product questionnaire
- Add questions/steps
- Save

**B. Section disabled in structure:**
- Tenant Portal → Forms → Global Structure tab
- Enable required sections
- Save

**C. Category questions not created:**
- Check if product has category assigned
- Create standardized category template
- Assign to products in that category

---

## 🧪 Testing Checklist

### After Creating New Structure

- [ ] Structure appears in tenant portal structure list
- [ ] Structure saved to database (`SELECT "globalFormStructures"`)
- [ ] Admin product page shows new structure card
- [ ] New form auto-created for each product
- [ ] Preview URL works in patient portal
- [ ] Sections appear in correct order
- [ ] Disabled sections don't show

### After Editing Structure

- [ ] Changes saved to database
- [ ] Admin portal reflects updated structure name
- [ ] Patient forms re-render with new section order
- [ ] No duplicate forms created
- [ ] Existing forms still work

### Before Deploying

- [ ] All migrations run successfully
- [ ] `Clinic` table has `globalFormStructures` column
- [ ] `TenantProductForms` table has `globalFormStructureId` column
- [ ] Index exists on `globalFormStructureId`
- [ ] At least one clinic has default structure
- [ ] Forms exist for active products
- [ ] URLs follow correct format
- [ ] Patient portal loads forms without errors

---

## 📞 Emergency Fixes

### All Forms Broken - Reset to Default

```sql
-- 1. Ensure clinic has default structure
UPDATE "Clinic"
SET "globalFormStructures" = '[
  {
    "id": "default",
    "name": "Default Flow",
    "sections": [
      {"id": "product", "type": "product_questions", "order": 1, "enabled": true, "icon": "📦", "label": "Product Questions"},
      {"id": "category", "type": "category_questions", "order": 2, "enabled": true, "icon": "📋", "label": "Category Questions"},
      {"id": "account", "type": "account_creation", "order": 3, "enabled": true, "icon": "👤", "label": "Create Account"},
      {"id": "checkout", "type": "checkout", "order": 4, "enabled": true, "icon": "💳", "label": "Payment & Checkout"}
    ],
    "isDefault": true
  }
]'::jsonb
WHERE slug = 'YOUR-CLINIC-SLUG';

-- 2. Update all forms to use default structure
UPDATE "TenantProductForms"
SET "globalFormStructureId" = 'default'
WHERE "clinicId" = (SELECT id FROM "Clinic" WHERE slug = 'YOUR-CLINIC-SLUG');

-- 3. Verify
SELECT COUNT(*) FROM "TenantProductForms"
WHERE "clinicId" = (SELECT id FROM "Clinic" WHERE slug = 'YOUR-CLINIC-SLUG')
  AND "globalFormStructureId" = 'default';
```

### Regenerate All Published URLs

```sql
UPDATE "TenantProductForms" tpf
SET 
  "publishedUrl" = CONCAT(
    c.slug,
    CASE 
      WHEN c."isCustomDomain" AND c."customDomain" IS NOT NULL 
      THEN CONCAT('.', c."customDomain")
      ELSE '.localhost:3000'
    END,
    '/my-products/',
    tpf.id,
    '/',
    p.slug
  ),
  "lastPublishedAt" = NOW()
FROM "Clinic" c, "Product" p
WHERE tpf."clinicId" = c.id
  AND tpf."productId" = p.id;
```

---

## 🔧 Useful Database Queries

### Find Forms Without Published URLs
```sql
SELECT 
  tpf.id,
  p.name as product_name,
  tpf."globalFormStructureId"
FROM "TenantProductForms" tpf
JOIN "Product" p ON tpf."productId" = p.id
WHERE tpf."publishedUrl" IS NULL;
```

### Find Products Missing Forms for Structures
```sql
WITH 
  AllProducts AS (
    SELECT DISTINCT "productId", "clinicId"
    FROM "TenantProductForms"
  ),
  AllStructures AS (
    SELECT 
      p."productId",
      p."clinicId",
      jsonb_array_elements(c."globalFormStructures")->>'id' as structure_id
    FROM AllProducts p
    JOIN "Clinic" c ON p."clinicId" = c.id
  )
SELECT 
  s."productId",
  s.structure_id,
  CASE WHEN tpf.id IS NULL THEN 'MISSING' ELSE 'EXISTS' END as status
FROM AllStructures s
LEFT JOIN "TenantProductForms" tpf 
  ON s."productId" = tpf."productId" 
  AND s.structure_id = tpf."globalFormStructureId"
WHERE tpf.id IS NULL;
```

### Count Forms Per Product
```sql
SELECT 
  p.name,
  COUNT(tpf.id) as form_count,
  array_agg(tpf."globalFormStructureId") as structures
FROM "Product" p
LEFT JOIN "TenantProductForms" tpf ON p.id = tpf."productId"
GROUP BY p.id, p.name
ORDER BY form_count DESC;
```

---

## 📚 Related Documentation

- `GLOBAL_FORM_STRUCTURE_DEVELOPER_GUIDE.md` - Full technical guide
- `GLOBAL_FORM_STRUCTURE_QUICK_REFERENCE.md` - Quick lookup
- `GLOBAL_FORM_STRUCTURE_ARCHITECTURE_DIAGRAM.md` - Visual diagrams

---

**Last Updated**: November 6, 2025  
**Maintained By**: Platform Team

