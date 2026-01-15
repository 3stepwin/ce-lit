
const SUPABASE_URL = 'https://ebostxmvyocypwqpgzct.supabase.co';
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVib3N0eG12eW9jeXB3cXBnemN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMzk2MjcsImV4cCI6MjA4MDcxNTYyN30.CS0osjHXCqKQJqebwRy3QAviYJEzJFuRe1eUbs6KODI';

async function checkNewTables() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`,
                'Accept': 'application/json'
            }
        });

        const data = await response.json();
        const defs = data.definitions || {};

        const tablesToCheck = ['celit_jobs', 'image_prompt_packets', 'video_prompt_packets'];

        console.log("--- TABLE CHECK ---");
        tablesToCheck.forEach(t => {
            if (defs[t]) {
                console.log(`✅ ${t} EXISTS`);
                console.log(`   Cols: ${Object.keys(defs[t].properties).join(', ')}`);
            } else {
                console.log(`❌ ${t} MISSING`);
            }
        });

    } catch (error) {
        console.error("Error fetching schema:", error);
    }
}

checkNewTables();
