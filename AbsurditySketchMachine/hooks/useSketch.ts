// ========================================
// SKETCH GENERATION HOOK
// ========================================

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store/useAppStore';
import {
    callGenerateSketch,
    subscribeToSketchStatus,
    getSketches,
    getSketch,
    callGetSeed,
} from '../lib/supabase';
import { cacheVideo } from '../lib/storage';
import type { SketchConfig, Sketch, SketchStatus } from '../types';

export function useSketch() {
    const router = useRouter();
    const subscriptionRef = useRef<any>(null);

    const {
        user,
        currentConfig,
        currentSketchId,
        generationStatus,
        generationProgress,
        sketches,
        selectedAvatarId,
        setSketchConfig,
        setCurrentSketch,
        updateGenerationStatus,
        addSketch,
        updateSketch,
        setSketches,
    } = useAppStore();

    // ========================================
    // LOAD USER'S SKETCHES
    // ========================================

    const loadSketches = useCallback(async () => {
        if (!user?.id) return;

        try {
            const { data, error } = await getSketches(user.id);
            if (error) throw error;

            if (data) {
                const formattedSketches: Sketch[] = data.map((s: any) => ({
                    id: s.id,
                    userId: s.user_id,
                    sketchType: s.sketch_type,
                    role: s.role,
                    premise: s.premise,
                    dialogue: s.dialogue,
                    dumbnessLevel: s.dumbness_level,
                    status: s.status,
                    generationProgress: s.generation_progress,
                    errorMessage: s.error_message,
                    videoUrl: s.video_url,
                    videoDuration: s.video_duration,
                    thumbnailUrl: s.thumbnail_url,
                    outtakes: s.outtakes || [],
                    shareCount: s.share_count,
                    saveCount: s.save_count,
                    createdAt: s.created_at,
                    completedAt: s.completed_at,
                }));
                setSketches(formattedSketches);
            }
        } catch (error) {
            console.error('Error loading sketches:', error);
        }
    }, [user?.id, setSketches]);

    // ========================================
    // GET RANDOM SEED
    // ========================================

    const getSeed = useCallback(async (category?: string) => {
        try {
            const { data, error } = await callGetSeed(category);
            if (error) throw error;
            return data?.seed;
        } catch (error) {
            console.error('Error getting seed:', error);
            return null;
        }
    }, []);

    // ========================================
    // GENERATE SKETCH
    // ========================================

    const generateSketch = useCallback(async (config: SketchConfig) => {
        if (!user?.id || !selectedAvatarId) {
            console.error('Missing user or avatar');
            return null;
        }

        try {
            // Haptic feedback
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

            // Set config in store
            setSketchConfig(config);

            // Call edge function
            const { data, error } = await callGenerateSketch(
                user.id,
                selectedAvatarId,
                {
                    type: config.type,
                    role: config.role,
                    dumbnessLevel: config.dumbnessLevel,
                    premise: config.customPrompt,
                    scene: config.scene,
                }
            );

            if (error) throw error;

            if (data?.job_id) {
                const sketchId = data.job_id;
                setCurrentSketch(sketchId);

                // Navigate to generation screen
                router.push('/(main)/generating');

                // Subscribe to updates
                subscribeToUpdates(sketchId);

                return sketchId;
            }

            return null;
        } catch (error) {
            console.error('Error generating sketch:', error);
            updateGenerationStatus('failed', 0);
            return null;
        }
    }, [user?.id, selectedAvatarId, router, setSketchConfig, setCurrentSketch, updateGenerationStatus]);

    // ========================================
    // SUBSCRIBE TO GENERATION UPDATES
    // ========================================

    const subscribeToUpdates = useCallback((sketchId: string) => {
        // Cleanup previous subscription
        if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe();
        }

        subscriptionRef.current = subscribeToSketchStatus(sketchId, async (payload) => {
            const updated = payload.new;

            // Update status in store
            updateGenerationStatus(
                updated.status as SketchStatus,
                updated.generation_progress || 0
            );

            // Handle completion
            if (updated.status === 'complete') {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                // Fetch full sketch data
                const { data } = await getSketch(sketchId);
                if (data) {
                    const sketch: Sketch = {
                        id: data.id,
                        userId: data.user_id,
                        sketchType: data.sketch_type,
                        role: data.role,
                        premise: data.premise,
                        dialogue: data.dialogue,
                        dumbnessLevel: data.dumbness_level,
                        status: data.status,
                        generationProgress: data.generation_progress,
                        videoUrl: data.video_url,
                        videoDuration: data.video_duration,
                        thumbnailUrl: data.thumbnail_url,
                        outtakes: data.outtakes || [],
                        content: data.content,
                        shareCount: data.share_count,
                        saveCount: data.save_count,
                        createdAt: data.created_at,
                        completedAt: data.completed_at,
                    };

                    addSketch(sketch);

                    // Cache video locally
                    if (sketch.videoUrl) {
                        cacheVideo(sketch.id, sketch.videoUrl);
                    }

                    // Navigate to viral result
                    router.replace(`/(main)/viral-result?sketchId=${sketch.id}`);
                }

                // Cleanup subscription
                subscriptionRef.current?.unsubscribe();
            }

            // Handle failure
            if (updated.status === 'failed') {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                subscriptionRef.current?.unsubscribe();
            }
        });
    }, [updateGenerationStatus, addSketch, router]);

    // ========================================
    // CLEANUP
    // ========================================

    useEffect(() => {
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
            }
        };
    }, []);

    // ========================================
    // GET SKETCH BY ID
    // ========================================

    const getSketchById = useCallback((sketchId: string): Sketch | undefined => {
        return sketches.find((s: Sketch) => s.id === sketchId);
    }, [sketches]);

    return {
        currentConfig,
        currentSketchId,
        generationStatus,
        generationProgress,
        sketches,
        loadSketches,
        generateSketch,
        getSketchById,
        setSketchConfig,
        getSeed,
    };
}
