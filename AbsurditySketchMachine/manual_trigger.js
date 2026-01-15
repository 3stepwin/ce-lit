
const FUNCTION_URL = 'https://ebostxmvyocypwqpgzct.supabase.co/functions/v1/generate-sketch';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVib3N0eG12eW9jeXB3cXBnemN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMzk2MjcsImV4cCI6MjA4MDcxNTYyN30.CS0osjHXCqKQJqebwRy3QAviYJEzJFuRe1eUbs6KODI';

async function triggerGenerate() {
    console.log("Triggering generate-sketch manually...");

    // Payload matching frontend
    const payload = {
        type: 'celit_viral',
        reality_vectors: ['WORK_VECTOR'], // Using the CORRECT vector string
        premise: '', // Empty premise = Seed Pull
        role: 'TEST_AGENT',
        cinema_lane: false
    };

    try {
        const res = await fetch(FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", JSON.stringify(data, null, 2));

    } catch (e) {
        console.error("Error:", e);
    }
}

triggerGenerate();
