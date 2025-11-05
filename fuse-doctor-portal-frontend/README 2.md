# Fuse Doctor Portal Frontend

A Next.js-based doctor portal application for managing patients, appointments, and medical records.

## Features

- **Authentication**: JWT-based authentication with secure token storage
- **Dashboard**: Overview of patients, appointments, and records
- **Theme Support**: Light/Dark mode toggle
- **Responsive Design**: Mobile-friendly UI built with Tailwind CSS
- **Type-Safe**: Built with TypeScript for enhanced developer experience

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom theme variables
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10+

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

The application will start on [http://localhost:3003](http://localhost:3003)

### Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
fuse-doctor-portal-frontend/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── Header.tsx       # Top navigation
│   ├── Sidebar.tsx      # Left navigation menu
│   ├── Layout.tsx       # Page layout wrapper
│   └── ProtectedRoute.tsx # Auth route guard
├── contexts/
│   ├── AuthContext.tsx  # Authentication state
│   └── ThemeContext.tsx # Theme management
├── pages/
│   ├── _app.tsx         # App wrapper
│   ├── _document.tsx    # HTML document
│   ├── index.tsx        # Dashboard
│   ├── signin.tsx       # Login page
│   ├── signup.tsx       # Registration page
│   └── verify-email.tsx # Email verification
├── lib/
│   └── utils.ts         # Utility functions
└── styles/
    └── globals.css      # Global styles
```

## Authentication

The portal uses JWT tokens stored in localStorage:

- `doctor_token`: Authentication token
- `doctor_user`: User profile data

Authentication endpoints:

- POST `/auth/signin` - Login
- POST `/auth/signup` - Registration (role: 'doctor')
- GET `/auth/verify-email` - Email verification

## Environment Variables

Create a `.env.local` file in the monorepo root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS=false
```

## Available Scripts

- `pnpm dev` - Start development server on port 3003
- `pnpm build` - Build for production
- `pnpm start` - Start production server on port 3030
- `pnpm lint` - Run ESLint
- `pnpm pm2:start` - Start with PM2
- `pnpm pm2:reload` - Reload PM2 process
- `pnpm pm2:stop` - Stop PM2 process
- `pnpm clean` - Clean build artifacts

## Deployment

```bash
# Using the deploy script
./deploy.sh

# Or manually with PM2
pnpm build
pnpm pm2:start
```

## License

Private - Fuse Monorepo
