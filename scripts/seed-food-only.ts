/**
 * Re-seed only the 5 food marketplace items
 * Run AFTER adding marker_config column to database
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const foodLandmarks = [
    {
        node_id: 'market',
        category: 'food',
        title: 'Arsik',
        coordinates: { yaw: 0.6, pitch: 0.3 },
        lore_context: 'Goldfish cooked with andaliman pepper and torch ginger. A celebratory dish symbolizing blessings, served at weddings and feasts.',
        position_3d: { x: 0.3, y: 1.7, z: -1.3 },
        marker_config: { is_for_sale: true, price: 75000, image: '/images/arsik.jpg' }
    },
    {
        node_id: 'market',
        category: 'food',
        title: 'Naniura',
        coordinates: { yaw: 1.8, pitch: 0.0 },
        lore_context: 'Raw carp marinated in lime juice, torch ginger, and andaliman. The citrus "cooks" the fish, creating a tangy delicacy.',
        position_3d: { x: -1.4, y: 1.5, z: 0.8 },
        marker_config: { is_for_sale: true, price: 65000, image: '/images/naniura.jpg' }
    },
    {
        node_id: 'market',
        category: 'food',
        title: 'Ombus-Ombus',
        coordinates: { yaw: 2.9, pitch: -0.1 },
        lore_context: 'Steamed rice cake wrapped in banana leaves, filled with palm sugar. A sweet treat enjoyed during harvest festivals.',
        position_3d: { x: 1.2, y: 1.8, z: 0.4 },
        marker_config: { is_for_sale: true, price: 25000, image: '/images/ombus.jpg' }
    },
    {
        node_id: 'market',
        category: 'food',
        title: 'Dali Ni Horbo',
        coordinates: { yaw: 4.1, pitch: 0.2 },
        lore_context: 'Buffalo cheese fermented in bamboo tubes. Its pungent, creamy flavor pairs perfectly with rice and sambal.',
        position_3d: { x: -0.6, y: 1.6, z: -1.0 },
        marker_config: { is_for_sale: true, price: 45000, image: '/images/dali.jpg' }
    },
    {
        node_id: 'market',
        category: 'food',
        title: 'Mie Gomak',
        coordinates: { yaw: 5.3, pitch: -0.2 },
        lore_context: 'Thick noodles in spicy andaliman broth. A comforting staple that warms the soul, especially on cool mountain mornings.',
        position_3d: { x: 0.9, y: 1.7, z: 1.2 },
        marker_config: { is_for_sale: true, price: 35000, image: '/images/mie-gomak.jpg' }
    }
];

async function seedFoodItems() {
    console.log('🍜 Re-seeding food marketplace items...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const landmark of foodLandmarks) {
        const { error } = await supabase
            .from('landmarks')
            .insert([landmark]);

        if (error) {
            if (error.code === '23505') {
                console.log(`   ⏭️  Skipped: ${landmark.title} (already exists)`);
            } else {
                console.error(`   ❌ Failed: ${landmark.title} - ${error.message}`);
                errorCount++;
            }
        } else {
            console.log(`   ✅ Added: ${landmark.title} (Rp ${landmark.marker_config.price.toLocaleString('id-ID')})`);
            successCount++;
        }
    }

    console.log(`\n✨ Food seeding complete!`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}\n`);

    // Verify
    const { data, error } = await supabase
        .from('landmarks')
        .select('*')
        .eq('category', 'food');

    if (error) {
        console.error('❌ Verification failed:', error.message);
    } else {
        console.log(`🛒 Total food items in database: ${data?.length || 0}/5\n`);
    }
}

seedFoodItems()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    });
