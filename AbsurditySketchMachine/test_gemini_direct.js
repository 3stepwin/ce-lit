require('dotenv').config({ path: '.env' });

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    console.log(`Testing Gemini API...`);
    console.log(`Model: ${model}`);
    console.log(`Key: ${apiKey ? 'Present (' + apiKey.slice(0, 5) + '...)' : 'MISSING'}`);

    if (!apiKey) {
        console.error("❌ ERROR: GEMINI_API_KEY is missing in .env");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hello, are you operational? Reply with 'Yes, I am active.'" }] }]
            })
        });

        const data = await response.json();

        console.log("\n--- API Response Status: " + response.status + " ---");

        if (!response.ok) {
            console.error("❌ API ERROR RESPONSE:");
            console.error(JSON.stringify(data, null, 2));

            if (data.error && data.error.message) {
                if (data.error.message.includes("API key not valid")) console.error("👉 CAUSE: Invalid API Key");
                else if (data.error.message.includes("quota")) console.error("👉 CAUSE: Quota Exceeded");
                else if (data.error.message.includes("location")) console.error("👉 CAUSE: Region/Location Blocked");
            }
            return;
        }

        if (data.candidates && data.candidates.length > 0) {
            const text = data.candidates[0].content.parts[0].text;
            console.log("✅ SUCCESS! Response received:");
            console.log(text.trim());

            if (data.promptFeedback) {
                console.log("\n⚠️ Prompt Feedback (Safety):", JSON.stringify(data.promptFeedback, null, 2));
            }
        } else {
            console.log("⚠️ Response OK but no candidates returned:");
            console.log(JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("❌ NETWORK/SYSTEM ERROR:", error.message);
    }
}

testGemini();
