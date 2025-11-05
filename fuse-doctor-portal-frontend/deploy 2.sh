#!/bin/bash

# Exit on error
set -e

echo "Starting deployment for Doctor Portal Frontend..."

# Pull latest code
git pull origin main

# Install dependencies
pnpm install

# Build the application
pnpm build

# Reload PM2 process
pnpm pm2:reload

echo "Deployment complete!"

