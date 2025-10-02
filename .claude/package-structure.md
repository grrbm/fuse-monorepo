# Package Structure Standards

This document defines the standard structure for creating shared packages in the `packages/` directory of the monorepo.

## Reference Implementation

The `@fuse/stripe` package serves as the reference implementation for all shared packages.

## Required Structure

All packages in `packages/` MUST follow this structure:

```
packages/
└── package-name/
    ├── package.json          # Package configuration
    ├── tsconfig.json         # TypeScript configuration
    ├── index.ts              # Main entry point (re-exports from src)
    └── src/
        ├── index.ts          # Main implementation and exports
        ├── config.ts         # Configuration (if needed)
        └── [other-files].ts  # Additional implementation files
```

## Package Configuration (package.json)

### Required Fields

```json
{
  "name": "@fuse/package-name",
  "private": true,
  "version": "1.0.0",
  "description": "",
  "main": "./index.ts",
  "types": "./index.ts",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "type:check": "tsc --noEmit",
    "clean": "git clean -xdf .cache .turbo dist node_modules"
  },
  "dependencies": {
    "@fuse/tsconfig": "workspace:*"
  },
  "devDependencies": {
    "dotenv": "catalog:",
    "typescript": "catalog:"
  }
}
```

### Key Points

- **Naming**: Use `@fuse/` scope for all internal packages
- **Private**: Always set `"private": true` for internal packages
- **Main/Types**: Point to `./index.ts` for direct TypeScript consumption
- **Dependencies**:
  - Include `@fuse/tsconfig` as a workspace dependency
  - Use `catalog:` for shared dependencies from pnpm-workspace.yaml
  - Add external dependencies with specific versions
- **Scripts**:
  - `type:check`: Run TypeScript type checking without emitting files
  - `clean`: Remove generated files and node_modules

## TypeScript Configuration (tsconfig.json)

### Standard Configuration

```json
{
  "extends": "@fuse/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "declarationMap": true,
    "resolveJsonModule": true,
    "noEmit": false,
    "types": ["node"]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.json"
  ],
  "exclude": [
    "dist",
    "node_modules"
  ]
}
```

### Key Points

- **Extends**: Always extend from `@fuse/tsconfig/base.json`
- **Output**: Configure `outDir: "dist"` and `rootDir: "src"`
- **Declarations**: Enable `declaration` and `declarationMap` for type definitions
- **Types**: Include only `["node"]` to avoid unnecessary type pollution
- **Include**: Source files from `src/` directory
- **Exclude**: Generated files and dependencies

## Entry Point (index.ts)

The root `index.ts` file should be a simple re-export:

```typescript
export * from "./src/index";
```

### Purpose

- Provides a clean public API
- Allows internal restructuring without breaking imports
- Follows common package patterns

## Source Structure (src/)

### Main Implementation (src/index.ts)

```typescript
// Import dependencies
import ExternalLib from 'external-lib';
import { internalHelper } from './config';

// Export enums and types
export enum MyEnum {
  VALUE1 = 'value1',
  VALUE2 = 'value2'
}

export interface MyInterface {
  prop: string;
}

// Export classes
export class MyService {
  async myMethod(params: MyInterface) {
    // Implementation
  }
}

// Named exports at the end
export { MyInterface, MyService };
```

### Configuration File (src/config.ts)

For packages that need configuration:

```typescript
import ExternalLib from 'external-lib';

interface Config {
  apiKey: string;
  environment: string;
}

const config: Config = {
  apiKey: process.env.API_KEY!,
  environment: process.env.NODE_ENV || 'development'
};

// Validate required environment variables
if (!config.apiKey) {
  throw new Error('API_KEY environment variable is required');
}

// Export configuration and instances
export { config };
```

## Module System

### ES Modules

All packages use **ES Modules (ESM)** syntax:

- ✅ Use `import` and `export` statements
- ✅ Use `.ts` extensions in imports when needed
- ❌ Do NOT use `require()` or `module.exports`
- ❌ Do NOT add `"type": "module"` to package.json (let TypeScript handle it)

### Example

```typescript
// ✅ Correct - ES Modules
import Stripe from 'stripe';
export class StripeService { }

// ❌ Incorrect - CommonJS
const Stripe = require('stripe');
module.exports = { StripeService };
```

## Consuming Packages

### In Other Packages

To use a shared package in another workspace package:

1. **Add dependency to package.json**:
   ```json
   {
     "dependencies": {
       "@fuse/package-name": "workspace:*"
     }
   }
   ```

2. **Import in your code**:
   ```typescript
   import { MyService } from '@fuse/package-name';

   const service = new MyService();
   ```

3. **TypeScript will resolve types automatically** from the package's type definitions

## Best Practices

### 1. Single Responsibility
Each package should have a clear, focused purpose (e.g., Stripe integration, email service, authentication utilities).

### 2. Minimal Dependencies
Only include dependencies that are necessary for the package's functionality.

### 3. Clear Exports
Export only what consumers need. Keep internal utilities private.

### 4. Type Safety
Always export TypeScript interfaces and types alongside implementations.

### 5. Environment Variables
- Validate required environment variables in config files
- Throw clear errors when configuration is missing
- Document all required environment variables

### 6. Error Handling
- Let consumers handle errors (don't wrap in try-catch within service methods)
- Throw descriptive errors when configuration is invalid
- Use TypeScript for type validation

### 7. Documentation
- Add JSDoc comments for public APIs
- Document required environment variables
- Include usage examples in comments

## Example: Creating a New Package

To create a new package called `@fuse/email`:

1. **Create directory structure**:
   ```bash
   mkdir -p packages/email/src
   ```

2. **Create package.json**:
   ```json
   {
     "name": "@fuse/email",
     "private": true,
     "version": "1.0.0",
     "main": "./index.ts",
     "types": "./index.ts",
     "dependencies": {
       "@sendgrid/mail": "^8.1.6",
       "@fuse/tsconfig": "workspace:*"
     },
     "devDependencies": {
       "dotenv": "catalog:",
       "typescript": "catalog:"
     }
   }
   ```

3. **Create tsconfig.json** (copy from @fuse/stripe and modify if needed)

4. **Create index.ts**:
   ```typescript
   export * from "./src/index";
   ```

5. **Create src/index.ts**:
   ```typescript
   import sgMail from '@sendgrid/mail';

   export class EmailService {
     async sendEmail(to: string, subject: string, body: string) {
       return sgMail.send({ to, subject, html: body });
     }
   }
   ```

6. **Register in pnpm-workspace.yaml** (already done with `packages/*` glob)

7. **Install dependencies**:
   ```bash
   pnpm install
   ```

8. **Use in other packages**:
   ```typescript
   import { EmailService } from '@fuse/email';
   ```

## Turbo Integration

Packages are automatically discovered by Turbo through the pnpm workspace configuration. No additional Turbo configuration needed for basic packages.

If a package needs build steps, add a `build` script to package.json:

```json
{
  "scripts": {
    "build": "tsc"
  }
}
```

Turbo will automatically handle build ordering through the `^build` dependency in turbo.json.

## Maintenance

When updating a shared package:

1. **Run type check**: `pnpm --filter @fuse/package-name type:check`
2. **Check dependents**: Use workspace commands to test affected packages
3. **Version carefully**: Consider semantic versioning for breaking changes
4. **Update CLAUDE.md**: Document any changes to package patterns

## Reference

For a complete, working example, see:
- `packages/stripe/` - Full implementation
- `packages/stripe/package.json` - Package configuration
- `packages/stripe/tsconfig.json` - TypeScript setup
- `packages/stripe/src/index.ts` - Service implementation
