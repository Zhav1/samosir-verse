import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Map panorama filenames to node IDs and landmark titles
const panoramaNodes = [
    // FOLKLORE
    { id: 'hanging-stone', name: 'Batu Gantung', panorama_url: '/panoramas/folklore/hanging-stone.png', landmarkTitle: 'Batu Gantung' },
    { id: 'king-sidabutar-tomb', name: 'King Sidabutar Tomb', panorama_url: '/panoramas/folklore/king-sidabutar-tomb.png', landmarkTitle: 'Tomb of King Sidabutar' },
    { id: 'sigale-gale', name: 'Sigale-gale', panorama_url: '/panoramas/folklore/sigale-gale.png', landmarkTitle: 'Sigale-gale' },
    { id: 'toba-lake', name: 'Lake Toba Legend', panorama_url: '/panoramas/folklore/toba-lake.png', landmarkTitle: 'Legend of Toba' },
    { id: 'tunggal-panaluan', name: 'Tunggal Panaluan', panorama_url: '/panoramas/folklore/tunggal-panaluan.png', landmarkTitle: 'Tunggal Panaluan' },
    
    // FOOD
    { id: 'arsik', name: 'Arsik', panorama_url: '/panoramas/food/arsik.png', landmarkTitle: 'Arsik' },
    { id: 'dali-ni-horbo', name: 'Dali Ni Horbo', panorama_url: '/panoramas/food/dali-ni-horbo.png', landmarkTitle: 'Dali Ni Horbo' },
    { id: 'mie-gomak', name: 'Mie Gomak', panorama_url: '/panoramas/food/mie-gomak.png', landmarkTitle: 'Mie Gomak' },
    { id: 'naniura', name: 'Naniura', panorama_url: '/panoramas/food/naniura.png', landmarkTitle: 'Naniura' },
    { id: 'ombus-ombus', name: 'Ombus-Ombus', panorama_url: '/panoramas/food/ombus-ombus.png', landmarkTitle: 'Ombus-Ombus' },
    
    // HISTORY
    { id: 'huta-siallagan', name: 'Huta Siallagan', panorama_url: '/panoramas/history/huta-siallagan.png', landmarkTitle: 'Huta Siallagan' },
    { id: 'hutabolon-museum', name: 'Museum Huta Bolon', panorama_url: '/panoramas/history/hutabolon-museum.png', landmarkTitle: 'Museum Huta Bolon' },
    { id: 'stone-chair', name: 'Stone Chairs', panorama_url: '/panoramas/history/stone-chair.png', landmarkTitle: 'Stone Chairs' },
    { id: 'tele-watchtower', name: 'Tele Tower', panorama_url: '/panoramas/history/tele-watchtower.png', landmarkTitle: 'Tele Tower' },
    { id: 'tugu-toga-aritonang', name: 'Tugu Aritonang', panorama_url: '/panoramas/history/tugu-toga-aritonang.png', landmarkTitle: 'Tugu Aritonang' },
    
    // MUSIC
    { id: 'gondang-sabangunan', name: 'Gondang Sabangunan', panorama_url: '/panoramas/music/gondang-sabangunan.png', landmarkTitle: 'Gondang Sabangunan' },
    { id: 'hasapi', name: 'Hasapi', panorama_url: '/panoramas/music/hasapi.png', landmarkTitle: 'Hasapi' },
    { id: 'sarune-bolon', name: 'Sarune Bolon', panorama_url: '/panoramas/music/sarune-bolon.png', landmarkTitle: 'Sarune Bolon' },
    { id: 'taganing', name: 'Taganing', panorama_url: '/panoramas/music/taganing.png', landmarkTitle: 'Taganing' },
    { id: 'tortor', name: 'Tor-Tor Dance', panorama_url: '/panoramas/music/tortor.png', landmarkTitle: 'Tor-Tor Dance' },
    
    // NATURE
    { id: 'binangalom-waterfall', name: 'Binangalom Waterfall', panorama_url: '/panoramas/nature/binangalom-waterfall.png', landmarkTitle: 'Binangalom Waterfall' },
    { id: 'efrata-waterfall', name: 'Efrata Waterfall', panorama_url: '/panoramas/nature/efrata-waterfall.png', landmarkTitle: 'Efrata Waterfall' },
    { id: 'holbung-hill', name: 'Holbung Hill', panorama_url: '/panoramas/nature/holbung-hill.png', landmarkTitle: 'Holbung Hill' },
    { id: 'mount-pusuk-buhit', name: 'Pusuk Buhit', panorama_url: '/panoramas/nature/mount-pusuk-buhit.png', landmarkTitle: 'Pusuk Buhit' },
    { id: 'parbaba-beach', name: 'Parbaba Beach', panorama_url: '/panoramas/nature/parbaba-beach.png', landmarkTitle: 'Parbaba Beach' },
];

async function connectPanoramas() {
    console.log('🔗 Connecting panoramas to database...\n');

    for (const node of panoramaNodes) {
        // 1. Upsert the node (creates if doesn't exist, updates if exists)
        const { error: nodeError } = await supabase
            .from('nodes')
            .upsert({
                id: node.id,
                name: node.name,
                panorama_url: node.panorama_url,
                thumbnail_url: node.panorama_url, // Same image for now
                default_yaw: 0,
                default_pitch: 0,
                links: [] // No navigation links for individual items
            }, {
                onConflict: 'id'
            });

        if (nodeError) {
            console.error(`❌ Error creating node ${node.id}:`, nodeError.message);
            continue;
        }

        // 2. Update the landmark to link to this node
        const { error: landmarkError } = await supabase
            .from('landmarks')
            .update({ node_id: node.id })
            .eq('title', node.landmarkTitle);

        if (landmarkError) {
            console.error(`❌ Error linking landmark "${node.landmarkTitle}":`, landmarkError.message);
        } else {
            console.log(`✅ Connected: ${node.name} → ${node.panorama_url}`);
        }
    }

    console.log('\n✨ Done! All panoramas connected.');
}

connectPanoramas();
