#!/bin/bash

# Run the supercheap plan migration using the same .env.local that the API uses

echo "=================================================="
echo "Update Supercheap Plan - Max Products: 3 → 25"
echo "=================================================="
echo ""

# Check if .env.local exists in parent directory
if [ -f "../.env.local" ]; then
    echo "✅ Found ../.env.local, loading environment variables..."
    export $(cat ../.env.local | grep -v '^#' | grep -v '^$' | xargs)
    echo "✅ Environment loaded"
else
    echo "⚠️  No ../.env.local file found"
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo ""
    echo "❌ DATABASE_URL is not set!"
    echo ""
    echo "Checking for alternative database variables..."
    
    # Check for POSTGRES_URL
    if [ ! -z "$POSTGRES_URL" ]; then
        echo "✅ Found POSTGRES_URL, using that instead"
        export DATABASE_URL="$POSTGRES_URL"
    else
        echo ""
        echo "Please either:"
        echo "  1. Add DATABASE_URL to ../.env.local"
        echo "  2. Run the SQL manually (see update-supercheap-plan.sql)"
        echo "  3. Use your database GUI to run the SQL"
        echo ""
        echo "See RUN_UPDATES_NOW.md for detailed instructions"
        exit 1
    fi
fi

echo "✅ DATABASE_URL is set"
echo ""

# Run the migration script
node run-supercheap-migration.js

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "=================================================="
    echo "✅ Migration Complete!"
    echo "=================================================="
    echo ""
    echo "📝 Next Steps:"
    echo "  1. Restart your API server (npm run dev or pm2 reload)"
    echo "  2. Refresh http://localhost:3002/products"
    echo "  3. You should now see:"
    echo "     - Ability to add up to 25 products"
    echo "     - BPC-157 showing $150 wholesale cost"
    echo ""
else
    echo ""
    echo "=================================================="
    echo "❌ Migration Failed"
    echo "=================================================="
    echo ""
    echo "See RUN_UPDATES_NOW.md for alternative methods"
    exit 1
fi

