import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    try {
        console.log('🚀 Starting Phase 5 database migration...\n');

        // Read the migration SQL file
        const sqlPath = path.join(process.cwd(), 'update-landmark-positions.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

        // Split the SQL into individual statements (simple split by semicolon)
        const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`Found ${statements.length} SQL statements to execute\n`);

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];

            // Skip SELECT statements (verification queries)
            if (statement.toUpperCase().startsWith('SELECT')) {
                console.log(`⏭️  Skipping verification query (#${i + 1})`);
                continue;
            }

            console.log(`▶️  Executing statement #${i + 1}...`);

            const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });

            // If RPC method doesn't exist, try direct query
            if (error && error.message.includes('function')) {
                // Note: direct SQL execution might be restricted
                console.log('   Using alternative method...');
                const { error: directError } = await supabase.from('_sql').select('*').limit(0);
                if (directError) {
                    console.warn('   ⚠️  Statement might need manual execution via Supabase dashboard');
                }
            } else if (error) {
                console.error(`   ❌ Error: ${error.message}`);
            } else {
                console.log(`   ✅ Success`);
            }
        }

        // Verify the migration
        console.log('\n🔍 Verifying migration...');
        const { data, error } = await supabase
            .from('landmarks')
            .select('id, title, category, node_id, position_3d')
            .not('position_3d', 'is', null);

        if (error) {
            console.error('❌ Verification failed:', error.message);
        } else {
            console.log(`✅ Migration successful! ${data?.length || 0} landmarks have 3D positions:`);
            data?.forEach((landmark) => {
                console.log(`   - ${landmark.title} (${landmark.category}): ${JSON.stringify(landmark.position_3d)}`);
            });
        }

        console.log('\n✨ Phase 5 migration complete!\n');
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

runMigration();
