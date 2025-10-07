# Product Requirements Document (PRD)
## Global Form Builder & Standardized Templates System

**Version:** 1.0  
**Date:** October 7, 2025  
**Status:** Implemented  
**Author:** FUSE Health Development Team

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Goals & Objectives](#goals--objectives)
4. [Target Users](#target-users)
5. [Feature Overview](#feature-overview)
6. [User Flows](#user-flows)
7. [Technical Architecture](#technical-architecture)
8. [UI/UX Requirements](#uiux-requirements)
9. [API Specifications](#api-specifications)
10. [Database Schema](#database-schema)
11. [Security & Compliance](#security--compliance)
12. [Testing Requirements](#testing-requirements)
13. [Future Enhancements](#future-enhancements)

---

## Executive Summary

The Global Form Builder is a centralized system for creating and managing standardized questionnaire templates that are used across all tenants on the FUSE Health platform. This system ensures consistency in patient onboarding, data collection, and compliance while allowing for tenant-specific personalization through dynamic variables.

**Key Benefits:**
- ✅ Single source of truth for all patient forms
- ✅ Consistent data collection across all tenants
- ✅ Reduced maintenance overhead (update once, apply everywhere)
- ✅ Built-in personalization with dynamic variables
- ✅ Streamlined tenant onboarding

---

## Problem Statement

### Current Challenges
1. **Fragmentation**: Each tenant potentially creates their own forms, leading to inconsistent data collection
2. **Maintenance Burden**: Updates to forms require individual tenant modifications
3. **Compliance Risk**: Difficult to ensure all tenants collect required HIPAA-compliant data
4. **Onboarding Friction**: New tenants must build forms from scratch

### Solution
Implement a global template system where admin creates master templates once, and all tenants inherit these templates with automatic personalization.

---

## Goals & Objectives

### Primary Goals
1. **Centralization**: Create a single admin interface to manage all form templates
2. **Standardization**: Ensure all tenants use consistent, compliant questionnaires
3. **Personalization**: Allow tenant-specific branding through dynamic variables
4. **Automation**: Templates automatically populate into tenant product forms

### Success Metrics
- 100% of tenants use standardized templates
- 90% reduction in form maintenance time
- Zero compliance gaps in data collection
- < 5 minutes to create/update a global template

---

## Target Users

### Primary Users
1. **Platform Administrators**
   - Create and edit global templates
   - Manage standardized questions across categories
   - Ensure compliance and data consistency

2. **Tenants (Clinics/Providers)**
   - Consume global templates (read-only)
   - Benefit from automatic updates
   - See personalized branding via variables

### Secondary Users
3. **Patients**
   - Fill out forms with tenant-specific branding
   - Experience consistent, professional questionnaires
   - See their provider's company name throughout

---

## Feature Overview

### 1. Global Template Management

#### Two-Tab Interface
**Tab 1: Products**
- Configure product-specific forms
- Assign standardized templates to individual products
- NOT for treatment bundles (focused on SKU-level products)

**Tab 2: Standardized Questions**
- Manage reusable global templates
- Three template sections:
  - **Personalization Questions**: Category-specific (Performance, Weight Loss, Anti-Aging, etc.)
  - **Account Questions**: Universal (all products)
  - **Doctor Questions**: Medical intake (category-specific)

### 2. Form Builder

#### Two Step Types
1. **Question Step**
   - Title field
   - Description field
   - Multiple-choice answer options (dynamic add/remove)
   - Displays as button-based selection to patients

2. **Information Step**
   - Title field
   - Description field
   - Read-only content with "Continue" button
   - Used for educational content, disclaimers, etc.

#### Builder Features
- ✅ Drag-and-drop step reordering
- ✅ Inline editing (click to edit title/description)
- ✅ Add/remove answer options
- ✅ Real-time preview
- ✅ Auto-save functionality

### 3. Dynamic Variables System

#### Available Variables
```
{{companyName}}   - Tenant's company name
{{clinicName}}    - Tenant's clinic name
{{patientName}}   - Patient's first name (future)
```

#### Variable Features
- **Click-to-copy**: Click any variable to copy to clipboard
- **Hover tooltip**: Shows "Click to copy" on hover
- **Copy notification**: "Copied!" message appears for 2 seconds
- **Auto-replacement**: Variables replaced when form is rendered to patient

#### Example Usage
```
Admin creates: "What is your main goal with {{companyName}} medication?"

Tenant A sees: "What is your main goal with FUSE Health medication?"
Tenant B sees: "What is your main goal with Clinic XYZ medication?"
```

### 4. Template Types

#### Three Standard Layouts
1. **Template 1**: Personalization → Account → Doctor Questions
2. **Template 2**: Account → Doctor Questions
3. **Template 3**: Account → Personalization → Doctor Questions

Each template type follows this structure for consistency.

---

## User Flows

### Flow 1: Admin Creates Global Template

```
1. Admin navigates to Forms → Standardized Questions tab
2. Admin selects product category (e.g., "Performance")
3. Admin clicks "Create Personalization Template"
4. System creates template with:
   - isGlobal: true
   - tenantId: null
   - sectionType: "personalization"
   - category: "performance"
5. Template editor opens with empty schema
6. Admin clicks "Question Step" to add first question
7. Admin enters:
   - Title: "What is your main goal with {{companyName}} medication?"
   - Description: "Please select your primary reason."
   - Options: ["Improve health", "Feel better", "Improve quality of life"]
8. Admin clicks "Add Step" to add more questions
9. Admin clicks "Save Changes"
10. Template is now live for ALL tenants
```

### Flow 2: Admin Edits Existing Template

```
1. Admin navigates to Forms → Standardized Questions tab
2. Admin selects category (e.g., "Weight Loss")
3. Admin clicks "Edit Personalization Questions"
4. Template editor loads existing steps
5. Admin can:
   - Drag to reorder steps
   - Click Edit icon to modify step
   - Delete unwanted steps
   - Add new steps
6. Admin clicks "Save Changes"
7. Changes propagate to all tenant forms instantly
```

### Flow 3: Tenant Views Personalized Form

```
1. Tenant's patient starts product questionnaire
2. System loads product's assigned templates
3. For each template step:
   - Replace {{companyName}} with tenant's company name
   - Replace {{clinicName}} with tenant's clinic name
4. Display personalized form to patient
5. Patient completes questionnaire
6. Answers stored with original variable names preserved
```

### Flow 4: Auto-Population of Product Forms

```
1. Admin creates/updates global template
2. System identifies all products matching template criteria:
   - Same category (for personalization/doctor templates)
   - All products (for account templates)
3. System automatically assigns template to product forms
4. Tenants see updated forms immediately
5. No manual assignment required
```

---

## Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     FUSE Health Platform                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├─── Admin Portal (port 3002)
                              │    └── Not used for form builder
                              │
                              ├─── Tenant Portal (port 3030)
                              │    ├── Forms Management Page
                              │    │   ├── Products Tab
                              │    │   └── Standardized Questions Tab
                              │    └── Template Editor
                              │
                              ├─── Patient Portal (port 3000)
                              │    └── Questionnaire Renderer
                              │    └── Variable Replacement Engine
                              │
                              └─── Backend API (port 3001)
                                   ├── /questionnaires/templates [GET, POST, PUT]
                                   ├── /questionnaires/templates/:id [GET, PUT]
                                   ├── /questionnaires/templates/assignments [GET]
                                   └── /products-management [GET]
```

### Data Flow

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    Admin     │────────>│   Backend    │────────>│  PostgreSQL  │
│   Creates    │ POST    │     API      │ INSERT  │   Database   │
│   Template   │         │              │         │              │
└──────────────┘         └──────────────┘         └──────────────┘
                                │
                                │ isGlobal: true
                                │ tenantId: null
                                ▼
                    ┌───────────────────────┐
                    │  All Tenants Inherit  │
                    └───────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
              ┌─────▼─────┐         ┌─────▼─────┐
              │ Tenant A  │         │ Tenant B  │
              │  Forms    │         │  Forms    │
              └───────────┘         └───────────┘
```

---

## UI/UX Requirements

### Forms Management Page (/forms)

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Sidebar │ Header                                             │
├─────────┼──────────────────────────────────────────────────┤
│         │ Form Management                                   │
│ Nav     │                                                    │
│ Menu    │ [Products Tab] [Standardized Questions Tab]       │
│         │                                                    │
│         │ ┌─────────────────────────────────────────────┐  │
│         │ │ Manage Standardized Templates                │  │
│         │ │                                               │  │
│         │ │ Select Category: [Dropdown ▼]                │  │
│         │ │                                               │  │
│         │ │ ┌─────────────────┐ ┌──────────────────────┐ │  │
│         │ │ │ Personalization │ │ Account Questions    │ │  │
│         │ │ │ Questions       │ │                      │ │  │
│         │ │ │                 │ │ Universal (All)      │ │  │
│         │ │ │ Category: Perf. │ │                      │ │  │
│         │ │ │                 │ │                      │ │  │
│         │ │ │ [Edit Template] │ │ [Edit Template]      │ │  │
│         │ │ └─────────────────┘ └──────────────────────┘ │  │
│         │ └─────────────────────────────────────────────┘  │
└─────────┴──────────────────────────────────────────────────┘
```

#### Visual Design
- **Color Scheme**: 
  - Primary: Brand blue
  - Global templates: Purple (#9333ea)
  - Success: Green
  - Destructive: Red
- **Typography**: Sans-serif, clear hierarchy
- **Spacing**: Consistent 16px/24px grid
- **Cards**: Subtle borders, hover states

### Template Editor (/forms/editor/[id])

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Sidebar │ Header                                             │
├─────────┼──────────────────────────────────────────────────┤
│         │ [← Back to Forms]                                 │
│ Nav     │                                                    │
│ Menu    │ Template Name [🌐 GLOBAL] [PERSONALIZATION] [Cat]│
│         │ Description text here                             │
│         │                                         [Save] ──┐│
│         │                                                  ││
│         │ ┌─────────────────────────────────────────────┐ ││
│         │ │ Add New Step                                │ ││
│         │ │                                             │ ││
│         │ │ [📋 Question Step] [ℹ️  Info Step]          │ ││
│         │ └─────────────────────────────────────────────┘ ││
│         │                                                  ││
│         │ ┌─────────────────────────────────────────────┐ ││
│         │ │ Template Steps (3)                          │ ││
│         │ │                                             │ ││
│         │ │ ╬ [Step 1] [Question] [Edit] [Delete]       │ ││
│         │ │   Title: What is your goal...               │ ││
│         │ │   Options: [Health] [Better] [Quality]      │ ││
│         │ │                                             │ ││
│         │ │ ╬ [Step 2] [Info] [Edit] [Delete]           │ ││
│         │ │   Title: Treatment Information              │ ││
│         │ └─────────────────────────────────────────────┘ ││
└─────────┴──────────────────────────────────────────────────┘
```

#### Interaction States

**Step Card - Collapsed**
- Show step number, type badge, title preview
- Show first 3 answer options as badges
- Edit and Delete buttons visible

**Step Card - Expanded (Editing)**
- Title input (full width)
- Description textarea
- Dynamic Variables button (top-right)
- Answer options list (for question steps)
- Add Option button

**Dynamic Variables Dropdown**
```
[Code2 Icon] Dynamic Variables [▼]
─────────────────────────────────────
{{companyName}}   Your company name
{{clinicName}}    Your clinic name
{{patientName}}   Patient's first name
─────────────────────────────────────
(Each variable is clickable)
```

#### Visual Indicators
- **Purple Badge**: "🌐 GLOBAL TEMPLATE" (visible at all times)
- **Purple Help Card**: Explains global nature, warns about tenant impact
- **Grip Icon**: Six dots, cursor changes to grab/grabbing
- **Drag State**: 50% opacity while dragging
- **Copy Notification**: Small tooltip above clicked variable

---

## API Specifications

### Base URL
```
http://localhost:3001  (dev)
https://api.fuse.health (prod)
```

### Authentication
All endpoints require JWT authentication:
```
Authorization: Bearer {token}
```

### Endpoints

#### 1. List Templates
```http
GET /questionnaires/templates
```

**Query Parameters:**
- `sectionType` (optional): `personalization` | `account` | `doctor`
- `category` (optional): `performance` | `weight-loss` | `anti-aging` | etc.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Performance Personalization Questions",
      "description": "Category-specific questions for Performance products",
      "sectionType": "personalization",
      "category": "performance",
      "schema": {
        "steps": [
          {
            "id": "step-1",
            "title": "What is your main goal?",
            "description": "Select your primary reason",
            "stepOrder": 1,
            "stepType": "question",
            "category": "normal",
            "questions": [
              {
                "id": "q-1",
                "type": "single-choice",
                "questionText": "",
                "required": true,
                "options": ["Option 1", "Option 2"]
              }
            ]
          }
        ]
      },
      "version": 1,
      "isActive": true,
      "isGlobal": true,
      "tenantId": null,
      "createdAt": "2025-10-07T00:00:00.000Z",
      "updatedAt": "2025-10-07T00:00:00.000Z"
    }
  ]
}
```

**Filters Applied:**
- Automatically filters to `isGlobal: true` (only master templates)
- Sorted by: `sectionType ASC`, `category ASC`, `createdAt DESC`

---

#### 2. Get Template by ID
```http
GET /questionnaires/templates/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Performance Personalization Questions",
    "description": "...",
    "sectionType": "personalization",
    "category": "performance",
    "schema": { /* steps array */ },
    "version": 1,
    "isActive": true,
    "isGlobal": true,
    "tenantId": null,
    "createdAt": "2025-10-07T00:00:00.000Z",
    "updatedAt": "2025-10-07T00:00:00.000Z"
  }
}
```

---

#### 3. Create Template
```http
POST /questionnaires/templates
```

**Request Body:**
```json
{
  "name": "Performance Personalization Questions",
  "description": "Category-specific personalization questions for Performance products",
  "sectionType": "personalization",
  "category": "performance",
  "schema": {
    "steps": []
  },
  "isGlobal": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "newly-created-uuid",
    "name": "Performance Personalization Questions",
    /* ...full template object... */
  }
}
```

**Validation:**
- `name` (required, string, max 255 chars)
- `sectionType` (required, enum: `personalization` | `account` | `doctor`)
- `category` (optional for account, required for personalization/doctor)
- `schema` (required, object with `steps` array)
- `isGlobal` (defaults to `true`)

---

#### 4. Update Template
```http
PUT /questionnaires/templates/:id
```

**Request Body:**
```json
{
  "name": "Updated Template Name",
  "description": "Updated description",
  "schema": {
    "steps": [
      /* updated steps array */
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "version": 2,  // Auto-incremented
    /* ...updated template object... */
  }
}
```

**Behavior:**
- `version` field auto-increments on each update
- Only provided fields are updated
- `isGlobal` and `tenantId` cannot be changed after creation
- Changes propagate instantly to all tenant forms

---

#### 5. List Template Assignments
```http
GET /questionnaires/templates/assignments
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "assignment-uuid",
      "tenantId": "tenant-uuid",
      "treatmentId": "product-uuid",  // Conceptually productId
      "personalizationTemplateId": "template-uuid",
      "accountTemplateId": "template-uuid",
      "doctorTemplateId": "template-uuid",
      "layoutTemplate": "template-1",
      "themeId": "theme-uuid",
      "treatment": {
        "id": "product-uuid",
        "name": "Product Name",
        "category": "performance",
        "isActive": true
      },
      "personalizationTemplate": { /* template object */ },
      "accountTemplate": { /* template object */ },
      "doctorTemplate": { /* template object */ }
    }
  ]
}
```

---

#### 6. List Products
```http
GET /products-management
```

**Query Parameters:**
- `limit` (default: 10, max: 100)
- `page` (default: 1)
- `category` (optional filter)
- `isActive` (optional filter)

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Product Name",
        "category": "performance",
        "price": 99.99,
        "isActive": true,
        "imageUrl": "https://...",
        /* ...other product fields... */
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

---

### Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Technical error details (dev only)"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation failed)
- `401` - Unauthorized (invalid/expired token)
- `404` - Not Found
- `500` - Internal Server Error

---

## Database Schema

### Table: `FormSectionTemplate`

```sql
CREATE TABLE "FormSectionTemplate" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  "sectionType" VARCHAR(50) NOT NULL CHECK ("sectionType" IN ('personalization', 'account', 'doctor')),
  category VARCHAR(100),
  "treatmentId" UUID REFERENCES "Treatment"(id) ON DELETE SET NULL,
  schema JSONB NOT NULL DEFAULT '{"steps": []}',
  version INTEGER NOT NULL DEFAULT 1,
  "publishedAt" TIMESTAMP,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isGlobal" BOOLEAN NOT NULL DEFAULT false,
  "tenantId" UUID REFERENCES "User"(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_form_section_template_global ON "FormSectionTemplate"("isGlobal");
CREATE INDEX idx_form_section_template_tenant ON "FormSectionTemplate"("tenantId");
CREATE INDEX idx_form_section_template_category ON "FormSectionTemplate"(category);
CREATE INDEX idx_form_section_template_section_type ON "FormSectionTemplate"("sectionType");
```

### Table: `TenantProductForm`

```sql
CREATE TABLE "TenantProductForm" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenantId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "treatmentId" UUID NOT NULL REFERENCES "Treatment"(id) ON DELETE CASCADE,
  "personalizationTemplateId" UUID REFERENCES "FormSectionTemplate"(id) ON DELETE SET NULL,
  "accountTemplateId" UUID REFERENCES "FormSectionTemplate"(id) ON DELETE SET NULL,
  "doctorTemplateId" UUID REFERENCES "FormSectionTemplate"(id) ON DELETE SET NULL,
  "layoutTemplate" VARCHAR(50) NOT NULL DEFAULT 'template-1',
  "themeId" UUID,
  "lockedUntil" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  
  UNIQUE("tenantId", "treatmentId")
);
```

### Schema Relationships

```
User (Tenant)
├── 1:Many → TenantProductForm
└── 1:Many → FormSectionTemplate (created templates)

FormSectionTemplate (Global)
├── isGlobal: true
├── tenantId: null
└── Many:Many → TenantProductForm (via foreign keys)

Treatment (Product)
└── 1:Many → TenantProductForm
```

### Sample Data

**Global Template:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Performance Personalization Questions",
  "sectionType": "personalization",
  "category": "performance",
  "isGlobal": true,
  "tenantId": null,
  "schema": {
    "steps": [
      {
        "id": "step-1",
        "title": "What is your main goal with {{companyName}} medication?",
        "description": "Please select your primary reason.",
        "stepOrder": 1,
        "stepType": "question",
        "category": "normal",
        "questions": [
          {
            "id": "q-1",
            "type": "single-choice",
            "questionText": "",
            "required": true,
            "options": [
              "Improve health",
              "Feel better about myself",
              "Improve quality of life",
              "All of the above"
            ]
          }
        ]
      }
    ]
  }
}
```

---

## Security & Compliance

### Access Control

#### Admin Users
- **Can**: Create, read, update global templates
- **Cannot**: Delete global templates (soft delete only via `isActive: false`)
- **Role**: `admin` or `super-admin`

#### Tenant Users
- **Can**: Read global templates, view in forms
- **Cannot**: Modify global templates
- **Role**: `tenant` or `clinic-admin`

### Data Protection

1. **HIPAA Compliance**
   - No PHI in template definitions
   - Patient data collected separately
   - Encrypted at rest and in transit

2. **Audit Trail**
   - All template changes logged
   - Version history maintained
   - `version` field incremented on updates

3. **Input Validation**
   - XSS protection on all text fields
   - SQL injection prevention (parameterized queries)
   - JSONB schema validation

### Authentication & Authorization

```typescript
// Middleware: authenticateJWT
// - Validates JWT token
// - Checks expiration
// - Extracts user role

// Middleware: requireAdmin (future)
// - Ensures user has admin role
// - Required for template creation/updates
```

### Rate Limiting

- **Template Creation**: 10 requests/minute per user
- **Template Updates**: 30 requests/minute per user
- **Template Reads**: Unlimited (cached)

---

## Testing Requirements

### Unit Tests

#### Backend (patient-api)
```typescript
// formTemplate.service.test.ts
describe('FormTemplateService', () => {
  it('should create global template with isGlobal: true')
  it('should list only global templates')
  it('should update template and increment version')
  it('should not allow changing isGlobal after creation')
})

// Model validations
describe('FormSectionTemplate Model', () => {
  it('should require name and sectionType')
  it('should validate sectionType enum')
  it('should default isGlobal to true')
  it('should set tenantId to null for global templates')
})
```

#### Frontend (fuse-tenant-portal-frontend)
```typescript
// forms/index.test.tsx
describe('Forms Management Page', () => {
  it('should show Products and Standardized Questions tabs')
  it('should list templates by category')
  it('should create template with isGlobal: true')
  it('should navigate to editor on edit click')
})

// forms/editor/[id].test.tsx
describe('Template Editor', () => {
  it('should load template with steps')
  it('should add new question step')
  it('should add new info step')
  it('should reorder steps via drag and drop')
  it('should save template with updated schema')
  it('should show global template badge')
  it('should copy variable on click')
})
```

### Integration Tests

```typescript
describe('Global Template Flow', () => {
  it('should create template and make available to all tenants', async () => {
    // 1. Admin creates template
    const template = await createTemplate({ isGlobal: true })
    
    // 2. Verify tenant A sees template
    const tenantATemplates = await fetchTemplates(tenantA.token)
    expect(tenantATemplates).toContainEqual(template)
    
    // 3. Verify tenant B sees template
    const tenantBTemplates = await fetchTemplates(tenantB.token)
    expect(tenantBTemplates).toContainEqual(template)
    
    // 4. Admin updates template
    await updateTemplate(template.id, { name: 'Updated Name' })
    
    // 5. Verify both tenants see update
    expect(await fetchTemplate(template.id, tenantA.token)).toHaveProperty('name', 'Updated Name')
    expect(await fetchTemplate(template.id, tenantB.token)).toHaveProperty('name', 'Updated Name')
  })
})
```

### E2E Tests (Playwright/Cypress)

```typescript
describe('Admin creates global template', () => {
  it('should complete full template creation flow', () => {
    // 1. Navigate to forms page
    cy.visit('/forms')
    
    // 2. Switch to Standardized Questions tab
    cy.contains('Standardized Questions').click()
    
    // 3. Select category
    cy.get('select').select('Performance')
    
    // 4. Click Create Personalization Template
    cy.contains('Create Personalization Template').click()
    
    // 5. Verify editor opens
    cy.url().should('include', '/forms/editor/')
    cy.contains('🌐 GLOBAL TEMPLATE').should('be.visible')
    
    // 6. Add question step
    cy.contains('Question Step').click()
    
    // 7. Edit step
    cy.get('[data-testid="step-title"]').type('What is your goal?')
    cy.get('[data-testid="step-description"]').type('Select your primary reason.')
    
    // 8. Add option
    cy.contains('Add Option').click()
    cy.get('[data-testid="option-3"]').type('Custom option')
    
    // 9. Save
    cy.contains('Save Changes').click()
    cy.contains('✅ Template saved successfully!').should('be.visible')
  })
})
```

### Manual Testing Checklist

- [ ] Create global template for each section type (personalization, account, doctor)
- [ ] Edit existing template and verify version increments
- [ ] Add question step with 5+ options
- [ ] Add info step with long description
- [ ] Drag-and-drop to reorder steps
- [ ] Delete a step and verify it's removed
- [ ] Use dynamic variable in title ({{companyName}})
- [ ] Copy variable by clicking (verify "Copied!" shows)
- [ ] Save template and verify in database
- [ ] Load template as Tenant A, verify {{companyName}} replaced
- [ ] Load same template as Tenant B, verify different company name
- [ ] Update global template, verify both tenants see changes
- [ ] Test with expired JWT (should show session expired message)

---

## Future Enhancements

### Phase 2: Advanced Features

1. **Template Versioning UI**
   - View version history
   - Rollback to previous version
   - Compare versions side-by-side

2. **Template Preview**
   - Live preview of patient-facing form
   - Toggle between tenant views
   - Mobile/desktop preview modes

3. **Conditional Logic**
   - Show/hide questions based on previous answers
   - Branching paths within forms
   - Skip logic implementation

4. **Question Types**
   - Date picker
   - File upload
   - Signature field
   - Scale/slider
   - Matrix questions

5. **Template Analytics**
   - Completion rates per template
   - Time spent per step
   - Drop-off points
   - A/B testing capabilities

### Phase 3: Tenant Customization

1. **Template Override**
   - Tenant can "fork" global template
   - Custom version for their clinic only
   - Falls back to global if not overridden

2. **Custom Variables**
   - Tenant-defined variables
   - Dynamic field mapping
   - Conditional variable display

3. **Localization**
   - Multi-language support
   - Translation management
   - RTL language support

### Phase 4: Compliance & Governance

1. **Approval Workflow**
   - Template changes require approval
   - Multi-stage review process
   - Audit log with approver names

2. **Compliance Checks**
   - Required questions per state
   - Age verification
   - Consent management

3. **Data Retention**
   - Archive old template versions
   - GDPR right-to-delete support
   - Data export functionality

---

## Appendix

### A. Glossary

- **Global Template**: Master template used by all tenants (`isGlobal: true`)
- **Tenant**: A clinic or provider using the FUSE Health platform
- **Section Type**: Category of questions (personalization, account, doctor)
- **Product Category**: Type of medical treatment (performance, weight-loss, etc.)
- **Dynamic Variable**: Placeholder text replaced with tenant-specific data
- **Step**: Individual page/screen in a questionnaire
- **Question Step**: Step with interactive question and answer options
- **Info Step**: Read-only informational step
- **Schema**: JSON structure defining questionnaire steps and questions

### B. Environment Variables

```bash
# Backend (.env.local at root)
DATABASE_URL=postgresql://user:pass@host:port/database
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:3030
NEXT_PUBLIC_API_URL=http://localhost:3001

# Frontend (embedded in code)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### C. File Locations

**Backend:**
```
patient-api/
├── src/models/FormSectionTemplate.ts
├── src/services/formTemplate.service.ts
├── src/main.ts (API endpoints)
└── migrations/20251007000000-add-global-templates-support.js
```

**Frontend:**
```
fuse-tenant-portal-frontend/
├── pages/forms/index.tsx (management page)
├── pages/forms/editor/[id].tsx (template editor)
├── pages/forms/hooks/useTemplates.ts
└── pages/forms/QuestionnaireEditor.tsx (legacy, not used)
```

**Patient Frontend:**
```
patient-frontend/
├── components/QuestionnaireModal/index.tsx (variable replacement)
└── lib/templateVariables.ts (replacement logic)
```

### D. Support & Maintenance

**Documentation:**
- Technical Docs: `/CLAUDE.md` (repository root)
- API Docs: This PRD, API Specifications section
- User Guide: TBD

**Monitoring:**
- Template creation rate
- Template update frequency
- API error rates
- Variable replacement failures

**Maintenance Windows:**
- Database migrations: Coordinated with dev team
- Schema updates: Require backward compatibility
- API changes: Versioned endpoints recommended

---

## Revision History

| Version | Date       | Author      | Changes                            |
|---------|------------|-------------|------------------------------------|
| 1.0     | 2025-10-07 | FUSE Team   | Initial PRD - Global templates     |

---

**Document Status:** ✅ Complete and Implemented  
**Last Updated:** October 7, 2025  
**Next Review:** January 2026

---

## Contact

For questions or clarifications about this PRD, contact:
- **Development Team**: dev@fuse.health
- **Product Manager**: product@fuse.health
- **Technical Lead**: tech-lead@fuse.health

