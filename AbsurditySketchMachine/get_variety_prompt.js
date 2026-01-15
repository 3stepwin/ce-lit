
const SUPABASE_URL = 'https://ebostxmvyocypwqpgzct.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVib3N0eG12eW9jeXB3cXBnemN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMzk2MjcsImV4cCI6MjA4MDcxNTYyN30.CS0osjHXCqKQJqebwRy3QAviYJEzJFuRe1eUbs6KODI';

async function getVarietyPrompt() {
  const url = `${SUPABASE_URL}/rest/v1/prompt_library?source_table=eq.prompt_generators_pg_variety`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch prompt: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

getVarietyPrompt().catch(console.error);
