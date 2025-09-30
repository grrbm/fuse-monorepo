# FUSE Health Platform

A comprehensive healthcare platform for managing treatments, prescriptions, orders, and telehealth services. Built as a monorepo containing patient portal, admin dashboard, tenant portal, and backend API.

## 🏗️ Architecture

**Monorepo Structure:**
- `patient-api/` - Express + TypeScript backend API (port 3001)
- `patient-frontend/` - Patient portal built with Next.js 14 (port 3000)
- `fuse-admin-frontend/` - Admin dashboard (port 3002)
- `fuse-tenant-portal-frontend/` - Tenant/clinic portal (port 3030)

**Technology Stack:**
- **Monorepo:** Turborepo + pnpm workspaces
- **Backend:** Node.js, Express, TypeScript, Sequelize (PostgreSQL)
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **UI:** Radix UI (admin/tenant), Hero UI (patient), Framer Motion
- **Integrations:** Stripe, MD Integrations (telehealth), Pharmacy API, SendGrid, AWS S3

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 10+
- PostgreSQL database

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Development

```bash
# Run all apps in parallel
pnpm dev

# Run specific app
cd patient-api && pnpm dev
cd patient-frontend && pnpm dev
cd fuse-admin-frontend && pnpm dev
cd fuse-tenant-portal-frontend && pnpm dev
```

### Database Setup

```bash
cd patient-api

# Run migrations
pnpm migrate

# Undo last migration
pnpm migrate:undo
```

**Note:** Local development uses Aptible tunnel:
```bash
aptible db:tunnel patient-api-staging-postgresql --port 5433
```

### Building

```bash
# Build all apps
pnpm build

# Build specific app
cd patient-api && pnpm build
```

## 🔐 Environment Variables

All apps load environment variables from `.env.local` at the monorepo root.

**Frontend variables must be prefixed with `NEXT_PUBLIC_`**.

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/fuse_db

# Authentication
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_PUBLIC_BUCKET=...

# URLs
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001

# External APIs
PHARMACY_API_KEY=...
MD_INTEGRATIONS_CLIENT_ID=...
MD_INTEGRATIONS_CLIENT_SECRET=...
SENDGRID_API_KEY=...
```

See `.env.example` for complete configuration.

## 📦 Dependency Management

This monorepo uses **pnpm workspace catalogs** for shared dependencies.

### Adding Dependencies

**Shared dependency** (used by 2+ apps):
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

**Version-specific catalogs:**
```json
"dependencies": {
  "react": "catalog:react18",
  "next": "catalog:next14"
}
```

## 🏥 HIPAA Compliance

This platform handles Protected Health Information (PHI) and follows HIPAA compliance requirements:

- ✅ Never log PHI in application logs
- ✅ Authentication required for all patient data endpoints
- ✅ Data minimization in API responses
- ✅ Secure session management with JWT tokens
- ✅ HTTPS only in production

## 🛠️ Common Commands

```bash
# Development
pnpm dev                    # Run all apps
pnpm build                  # Build all apps

# Database
cd patient-api
pnpm migrate               # Run migrations
pnpm migrate:undo          # Undo last migration

# Quality
pnpm lint                  # Lint all apps

# Cleanup
pnpm clean                 # Clean node_modules
pnpm clean:workspaces      # Clean all workspaces

# Production (PM2)
pnpm pm2:start             # Start with PM2
pnpm pm2:reload            # Reload (rebuild + restart)
pnpm pm2:stop              # Stop PM2 process
```

## 🔌 External Integrations

- **Stripe** - Payment processing and subscription management
- **MD Integrations** - Telehealth services via OAuth2
- **Pharmacy API** - Patient sync and order submission
- **AWS S3** - Image storage (max 5MB, images only)
- **SendGrid** - Email notifications

## 📁 Project Structure

```
fuse-monorepo/
├── patient-api/
│   ├── src/
│   │   ├── config/          # Configuration (JWT, S3, database)
│   │   ├── models/          # Sequelize models
│   │   ├── services/        # Business logic layer
│   │   │   ├── db/         # Database abstraction
│   │   │   ├── pharmacy/   # Pharmacy API integration
│   │   │   ├── stripe/     # Stripe integration
│   │   │   └── mdIntegration/  # MD Integrations
│   │   └── main.ts         # Express routes
│   └── package.json
│
├── patient-frontend/
│   ├── pages/              # Next.js pages
│   ├── components/         # React components
│   └── lib/api.ts         # Centralized API client
│
├── fuse-admin-frontend/
│   ├── pages/              # Next.js pages
│   ├── contexts/           # Auth context
│   └── package.json
│
├── fuse-tenant-portal-frontend/
│   ├── pages/              # Next.js pages
│   └── package.json
│
├── .env.local              # Shared environment variables
├── .env.example            # Environment template
├── pnpm-workspace.yaml     # Workspace configuration
├── turbo.json              # Turborepo configuration
└── CLAUDE.md              # Developer guide
```

## 🐛 Troubleshooting

### TypeScript: "Cannot find type definition"
Add `"types": ["node"]` or `"types": []` to tsconfig.json.

### "Invalid hook call" in React
Ensure all frontends use React 18: `"react": "catalog:react18"`

### "Must use import to load ES Module"
Remove `"type": "module"` from patient-api/package.json (uses CommonJS).

### CORS errors
Check `FRONTEND_URL` in `.env.local` and API CORS configuration.

### Environment variables not loading
- Ensure `.env.local` exists at monorepo root
- Scripts use `pnpm with-env` prefix
- Frontend vars prefixed with `NEXT_PUBLIC_`

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive developer guide with architecture patterns
- **[.env.example](./.env.example)** - Environment configuration reference

## 🔒 Security

This is a healthcare application handling PHI. Please review HIPAA compliance requirements in [CLAUDE.md](./CLAUDE.md) before contributing.

## 📄 License

Proprietary - All rights reserved
