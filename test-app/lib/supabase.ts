// ========================================
// SUPABASE CLIENT
// ========================================

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

// Supabase credentials from environment
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client with AsyncStorage for React Native
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Important for React Native
    },
});

// ========================================
// AUTH HELPERS
// ========================================

export const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: 'absurdity://auth/callback',
        },
    });
    return { data, error };
};

export const signInWithApple = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
            redirectTo: 'absurdity://auth/callback',
        },
    });
    return { data, error };
};

export const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
};

export const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    return { data, error };
};

export const signInAsGuest = async () => {
    const { data, error } = await supabase.auth.signInAnonymously();
    return { data, error };
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};

export const getSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
};

export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
};

// ========================================
// STORAGE HELPERS
// ========================================

export const uploadAvatar = async (
    userId: string,
    uri: string,
    fileName: string
): Promise<{ publicUrl: string; storagePath: string } | null> => {
    try {
        // Fetch the file as a blob
        const response = await fetch(uri);
        const blob = await response.blob();

        const storagePath = `${userId}/${fileName}`;

        const { data, error } = await supabase.storage
            .from('user_avatars')
            .upload(storagePath, blob, {
                contentType: blob.type,
                upsert: true,
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('user_avatars')
            .getPublicUrl(storagePath);

        return { publicUrl, storagePath };
    } catch (error) {
        console.error('Error uploading avatar:', error);
        return null;
    }
};

export const getVideoUrl = (storagePath: string): string => {
    const { data: { publicUrl } } = supabase.storage
        .from('sketch_videos')
        .getPublicUrl(storagePath);
    return publicUrl;
};

// ========================================
// DATABASE HELPERS
// ========================================

export const createProfile = async (userId: string, isGuest: boolean = false) => {
    const { data, error } = await supabase
        .from('profiles')
        .insert({
            id: userId,
            is_guest: isGuest,
            face_model_status: 'pending',
        })
        .select()
        .single();
    return { data, error };
};

export const getProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    return { data, error };
};

export const updateProfile = async (userId: string, updates: Record<string, any>) => {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    return { data, error };
};

export const getSketches = async (userId: string) => {
    const { data, error } = await supabase
        .from('sketches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    return { data, error };
};

export const getSketch = async (sketchId: string) => {
    const { data, error } = await supabase
        .from('sketches')
        .select('*')
        .eq('id', sketchId)
        .single();
    return { data, error };
};

export const createSketch = async (sketchData: Record<string, any>) => {
    const { data, error } = await supabase
        .from('sketches')
        .insert(sketchData)
        .select()
        .single();
    return { data, error };
};

export const updateSketch = async (sketchId: string, updates: Record<string, any>) => {
    const { data, error } = await supabase
        .from('sketches')
        .update(updates)
        .eq('id', sketchId)
        .select()
        .single();
    return { data, error };
};

// ========================================
// REALTIME SUBSCRIPTION
// ========================================

export const subscribeToSketchStatus = (
    sketchId: string,
    callback: (payload: any) => void
) => {
    const subscription = supabase
        .channel(`sketch-${sketchId}`)
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'sketches',
                filter: `id=eq.${sketchId}`,
            },
            callback
        )
        .subscribe();

    return subscription;
};

// ========================================
// EDGE FUNCTION CALLS
// ========================================

export const callGenerateSketch = async (
    userId: string,
    avatarId: string,
    config: { type: string; role: string; dumbnessLevel: number }
) => {
    const { data, error } = await supabase.functions.invoke('generate-sketch', {
        body: {
            userId,
            avatarId,
            config,
        },
    });
    return { data, error };
};

export const callCreateFaceModel = async (userId: string, avatarUrls: string[]) => {
    const { data, error } = await supabase.functions.invoke('create-face-model', {
        body: {
            userId,
            avatarUrls,
        },
    });
    return { data, error };
};
