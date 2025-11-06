# URL Preview Fix - November 6, 2025

## Problem Summary

URL previews were not showing in the Admin Frontend product pages, even though the backend was correctly generating and returning `publishedUrl` fields.

## Root Cause Analysis

### High-Level Architecture
The system has 3 main components:
1. **Patient API Backend** (localhost:3001) - Generates URLs
2. **Admin Frontend** (localhost:3002) - Displays product management
3. **Patient Frontend** (localhost:3000) - Renders the actual forms

### What Changed
When implementing the **Global Form Structure** system, forms transitioned from being questionnaire-based to structure-based:
- **OLD**: Forms required a `questionnaireId`
- **NEW**: Forms can be built from global structures with `questionnaireId: null` and `globalFormStructureId: "default"`

### The Bug
The Admin Frontend's form filtering logic (line 856-859 in `products/[id].tsx`) was still filtering by `questionnaireId`:

```typescript
// ❌ OLD CODE (BROKEN)
const formsForStructure = enabledForms.filter((f: any) => 
    f?.questionnaireId === questionnaireId &&
    (f?.globalFormStructureId ?? 'default') === structureId
)
```

**Problem**: Forms created from global structures have `questionnaireId: null`, so the filter never matched, resulting in `form = undefined`, which prevented the URL display code from rendering.

### Backend Was Working Correctly
The backend (`patient-api/src/main.ts` lines 6002-6033) was correctly:
1. Generating URLs: `http://limitless.localhost:3000/my-products/{formId}/{productSlug}`
2. Storing them in the database
3. Returning them in the API response

Example response:
```json
{
  "publishedUrl": "http://limitless.localhost:3000/my-products/c95f73c8-2c21-4bd3-9f6f-312eddc6a87f/glutathione",
  "questionnaireId": null,
  "globalFormStructureId": "default"
}
```

## The Fix

### 1. Updated Form Filtering Logic
Changed the filter to match by `globalFormStructureId` and `productId` instead of `questionnaireId`:

```typescript
// ✅ NEW CODE (FIXED)
const formsForStructure = enabledForms.filter((f: any) => {
    const matchesStructure = (f?.globalFormStructureId ?? 'default') === structureId
    const matchesProduct = f?.productId === id
    return matchesStructure && matchesProduct
})
```

**File Changed**: `fuse-admin-frontend/pages/products/[id].tsx` (lines 858-862)

### 2. Product Slug Correction (Optional)
Created SQL script to fix the Glutathione product slug typo:
- Current: `glutathionet` (with trailing 't')
- Corrected: `glutathione`

**File**: `patient-api/fix-glutathione-slug.sql`

## Testing

### Before Fix
- Admin page showed: "Preview URL will generate after publishing"
- No "Preview" or "Copy" buttons visible
- Backend was returning valid URLs, but frontend couldn't display them

### After Fix
1. **Refresh** http://localhost:3002/products/1d2c6a8a-2ac7-4820-bf10-34e75d13cd63
2. You should now see:
   - ✅ Preview URL displayed for each form
   - ✅ "Preview" button (opens form in new tab)
   - ✅ "Copy" button (copies URL to clipboard)

### Expected URL Format
- **Development**: `http://limitless.localhost:3000/my-products/{formId}/glutathione`
- **Production**: `https://limitless.fuse.health/my-products/{formId}/glutathione`

## Key Learnings

1. **Multi-System Architecture Complexity**: With 3 separate frontends and a shared backend, data flow issues can be hard to diagnose without inspecting network traffic.

2. **Migration Debt**: When introducing new architectural patterns (global form structures), all related code must be updated - not just the backend.

3. **Debug Strategy**: 
   - Start high-level (understand the architecture)
   - Check data flow (network tab in DevTools)
   - Trace the code path (find where data gets lost)
   - Fix at the source (update filtering logic)

4. **Localhost Subdomain Limitations**: 
   - `subdomain.localhost:3000` works in most modern browsers
   - For testing production behavior, consider using `/etc/hosts` entries

## Files Modified

1. ✅ `fuse-admin-frontend/pages/products/[id].tsx` - Fixed form filtering
2. 📝 `patient-api/fix-glutathione-slug.sql` - Optional slug correction script

## Next Steps

1. ✅ Test the admin frontend to verify URL previews appear
2. 🔄 Run the SQL script to fix the product slug (optional)
3. 🔄 Check if Tenant Portal needs similar fixes (likely already correct)
4. 🔄 Test clicking "Preview" buttons to ensure forms load correctly

