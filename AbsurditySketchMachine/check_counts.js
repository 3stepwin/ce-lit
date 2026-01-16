const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { count: premiseCount } = await client.from('viral_seed_bank').select('*', { count: 'exact', head: true });
    const { count: sceneCount } = await client.from('scene_templates').select('*', { count: 'exact', head: true });
    const { count: oldPremiseCount } = await client.from('celit_premises').select('*', { count: 'exact', head: true });
    const { count: oldSceneCount } = await client.from('celit_scene_bank').select('*', { count: 'exact', head: true });

    console.log({
        viral_seed_bank: premiseCount,
        scene_templates: sceneCount,
        celit_premises: oldPremiseCount,
        celit_scene_bank: oldSceneCount
    });
}

check();
