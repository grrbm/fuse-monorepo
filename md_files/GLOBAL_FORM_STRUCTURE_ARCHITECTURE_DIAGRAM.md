# Global Form Structure - Architecture Diagrams

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FUSE Platform                            │
└─────────────────────────────────────────────────────────────────┘

    ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
    │ Tenant Portal │      │ Admin Portal  │      │Patient Portal │
    │               │      │               │      │               │
    │ Create/Manage │      │ View Forms &  │      │  Fill Out     │
    │  Structures   │      │  Preview URLs │      │    Forms      │
    └───────┬───────┘      └───────┬───────┘      └───────┬───────┘
            │                      │                      │
            │ POST /global-form-   │ GET /admin/tenant-  │ GET /public/
            │      structures      │     product-forms   │     brand-products
            │                      │                      │
            └──────────────────────┼──────────────────────┘
                                   │
                                   ▼
                        ┌──────────────────┐
                        │  Patient API     │
                        │  (Backend)       │
                        └─────────┬────────┘
                                  │
                                  ▼
                        ┌──────────────────┐
                        │   PostgreSQL     │
                        │                  │
                        │  • Clinic        │
                        │  • TenantProduct │
                        │    Form          │
                        │  • Product       │
                        │  • Questionnaire │
                        └──────────────────┘
```

## Data Relationships

```
┌──────────────────────────────────────────────────────────────────┐
│                          Clinic                                   │
│  • id: UUID                                                       │
│  • slug: "preimier"                                              │
│  • globalFormStructures: JSONB [                                 │
│      { id: "default", name: "Default Flow", sections: [...] },   │
│      { id: "1762382604408", name: "Payment First", ... }         │
│    ]                                                             │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       │ HAS MANY
                       │
          ┌────────────┴────────────┬──────────────────┐
          │                         │                  │
          ▼                         ▼                  ▼
    ┌─────────┐              ┌─────────┐        ┌─────────┐
    │ Product │              │ Product │        │ Product │
    │  (NAD)  │              │ (Sema)  │        │ (Tirz)  │
    └────┬────┘              └────┬────┘        └────┬────┘
         │                        │                   │
         │ AUTO-CREATES           │                   │
         │ 1 form per structure   │                   │
         │                        │                   │
    ┌────┴────────────────────────┴───────────────────┴────┐
    │                                                        │
    ▼                                                        ▼
┌─────────────────────┐                          ┌─────────────────────┐
│ TenantProductForm   │                          │ TenantProductForm   │
│ • productId: NAD    │                          │ • productId: NAD    │
│ • structureId:      │                          │ • structureId:      │
│   "default"         │                          │   "1762382604408"   │
│ • publishedUrl:     │                          │ • publishedUrl:     │
│   preimier.../      │                          │   preimier.../      │
│   abc123/nad        │                          │   def456/nad        │
└─────────────────────┘                          └─────────────────────┘

                 ↓                                         ↓
          Renders with                              Renders with
        "Default Flow"                            "Payment First"
         section order                             section order
```

## Form Structure Deep Dive

```
┌─────────────────────────────────────────────────────────────────┐
│              Global Form Structure: "Payment First"              │
├─────────────────────────────────────────────────────────────────┤
│  {                                                               │
│    "id": "1762382604408",                                       │
│    "name": "Payment First",                                     │
│    "description": "Collect payment before questions",           │
│    "sections": [                                                │
│      ┌─────────────────────────────────────────────┐            │
│      │ { type: "checkout", order: 1, enabled: ✓ } │  ← Step 1  │
│      └─────────────────────────────────────────────┘            │
│      ┌─────────────────────────────────────────────┐            │
│      │ { type: "account_creation", order: 2, ✓ }  │  ← Step 2  │
│      └─────────────────────────────────────────────┘            │
│      ┌─────────────────────────────────────────────┐            │
│      │ { type: "product_questions", order: 3, ✓ } │  ← Step 3  │
│      └─────────────────────────────────────────────┘            │
│      ┌─────────────────────────────────────────────┐            │
│      │ { type: "category_questions", order: 4, ✗ }│  ← Hidden  │
│      └─────────────────────────────────────────────┘            │
│    ]                                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

## Section Type Mapping

```
Database Questionnaire Steps          Global Form Structure
┌─────────────────────────┐            ┌──────────────────────┐
│                         │            │                      │
│  category: 'normal'     │ ──────────>│ product_questions    │
│  category: null         │            │                      │
│                         │            └──────────────────────┘
└─────────────────────────┘

┌─────────────────────────┐            ┌──────────────────────┐
│                         │            │                      │
│ FormSectionTemplate     │ ──────────>│ category_questions   │
│ (Standardized)          │            │                      │
│                         │            └──────────────────────┘
└─────────────────────────┘

┌─────────────────────────┐            ┌──────────────────────┐
│                         │            │                      │
│ category: 'user_profile'│ ──────────>│ account_creation     │
│                         │            │                      │
│                         │            └──────────────────────┘
└─────────────────────────┘

┌─────────────────────────┐            ┌──────────────────────┐
│                         │            │                      │
│ Special checkout logic  │ ──────────>│ checkout             │
│                         │            │                      │
│                         │            └──────────────────────┘
└─────────────────────────┘
```

## Admin Portal Auto-Enable Flow

```
Admin Opens Product Page
         │
         ▼
  ┌──────────────────┐
  │ Fetch Product    │
  │ Fetch Clinic     │
  │ Fetch Forms      │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────────────────────┐
  │ Get clinic.globalFormStructures  │
  │ Result: ["default", "payment",   │
  │          "short", "personalized"]│
  └────────┬─────────────────────────┘
           │
           ▼
  ┌──────────────────────────────────┐
  │ FOR EACH structure:              │
  │                                  │
  │  ┌────────────────────────────┐  │
  │  │ Check if form exists       │  │
  │  │ WHERE productId = X        │  │
  │  │   AND structureId = Y      │  │
  │  └──────────┬─────────────────┘  │
  │             │                    │
  │             ▼                    │
  │    ┌────────────────┐            │
  │    │ Form exists?   │            │
  │    └───┬────────┬───┘            │
  │        │ YES    │ NO             │
  │        │        │                │
  │        │        ▼                │
  │        │   ┌─────────────────┐   │
  │        │   │ POST /admin/    │   │
  │        │   │ tenant-product- │   │
  │        │   │ forms           │   │
  │        │   │                 │   │
  │        │   │ Creates form +  │   │
  │        │   │ publishedUrl    │   │
  │        │   └─────────────────┘   │
  │        │                         │
  │        └────────┬────────────────┘
  │                 │
  └─────────────────┼──────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ Display 4 structure  │
         │ cards, each with     │
         │ preview URL          │
         └──────────────────────┘
```

## Patient Form Rendering Flow

```
Patient Clicks: preimier.localhost:3000/my-products/abc123/nad
                                                      ^^^^^^ ^^^
                                                      formId slug
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│  GET /public/brand-products/preimier/nad?extra=abc123   │
└───────────────────────┬──────────────────────────────────┘
                        │
                        ▼
          ┌─────────────────────────────┐
          │ Find TenantProductForm      │
          │ WHERE id = 'abc123'         │
          └──────────┬──────────────────┘
                     │
                     ▼
          ┌─────────────────────────────┐
          │ Get globalFormStructureId   │
          │ = "1762382604408"           │
          └──────────┬──────────────────┘
                     │
                     ▼
          ┌─────────────────────────────────┐
          │ Lookup structure in clinic.     │
          │ globalFormStructures array      │
          └──────────┬──────────────────────┘
                     │
                     ▼
          ┌─────────────────────────────────┐
          │ Return to frontend:             │
          │ {                               │
          │   product: {...},               │
          │   globalFormStructure: {        │
          │     name: "Payment First",      │
          │     sections: [...]             │
          │   }                             │
          │ }                               │
          └──────────┬──────────────────────┘
                     │
                     ▼
          ┌──────────────────────────────────┐
          │ QuestionnaireModal receives:     │
          │                                  │
          │ 1. Questionnaire steps           │
          │ 2. Global structure definition   │
          └──────────┬───────────────────────┘
                     │
                     ▼
          ┌──────────────────────────────────┐
          │ Reorder sections based on        │
          │ structure.sections[].order       │
          │                                  │
          │ Order 1: Checkout                │
          │ Order 2: Account Creation        │
          │ Order 3: Product Questions       │
          │ (Category disabled - skip)       │
          └──────────┬───────────────────────┘
                     │
                     ▼
          ┌──────────────────────────────────┐
          │  Display multi-step form         │
          │  with sections in correct order  │
          └──────────────────────────────────┘
```

## Database Schema Relationship

```
┌─────────────────────────────────────────────────────────────┐
│                         Clinic                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ id                 UUID PRIMARY KEY                     │ │
│ │ slug               VARCHAR UNIQUE                       │ │
│ │ name               VARCHAR                              │ │
│ │ globalFormStructures  JSONB  ← Stores array of         │ │
│ │                                 structure objects       │ │
│ └─────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ 1:N
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                  TenantProductForms                          │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ id                      UUID PRIMARY KEY                │ │
│ │ productId               UUID FK → Product              │ │
│ │ clinicId                UUID FK → Clinic               │ │
│ │ questionnaireId         UUID FK → Questionnaire        │ │
│ │ globalFormStructureId   VARCHAR  ← Links to structure  │ │
│ │                                     ID in JSONB array   │ │
│ │ publishedUrl            VARCHAR  ← Auto-generated      │ │
│ │ lastPublishedAt         TIMESTAMP                      │ │
│ │                                                         │ │
│ │ UNIQUE(productId, clinicId, questionnaireId,          │ │
│ │        globalFormStructureId)                          │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

INDEX: tenant_product_forms_structure_id_idx ON globalFormStructureId
```

## Scaling Example

```
Starting State:
Clinic has 2 structures, 3 products

┌─────────┬─────────┬─────────┐
│ Product │ Product │ Product │
│   A     │   B     │   C     │
└────┬────┴────┬────┴────┬────┘
     │         │         │
     ▼         ▼         ▼
┌─────────────────────────────┐
│ Forms Created:              │
│ • Product A + Default       │
│ • Product A + Payment First │
│ • Product B + Default       │
│ • Product B + Payment First │
│ • Product C + Default       │
│ • Product C + Payment First │
│                             │
│ Total: 6 forms (2×3)        │
└─────────────────────────────┘

After Adding 3rd Structure:
Clinic creates "Short Form"

┌─────────┬─────────┬─────────┐
│ Product │ Product │ Product │
│   A     │   B     │   C     │
└────┬────┴────┬────┴────┬────┘
     │         │         │
     ▼         ▼         ▼
┌─────────────────────────────┐
│ New Forms Auto-Created:     │
│ • Product A + Short Form    │
│ • Product B + Short Form    │
│ • Product C + Short Form    │
│                             │
│ Total: 9 forms (3×3)        │
└─────────────────────────────┘
```

## URL Structure Breakdown

```
Published URL Format:
┌────────────────────────────────────────────────────────────────┐
│ {clinicSlug}.{domain}/my-products/{formId}/{productSlug}      │
└────────────────────────────────────────────────────────────────┘
     │           │                    │           │
     ▼           ▼                    ▼           ▼
  preimier   localhost:3000   abc-123-form-uuid  nad-iv-therapy
     │           │                    │           │
     └───────────┴────────────────────┴───────────┘
              Subdomain routing    Unique per      SEO-friendly
              OR custom domain     structure       product name

Example URLs for Same Product, Different Structures:

Default Structure:
https://preimier.fuse.health/my-products/8251d1fb-641c.../nad
                                         ^^^^^^^^^^^^^^^^
                                         Form ID = Default

Payment First Structure:
https://preimier.fuse.health/my-products/a5f3-2b1c-4781.../nad
                                         ^^^^^^^^^^^^^^^^
                                         Form ID = Payment First

Short Form Structure:
https://preimier.fuse.health/my-products/c7d9-8e2f-9a12.../nad
                                         ^^^^^^^^^^^^^^^^
                                         Form ID = Short Form

Same product (NAD), different forms, different user experiences!
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│               Tenant Portal Frontend                        │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │      pages/forms/index.tsx                            │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │   GlobalStructureTab Component                  │  │  │
│  │  │                                                 │  │  │
│  │  │  • Create new structures                        │  │  │
│  │  │  • Edit existing structures                     │  │  │
│  │  │  • Drag & drop section ordering                 │  │  │
│  │  │  • Enable/disable sections                      │  │  │
│  │  │  • Save to backend                              │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                Admin Portal Frontend                        │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │      pages/products/[id].tsx                          │  │
│  │                                                       │  │
│  │  • Fetches global structures from clinic             │  │
│  │  • Auto-creates forms (one per structure)            │  │
│  │  • Displays structure cards with preview URLs        │  │
│  │  • Shows form statistics                             │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│               Patient Portal Frontend                       │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   pages/my-products/[extra]/[slug].tsx                │  │
│  │                                                       │  │
│  │  • Receives globalFormStructure from API              │  │
│  │  • Passes to QuestionnaireModal                       │  │
│  └─────────────────┬─────────────────────────────────────┘  │
│                    │                                        │
│                    ▼                                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   components/QuestionnaireModal/index.tsx             │  │
│  │                                                       │  │
│  │  • Receives questionnaire steps                       │  │
│  │  • Receives globalFormStructure                       │  │
│  │  • Reorders sections by structure.sections[].order    │  │
│  │  • Renders multi-step form                            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

**Visual diagrams help communicate the architecture to both technical and non-technical team members.**

