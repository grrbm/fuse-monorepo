# Global Form Structure System - Complete Documentation

## 📚 Documentation Index

This folder contains comprehensive documentation for the FUSE Global Form Structure system. Choose the document that best fits your needs:

### 🚀 Quick Start
**[GLOBAL_FORM_STRUCTURE_QUICK_REFERENCE.md](./GLOBAL_FORM_STRUCTURE_QUICK_REFERENCE.md)**
- One-page reference guide
- Core concepts and examples
- Common SQL queries
- File locations
- Perfect for: Quick lookups, new developers, refreshers

### 👨‍💻 Developer Guide
**[GLOBAL_FORM_STRUCTURE_DEVELOPER_GUIDE.md](./GLOBAL_FORM_STRUCTURE_DEVELOPER_GUIDE.md)**
- Complete technical documentation
- Architecture and data models
- System flow diagrams
- Code examples and best practices
- Testing checklist
- Perfect for: Understanding the full system, implementing features, code reviews

### 🎨 Architecture Diagrams
**[GLOBAL_FORM_STRUCTURE_ARCHITECTURE_DIAGRAM.md](./GLOBAL_FORM_STRUCTURE_ARCHITECTURE_DIAGRAM.md)**
- Visual system overview
- Data relationship diagrams
- Component architecture
- Flow charts
- Database schema visuals
- Perfect for: System design discussions, onboarding, presentations

### 🔧 Troubleshooting
**[GLOBAL_FORM_STRUCTURE_TROUBLESHOOTING.md](./GLOBAL_FORM_STRUCTURE_TROUBLESHOOTING.md)**
- Common issues and solutions
- Diagnostic SQL queries
- Emergency fixes
- Testing procedures
- Perfect for: Debugging production issues, support tickets, QA

---

## 🎯 What is the Global Form Structure System?

The Global Form Structure system allows clinics to create multiple form flow templates that control:
- **Section ordering**: Which sections appear first (e.g., payment before questions)
- **Section visibility**: Which sections to show/hide
- **Form variants**: Different flows for different use cases (A/B testing, customer segments)

### The Core Rule
```
Number of Global Form Structures = Number of Forms per Product
```

If a clinic has 4 global form structures, each product automatically gets 4 different form instances with 4 unique URLs.

---

## 🏗️ System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    FUSE Platform                            │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  Tenant Portal   │   │  Admin Portal    │   │ Patient Portal   │
│                  │   │                  │   │                  │
│  Create/manage   │   │  View forms &    │   │  Fill out forms  │
│  structures      │   │  preview URLs    │   │  with sections   │
│                  │   │                  │   │  in custom order │
└────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │
                    ┌───────────▼──────────┐
                    │   Patient API        │
                    │   (Node.js/Express)  │
                    └───────────┬──────────┘
                                │
                    ┌───────────▼──────────┐
                    │   PostgreSQL         │
                    │   • Clinic           │
                    │   • TenantProductForm│
                    │   • Product          │
                    └──────────────────────┘
```

---

## 📖 Quick Examples

### Example 1: Creating a "Payment First" Structure

**Step 1**: Tenant Portal → Forms → Global Structure Tab
```
Create new structure:
  Name: "Payment First"
  Description: "Collect payment before medical questions"
  
  Sections (drag to reorder):
  1. 💳 Payment & Checkout
  2. 👤 Create Account  
  3. 📦 Product Questions
  4. 📋 Category Questions (disabled)
```

**Step 2**: Admin Portal automatically creates forms
```
Product: NAD+ IV Therapy
  
  ✅ Default Flow
     URL: preimier.localhost:3000/my-products/abc-123.../nad
  
  ✅ Payment First
     URL: preimier.localhost:3000/my-products/def-456.../nad
```

**Step 3**: Patient sees payment first
```
Patient opens "Payment First" URL:
  → Step 1: Enter credit card
  → Step 2: Create account
  → Step 3: Medical questions
  → Complete!
```

### Example 2: A/B Testing Different Flows

```
Create two structures:
1. "Questions First" - Traditional medical intake
2. "Payment First" - Conversion-optimized

Send 50% traffic to each URL
Compare conversion rates in analytics
Winner becomes default
```

---

## 🗂️ Key Database Tables

### Clinic
Stores global form structures as JSONB array:
```sql
SELECT "globalFormStructures" FROM "Clinic" WHERE slug = 'preimier';
```

### TenantProductForms
Each form links to one structure:
```sql
SELECT 
  "globalFormStructureId",
  "publishedUrl"
FROM "TenantProductForms"
WHERE "productId" = 'product-uuid';
```

---

## 🔑 Key Files

### Backend
| File | Purpose |
|------|---------|
| `patient-api/src/models/Clinic.ts` | Clinic model with globalFormStructures |
| `patient-api/src/models/TenantProductForm.ts` | Form model with globalFormStructureId |
| `patient-api/src/main.ts` (lines 1244-1318) | Structure CRUD endpoints |
| `patient-api/src/main.ts` (lines ~9800-9900) | Form creation logic |

### Frontends
| File | Purpose |
|------|---------|
| `fuse-tenant-portal-frontend/pages/forms/index.tsx` | Create/manage structures |
| `fuse-admin-frontend/pages/products/[id].tsx` | View forms, auto-create |
| `patient-frontend/pages/my-products/[extra]/[slug].tsx` | Public form page |
| `patient-frontend/components/QuestionnaireModal/index.tsx` | Form rendering |

---

## 🧪 Testing the System

### 1. Create a Global Structure
```
Tenant Portal → Forms → Global Structure Tab
→ Create "Test Structure"
→ Save
→ Verify in database: SELECT "globalFormStructures" FROM "Clinic"
```

### 2. Check Auto-Creation
```
Admin Portal → Products → Click any product
→ Should see "Test Structure" card
→ Should have preview URL
→ Check database: SELECT * FROM "TenantProductForms" WHERE globalFormStructureId = 'test-id'
```

### 3. Test Patient Form
```
Click preview URL
→ Form should load
→ Sections should appear in structure's defined order
→ Disabled sections should not show
```

---

## 🚨 Common Issues

| Issue | Quick Fix |
|-------|-----------|
| Forms not auto-creating | Check clinic has global structures in database |
| Wrong section order | Verify structure's `sections[].order` values |
| URL 404 error | Check URL format: `{formId}/{productSlug}` |
| Duplicate forms | Delete duplicates, check auto-enable logic |
| TypeScript errors | Add explicit type: `let x: any \| null = null` |

See [GLOBAL_FORM_STRUCTURE_TROUBLESHOOTING.md](./GLOBAL_FORM_STRUCTURE_TROUBLESHOOTING.md) for detailed solutions.

---

## 📊 System Statistics

```sql
-- Count structures per clinic
SELECT 
  slug,
  jsonb_array_length("globalFormStructures") as structure_count
FROM "Clinic"
WHERE "globalFormStructures" IS NOT NULL;

-- Count forms per product
SELECT 
  p.name,
  COUNT(tpf.id) as form_count
FROM "Product" p
LEFT JOIN "TenantProductForms" tpf ON p.id = tpf."productId"
GROUP BY p.id, p.name;

-- Count forms per structure
SELECT 
  "globalFormStructureId",
  COUNT(*) as form_count
FROM "TenantProductForms"
GROUP BY "globalFormStructureId";
```

---

## 🎓 Learning Path

### For New Developers
1. Read [Quick Reference](./GLOBAL_FORM_STRUCTURE_QUICK_REFERENCE.md) (15 min)
2. Review [Architecture Diagrams](./GLOBAL_FORM_STRUCTURE_ARCHITECTURE_DIAGRAM.md) (20 min)
3. Follow examples in this README (10 min)
4. Try creating a test structure in dev environment (30 min)

### For System Architects
1. Read [Developer Guide](./GLOBAL_FORM_STRUCTURE_DEVELOPER_GUIDE.md) (45 min)
2. Review [Architecture Diagrams](./GLOBAL_FORM_STRUCTURE_ARCHITECTURE_DIAGRAM.md) (30 min)
3. Study data flow and relationships (30 min)
4. Plan feature enhancements (as needed)

### For Support/QA
1. Read [Quick Reference](./GLOBAL_FORM_STRUCTURE_QUICK_REFERENCE.md) (15 min)
2. Bookmark [Troubleshooting Guide](./GLOBAL_FORM_STRUCTURE_TROUBLESHOOTING.md) (5 min)
3. Practice diagnostic queries (30 min)
4. Test common scenarios (60 min)

---

## 🔄 Recent Updates

### November 6, 2025
- ✅ Fixed TypeScript build error in `patient-api/src/main.ts`
- ✅ Created comprehensive documentation suite
- ✅ Added troubleshooting guide
- ✅ Added architecture diagrams

### November 5, 2025
- ✅ Added `globalFormStructureId` to TenantProductForm model
- ✅ Implemented auto-creation logic in admin portal
- ✅ Added global structure management UI in tenant portal
- ✅ Updated patient form rendering to use structure ordering

---

## 📞 Support

### Issues or Questions?
1. Check [Troubleshooting Guide](./GLOBAL_FORM_STRUCTURE_TROUBLESHOOTING.md)
2. Review [Developer Guide](./GLOBAL_FORM_STRUCTURE_DEVELOPER_GUIDE.md)
3. Search existing documentation
4. Contact platform team

### Contributing
When making changes to the Global Form Structure system:
1. Update relevant documentation
2. Add test cases
3. Update migration notes
4. Create troubleshooting entries for new issues

---

## 📝 Implementation Checklist

For fine-tuning the platform, ensure:

- [ ] All clinics have at least a "default" global form structure
- [ ] `Clinic.globalFormStructures` JSONB column exists
- [ ] `TenantProductForms.globalFormStructureId` column exists
- [ ] Index on `globalFormStructureId` exists
- [ ] Auto-enable logic creates exactly one form per structure
- [ ] Published URLs follow format: `{formId}/{productSlug}`
- [ ] Patient forms render sections in structure-defined order
- [ ] Disabled sections don't appear in patient forms
- [ ] No duplicate forms for same (product, structure) combination
- [ ] All tests pass
- [ ] Documentation is up to date

---

## 🎯 Next Steps

1. **For Platform Team**: Review all documentation for accuracy
2. **For Developers**: Follow learning path, create test structures
3. **For QA**: Test all scenarios in troubleshooting guide
4. **For Product**: Plan A/B testing strategies using multiple structures

---

**Last Updated**: November 6, 2025  
**Documentation Version**: 1.0  
**System Version**: Production  
**Maintainer**: Daniel Meursing

---

## 📚 Full Documentation Set

1. **[GLOBAL_FORM_STRUCTURE_README.md](./GLOBAL_FORM_STRUCTURE_README.md)** ← You are here
2. **[GLOBAL_FORM_STRUCTURE_QUICK_REFERENCE.md](./GLOBAL_FORM_STRUCTURE_QUICK_REFERENCE.md)**
3. **[GLOBAL_FORM_STRUCTURE_DEVELOPER_GUIDE.md](./GLOBAL_FORM_STRUCTURE_DEVELOPER_GUIDE.md)**
4. **[GLOBAL_FORM_STRUCTURE_ARCHITECTURE_DIAGRAM.md](./GLOBAL_FORM_STRUCTURE_ARCHITECTURE_DIAGRAM.md)**
5. **[GLOBAL_FORM_STRUCTURE_TROUBLESHOOTING.md](./GLOBAL_FORM_STRUCTURE_TROUBLESHOOTING.md)**

