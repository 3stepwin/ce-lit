// Clear AsyncStorage and Expo Cache
const AsyncStorage = require('@react-native-async-storage/async-storage').default;
const fs = require('fs');
const path = require('path');

async function clearAll() {
    console.log("🧹 CLEARING ALL CACHES...");

    // 1. Clear .expo directory
    const expoDir = path.join(__dirname, '.expo');
    if (fs.existsSync(expoDir)) {
        fs.rmSync(expoDir, { recursive: true, force: true });
        console.log("✅ Cleared .expo directory");
    }

    // 2. Clear node_modules/.cache
    const cacheDir = path.join(__dirname, 'node_modules', '.cache');
    if (fs.existsSync(cacheDir)) {
        fs.rmSync(cacheDir, { recursive: true, force: true });
        console.log("✅ Cleared node_modules/.cache");
    }

    console.log("\n✅ ALL CACHES CLEARED");
    console.log("📋 Next steps:");
    console.log("   1. Restart your Expo app");
    console.log("   2. The app will clear persisted state on first load");
}

clearAll().catch(console.error);
