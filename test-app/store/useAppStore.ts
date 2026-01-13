// ========================================
// ZUSTAND GLOBAL STORE
// ========================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
    User,
    UserAvatar,
    Sketch,
    SketchConfig,
    SketchStatus,
    FaceModelStatus,
    AppState
} from '../types';

// ========================================
// INITIAL STATE
// ========================================

const initialState = {
    // Auth
    user: null as User | null,
    isAuthenticated: false,
    isLoading: true,

    // Avatar
    avatars: [] as UserAvatar[],
    selectedAvatarId: null as string | null,
    faceModelStatus: 'pending' as FaceModelStatus,

    // Current sketch creation
    currentConfig: null as SketchConfig | null,
    currentSketchId: null as string | null,
    generationStatus: 'pending' as SketchStatus,
    generationProgress: 0,

    // Gallery
    sketches: [] as Sketch[],
};

// ========================================
// STORE DEFINITION
// ========================================

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            ...initialState,

            // ========================================
            // AUTH ACTIONS
            // ========================================

            setUser: (user) => set({
                user,
                isAuthenticated: !!user,
                isLoading: false,
            }),

            setLoading: (isLoading) => set({ isLoading }),

            // ========================================
            // AVATAR ACTIONS
            // ========================================

            addAvatar: (avatar) => set((state) => ({
                avatars: [...state.avatars, avatar],
            })),

            setSelectedAvatar: (avatarId) => set({ selectedAvatarId: avatarId }),

            setFaceModelStatus: (status) => set({ faceModelStatus: status }),

            // ========================================
            // SKETCH CONFIG ACTIONS
            // ========================================

            setSketchConfig: (config) => set({ currentConfig: config }),

            setCurrentSketch: (sketchId) => set({
                currentSketchId: sketchId,
                generationStatus: 'pending',
                generationProgress: 0,
            }),

            updateGenerationStatus: (status, progress) => set({
                generationStatus: status,
                generationProgress: progress,
            }),

            // ========================================
            // SKETCH GALLERY ACTIONS
            // ========================================

            addSketch: (sketch) => set((state) => ({
                sketches: [sketch, ...state.sketches],
            })),

            updateSketch: (sketchId, updates) => set((state) => ({
                sketches: state.sketches.map((s) =>
                    s.id === sketchId ? { ...s, ...updates } : s
                ),
            })),

            setSketches: (sketches) => set({ sketches }),

            // ========================================
            // RESET
            // ========================================

            reset: () => set(initialState),
        }),
        {
            name: 'absurdity-store',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                // Only persist these fields
                user: state.user,
                avatars: state.avatars,
                selectedAvatarId: state.selectedAvatarId,
                sketches: state.sketches,
            }),
        }
    )
);

// ========================================
// SELECTORS (for performance)
// ========================================

export const useUser = () => useAppStore((state) => state.user);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useAvatars = () => useAppStore((state) => state.avatars);
export const useSelectedAvatarId = () => useAppStore((state) => state.selectedAvatarId);
export const useFaceModelStatus = () => useAppStore((state) => state.faceModelStatus);
export const useCurrentConfig = () => useAppStore((state) => state.currentConfig);
export const useGenerationStatus = () => useAppStore((state) => state.generationStatus);
export const useGenerationProgress = () => useAppStore((state) => state.generationProgress);
export const useSketches = () => useAppStore((state) => state.sketches);

// Get selected avatar object
export const useSelectedAvatar = () => {
    const avatars = useAppStore((state) => state.avatars);
    const selectedId = useAppStore((state) => state.selectedAvatarId);
    return avatars.find((a) => a.id === selectedId) || null;
};

// Get current sketch object
export const useCurrentSketch = () => {
    const sketches = useAppStore((state) => state.sketches);
    const currentId = useAppStore((state) => state.currentSketchId);
    return sketches.find((s) => s.id === currentId) || null;
};
