/**
 * Phase 5 Database Seeder - Simplified Version
 * First manually add the column via Supabase Dashboard, then run this to seed positions
 * 
 * Manual Step (Do this in Supabase SQL Editor first):
 * ALTER TABLE landmarks ADD COLUMN IF NOT EXISTS position_3d JSONB;
 * 
 * Then run: npx tsx seed-3d-positions-simple.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials in .env.local file');
    console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 3D positions for landmarks
// Coordinate System: Origin (0,0,0) is at the island center, Y is up
// Island floats at Y=0.5 base, camera views from Y=2
// Landmarks positioned at Y=1.4 to 1.8 to appear above the island surface
const landmarkPositions = [
    // Tomok Harbor landmarks - distributed around one side of the island
    { node_id: 'tomok-harbor', category: 'folklore', position_3d: { x: -1.5, y: 1.6, z: 1.0 } },
    { node_id: 'tomok-harbor', category: 'music', position_3d: { x: 1.2, y: 1.5, z: 0.5 } },
    { node_id: 'tomok-harbor', category: 'food', position_3d: { x: 0.3, y: 1.7, z: -1.3 } },
    
    // Ambarita Stone Chairs landmarks - on the opposite side
    { node_id: 'ambarita-stone-chairs', category: 'history', position_3d: { x: -0.8, y: 1.8, z: -0.7 } },
    { node_id: 'ambarita-stone-chairs', category: 'nature', position_3d: { x: 1.8, y: 1.4, z: 1.5 } },
];

async function seedPositions() {
    console.log('🚀 Phase 5: Seeding 3D positions for landmarks...\n');
    console.log('   Coordinate System: Origin (0,0,0) at island center, Y is up\n');

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const { node_id, category, position_3d } of landmarkPositions) {
        try {
            // Find the landmark without position_3d
            const { data: landmarks, error: fetchError } = await supabase
                .from('landmarks')
                .select('id, title, position_3d')
                .eq('node_id', node_id)
                .eq('category', category)
                .limit(1);

            if (fetchError) {
                console.error(`❌ Error fetching ${category} landmark at ${node_id}:`, fetchError.message);
                errorCount++;
                continue;
            }

            if (!landmarks || landmarks.length === 0) {
                console.log(`⚠️  No ${category} landmark found at ${node_id}`);
                skipCount++;
                continue;
            }

            const landmark = landmarks[0];

            // Skip if already has position
            if (landmark.position_3d) {
                console.log(`⏭️  "${landmark.title}" already has 3D position, skipping`);
                skipCount++;
                continue;
            }

            // Update with 3D position
            const { error: updateError } = await supabase
                .from('landmarks')
                .update({ position_3d })
                .eq('id', landmark.id);

            if (updateError) {
                console.error(`❌ Error updating ${landmark.title}:`, updateError.message);
                console.error(`   Details:`, updateError);
                errorCount++;
            } else {
                console.log(`✅ Updated "${landmark.title}" (${category})`);
                console.log(`   Position: x=${position_3d.x}, y=${position_3d.y}, z=${position_3d.z}\n`);
                successCount++;
            }
        } catch (error: any) {
            console.error(`❌ Unexpected error for ${category} at ${node_id}:`, error.message);
            errorCount++;
        }
    }

    // Verify the changes
    console.log('\n📊 Verification: Fetching all landmarks with 3D positions...\n');
    const { data: allLandmarks, error: verifyError } = await supabase
        .from('landmarks')
        .select('id, node_id, category, title, position_3d')
        .not('position_3d', 'is', null);

    if (verifyError) {
        console.error('❌ Error during verification:', verifyError.message);
    } else {
        console.log(`✅ Total landmarks with 3D positions: ${allLandmarks?.length || 0}\n`);
        if (allLandmarks && allLandmarks.length > 0) {
            allLandmarks.forEach(landmark => {
                const pos = landmark.position_3d as { x: number; y: number; z: number };
                console.log(`   📍 ${landmark.title} (${landmark.category})`);
                console.log(`      Node: ${landmark.node_id}`);
                console.log(`      Position: x=${pos.x}, y=${pos.y}, z=${pos.z}\n`);
            });
        } else {
            console.log('   ⚠️  No landmarks found with 3D positions');
            console.log('   💡 Tip: Make sure the position_3d column exists in the landmarks table');
            console.log('   Run this SQL in Supabase SQL Editor:');
            console.log('   ALTER TABLE landmarks ADD COLUMN IF NOT EXISTS position_3d JSONB;\n');
        }
    }

    console.log(`\n✨ Seeding completed!`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}\n`);

    if (successCount > 0) {
        console.log('🎉 You can now see 3D landmarks in the Sky Island view!');
        console.log('   Refresh your browser and look for glowing markers on the island\n');
    }
}

seedPositions()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
