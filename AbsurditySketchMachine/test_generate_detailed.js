// Test generate-sketch with detailed error logging
require('dotenv').config();
const https = require('https');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const url = `${SUPABASE_URL}/functions/v1/generate-sketch`;
const urlObj = new URL(url);

const options = {
    method: 'POST',
    hostname: urlObj.hostname,
    path: urlObj.pathname,
    headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
    }
};

const payload = JSON.stringify({});

console.log('🧪 Testing generate-sketch with full payload...\n');
console.log('URL:', url);
console.log('Payload:', payload, '\n');

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
    });
});

req.on('error', (err) => {
    console.error('Error:', err.message);
});

req.write(payload);
req.end();
