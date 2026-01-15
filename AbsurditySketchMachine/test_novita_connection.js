const https = require('https');

const url = 'https://ebostxmvyocypwqpgzct.supabase.co/functions/v1/generate-sketch';
const payload = JSON.stringify({
    userId: 'test_user_' + Date.now(),
    type: 'celit_viral',
    reality_vectors: ['WORK_VECTOR'],
    cinema_lane: false,  // Test Novita pipeline
    role: 'MAIN_PERFORMER',
    premise: 'Testing Novita connectivity after balance added.'
});

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVib3N0eG12eW9jeXB3cXBnemN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMzk2MjcsImV4cCI6MjA4MDcxNTYyN30.CS0osjHXCqKQJqebwRy3QAviYJEzJFuRe1eUbs6KODI'
    }
};

const req = https.request(url, options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
    });
});

req.on('error', (err) => {
    console.error('Error: ' + err.message);
});

req.write(payload);
req.end();
