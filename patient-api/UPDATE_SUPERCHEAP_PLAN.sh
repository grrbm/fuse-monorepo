#!/bin/bash

# Script to update the supercheap plan maxProducts from 3 to 25

echo "=================================================="
echo "Update Supercheap Plan - Max Products: 3 → 25"
echo "=================================================="
echo ""

# Check if .env file exists
if [ -f .env ]; then
    echo "✅ Found .env file, loading environment variables..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️  No .env file found"
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo ""
    echo "❌ DATABASE_URL is not set!"
    echo ""
    echo "Please either:"
    echo "  1. Create a .env file with DATABASE_URL"
    echo "  2. Export DATABASE_URL in your shell"
    echo "  3. Run this script from the API server context"
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo ""

# Run the migration script
node run-supercheap-migration.js

echo ""
echo "=================================================="
echo "Done!"
echo "=================================================="

