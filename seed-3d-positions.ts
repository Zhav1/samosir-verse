/**
 * Phase 5 Database Seeder
 * Adds position_3d data to existing landmarks via Supabase client
 * Run with: npx tsx seed-3d-positions.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials in environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 3D positions for landmarks
// Coordinate System: Origin (0,0,0) is at the island center, Y is up
const landmarkPositions = [
    // Tomok Harbor landmarks
    { node_id: 'tomok-harbor', category: 'folklore', position_3d: { x: -1.5, y: 0.8, z: 1.0 } },
    { node_id: 'tomok-harbor', category: 'music', position_3d: { x: 1.2, y: 0.6, z: 0.5 } },
    { node_id: 'tomok-harbor', category: 'food', position_3d: { x: 0.3, y: 0.7, z: -1.3 } },
    
    // Ambarita Stone Chairs landmarks
    { node_id: 'ambarita-stone-chairs', category: 'history', position_3d: { x: -0.8, y: 0.9, z: -0.7 } },
    { node_id: 'ambarita-stone-chairs', category: 'nature', position_3d: { x: 1.8, y: 0.5, z: 1.5 } },
];

async function seedPositions() {
    console.log('🚀 Phase 5: Seeding 3D positions for landmarks...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const { node_id, category, position_3d } of landmarkPositions) {
        try {
            // Find the landmark
            const { data: landmarks, error: fetchError } = await supabase
                .from('landmarks')
                .select('id, title')
                .eq('node_id', node_id)
                .eq('category', category)
                .is('position_3d', null)
                .limit(1);

            if (fetchError) {
                console.error(`❌ Error fetching ${category} landmark at ${node_id}:`, fetchError.message);
                errorCount++;
                continue;
            }

            if (!landmarks || landmarks.length === 0) {
                console.log(`⏭️  No ${category} landmark found at ${node_id} (may already have position)`);
                continue;
            }

            const landmark = landmarks[0];

            // Update with 3D position
            const { error: updateError } = await supabase
                .from('landmarks')
                .update({ position_3d })
                .eq('id', landmark.id);

            if (updateError) {
                console.error(`❌ Error updating ${landmark.title}:`, updateError.message);
                errorCount++;
            } else {
                console.log(`✅ Updated "${landmark.title}" (${category}) at ${node_id}`);
                console.log(`   Position: x=${position_3d.x}, y=${position_3d.y}, z=${position_3d.z}\n`);
                successCount++;
            }
        } catch (error) {
            console.error(`❌ Unexpected error:`, error);
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
        console.error('❌ Error during verification:', verifyError);
    } else {
        console.log(`✅ Total landmarks with 3D positions: ${allLandmarks?.length || 0}\n`);
        allLandmarks?.forEach(landmark => {
            const pos = landmark.position_3d as { x: number; y: number; z: number };
            console.log(`   📍 ${landmark.title} (${landmark.category})`);
            console.log(`      Node: ${landmark.node_id}`);
            console.log(`      Position: x=${pos.x}, y=${pos.y}, z=${pos.z}\n`);
        });
    }

    console.log(`\n✨ Seeding completed!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}\n`);
}

seedPositions()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
