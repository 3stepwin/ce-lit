
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const chalk = require('chalk');

dotenv.config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error(chalk.red('Error: Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env'));
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log(chalk.cyan('========================================='));
console.log(chalk.cyan(`🕵️  DEBUG AGENT: LISTENING ON ${SUPABASE_URL}`));
console.log(chalk.cyan('========================================='));
console.log(chalk.gray('Waiting for realtime events on "sketches" table...\n'));

supabase
    .channel('debug-agent')
    .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sketches' },
        (payload) => {
            const { eventType, new: newRecord, old: oldRecord } = payload;
            const timestamp = new Date().toLocaleTimeString();

            if (eventType === 'INSERT') {
                console.log(chalk.green(`[${timestamp}] ✨ NEW SKETCH STARTED`));
                console.log(chalk.white(`  ID: ${newRecord.id}`));
                console.log(chalk.white(`  Premise: "${newRecord.premise}"`));
                console.log(chalk.white(`  Role: ${newRecord.role}`));
                console.log(chalk.white(`  Cinema Lane: ${newRecord.cinema_lane}`));
            }

            else if (eventType === 'UPDATE') {
                // Detect Status Change
                if (oldRecord.status !== newRecord.status) {
                    const statusColor = newRecord.status === 'failed' ? chalk.red :
                        newRecord.status === 'completed' ? chalk.green : chalk.yellow;

                    console.log(`[${timestamp}] 🔄 STATUS CHANGE: ${chalk.gray(oldRecord.status)} -> ${statusColor(newRecord.status)}`);

                    if (newRecord.status === 'failed') {
                        console.log(chalk.red(`  ❌ ERROR: ${newRecord.error_message}`));
                    }
                    if (newRecord.status === 'completed') {
                        console.log(chalk.green(`  ✅ VIDEO READY: ${newRecord.final_video_url || newRecord.video_url}`));
                    }
                }

                // Detect Provider Info Update
                if (!oldRecord.provider_selected && newRecord.provider_selected) {
                    console.log(chalk.blue(`[${timestamp}] 🤖 PROVIDER SELECTED: ${newRecord.provider_selected}`));
                }

                // Detect Progress Update
                if (oldRecord.generation_progress !== newRecord.generation_progress) {
                    console.log(chalk.blue(`[${timestamp}] ⏳ PROGRESS: ${newRecord.generation_progress}%`));
                }

                // Detect Script Generation
                if (!oldRecord.script_json && newRecord.script_json) {
                    console.log(chalk.magenta(`[${timestamp}] 📝 SCRIPT GENERATED`));
                    console.log(chalk.gray(`  Title: ${newRecord.script_json.title}`));
                }
            }
        }
    )
    .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
            console.log(chalk.green('✅ Connected to Realtime Channel'));
        }
    });

// Keep process alive
process.stdin.resume();
