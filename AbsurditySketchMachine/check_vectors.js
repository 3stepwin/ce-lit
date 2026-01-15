const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data, error } = await supabase.from('seed_bank').select('category');
    if (error) {
        console.error('Error fetching vectors:', error);
    } else {
        const uniqueCategories = [...new Set(data.map(d => d.category))];
        console.log('------------------------------------------------');
        console.log('⚡ CURRENT REALITY VECTORS (DB CATEGORIES) ⚡');
        console.log('------------------------------------------------');
        uniqueCategories.forEach(cat => console.log(`• ${cat || "NULL"} (Mapped as ${cat ? cat.toUpperCase() + "_VECTOR" : "UNKNOWN"})`));
        console.log('------------------------------------------------');
    }
}

run();
