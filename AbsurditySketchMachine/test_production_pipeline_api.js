
// Test Production Pipeline API
require('dotenv').config();
const https = require('https');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://ebostxmvyocypwqpgzct.supabase.co";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

function callGenerate(payload, label) {
    return new Promise((resolve, reject) => {
        console.log(`\n🧪 TESTING: ${label}`);
        console.log(`Payload:`, JSON.stringify(payload, null, 2));

        const url = `${SUPABASE_URL}/functions/v1/generate-sketch`;
        const opts = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(url, opts, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                try {
                    const json = JSON.parse(data);
                    console.log(`Response:`, JSON.stringify(json, null, 2));
                    resolve(json);
                } catch (e) {
                    console.log(`Raw Body: ${data}`);
                    resolve({ error: "Invalid JSON", raw: data });
                }
            });
        });

        req.on('error', e => {
            console.error(`Request Error: ${e.message}`);
            resolve({ error: e.message });
        });

        req.write(JSON.stringify(payload));
        req.end();
    });
}

async function runTests() {
    // Test 1: LIFE Vector, Empty Premise
    await callGenerate({
        type: "celit_viral",
        reality_vectors: ["LIFE_VECTOR"],
        cinema_lane: true // Higgsfield
    }, "LIFE Vector (Higgsfield)");

    // Test 2: WORK Vector, Empty Premise, Novita Forced
    await callGenerate({
        type: "celit_viral",
        reality_vectors: ["WORK_VECTOR"],
        cinema_lane: false // Novita
    }, "WORK Vector (Novita)");
}

runTests();
