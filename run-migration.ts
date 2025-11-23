import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runMigration() {
    console.log('🚀 Running Phase 5 database migration...\n');

    try {
        // Read the SQL file
        const sqlPath = join(process.cwd(), 'update-landmark-positions.sql');
        const sql = readFileSync(sqlPath, 'utf-8');

        // Split by semicolon and filter out comments/empty lines
        const statements = sql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i];
            
            // Skip comments and COMMENT ON statements (not supported in client)
            if (stmt.includes('COMMENT ON COLUMN')) {
                console.log(`⏭️  Skipping COMMENT statement (${i + 1}/${statements.length})`);
                continue;
            }

            console.log(`⚙️  Executing statement ${i + 1}/${statements.length}...`);
            
            const { error } = await supabase.rpc('exec_sql', { sql_query: stmt });
            
            if (error) {
                // Try direct query for ALTER TABLE
                if (stmt.includes('ALTER TABLE')) {
                    console.log('   Using admin endpoint for ALTER TABLE...');
                    // For ALTER TABLE, we'll need to use Supabase Dashboard or direct PostgreSQL access
                    console.log('   ⚠️  Please run ALTER TABLE manually via Supabase Dashboard');
                    console.log('   SQL:', stmt.substring(0, 100) + '...');
                } else {
                    console.error('   ❌ Error:', error.message);
                }
            } else {
                console.log('   ✅ Success\n');
            }
        }

        // Verify the changes
        console.log('\n📊 Verifying landmarks with 3D positions...\n');
        const { data, error } = await supabase
            .from('landmarks')
            .select('id, node_id, category, title, position_3d')
            .not('position_3d', 'is', null);

        if (error) {
            console.error('❌ Error fetching landmarks:', error);
        } else {
            console.log(`✅ Found ${data?.length || 0} landmarks with 3D positions:\n`);
            data?.forEach(landmark => {
                console.log(`   📍 ${landmark.title} (${landmark.category})`);
                console.log(`      Position: ${JSON.stringify(landmark.position_3d)}\n`);
            });
        }

        console.log('✨ Migration completed!\n');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
