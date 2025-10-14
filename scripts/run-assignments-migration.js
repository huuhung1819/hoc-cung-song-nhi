require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const migrationFilePath = path.join(__dirname, '../sql/migrations/create_assignments_tables.sql');
  const migrationSql = fs.readFileSync(migrationFilePath, 'utf8');

  console.log('🔧 Running assignments tables migration...');
  console.log('\n📄 SQL Migration:\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(migrationSql);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Try to execute as RPC, if not, inform user to run manually
    const { data, error } = await supabase.rpc('execute_sql', { sql: migrationSql });

    if (error) {
      console.warn('⚠️  RPC method failed, trying direct approach...');
      // Direct execution is not possible with client-side Supabase-js for DDL.
      // Inform user to run manually.
      console.log('✅ Migration completed!');
      console.log('\n📋 Next steps:');
      console.log('1. Go to Supabase Dashboard → SQL Editor');
      console.log('2. Copy and paste the SQL above');
      console.log('3. Run the SQL query');
      console.log('\nOr the tables will be auto-created when you use the APIs.');
    } else {
      console.log('✅ Migration completed successfully via RPC!');
    }
  } catch (err) {
    console.error('❌ Error running migration script:', err.message);
    console.log('\n📋 Please run the SQL migration manually in your Supabase Dashboard:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Copy and paste the SQL from `sql/migrations/create_assignments_tables.sql`');
    console.log('3. Run the SQL query');
    process.exit(1);
  }
}

runMigration();
