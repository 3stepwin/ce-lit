// ========================================
// LOCAL STORAGE HELPERS
// ========================================

import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_DIR = `${FileSystem.documentDirectory}video_cache/`;
const CACHE_INDEX_KEY = '@absurdity_cache_index';

// ========================================
// VIDEO CACHE
// ========================================

interface CacheEntry {
    sketchId: string;
    localPath: string;
    cachedAt: number;
    size: number;
}

// Ensure cache directory exists
const ensureCacheDir = async () => {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    }
};

// Get cache index
const getCacheIndex = async (): Promise<Record<string, CacheEntry>> => {
    try {
        const index = await AsyncStorage.getItem(CACHE_INDEX_KEY);
        return index ? JSON.parse(index) : {};
    } catch {
        return {};
    }
};

// Save cache index
const saveCacheIndex = async (index: Record<string, CacheEntry>) => {
    await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(index));
};

// Download and cache video
export const cacheVideo = async (
    sketchId: string,
    videoUrl: string
): Promise<string | null> => {
    try {
        await ensureCacheDir();

        const fileName = `${sketchId}.mp4`;
        const localPath = `${CACHE_DIR}${fileName}`;

        // Check if already cached
        const existingInfo = await FileSystem.getInfoAsync(localPath);
        if (existingInfo.exists) {
            return localPath;
        }

        // Download video
        const download = await FileSystem.downloadAsync(videoUrl, localPath);

        if (download.status === 200) {
            // Update cache index
            const index = await getCacheIndex();
            const fileInfo = await FileSystem.getInfoAsync(localPath);

            index[sketchId] = {
                sketchId,
                localPath,
                cachedAt: Date.now(),
                size: fileInfo.exists && !fileInfo.isDirectory ? fileInfo.size || 0 : 0,
            };

            await saveCacheIndex(index);
            return localPath;
        }

        return null;
    } catch (error) {
        console.error('Error caching video:', error);
        return null;
    }
};

// Get cached video path
export const getCachedVideo = async (sketchId: string): Promise<string | null> => {
    try {
        const index = await getCacheIndex();
        const entry = index[sketchId];

        if (entry) {
            const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
            if (fileInfo.exists) {
                return entry.localPath;
            }
            // File doesn't exist, remove from index
            delete index[sketchId];
            await saveCacheIndex(index);
        }

        return null;
    } catch {
        return null;
    }
};

// Clear video from cache
export const clearCachedVideo = async (sketchId: string) => {
    try {
        const index = await getCacheIndex();
        const entry = index[sketchId];

        if (entry) {
            await FileSystem.deleteAsync(entry.localPath, { idempotent: true });
            delete index[sketchId];
            await saveCacheIndex(index);
        }
    } catch (error) {
        console.error('Error clearing cached video:', error);
    }
};

// Clear entire cache
export const clearAllCache = async () => {
    try {
        await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
        await AsyncStorage.removeItem(CACHE_INDEX_KEY);
        await ensureCacheDir();
    } catch (error) {
        console.error('Error clearing cache:', error);
    }
};

// Get cache size
export const getCacheSize = async (): Promise<number> => {
    try {
        const index = await getCacheIndex();
        return Object.values(index).reduce((total, entry) => total + entry.size, 0);
    } catch {
        return 0;
    }
};

// ========================================
// ASYNC STORAGE HELPERS
// ========================================

export const saveToStorage = async (key: string, value: any) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to storage:', error);
    }
};

export const getFromStorage = async <T>(key: string): Promise<T | null> => {
    try {
        const value = await AsyncStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch {
        return null;
    }
};

export const removeFromStorage = async (key: string) => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from storage:', error);
    }
};

// ========================================
// STORAGE KEYS
// ========================================

export const STORAGE_KEYS = {
    HAS_ONBOARDED: '@absurdity_has_onboarded',
    LAST_SKETCH_CONFIG: '@absurdity_last_config',
    USER_PREFERENCES: '@absurdity_preferences',
} as const;
