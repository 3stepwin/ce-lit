const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkCategories() {
    const { data: viralCategories, error: err1 } = await client.from('viral_seed_bank').select('category');
    if (err1) console.error("Error viral:", err1.message);
    else {
        const cats = [...new Set(viralCategories.map(r => r.category))];
        console.log("viral_seed_bank categories:", cats);
    }

    const { data: premiseCategories, error: err2 } = await client.from('celit_premises').select('category');
    if (err2) console.error("Error premises:", err2.message);
    else {
        const cats = [...new Set(premiseCategories.map(r => r.category))];
        console.log("celit_premises categories:", cats);
    }
}

checkCategories();
