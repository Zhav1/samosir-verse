import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function fixNodeLinks() {
    console.log('🔧 Fixing node links...\n');

    // Fetch all nodes
    const { data: nodes, error: fetchError } = await supabase
        .from('nodes')
        .select('*');

    if (fetchError) {
        console.error('❌ Error fetching nodes:', fetchError.message);
        return;
    }

    if (!nodes || nodes.length === 0) {
        console.log('⚠️  No nodes found in database');
        return;
    }

    console.log(`📋 Found ${nodes.length} nodes\n`);

    for (const node of nodes) {
        const links = node.links;
        
        // Check if links is an array
        if (!Array.isArray(links)) {
            console.log(`⚠️  Node ${node.id}: links is not an array, setting to []`);
            await supabase
                .from('nodes')
                .update({ links: [] })
                .eq('id', node.id);
            continue;
        }

        // Check if any link is missing position data
        let hasInvalidLinks = false;
        const validLinks = links.filter((link: any) => {
            // Each link must have either:
            // 1. yaw and pitch properties, OR
            // 2. position property with yaw and pitch
            const hasYawPitch = typeof link.yaw === 'number' && typeof link.pitch === 'number';
            const hasPositionYawPitch = link.position && 
                typeof link.position.yaw === 'number' && 
                typeof link.position.pitch === 'number';
            
            if (!hasYawPitch && !hasPositionYawPitch) {
                console.log(`   ⚠️  Invalid link to "${link.nodeId}" - missing position`);
                hasInvalidLinks = true;
                return false;
            }
            
            return true;
        });

        if (hasInvalidLinks) {
            console.log(`🔧 Fixing node ${node.id}: ${links.length} → ${validLinks.length} links`);
            const { error: updateError } = await supabase
                .from('nodes')
                .update({ links: validLinks })
                .eq('id', node.id);

            if (updateError) {
                console.error(`   ❌ Error updating: ${updateError.message}`);
            } else {
                console.log(`   ✅ Updated successfully\n`);
            }
        } else {
            console.log(`✅ Node ${node.id}: ${links.length} valid links`);
        }
    }

    console.log('\n✨ Done! All node links fixed.');
    
    // Show summary
    console.log('\n📊 Database Summary:');
    const { count } = await supabase
        .from('nodes')
        .select('*', { count: 'exact', head: true });
    console.log(`   Nodes: ${count}`);
}

fixNodeLinks();
