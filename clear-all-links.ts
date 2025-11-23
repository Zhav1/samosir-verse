import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function clearAllLinks() {
    console.log('🧹 Clearing ALL node links in database...\n');
    console.log('⚠️  This will remove all navigation links between panorama nodes.');
    console.log('   Your architecture uses individual panoramas per landmark.');
    console.log('   Navigation links are not needed and cause Photo Sphere Viewer errors.\n');

    // Update ALL nodes to have empty links
    const { error: updateError, count } = await supabase
        .from('nodes')
        .update({ links: [] })
        .neq('id', 'non-existent-id'); // Update all rows

    if (updateError) {
        console.error('❌ Error clearing links:', updateError.message);
        return;
    }

    console.log(`✅ Successfully cleared links for all nodes`);
    
    // Verify by fetching a few nodes
    const { data: sampleNodes } = await supabase
        .from('nodes')
        .select('id, name, links')
        .limit(5);

    if (sampleNodes && sampleNodes.length > 0) {
        console.log('\n📋 Sample nodes after update:');
        sampleNodes.forEach(node => {
            const linksStatus = Array.isArray(node.links) && node.links.length === 0 ? '✅ []' : '⚠️  ' + JSON.stringify(node.links);
            console.log(`   ${node.id}: ${linksStatus}`);
        });
    }

    // Get total count
    const { count: totalCount } = await supabase
        .from('nodes')
        .select('*', { count: 'exact', head: true });

    console.log(`\n✨ Done! Cleared links for ${totalCount} nodes.`);
    console.log('\n💡 Your panorama viewer should now work correctly.');
    console.log('   Each landmark has its own individual 360° panorama.');
    console.log('   No navigation arrows between panoramas.');
}

clearAllLinks();
