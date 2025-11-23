import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { readFileSync, existsSync, statSync } from 'fs';
import sizeOf from 'image-size';

dotenv.config({ path: resolve(__dirname, '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkPanoramas() {
    console.log('🔍 Checking panorama images...\n');

    // Check database
    const { data: nodes, error } = await supabase.from('nodes').select('*');
    
    if (error) {
        console.error('❌ Database error:', error);
        return;
    }

    console.log(`📊 Found ${nodes?.length || 0} nodes in database\n`);

    // Check first 5 panorama files
    const testFiles = [
        'public/panoramas/folklore/sigale-gale.png',
        'public/panoramas/food/arsik.png',
        'public/panoramas/nature/parbaba-beach.png'
    ];

    for (const file of testFiles) {
        if (existsSync(file)) {
            const stats = statSync(file);
            const dimensions = sizeOf(file);
            const aspectRatio = dimensions.width! / dimensions.height!;
            
            console.log(`✅ ${file}`);
            console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   Dimensions: ${dimensions.width}x${dimensions.height}`);
            console.log(`   Aspect Ratio: ${aspectRatio.toFixed(2)} ${aspectRatio >= 1.9 && aspectRatio <= 2.1 ? '✅ (Good for 360°)' : '⚠️ (Should be 2:1)'}`);
            console.log('');
        } else {
            console.log(`❌ File not found: ${file}\n`);
        }
    }

    // Check a few nodes from DB
    console.log('📋 Sample nodes from database:');
    nodes?.slice(0, 3).forEach(node => {
        console.log(`\n   Node: ${node.id}`);
        console.log(`   Name: ${node.name}`);
        console.log(`   Panorama URL: ${node.panorama_url}`);
        console.log(`   Has links: ${node.links?.length || 0}`);
    });
}

checkPanoramas();
