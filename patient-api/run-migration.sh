#!/bin/bash

# Migration runner script for patient-portal API
# This script runs Sequelize migrations against the remote Aptible database
# Make sure the Aptible tunnel is running: aptible db:tunnel patient-api-staging-postgresql --port 5433

echo "Running database migration..."
DATABASE_URL=postgresql://aptible:GrfB7XhlC3UI6hedNdKAjzSf819kAYun@localhost.aptible.in:5433/db NODE_ENV=production npx sequelize-cli db:migrate

echo "Migration completed!"