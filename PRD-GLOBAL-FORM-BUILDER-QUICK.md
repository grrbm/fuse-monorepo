# Global Form Builder - Quick Reference PRD

**Version:** 1.0 | **Status:** Implemented | **Date:** Oct 7, 2025

---

## 🎯 What We Built

A centralized form builder where **admins create master templates once** and **all tenants inherit them automatically**. Templates support dynamic variables like `{{companyName}}` for personalization.

---

## 🏗️ Architecture

```
Admin creates template (isGlobal: true) 
    ↓
Saved to database (tenantId: null)
    ↓
All tenants see it automatically
    ↓
Variables replaced at render time
```

**Key Concept:** One template → All tenants → Personalized per tenant

---

## 🔑 Core Features

### 1. Two-Tab Interface (`/forms`)
- **Products Tab**: Assign templates to specific products
- **Standardized Questions Tab**: Create/edit global templates

### 2. Template Types
- **Personalization**: Category-specific (Performance, Weight Loss, etc.)
- **Account**: Universal (all products)
- **Doctor**: Medical intake questions

### 3. Form Builder (`/forms/editor/[id]`)
**Two Step Types:**
- **Question Step**: Title + description + multiple choice options
- **Info Step**: Title + description only (read-only)

**Features:**
- Drag-and-drop reordering
- Inline editing
- Dynamic variable insertion
- Click-to-copy variables

### 4. Dynamic Variables
```
{{companyName}} → Replaced with tenant's company name
{{clinicName}}  → Replaced with tenant's clinic name
{{patientName}} → Replaced with patient's first name (future)
```

---

## 📊 Database Changes

### New Fields in `FormSectionTemplate`
```sql
isGlobal BOOLEAN DEFAULT false   -- true = master template
tenantId UUID NULL               -- null = global template
```

**Key Rule:** Global templates have `isGlobal: true` AND `tenantId: null`

---

## 🔌 API Endpoints

### List Templates (filtered to global only)
```http
GET /questionnaires/templates
→ Returns only templates where isGlobal = true
```

### Get Template
```http
GET /questionnaires/templates/:id
→ Returns single template by ID
```

### Create Template
```http
POST /questionnaires/templates
Body: {
  name: string,
  sectionType: "personalization" | "account" | "doctor",
  category?: string,
  schema: { steps: [] },
  isGlobal: true  ← Defaults to true
}
```

### Update Template
```http
PUT /questionnaires/templates/:id
Body: {
  name?: string,
  description?: string,
  schema?: { steps: [] }
}
→ Auto-increments version field
→ Changes propagate to all tenants instantly
```

---

## 📝 Schema Structure

### Template Schema Format
```typescript
{
  steps: [
    {
      id: string,
      title: string,
      description: string,
      stepOrder: number,
      stepType: "question" | "info",
      category: "normal" | "info",
      questions?: [
        {
          id: string,
          type: "single-choice",
          questionText: string,
          required: boolean,
          options: string[]
        }
      ]
    }
  ]
}
```

---

## 🎨 UI Components

### Forms Management Page
```
[Products Tab] [Standardized Questions Tab]
                    ↓
        Select Category: [Dropdown]
                    ↓
    ┌─────────────────────┬─────────────────────┐
    │ Personalization Q's │ Account Questions   │
    │ (Category-specific) │ (Universal)         │
    │ [Edit] or [Create]  │ [Edit] or [Create]  │
    └─────────────────────┴─────────────────────┘
```

### Template Editor
```
[← Back] Template Name [🌐 GLOBAL] [Type] [Category]    [Save ↑]

┌─────────────────────────────────────────────────┐
│ Add New Step                                     │
│ [📋 Question Step]  [ℹ️  Info Step]              │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Template Steps (3)                               │
│                                                  │
│ ╬ Step 1 [Question] [Edit] [Delete]             │
│   "What is your goal with {{companyName}}?"     │
│   Options: [Health] [Better] [Quality]          │
│                                                  │
│ ╬ Step 2 [Info] [Edit] [Delete]                 │
│   "Treatment Information"                        │
└─────────────────────────────────────────────────┘
```

**Visual Indicators:**
- Purple "🌐 GLOBAL TEMPLATE" badge
- Purple help card warning about global changes
- Dynamic Variables dropdown (click-to-copy)

---

## 🔄 User Flows

### Admin Creates Template
```
1. Go to /forms → Standardized Questions tab
2. Select category (e.g., "Performance")
3. Click "Create Personalization Template"
4. Editor opens with empty schema
5. Click "Question Step" to add first slide
6. Enter: Title, Description, Answer Options
7. Use {{companyName}} for personalization
8. Add more steps as needed
9. Click "Save Changes"
→ Template live for all tenants
```

### Admin Updates Template
```
1. Go to /forms → Standardized Questions
2. Select category
3. Click "Edit Personalization Questions"
4. Modify steps (edit/reorder/delete/add)
5. Click "Save Changes"
→ All tenants see update immediately
```

### Tenant Views Form
```
1. Patient starts product questionnaire
2. System loads global templates for product
3. Replace all {{companyName}} with tenant's name
4. Display personalized form to patient
5. Collect answers
→ Answers stored with company name intact
```

---

## 🔐 Security

### Access Control
- **Admin**: Create/edit/delete global templates
- **Tenant**: Read-only, auto-assigned to products
- **Patient**: Fill out forms (personalized view)

### Validation
- JWT required on all endpoints
- XSS protection on text inputs
- JSONB schema validation
- Rate limiting on creates/updates

---

## 🧪 Testing Checklist

**Backend:**
- [ ] Create template with `isGlobal: true`
- [ ] List templates (only returns global)
- [ ] Update template (version increments)
- [ ] Cannot change `isGlobal` after creation

**Frontend:**
- [ ] Create template from UI
- [ ] Add question step with 3+ options
- [ ] Add info step
- [ ] Drag-and-drop reorder
- [ ] Copy variable ({{companyName}})
- [ ] Save and reload

**Integration:**
- [ ] Admin creates template
- [ ] Tenant A sees template
- [ ] Tenant B sees same template
- [ ] Admin updates template
- [ ] Both tenants see update
- [ ] Patient sees {{companyName}} replaced

---

## 📂 File Locations

**Backend:**
```
patient-api/
├── src/models/FormSectionTemplate.ts         (Model with isGlobal)
├── src/services/formTemplate.service.ts      (Service layer)
└── src/main.ts                                (API endpoints)
```

**Frontend:**
```
fuse-tenant-portal-frontend/pages/forms/
├── index.tsx                   (Management page)
├── editor/[id].tsx             (Template editor)
└── hooks/useTemplates.ts       (Data fetching)
```

**Patient:**
```
patient-frontend/
├── components/QuestionnaireModal/index.tsx   (Variable replacement)
└── lib/templateVariables.ts                   (Replacement logic)
```

---

## 🚀 Quick Start

### Create Your First Global Template
```bash
# 1. Log in to tenant portal (http://localhost:3030)
# 2. Navigate to Forms page
# 3. Click "Standardized Questions" tab
# 4. Select "Performance" category
# 5. Click "Create Personalization Template"
# 6. Add a question step:
#    Title: "What is your goal with {{companyName}}?"
#    Options: ["Health", "Better", "Quality"]
# 7. Click "Save Changes"
# 8. Done! All tenants now have this template.
```

---

## ⚡ Key Takeaways

1. **One template, all tenants** - Global templates are shared across the platform
2. **Automatic updates** - Change once, updates everywhere instantly
3. **Personalization built-in** - Use `{{companyName}}` for tenant branding
4. **Three template types** - Personalization (category), Account (universal), Doctor (medical)
5. **Two step types** - Question (interactive) and Info (read-only)
6. **Drag-and-drop** - Smooth reordering of steps
7. **Version tracking** - Every update increments version number
8. **Purple = Global** - Visual indicator throughout UI

---

## 🐛 Common Issues

**401 Unauthorized when saving:**
- JWT token expired
- Log out and back in
- Get fresh token

**Template not showing:**
- Check `isGlobal` flag is `true`
- Check `tenantId` is `null`
- Verify in database

**Variables not replacing:**
- Check syntax: `{{companyName}}` (double braces)
- Verify tenant has company name set
- Check variable replacement in QuestionnaireModal

---

## 📊 Monitoring

**Key Metrics:**
- Template creation rate
- Template update frequency
- Variable replacement errors
- API response times
- Form completion rates

**Alerts:**
- Failed template saves
- Invalid schema structures
- Missing required fields
- High API error rates

---

## 🔮 Future Enhancements

**Phase 2:**
- Template versioning UI
- Live preview mode
- Conditional logic (show/hide questions)
- More question types (date, file upload, signature)

**Phase 3:**
- Tenant template overrides (fork global)
- Custom variables per tenant
- Multi-language support

**Phase 4:**
- Approval workflow for changes
- Compliance validation
- Data retention policies

---

## 📞 Support

**Questions?** Contact:
- Dev Team: dev@fuse.health
- Product: product@fuse.health

**Documentation:**
- Full PRD: `PRD-GLOBAL-FORM-BUILDER.md`
- Codebase Guide: `CLAUDE.md`

---

**Status:** ✅ Complete and Ready to Use  
**Last Updated:** October 7, 2025

