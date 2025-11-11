# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FUSE Health Monorepo** - A healthcare platform consisting of a patient portal, admin dashboard, tenant portal, and backend API for managing treatments, prescriptions, orders, and telehealth services.

**Technology Stack:**
- **Monorepo:** Turborepo + pnpm workspaces
- **Backend:** Node.js + Express + TypeScript + Sequelize (PostgreSQL)
- **Frontend:** Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **UI Libraries:** Radix UI (admin/tenant), Hero UI (patient), Framer Motion
- **Payments:** Stripe
- **External Integrations:** MD Integrations (telehealth), Pharmacy API, SendGrid, AWS S3

## Workspace Structure

```
fuse-monorepo/
├── patient-api/              # Express API backend (port 3001)
├── patient-frontend/         # Patient portal (port 3000)
├── fuse-admin-frontend/      # Admin dashboard (port 3002)
├── fuse-tenant-portal-frontend/ # Tenant/clinic portal (port 3030)
├── .env.local               # Shared environment variables
└── pnpm-workspace.yaml      # Dependency catalog
```

## Common Commands

### Development
```bash
# Install dependencies (from root)
pnpm install

# Run all apps in parallel
pnpm dev

# Run specific app
cd patient-api && pnpm dev
cd patient-frontend && pnpm dev
cd fuse-admin-frontend && pnpm dev
cd fuse-tenant-portal-frontend && pnpm dev

# Build all apps
pnpm build

# Build specific app
cd patient-api && pnpm build
```

### Database (patient-api)
```bash
cd patient-api

# Run migrations
pnpm migrate

# Undo last migration
pnpm migrate:undo

# Note: Uses Sequelize with PostgreSQL
```

### Testing & Quality
```bash
# Lint all apps
pnpm lint

# Clean all node_modules and build artifacts
pnpm clean
pnpm clean:workspaces
```

### PM2 Production (each app has these scripts)
```bash
# Start with PM2
pnpm pm2:start

# Reload (rebuild + restart)
pnpm pm2:reload

# Reload without rebuild
pnpm pm2:reload-no-build

# Stop
pnpm pm2:stop
```

## Environment Configuration

All apps load environment variables from `.env.local` at the **monorepo root** using `dotenv-cli`.

**Frontend variables must be prefixed with `NEXT_PUBLIC_`** to be accessible in the browser.

### Critical Variables
```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...          # Backend
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Frontend
STRIPE_WEBHOOK_SECRET=whsec_...

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_PUBLIC_BUCKET=...

# URLs
FRONTEND_URL=http://localhost:3000     # Patient portal URL (for CORS/redirects)
NEXT_PUBLIC_API_URL=http://localhost:3001  # API endpoint for frontends

# External APIs
PHARMACY_API_KEY=...
MD_INTEGRATIONS_CLIENT_ID=...
MD_INTEGRATIONS_CLIENT_SECRET=...
SENDGRID_API_KEY=...
```

See `.env.example` for complete list with documentation.

## Backend Architecture (patient-api)

### Service Layer Pattern

**Three-tier architecture:**
1. **Routes** (in `main.ts`) - HTTP request handling, authentication, validation
2. **Service Layer** (`src/services/*.service.ts`) - Business logic
3. **Database Layer** (`src/services/db/*.ts`) - Data access

#### Service Classes
Class-based services with constructor injection for external dependencies:

```typescript
// src/services/user.service.ts
class UserService {
    private externalService: ExternalService;

    constructor() {
        this.externalService = new ExternalService();
    }

    async updateUser(userId: string, data: UserData) {
        // Business logic here
        // Call database layer
        const result = await updateUser(userId, data);
        return { success: true, data: result };
    }
}

export default UserService;
```

#### Database Abstraction
Separate database operations into `src/services/db/`:

```typescript
// src/services/db/user.ts
export const getUser = async (userId: string): Promise<User | null> => {
    return User.findByPk(userId);
}

export const updateUser = async (userId: string, data: Partial<User>): Promise<[number]> => {
    return User.update(data, { where: { id: userId } });
}
```

#### External Service Integration
Direct response return pattern for external APIs (Stripe, Pharmacy, MD Integrations):

```typescript
// Services return external API responses directly
async checkoutSub(params) {
    return stripe.checkout.sessions.create({...});
}

// Controllers handle errors
try {
    const session = await stripeService.checkoutSub(params);
    res.json(session);
} catch (error) {
    res.status(500).json({ error: 'Checkout failed' });
}
```

### API Endpoint Patterns

#### Authentication
Always use `authenticateJWT` middleware for protected endpoints:

```typescript
app.put("/endpoint", authenticateJWT, async (req, res) => {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    // Process request
});
```

#### Response Format
Consistent JSON structure:

```typescript
// Success
res.status(200).json({
    success: true,
    message: "Operation completed",
    data: result
});

// Error
res.status(400).json({
    success: false,
    error: "Validation failed",
    missingFields: ["field1", "field2"]
});
```

#### Business Logic Separation
Controllers are thin - delegate to services:

```typescript
// Controller extracts params, calls service, returns response
app.put("/endpoint/:id", authenticateJWT, async (req, res) => {
    try {
        const currentUser = getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }

        const result = await someService.performOperation(req.params.id, req.body, currentUser.id);

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
```

### List Method Standards

All list endpoints follow consistent pagination:

```typescript
// Database layer
export const listOrdersByClinic = async (
    clinicId: string,
    options: { page: number; limit: number }
): Promise<{ orders: Order[], total: number, totalPages: number }> => {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    const { rows: orders, count: total } = await Order.findAndCountAll({
        where: { clinicId },
        limit,
        offset,
        distinct: true
    });

    return { orders, total, totalPages: Math.ceil(total / limit) };
};

// Service layer
async listOrdersByClinic(clinicId: string, userId: string, paginationParams = {}) {
    // Validate user permissions
    const page = Math.max(1, paginationParams.page || 1);
    const limit = Math.min(100, Math.max(1, paginationParams.limit || 10));

    const result = await listOrdersByClinic(clinicId, { page, limit });

    return {
        success: true,
        message: `Retrieved ${result.orders.length} orders`,
        data: {
            orders: result.orders,
            pagination: { page, limit, total: result.total, totalPages: result.totalPages }
        }
    };
}
```

### Model Relationships

Key Sequelize models with associations:
- **User** - hasOne Clinic, hasMany Orders, hasOne Subscription
- **Clinic** - belongsTo User, hasMany Treatments, hasMany Products
- **Treatment** - belongsTo Clinic, belongsToMany Products (through TreatmentProducts)
- **Order** - belongsTo User/Clinic, hasMany OrderItems, hasOne Payment, hasOne ShippingOrder
- **Prescription** - belongsTo User/Physician, belongsToMany Products

External ID fields for synchronization:
- `pharmacyPatientId` - Pharmacy API patient ID
- `mdIntegrationsCaseId` - MD Integrations case ID
- `stripeCustomerId` - Stripe customer ID

## Frontend Architecture

### Patient Frontend
- **Framework:** Next.js 14 (Pages Router) + React 18
- **Styling:** Tailwind CSS 4 + Hero UI + Framer Motion
- **Auth:** JWT tokens in localStorage, ProtectedRoute component
- **API:** Centralized `lib/api.ts` with automatic JWT header injection

### Admin & Tenant Frontends
- **Framework:** Next.js 14 (Pages Router) + React 18
- **Styling:** Tailwind CSS 3 + Radix UI + shadcn/ui patterns
- **Forms:** react-hook-form + zod validation
- **Auth:** AuthContext with JWT tokens

### API Communication Pattern

All frontends use `NEXT_PUBLIC_API_URL` environment variable:

```typescript
// Fetch with automatic auth
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/endpoint`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
});
```

Patient frontend has centralized `apiCall()` utility in `lib/api.ts`.

## External Integrations

### Stripe
- Subscription management with webhook handling (`/stripe-webhook`)
- Product purchases with checkout sessions
- Payment intents for one-time payments
- Webhook secret validation required

### Pharmacy API
- Patient sync via `PharmacyPatientService`
- Order submission via `PharmacyOrderService`
- Physician management
- Webhook handling at `/pharmacy-webhook`

### MD Integrations (Telehealth)
- OAuth2 authentication (`MDAuthService`)
- Case/patient management
- File uploads for prescriptions
- Clinician messaging
- Webhook handling at `/md-webhook`

### AWS S3
- Image uploads (products, treatments, user avatars)
- Public bucket configuration
- Validation: max 5MB, image files only
- Helper functions in `config/s3.ts`

## HIPAA Compliance

**Critical security requirements:**

1. **Never log PHI** (Protected Health Information)
   - No patient names, DOB, addresses in logs
   - Use generic error messages: "Error updating patient" not "Error updating John Doe"

2. **Authentication required** for all patient data endpoints
   - Use `authenticateJWT` middleware
   - Validate user owns/has access to data

3. **Data minimization** in API responses
   - Only return necessary fields
   - Don't return full objects when IDs suffice

4. **Secure session management**
   - JWT tokens with expiration
   - HTTPS only in production
   - Secure cookies with sameSite='none' in production

## Dependency Management

The monorepo uses **pnpm workspace catalogs** for shared dependencies.

### Adding Dependencies

1. **Shared dependency** (used by 2+ apps):
   ```yaml
   # pnpm-workspace.yaml
   catalog:
     package-name: ^1.0.0
   ```

   ```json
   // package.json
   "dependencies": {
     "package-name": "catalog:"
   }
   ```

2. **Version-specific catalogs**:
   ```yaml
   catalogs:
     react18:
       react: 18.3.1
       react-dom: 18.3.1
   ```

   ```json
   "dependencies": {
     "react": "catalog:react18"
   }
   ```

3. **App-specific dependency**:
   ```json
   "dependencies": {
     "app-specific-pkg": "^1.0.0"
   }
   ```

**Important:** Patient-frontend uses React 18/Next 14 (like admin frontends), NOT React 19. Many UI libraries are not React 19 compatible yet.

## Common Issues & Solutions

### TypeScript: "Cannot find type definition for 'minimatch'"
**Solution:** Add `"types": ["node"]` or `"types": []` to tsconfig.json compilerOptions.

### "Invalid hook call" error in React
**Cause:** React version mismatch between app and libraries.
**Solution:** Ensure all frontends use React 18 (`catalog:react18`).

### "Must use import to load ES Module" in patient-api
**Cause:** `"type": "module"` in package.json but using CommonJS.
**Solution:** Remove `"type": "module"` from patient-api/package.json (it uses CommonJS).

### CORS errors in development
**Check:**
1. `FRONTEND_URL` set correctly in API `.env.local`
2. API CORS config allows frontend origin
3. Using `withCredentials: true` if sending cookies

### Environment variables not loading
**Check:**
1. `.env.local` exists at monorepo root
2. Scripts use `pnpm with-env` prefix
3. `dotenv-cli` installed in devDependencies
4. Frontend vars prefixed with `NEXT_PUBLIC_`

## Code Generation Rules

When modifying existing code, follow the patterns established in the codebase (see patient-api examples above). Key principles:

- **Services** contain business logic, **routes** are thin
- **Database layer** abstracts Sequelize queries
- **External service calls** return responses directly, let controllers handle errors
- **Validation** returns structured results with missing fields
- **Authentication** always required for PHI endpoints
- **Response format** is consistent across all endpoints
- **Minimal data return** - only return what's needed
- **List methods** follow pagination standard

This document should be referenced when creating new features, endpoints, services, or troubleshooting issues.
