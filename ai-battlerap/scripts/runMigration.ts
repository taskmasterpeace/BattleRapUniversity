/**
 * Run a specific migration file
 * Usage: npx tsx scripts/runMigration.ts <migration-file>
 */

import { createTestSupabaseClient } from '../lib/db/test-client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config as loadEnv } from 'dotenv';

// Load environment variables
loadEnv({ path: join(process.cwd(), '.env.local') });

async function main() {
  const migrationFile = process.argv[2];

  if (!migrationFile) {
    console.error('Usage: npx tsx scripts/runMigration.ts <migration-file>');
    process.exit(1);
  }

  const migrationPath = join(process.cwd(), 'supabase', 'migrations', migrationFile);
  console.log(`Running migration: ${migrationFile}`);
  console.log(`Path: ${migrationPath}`);

  // Read migration SQL
  const sql = readFileSync(migrationPath, 'utf-8');

  // Create Supabase client
  const supabase = createTestSupabaseClient();

  // Execute migration
  console.log('Executing SQL...');
  const { error } = await supabase.rpc('exec_sql', { sql_string: sql });

  if (error) {
    // If exec_sql doesn't exist, try direct execution (this won't work for complex migrations but let's try)
    console.log('exec_sql RPC not available, trying direct execution...');

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.length === 0) continue;
      console.log(`Executing: ${statement.substring(0, 100)}...`);

      // Use the from() method with a dummy operation to execute raw SQL
      // This is a workaround - normally you'd use a custom RPC function
      const { error: stmtError } = await (supabase as any).rpc('exec', { sql: statement }).catch((e: any) => {
        console.log('Statement execution method not available, migration needs manual execution');
        return { error: e };
      });

      if (stmtError) {
        console.error('Error executing statement:', stmtError);
        console.error('Statement:', statement.substring(0, 200));
      }
    }
  } else {
    console.log('✅ Migration executed successfully!');
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
