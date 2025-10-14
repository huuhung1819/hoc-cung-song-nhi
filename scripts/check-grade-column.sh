#!/bin/bash
# Script to check and fix grade column issue
# File: scripts/check-grade-column.sh

echo "🔍 Checking grade column in users table..."

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

echo "📋 Checking current database schema..."

# Check if grade column exists
echo "SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'grade';" | supabase db shell

echo ""
echo "🔧 If grade column doesn't exist, running migration..."

# Apply the migration
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Migration completed!"
    echo "🔍 Verifying grade column exists..."
    
    echo "SELECT column_name, data_type, is_nullable, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'grade';" | supabase db shell
    
    echo ""
    echo "📊 Checking existing users and their grades..."
    echo "SELECT id, name, email, grade FROM users LIMIT 5;" | supabase db shell
else
    echo "❌ Migration failed. Please check the error above."
    exit 1
fi


