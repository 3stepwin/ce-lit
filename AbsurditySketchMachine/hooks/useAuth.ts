// ========================================
// AUTH HOOK
// ========================================

import { useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAppStore } from '../store/useAppStore';
import {
    supabase,
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    signInAsGuest,
    signOut as supabaseSignOut,
    getSession,
    createProfile,
    getProfile,
} from '../lib/supabase';
import type { User, FaceModelStatus } from '../types';

export function useAuth() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, setUser, setLoading, reset } = useAppStore();

    // ========================================
    // INITIALIZE AUTH STATE
    // ========================================

    useEffect(() => {
        // Check initial session
        const initializeAuth = async () => {
            try {
                const { data } = await getSession();

                if (data?.session?.user) {
                    await loadUserProfile(data.session.user.id);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                setUser(null);
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event);

                if (event === 'SIGNED_IN' && session?.user) {
                    await loadUserProfile(session.user.id);
                } else if (event === 'SIGNED_OUT') {
                    reset();
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // ========================================
    // LOAD USER PROFILE
    // ========================================

    const loadUserProfile = async (userId: string) => {
        try {
            let { data: profile, error } = await getProfile(userId);

            // Create profile if it doesn't exist
            if (error && error.code === 'PGRST116') {
                const { data: newProfile } = await createProfile(userId, false);
                profile = newProfile;
            }

            if (profile) {
                const appUser: User = {
                    id: profile.id,
                    email: profile.email,
                    username: profile.username,
                    displayName: profile.display_name,
                    avatarUrl: profile.avatar_url,
                    faceModelId: profile.face_model_id,
                    faceModelStatus: profile.face_model_status as FaceModelStatus,
                    isGuest: profile.is_guest,
                    totalSketches: profile.total_sketches,
                    createdAt: profile.created_at,
                    updatedAt: profile.updated_at,
                };
                setUser(appUser);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            setUser(null);
        }
    };

    // ========================================
    // AUTH METHODS
    // ========================================

    const signInGoogle = useCallback(async () => {
        setLoading(true);
        try {
            const { error } = await signInWithGoogle();
            if (error) throw error;
        } catch (error) {
            console.error('Google sign in error:', error);
            setLoading(false);
            throw error;
        }
    }, []);

    const signInApple = useCallback(async () => {
        setLoading(true);
        try {
            const { error } = await signInWithApple();
            if (error) throw error;
        } catch (error) {
            console.error('Apple sign in error:', error);
            setLoading(false);
            throw error;
        }
    }, []);

    const signInEmail = useCallback(async (email: string, password: string) => {
        setLoading(true);
        try {
            const { error } = await signInWithEmail(email, password);
            if (error) throw error;
        } catch (error) {
            console.error('Email sign in error:', error);
            setLoading(false);
            throw error;
        }
    }, []);

    const signUpEmail = useCallback(async (email: string, password: string) => {
        setLoading(true);
        try {
            const { data, error } = await signUpWithEmail(email, password);
            if (error) throw error;

            // Create profile for new user
            if (data?.user) {
                await createProfile(data.user.id, false);
            }
        } catch (error) {
            console.error('Email sign up error:', error);
            setLoading(false);
            throw error;
        }
    }, []);

    const signInGuest = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await signInAsGuest();
            if (error) throw error;

            // Create guest profile
            if (data?.user) {
                await createProfile(data.user.id, true);
                await loadUserProfile(data.user.id);
            }
        } catch (error) {
            console.error('Guest sign in error:', error);
            setLoading(false);
            throw error;
        }
    }, []);

    const signOut = useCallback(async () => {
        try {
            await supabaseSignOut();
            reset();
            router.replace('/');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    }, [router]);

    return {
        user,
        isAuthenticated,
        isLoading,
        signInGoogle,
        signInApple,
        signInEmail,
        signUpEmail,
        signInGuest,
        signOut,
    };
}
