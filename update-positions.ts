import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function updatePositions() {

    const updates = [
        { title: 'Tugu Aritonang', position_3d: { x: 0.2, y: 1.6, z: 5.5 } },
        { title: 'Batu Gantung', position_3d: { x: 2.5, y: 1.2, z: -3.2 } },
        { title: 'Tomb of King Sidabutar', position_3d: { x: 1.2, y: 1.2, z: -1.8 } },
        { title: 'Huta Siallagan', position_3d: { x: 0.7, y: 1.0, z: -2.0 } },
        { title: 'Parbaba Beach', position_3d: { x: -2.2, y: 1.0, z: -2.5 } },
        { title: 'Sigale-gale', position_3d: { x: 1.6, y: 1.2, z: -1.3 } },
        { title: 'Sigale-gale Statue', position_3d: { x: 1.8, y: 1.2, z: -1.0 } },
        { title: 'Holbung Hill', position_3d: { x: -1.6, y: 1.2, z: 2.0 } },
        { title: 'Pusuk Buhit', position_3d: { x: -3.5, y: 1.3, z: 0.1 } },
        { title: 'Efrata Waterfall', position_3d: { x: -2.5, y: 1.3, z: 2.2 } },
        { title: 'Binangalom Waterfall', position_3d: { x: 4.8, y: 1.2, z: 1.0 } },
        { title: 'Tele Tower', position_3d: { x: -3.5, y: 1.3, z: 1.3 } },
        { title: 'Museum Huta Bolon', position_3d: { x: -1.2, y: 1.0, z: -3.6 } },
        { title: 'Tunggal Panaluan', position_3d: { x: 2.2, y: 1.2, z: 3.6 } },
        { title: 'Legend of Toba', position_3d: { x: 0, y: 1.4, z: 0 } },
        { title: 'Sarune Bolon', position_3d: { x: -0.7, y: 1.0, z: 2.2 } },
        { title: 'Gondang Sabangunan', position_3d: { x: 1.8, y: 1.2, z: 2.8 } },
        { title: 'Taganing', position_3d: { x: -2.5, y: 1.0, z: -2.0 } },
        { title: 'Hasapi', position_3d: { x: -2.5, y: 1.0, z: 0.1 } },
        { title: 'Tor-Tor Dance', position_3d: { x: -0.7, y: 1.0, z: 1.8 } },
        { title: 'Dali Ni Horbo', position_3d: { x: 0.7, y: 1.5, z: 1.8 } },
        { title: 'Naniura', position_3d: { x: -2.2, y: 1.0, z: 0.5 } },
        { title: 'Arsik', position_3d: { x: -2.7, y: 1.0, z: -1.0 } },
        { title: 'Ombus-Ombus', position_3d: { x: -4.2, y: 1.5, z: 1.3 } },
        { title: 'Mie Gomak', position_3d: { x: 0.7, y: 1.0, z: 3.0 } },
    ];

    for (const item of updates) {
        const { error } = await supabase
            .from('landmarks')
            .update({ position_3d: item.position_3d })
            .eq('title', item.title);

        if (error) {
            console.error(`❌ Error updating ${item.title}:`, error.message);
        } else {
            console.log(`✅ Updated ${item.title}`);
        }
    }
}

updatePositions();
