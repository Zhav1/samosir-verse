import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function inspectTomokNode() {
    console.log('🔍 Inspecting tomok-harbor node...\n');

    // Fetch the problematic node
    const { data: node, error: fetchError } = await supabase
        .from('nodes')
        .select('*')
        .eq('id', 'tomok-harbor')
        .single();

    if (fetchError) {
        if (fetchError.code === 'PGRST116') {
            console.log('✅ tomok-harbor node does not exist - issue likely resolved!');
            return;
        }
        console.error('❌ Error fetching tomok-harbor:', fetchError.message);
        return;
    }

    console.log('📋 Found tomok-harbor node:');
    console.log('   ID:', node.id);
    console.log('   Name:', node.name);
    console.log('   Panorama URL:', node.panorama_url);
    console.log('   Links:', JSON.stringify(node.links, null, 2));
    
    // Ask to fix or delete
    console.log('\n🔧 Fixing: Setting links to empty array...');
    
    const { error: updateError } = await supabase
        .from('nodes')
        .update({ links: [] })
        .eq('id', 'tomok-harbor');

    if (updateError) {
        console.error('❌ Error updating tomok-harbor:', updateError.message);
    } else {
        console.log('✅ Successfully cleared links for tomok-harbor');
    }

    // Alternative: Delete the node completely
    console.log('\n💡 Tip: If tomok-harbor is from old data and not needed,');
    console.log('   you can delete it with: DELETE FROM nodes WHERE id = \'tomok-harbor\';');
}

inspectTomokNode();
