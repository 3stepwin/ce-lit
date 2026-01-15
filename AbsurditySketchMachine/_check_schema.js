const { createClient } = require('@supabase/supabase-js');

// Hardcoded from .env
const supabaseUrl = 'https://ebostxmvyocypwqpgzct.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVib3N0eG12eW9jeXB3cXBnemN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTEzOTYyNywiZXhwIjoyMDgwNzE1NjI3fQ.2QAUHfp7xhmAIMSX8jCbr7Vk99ijSinC3ENox2B5ASk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking tables...');

    // Check Sketches
    const t1 = await supabase.from('sketches').select('id').limit(1);
    console.log('Table sketches:', t1.error ? `Error: ${t1.error.message}` : 'Exists');

    // Check Scripts
    const t2 = await supabase.from('scripts').select('id').limit(1);
    console.log('Table scripts:', t2.error ? `Error: ${t2.error.message}` : 'Exists');

    // Check Shots
    const t3 = await supabase.from('shots').select('id').limit(1);
    console.log('Table shots:', t3.error ? `Error: ${t3.error.message}` : 'Exists');

    if (!t3.error) {
        // Check columns in shots
        console.log('Checking shots columns...');

        const c1 = await supabase.from('shots').select('sketch_id').limit(1);
        console.log('Column shots.sketch_id:', c1.error ? 'Missing' : 'Exists');

        const c2 = await supabase.from('shots').select('script_id').limit(1);
        console.log('Column shots.script_id:', c2.error ? 'Missing' : 'Exists');

        const c3 = await supabase.from('shots').select('visual_prompt').limit(1);
        console.log('Column shots.visual_prompt:', c3.error ? 'Missing' : 'Exists');
    }
}

check();
