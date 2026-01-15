const SUPABASE_URL = 'https://ebostxmvyocypwqpgzct.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVib3N0eG12eW9jeXB3cXBnemN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMzk2MjcsImV4cCI6MjA4MDcxNTYyN30.CS0osjHXCqKQJqebwRy3QAviYJEzJFuRe1eUbs6KODI';

async function explorePromptLibrary() {
    console.log('🔍 PROMPT LIBRARY EXPLORATION\n');
    console.log('═'.repeat(80));
    
    // Get categories
    const categoriesUrl = `${SUPABASE_URL}/rest/v1/prompt_library?select=category&limit=1000`;
    const categoriesRes = await fetch(categoriesUrl, {
        headers: {
            'apikey': ANON_KEY,
            'Authorization': `Bearer ${ANON_KEY}`
        }
    });
    
    const allRecords = await categoriesRes.json();
    const categories = [...new Set(allRecords.map(r => r.category))];
    
    console.log(`\n📂 CATEGORIES FOUND: ${categories.length}\n`);
    categories.forEach(cat => console.log(`   - ${cat}`));
    
    // Get source tables
    const sourceTables = [...new Set(allRecords.map(r => r.source_table))];
    console.log(`\n📊 SOURCE TABLES: ${sourceTables.length}\n`);
    sourceTables.forEach(table => console.log(`   - ${table}`));
    
    // Sample from each category
    console.log('\n\n📝 SAMPLE PROMPTS BY CATEGORY:\n');
    console.log('═'.repeat(80));
    
    for (const category of categories.slice(0, 10)) { // First 10 categories
        const sampleUrl = `${SUPABASE_URL}/rest/v1/prompt_library?category=eq.${encodeURIComponent(category)}&limit=3`;
        const sampleRes = await fetch(sampleUrl, {
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`
            }
        });
        
        const samples = await sampleRes.json();
        
        console.log(`\n📁 ${category.toUpperCase()} (${samples.length} samples)`);
        samples.forEach((sample, i) => {
            console.log(`\n   ${i + 1}. ${sample.content.substring(0, 150)}...`);
            console.log(`      Source: ${sample.source_table}`);
        });
    }
    
    // Count by category
    console.log('\n\n📊 RECORDS BY CATEGORY:\n');
    console.log('═'.repeat(80));
    
    const categoryCounts = {};
    allRecords.forEach(r => {
        categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    });
    
    Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, count]) => {
            console.log(`   ${cat.padEnd(30)} ${count} prompts`);
        });
}

explorePromptLibrary().catch(console.error);
