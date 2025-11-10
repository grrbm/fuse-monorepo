#!/bin/bash

# Migration runner script for patient-portal API
# This script runs Sequelize migrations using DATABASE_URL from environment

echo "Running database migration..."

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is required"
  exit 1
fi

NODE_ENV=${NODE_ENV:-production} npx sequelize-cli db:migrate

echo "Migration completed!"