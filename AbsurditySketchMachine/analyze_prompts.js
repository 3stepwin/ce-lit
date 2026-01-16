// Analyze prompt_library usage
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🎨 PROMPT LIBRARY ANALYSIS\n');
console.log('=' + '='.repeat(70) + '\n');

async function analyzePrompts() {
    // Get all prompts
    const { data: prompts, error } = await supabase
        .from('prompt_library')
        .select('*');

    if (error) {
        console.error('Error fetching prompts:', error);
        return;
    }

    console.log(`📊 Total prompts in library: ${prompts.length}\n`);

    // Analyze by category
    const categories = {};
    const tags = {};
    const styles = {};
    const types = {};

    prompts.forEach(p => {
        // Category
        const cat = p.category || 'uncategorized';
        categories[cat] = (categories[cat] || 0) + 1;

        // Type (image vs video)
        const type = p.type || 'unknown';
        types[type] = (types[type] || 0) + 1;

        // Tags
        if (p.tags && Array.isArray(p.tags)) {
            p.tags.forEach(tag => {
                tags[tag] = (tags[tag] || 0) + 1;
            });
        }

        // Style
        if (p.style) {
            styles[p.style] = (styles[p.style] || 0) + 1;
        }
    });

    console.log('📋 BREAKDOWN BY CATEGORY:\n');
    Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, count]) => {
            const pct = ((count / prompts.length) * 100).toFixed(1);
            console.log(`  ${cat.padEnd(25)} ${count.toString().padStart(4)} (${pct}%)`);
        });

    console.log('\n\n🎬 BREAKDOWN BY TYPE (image vs video):\n');
    Object.entries(types)
        .sort((a, b) => b[1] - a[1])
        .forEach(([type, count]) => {
            const pct = ((count / prompts.length) * 100).toFixed(1);
            console.log(`  ${type.padEnd(25)} ${count.toString().padStart(4)} (${pct}%)`);
        });

    if (Object.keys(styles).length > 0) {
        console.log('\n\n🎨 BREAKDOWN BY STYLE:\n');
        Object.entries(styles)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15) // Top 15
            .forEach(([style, count]) => {
                const pct = ((count / prompts.length) * 100).toFixed(1);
                console.log(`  ${style.padEnd(30)} ${count.toString().padStart(4)} (${pct}%)`);
            });
    }

    if (Object.keys(tags).length > 0) {
        console.log('\n\n🏷️  TOP TAGS:\n');
        Object.entries(tags)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .forEach(([tag, count]) => {
                const pct = ((count / prompts.length) * 100).toFixed(1);
                console.log(`  ${tag.padEnd(30)} ${count.toString().padStart(4)} (${pct}%)`);
            });
    }

    // Check for usage tracking
    console.log('\n\n=' + '='.repeat(70));
    console.log('\n🔍 USAGE ANALYSIS\n');

    const withUsageCount = prompts.filter(p => p.usage_count != null && p.usage_count > 0);
    const neverUsed = prompts.filter(p => !p.usage_count || p.usage_count === 0);

    console.log(`✅ Prompts with usage_count > 0: ${withUsageCount.length}`);
    console.log(`⚠️  Prompts with usage_count = 0 or null: ${neverUsed.length}`);

    if (withUsageCount.length > 0) {
        console.log('\n📈 MOST USED PROMPTS:\n');
        withUsageCount
            .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
            .slice(0, 10)
            .forEach(p => {
                console.log(`  [${p.usage_count}x] ${p.category || 'uncategorized'} - ${p.prompt?.substring(0, 60)}...`);
            });
    }

    // Check for last_used timestamps
    const withLastUsed = prompts.filter(p => p.last_used != null);
    console.log(`\n🕒 Prompts with last_used timestamp: ${withLastUsed.length}`);

    // Sample some prompts
    console.log('\n\n📝 SAMPLE PROMPTS:\n');

    const sampleCategories = [...new Set(prompts.map(p => p.category))].slice(0, 5);

    for (const cat of sampleCategories) {
        const sample = prompts.find(p => p.category === cat);
        if (sample) {
            console.log(`\n[${cat}] ${sample.type || 'unknown type'}`);
            console.log(`  "${sample.prompt?.substring(0, 100)}..."`);
            if (sample.usage_count) {
                console.log(`  Used: ${sample.usage_count} times`);
            }
        }
    }

    // Check for prompt packets
    console.log('\n\n=' + '='.repeat(70));
    console.log('\n🎁 PROMPT PACKET ANALYSIS\n');

    const { data: imagePackets } = await supabase
        .from('image_prompt_packets')
        .select('*');

    const { data: videoPackets } = await supabase
        .from('video_prompt_packets')
        .select('*');

    console.log(`Image prompt packets: ${imagePackets?.length || 0}`);
    console.log(`Video prompt packets: ${videoPackets?.length || 0}`);

    if (imagePackets && imagePackets.length > 0) {
        console.log('\n📸 Sample image packet:');
        console.log(JSON.stringify(imagePackets[0], null, 2));
    }

    if (videoPackets && videoPackets.length > 0) {
        console.log('\n🎬 Sample video packet:');
        console.log(JSON.stringify(videoPackets[0], null, 2));
    }

    // Final verdict
    console.log('\n\n=' + '='.repeat(70));
    console.log('\n🎯 VERDICT\n');

    if (neverUsed.length > prompts.length * 0.5) {
        console.log(`⚠️  WARNING: ${neverUsed.length} prompts (${((neverUsed.length / prompts.length) * 100).toFixed(1)}%) have never been used!`);
        console.log('   Consider removing unused prompts or implementing usage tracking.');
    } else if (neverUsed.length > 0) {
        console.log(`✅ Most prompts are being used, but ${neverUsed.length} are unused.`);
        console.log('   This could be normal for a diverse library.');
    } else {
        console.log('✅ All prompts show usage! Great job utilizing the full library.');
    }

    console.log('\n');
}

analyzePrompts().catch(console.error);
