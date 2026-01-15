require('dotenv').config({ path: '.env' });

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

async function testFunction() {
    console.log("Testing generate-cult-scene...");

    try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-cult-scene`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`
            },
            body: JSON.stringify({
                topic: "The history of lint",
                user_id: "test-user-123"
            })
        });

        const status = res.status;
        const text = await res.text();

        console.log(`Status: ${status}`);
        console.log(`Response: ${text.substring(0, 1000)}...`);

    } catch (e) {
        console.error("Test failed:", e);
    }
}

testFunction();
