/**
 * Complete Database Seeder - All 25 Landmarks + Nodes
 * Implements the Content Matrix from Agents.md Section 5
 * 
 * Run with: npx tsx scripts/seed-all-landmarks.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Placeholder panorama URLs (TODO: Replace with real 360 photos)
const PLACEHOLDER_PANORAMA = 'https://photo-sphere-viewer-data.netlify.app/assets/sphere.jpg';
const PLACEHOLDER_THUMBNAIL = 'https://photo-sphere-viewer-data.netlify.app/assets/sphere-small.jpg';

/**
 * All nodes (360 panorama locations)
 * Following hub-and-spoke model: ~12 nodes for 25 landmarks
 */
const nodes = [
    {
        id: 'tomok-harbor',
        name: 'Tomok Harbor',
        panorama_url: PLACEHOLDER_PANORAMA,
        thumbnail_url: PLACEHOLDER_THUMBNAIL,
        default_yaw: 0,
        default_pitch: 0,
        links: [
            { nodeId: 'ambarita-stone-chairs', yaw: 1.5, pitch: -0.2 },
            { nodeId: 'market', yaw: 4.7, pitch: -0.1 }
        ]
    },
    {
        id: 'ambarita-stone-chairs',
        name: 'Ambarita Stone Chairs',
        panorama_url: PLACEHOLDER_PANORAMA,
        thumbnail_url: PLACEHOLDER_THUMBNAIL,
        default_yaw: 0,
        default_pitch: 0,
        links: [
            { nodeId: 'tomok-harbor', yaw: 0.0, pitch: -0.2 },
            { nodeId: 'simanindo', yaw: 3.14, pitch: -0.1 }
        ]
    },
    {
        id: 'market',
        name: 'Traditional Market',
        panorama_url: PLACEHOLDER_PANORAMA,
        thumbnail_url: PLACEHOLDER_THUMBNAIL,
        default_yaw: 0,
        default_pitch: 0,
        links: [
            { nodeId: 'tomok-harbor', yaw: 1.57, pitch: -0.2 }
        ]
    },
    {
        id: 'simanindo',
        name: 'Simanindo Village',
        panorama_url: PLACEHOLDER_PANORAMA,
        thumbnail_url: PLACEHOLDER_THUMBNAIL,
        default_yaw: 0,
        default_pitch: 0,
        links: [
            { nodeId: 'ambarita-stone-chairs', yaw: 0.0, pitch: -0.2 },
            { nodeId: 'museum', yaw: 2.35, pitch: -0.1 }
        ]
    },
    {
        id: 'museum',
        name: 'Huta Bolon Museum',
        panorama_url: PLACEHOLDER_PANORAMA,
        thumbnail_url: PLACEHOLDER_THUMBNAIL,
        default_yaw: 0,
        default_pitch: 0,
        links: [
            { nodeId: 'simanindo', yaw: 5.5, pitch: -0.2 },
            { nodeId: 'lake-view', yaw: 1.8, pitch: -0.1 }
        ]
    },
    {
        id: 'lake-view',
        name: 'Lake Toba Viewpoint',
        panorama_url: PLACEHOLDER_PANORAMA,
        thumbnail_url: PLACEHOLDER_THUMBNAIL,
        default_yaw: 0,
        default_pitch: 0,
        links: [
            { nodeId: 'museum', yaw: 4.7, pitch: -0.2 },
            { nodeId: 'mountain-view', yaw: 1.2, pitch: -0.1 }
        ]
    },
    {
        id: 'mountain-view',
        name: 'Pusuk Buhit Mountain',
        panorama_url: PLACEHOLDER_PANORAMA,
        thumbnail_url: PLACEHOLDER_THUMBNAIL,
        default_yaw: 0,
        default_pitch: 0,
        links: [
            { nodeId: 'lake-view', yaw: 4.0, pitch: -0.2 },
            { nodeId: 'hill-view', yaw: 0.9, pitch: -0.1 }
        ]
    },
    {
        id: 'hill-view',
        name: 'Holbung Hill',
        panorama_url: PLACEHOLDER_PANORAMA,
        thumbnail_url: PLACEHOLDER_THUMBNAIL,
        default_yaw: 0,
        default_pitch: 0,
        links: [
            { nodeId: 'mountain-view', yaw: 3.8, pitch: -0.2 },
            { nodeId: 'waterfall-view', yaw: 1.3, pitch: -0.1 }
        ]
    },
    {
        id: 'waterfall-view',
        name: 'Efrata Waterfall',
        panorama_url: PLACEHOLDER_PANORAMA,
        thumbnail_url: PLACEHOLDER_THUMBNAIL,
        default_yaw: 0,
        default_pitch: 0,
        links: [
            { nodeId: 'hill-view', yaw: 4.3, pitch: -0.2 },
            { nodeId: 'parbaba', yaw: 1.1, pitch: -0.1 }
        ]
    },
    {
        id: 'parbaba',
        name: 'Parbaba Beach',
        panorama_url: PLACEHOLDER_PANORAMA,
        thumbnail_url: PLACEHOLDER_THUMBNAIL,
        default_yaw: 0,
        default_pitch: 0,
        links: [
            { nodeId: 'waterfall-view', yaw: 4.1, pitch: -0.2 },
            { nodeId: 'tele', yaw: 0.8, pitch: -0.1 }
        ]
    },
    {
        id: 'tele',
        name: 'Tele Tower',
        panorama_url: PLACEHOLDER_PANORAMA,
        thumbnail_url: PLACEHOLDER_THUMBNAIL,
        default_yaw: 0,
        default_pitch: 0,
        links: [
            { nodeId: 'parbaba', yaw: 3.9, pitch: -0.2 },
            { nodeId: 'monument-view', yaw: 0.6, pitch: -0.1 }
        ]
    },
    {
        id: 'monument-view',
        name: 'Aritonang Monument',
        panorama_url: PLACEHOLDER_PANORAMA,
        thumbnail_url: PLACEHOLDER_THUMBNAIL,
        default_yaw: 0,
        default_pitch: 0,
        links: [
            { nodeId: 'tele', yaw: 3.7, pitch: -0.2 },
            { nodeId: 'tomok-harbor', yaw: 0.4, pitch: -0.1 }
        ]
    }
];

/**
 * All 25 landmarks from Agents.md Content Matrix
 * Distributed across nodes in circular pattern for 3D positions
 */
const landmarks = [
    // === A. FOLKLORE (Purple) ===
    {
        node_id: 'tomok-harbor',
        category: 'folklore',
        title: 'Sigale-gale',
        coordinates: { yaw: 0.5, pitch: -0.2 },
        lore_context: 'The Sigale-gale is a wooden puppet used in funeral dances for those who died without children. It is said to move on its own during rituals, guided by the spirit of the deceased.',
        position_3d: { x: -1.5, y: 1.6, z: 1.0 },
        image_asset: '/images/sigale-gale.jpg' // User's uploaded image!
    },
    {
        node_id: 'lake-view',
        category: 'folklore',
        title: 'Batu Gantung',
        coordinates: { yaw: 1.2, pitch: 0.1 },
        lore_context: 'A massive hanging rock that defies gravity, believed to be a petrified giant caught between heaven and earth as punishment for his arrogance.',
        position_3d: { x: 1.2, y: 1.7, z: -0.8 }
    },
    {
        node_id: 'museum',
        category: 'folklore',
        title: 'Tunggal Panaluan',
        coordinates: { yaw: 2.3, pitch: -0.1 },
        lore_context: 'The sacred magic staff planted by Si Raja Batak. Local shamans believe it channels ancestral wisdom and protects the island from misfortune.',
        position_3d: { x: -0.9, y: 1.5, z: -1.4 }
    },
    {
        node_id: 'lake-view',
        category: 'folklore',
        title: 'Legend of Toba',
        coordinates: { yaw: 3.5, pitch: 0.0 },
        lore_context: 'The story of a fisherman who married a golden fish-woman. When he broke his promise, she and her son flooded the valley, creating Lake Toba.',
        position_3d: { x: 0.8, y: 1.8, z: 1.3 }
    },
    {
        node_id: 'tomok-harbor',
        category: 'folklore',
        title: 'Tomb of King Sidabutar',
        coordinates: { yaw: 4.2, pitch: -0.3 },
        lore_context: 'Ancient stone sarcophagus of King Sidabutar, adorned with intricate Batak carvings. Visitors leave offerings to honor his spirit.',
        position_3d: { x: 1.6, y: 1.4, z: 0.6 }
    },

    // === B. MUSIC & DANCE (Blue) ===
    {
        node_id: 'simanindo',
        category: 'music',
        title: 'Gondang Sabangunan',
        coordinates: { yaw: 0.8, pitch: 0.2 },
        lore_context: 'Sacred drum ensemble of five melodic drums and a gong. Used in Batak rituals to summon ancestral spirits and bless ceremonies.',
        position_3d: { x: -1.3, y: 1.6, z: -0.5 }
    },
    {
        node_id: 'simanindo',
        category: 'music',
        title: 'Hasapi',
        coordinates: { yaw: 1.5, pitch: -0.1 },
        lore_context: 'Traditional two-stringed lute made from jackfruit wood. Its melancholic tones accompany storytelling and courtship songs.',
        position_3d: { x: 0.5, y: 1.7, z: -1.2 }
    },
    {
        node_id: 'simanindo',
        category: 'music',
        title: 'Tor-Tor Dance',
        coordinates: { yaw: 2.7, pitch: 0.0 },
        lore_context: 'Ritual dance performed to honor spirits and celebrate life events. Dancers move in sync with Gondang rhythms, their bodies channels for divine energy.',
        position_3d: { x: 1.4, y: 1.5, z: 0.9 }
    },
    {
        node_id: 'simanindo',
        category: 'music',
        title: 'Sarune Bolon',
        coordinates: { yaw: 3.9, pitch: 0.1 },
        lore_context: 'A large wooden trumpet with a haunting, mystical sound. Played during funerals to guide souls to the afterlife.',
        position_3d: { x: -0.7, y: 1.8, z: 1.1 }
    },
    {
        node_id: 'simanindo',
        category: 'music',
        title: 'Taganing',
        coordinates: { yaw: 5.0, pitch: -0.2 },
        lore_context: 'Five melodic drums arranged by pitch, forming the heart of Gondang Sabangunan. Each drum represents a different ancestral voice.',
        position_3d: { x: 1.1, y: 1.6, z: -0.7 }
    },

    // === C. FOOD (Orange) - Marketplace ===
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
    },

    // === D. HISTORY (Red) ===
    {
        node_id: 'ambarita-stone-chairs',
        category: 'history',
        title: 'Stone Chairs',
        coordinates: { yaw: 1.5, pitch: -0.1 },
        lore_context: 'Ancient stone chairs where village elders held council and judged criminals. Executions took place on a nearby stone altar.',
        position_3d: { x: -0.8, y: 1.8, z: -0.7 }
    },
    {
        node_id: 'ambarita-stone-chairs',
        category: 'history',
        title: 'Huta Siallagan',
        coordinates: { yaw: 2.4, pitch: 0.0 },
        lore_context: 'Fortified village of the Siallagan clan, protected by stone walls. Its strategic hilltop position defended against rival clans.',
        position_3d: { x: 1.5, y: 1.5, z: 1.0 }
    },
    {
        node_id: 'museum',
        category: 'history',
        title: 'Museum Huta Bolon',
        coordinates: { yaw: 3.2, pitch: 0.1 },
        lore_context: 'Traditional Batak house museum showcasing ancient artifacts, textiles, and tools. Preserves the living heritage of Samosir Island.',
        position_3d: { x: -1.2, y: 1.6, z: 0.5 }
    },
    {
        node_id: 'tele',
        category: 'history',
        title: 'Tele Tower',
        coordinates: { yaw: 4.0, pitch: -0.2 },
        lore_context: 'Colonial-era telecommunication tower built by the Dutch. Now a landmark offering panoramic views of Lake Toba.',
        position_3d: { x: 0.7, y: 1.9, z: -1.1 }
    },
    {
        node_id: 'monument-view',
        category: 'history',
        title: 'Tugu Aritonang',
        coordinates: { yaw: 5.5, pitch: 0.0 },
        lore_context: 'Monument commemorating the Aritonang clan, one of the first settlers of Samosir. Engraved with genealogical records.',
        position_3d: { x: 1.3, y: 1.4, z: 0.8 }
    },

    // === E. NATURE (Green) ===
    {
        node_id: 'mountain-view',
        category: 'nature',
        title: 'Pusuk Buhit',
        coordinates: { yaw: 0.9, pitch: -0.3 },
        lore_context: 'Sacred mountain where Si Raja Batak, ancestor of the Batak people, first descended. Pilgrims climb to its peak for spiritual cleansing.',
        position_3d: { x: -1.6, y: 1.7, z: 0.3 }
    },
    {
        node_id: 'hill-view',
        category: 'nature',
        title: 'Holbung Hill',
        coordinates: { yaw: 2.0, pitch: 0.1 },
        lore_context: 'Rolling green hills with panoramic views of Lake Toba. A favorite spot for sunrise photography and meditation.',
        position_3d: { x: 0.4, y: 1.8, z: -1.4 }
    },
    {
        node_id: 'lake-view',
        category: 'nature',
        title: 'Binangalom Waterfall',
        coordinates: { yaw: 3.1, pitch: 0.0 },
        lore_context: 'Hidden waterfall cascading into a crystal pool. Locals believe bathing here brings good fortune and health.',
        position_3d: { x: 1.4, y: 1.6, z: 0.7 }
    },
    {
        node_id: 'waterfall-view',
        category: 'nature',
        title: 'Efrata Waterfall',
        coordinates: { yaw: 4.3, pitch: -0.1 },
        lore_context: 'Multi-tiered waterfall plunging 70 meters through lush rainforest. The mist creates rainbows on sunny afternoons.',
        position_3d: { x: -0.9, y: 1.5, z: -0.9 }
    },
    {
        node_id: 'parbaba',
        category: 'nature',
        title: 'Parbaba Beach',
        coordinates: { yaw: 5.7, pitch: 0.2 },
        lore_context: 'Black volcanic sand beach on the edge of Lake Toba. A tranquil escape where fishermen mend nets at sunset.',
        position_3d: { x: 1.8, y: 1.4, z: 1.5 }
    }
];

async function seedDatabase() {
    console.log('🚀 Seeding Samosir 360 Database...\n');
    console.log('📊 Target: 12 nodes + 25 landmarks\n');

    try {
        // Step 1: Seed Nodes
        console.log('📍 Seeding nodes...');
        const { data: nodeData, error: nodeError } = await supabase
            .from('nodes')
            .upsert(nodes, { onConflict: 'id' });

        if (nodeError) {
            console.error('❌ Node seeding failed:', nodeError.message);
            return;
        }
        console.log(`✅ Seeded ${nodes.length} nodes\n`);

        // Step 2: Seed Landmarks
        console.log('🏛️ Seeding landmarks...');
        
        let successCount = 0;
        let errorCount = 0;

        for (const landmark of landmarks) {
            const { error } = await supabase
                .from('landmarks')
                .insert([landmark]);

            if (error) {
                // Skip if already exists
                if (error.code === '23505') {
                    console.log(`   ⏭️  Skipped: ${landmark.title} (already exists)`);
                } else {
                    console.error(`   ❌ Failed: ${landmark.title} - ${error.message}`);
                    errorCount++;
                }
            } else {
                console.log(`   ✅ Added: ${landmark.title} (${landmark.category})`);
                successCount++;
            }
        }

        console.log(`\n✨ Landmark seeding complete!`);
        console.log(`   ✅ Success: ${successCount}`);
        console.log(`   ❌ Errors: ${errorCount}\n`);

        // Step 3: Verification
        console.log('🔍 Verifying database...');
        
        const { data: allLandmarks, error: verifyError } = await supabase
            .from('landmarks')
            .select('id, title, category, node_id, position_3d, marker_config');

        if (verifyError) {
            console.error('❌ Verification failed:', verifyError.message);
            return;
        }

        console.log(`\n📈 Database Status:`);
        console.log(`   Total landmarks: ${allLandmarks?.length || 0}/25`);
        
        // Count by category
        const byCategory = allLandmarks?.reduce((acc, lm) => {
            acc[lm.category] = (acc[lm.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        console.log(`\n📊 Breakdown by category:`);
        console.log(`   🟣 Folklore: ${byCategory?.folklore || 0}/5`);
        console.log(`   🔵 Music: ${byCategory?.music || 0}/5`);
        console.log(`   🟠 Food: ${byCategory?.food || 0}/5`);
        console.log(`   🔴 History: ${byCategory?.history || 0}/5`);
        console.log(`   🟢 Nature: ${byCategory?.nature || 0}/5`);

        // Marketplace items
        const marketplaceItems = allLandmarks?.filter(
            lm => (lm.marker_config as any)?.is_for_sale
        );
        console.log(`\n🛒 Marketplace items: ${marketplaceItems?.length || 0}/5`);

        console.log('\n🎉 Database seeding complete!');
        console.log('   Refresh your browser to see all glowmarks\n');

    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

seedDatabase()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    });
