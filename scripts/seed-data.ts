import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const nodes = [
    {
        id: 'tomok-harbor',
        name: 'Tomok Harbor',
        panorama_url: 'https://photo-sphere-viewer-data.netlify.app/assets/sphere.jpg', // Placeholder
        thumbnail_url: 'https://photo-sphere-viewer-data.netlify.app/assets/sphere-small.jpg',
        default_yaw: 0,
        default_pitch: 0,
        links: [
            { nodeId: 'ambarita-stone-chairs' }
        ]
    },
    {
        id: 'ambarita-stone-chairs',
        name: 'Ambarita Stone Chairs',
        panorama_url: 'https://photo-sphere-viewer-data.netlify.app/assets/sphere-test.jpg', // Placeholder
        thumbnail_url: 'https://photo-sphere-viewer-data.netlify.app/assets/sphere-test-small.jpg',
        default_yaw: 0,
        default_pitch: 0,
        links: [
            { nodeId: 'tomok-harbor' }
        ]
    }
];

const landmarks = [
    {
        node_id: 'tomok-harbor',
        category: 'folklore',
        title: 'Sigale-gale Statue',
        coordinates: { yaw: 0.5, pitch: -0.2 },
        lore_context: 'The Sigale-gale is a wooden puppet used in funeral dances for those who died without children. It is said to be able to move on its own during the ritual, guided by the spirit of the deceased.'
    },
    {
        node_id: 'tomok-harbor',
        category: 'food',
        title: 'Arsik Ikan Mas',
        coordinates: { yaw: 2.0, pitch: 0.1 },
        lore_context: 'Arsik is a traditional Batak dish made from gold fish (Ikan Mas) cooked with andaliman pepper and torch ginger. It symbolizes blessings and is often served during cultural ceremonies.'
    },
    {
        node_id: 'ambarita-stone-chairs',
        category: 'history',
        title: 'Stone Chairs of King Siallagan',
        coordinates: { yaw: 1.5, pitch: -0.1 },
        lore_context: 'These stone chairs were used by the elders of the Siallagan village to hold meetings and pass judgment on criminals. The most severe punishment involved beheading, which took place on a nearby stone table.'
    }
];

async function seed() {
    console.log('Seeding nodes...');
    const { error: nodesError } = await supabase.from('nodes').upsert(nodes);
    if (nodesError) {
        console.error('Error seeding nodes:', nodesError);
        return;
    }
    console.log('Nodes seeded successfully.');

    console.log('Seeding landmarks...');
    // First, delete existing landmarks to avoid duplicates if re-running (optional, but good for dev)
    // For now, we'll just upsert based on ID if we had one, but we generate IDs. 
    // So let's just insert. To prevent duplicates on multiple runs, we might want to clear first or check.
    // For simplicity in this phase, we will just insert.
    const { error: landmarksError } = await supabase.from('landmarks').insert(landmarks);
    if (landmarksError) {
        console.error('Error seeding landmarks:', landmarksError);
        return;
    }
    console.log('Landmarks seeded successfully.');
}

seed();
