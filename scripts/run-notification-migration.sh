#!/bin/bash

# Run notification settings migration
echo "🔄 Running notification settings migration..."

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first."
    echo "   npm install -g supabase"
    exit 1
fi

# Run migration
echo "📝 Applying migration: 005_add_notification_settings.sql"
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📊 Added columns to users table:"
    echo "   - email_updates (BOOLEAN, default: true)"
    echo "   - lesson_reminders (BOOLEAN, default: true)" 
    echo "   - progress_reports (BOOLEAN, default: false)"
    echo "   - promotions (BOOLEAN, default: false)"
    echo "   - avatar (TEXT, default: '')"
    echo ""
    echo "🎉 Account page notification settings are now ready!"
else
    echo "❌ Migration failed!"
    exit 1
fi
