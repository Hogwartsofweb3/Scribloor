#!/bin/bash
set -e

# ==============================================================
# SOLSCRIBE PRODUCTION DATABASE MIGRATION SCRIPT
# ==============================================================

echo "====================================================="
echo "🚨 CAUTION: RUNNING MIGRATIONS ON PRODUCTION DATABASE"
echo "====================================================="
echo "Target Database Host: $DATABASE_URL_UNPOOLED"
echo ""

# Safety check
read -p "Are you sure you want to run migrations on PRODUCTION? (y/N) " confirm

if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "❌ Migration cancelled by user."
  exit 1
fi

echo "🚀 Running database schema migration..."

# Execute drizzle-kit push using unpooled connection URL
# We run it from the root of the workspace or package location
DATABASE_URL="$DATABASE_URL_UNPOOLED" pnpm --filter @solscribe/db push

echo "✅ Production database migration completed successfully!"
