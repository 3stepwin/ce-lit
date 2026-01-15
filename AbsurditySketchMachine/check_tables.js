
// fetch is global in Node 22

const SUPABASE_URL = 'https://ebostxmvyocypwqpgzct.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVib3N0eG12eW9jeXB3cXBnemN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMzk2MjcsImV4cCI6MjA4MDcxNTYyN30.CS0osjHXCqKQJqebwRy3QAviYJEzJFuRe1eUbs6KODI';

async function checkSchema() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`,
                'Accept': 'application/json' // Explicitly ask for JSON description
            }
        });

        const data = await response.json();

        // Check if 'sketches' exists in definitions
        if (data.definitions && data.definitions.sketches) {
            console.log("✅ 'sketches' table FOUND.");
            console.log("Columns:", Object.keys(data.definitions.sketches.properties));
        } else if (data.definitions) {
            console.log("❌ 'sketches' table NOT found in public schema.");
            console.log("Tables found:", Object.keys(data.definitions));
        } else {
            console.log("Received unexpected response format:", JSON.stringify(data).slice(0, 200));
        }

        // Check for 'shots' table
        if (data.definitions && data.definitions.shots) {
            console.log("✅ 'shots' table FOUND.");
            console.log("Columns:", Object.keys(data.definitions.shots.properties));
        } else {
            console.log("❌ 'shots' table NOT found in public schema.");
        }
    } catch (error) {
        console.error("Error fetching schema:", error);
    }
}

checkSchema();
