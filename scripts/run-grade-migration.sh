#!/bin/bash
# Script to run database migration for adding grade field
# File: scripts/run-grade-migration.sh

echo "🚀 Running grade migration..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if we're logged in to Supabase
if ! supabase status &> /dev/null; then
    echo "❌ Not connected to Supabase. Please run:"
    echo "supabase login"
    exit 1
fi

echo "📝 Applying migration: 004_add_grade_to_users.sql"

# Apply the migration
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo "🎓 Grade field has been added to users table"
    echo "📋 Default grade is set to 'Lớp 5' for existing users"
else
    echo "❌ Migration failed. Please check the error above."
    exit 1
fi

echo "🔍 Verifying migration..."
echo "You can check the database schema with: supabase db diff"


