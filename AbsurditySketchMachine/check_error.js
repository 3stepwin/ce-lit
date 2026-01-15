
const SUPABASE_URL = 'https://ebostxmvyocypwqpgzct.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVib3N0eG12eW9jeXB3cXBnemN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMzk2MjcsImV4cCI6MjA4MDcxNTYyN30.CS0osjHXCqKQJqebwRy3QAviYJEzJFuRe1eUbs6KODI';

async function checkLastError() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/sketches?select=id,status,error_message&order=created_at.desc&limit=1`, {
            headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` }
        });
        const data = await res.json();
        console.log("--- LAST ERROR CHECK ---");
        console.log(data);
    } catch (e) {
        console.error(e);
    }
}
checkLastError();
