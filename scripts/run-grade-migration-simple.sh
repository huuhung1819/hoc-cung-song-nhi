#!/bin/bash
# Simple script to run grade migration
# File: scripts/run-grade-migration-simple.sh

echo "🚀 Running grade migration..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📝 Applying migration: 004_add_grade_to_users.sql"

# Try to apply migration using supabase db push
if command -v supabase &> /dev/null; then
    echo "Using Supabase CLI..."
    supabase db push
else
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    echo ""
    echo "Or manually run the SQL migration in your database:"
    echo "ALTER TABLE users ADD COLUMN grade VARCHAR(10) DEFAULT 'Lớp 5';"
    echo "UPDATE users SET grade = 'Lớp 5' WHERE grade IS NULL;"
    echo "ALTER TABLE users ALTER COLUMN grade SET NOT NULL;"
    exit 1
fi

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo "🎓 Grade field has been added to users table"
    echo "📋 Default grade is set to 'Lớp 5' for existing users"
else
    echo "❌ Migration failed. Please check the error above."
    echo ""
    echo "Manual steps to fix:"
    echo "1. Connect to your database"
    echo "2. Run: ALTER TABLE users ADD COLUMN grade VARCHAR(10) DEFAULT 'Lớp 5';"
    echo "3. Run: UPDATE users SET grade = 'Lớp 5' WHERE grade IS NULL;"
    echo "4. Run: ALTER TABLE users ALTER COLUMN grade SET NOT NULL;"
    exit 1
fi

