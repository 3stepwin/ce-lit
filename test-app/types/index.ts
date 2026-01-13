// ========================================
// ABSURDITY AI SKETCH MACHINE - TYPE DEFINITIONS
// ========================================

// ========================================
// USER & AUTH
// ========================================

export interface User {
    id: string;
    email?: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    faceModelId?: string;
    faceModelStatus: FaceModelStatus;
    isGuest: boolean;
    totalSketches: number;
    createdAt: string;
    updatedAt: string;
}

export type FaceModelStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface UserAvatar {
    id: string;
    userId: string;
    storagePath: string;
    publicUrl: string;
    type: 'image' | 'video';
    isPrimary: boolean;
    createdAt: string;
}

// ========================================
// SKETCH TYPES
// ========================================

export type SketchType =
    | 'fake_commercial'
    | 'weekend_update'
    | 'cult_rehearsal'
    | 'weird_role'
    | 'random_stupid'
    | 'celit_viral';

export type SketchRole =
    | 'cult_leader'
    | 'victim'
    | 'spokesperson'
    | 'news_anchor'
    | 'infomercial_host'
    | 'motivational_speaker'
    | 'random'
    | string; // Allow for dynamic celit roles

export type SketchStatus =
    | 'pending'
    | 'generating'
    | 'face_swap'
    | 'rendering'
    | 'complete'
    | 'failed'
    | 'generated';

export interface SketchConfig {
    type: SketchType;
    role: SketchRole;
    dumbnessLevel: number; // 1-10
    customPrompt?: string;
}

export interface Sketch {
    id: string;
    userId: string;

    // Config
    sketchType: SketchType;
    role: SketchRole;
    premise?: string;
    dialogue?: string;
    dumbnessLevel: number;
    content?: any; // CELIT specific content

    // Generation state
    status: SketchStatus;
    generationProgress: number;
    errorMessage?: string;

    // Output
    videoUrl?: string;
    videoDuration?: number;
    thumbnailUrl?: string;

    // Outtakes
    outtakes: Outtake[];

    // Metrics
    shareCount: number;
    saveCount: number;

    // Timestamps
    createdAt: string;
    completedAt?: string;
}

export interface Outtake {
    videoUrl: string;
    thumbnailUrl?: string;
}

// ========================================
// UI TYPES
// ========================================

export interface SketchTypeCard {
    type: SketchType;
    icon: string;
    title: string;
    description: string;
    gradient: string[];
}

export interface RoleChip {
    role: SketchRole;
    label: string;
    emoji: string;
}

export interface LoadingMessage {
    text: string;
    emoji: string;
}

// ========================================
// NAVIGATION TYPES
// ========================================

export interface NavigationParams {
    sketchId?: string;
    avatarId?: string;
}

// ========================================
// API TYPES
// ========================================

export interface GenerateSketchRequest {
    userId: string;
    avatarId: string;
    config: SketchConfig;
}

export interface GenerateSketchResponse {
    success: boolean;
    sketchId: string;
    error?: string;
}

export interface FaceModelRequest {
    userId: string;
    avatarUrls: string[];
}

export interface FaceModelResponse {
    success: boolean;
    faceModelId: string;
    error?: string;
}

// ========================================
// STORE TYPES
// ========================================

export interface AppState {
    // Auth
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Avatar
    avatars: UserAvatar[];
    selectedAvatarId: string | null;
    faceModelStatus: FaceModelStatus;

    // Current sketch creation
    currentConfig: SketchConfig | null;
    currentSketchId: string | null;
    generationStatus: SketchStatus;
    generationProgress: number;

    // Gallery
    sketches: Sketch[];

    // Actions
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    addAvatar: (avatar: UserAvatar) => void;
    setSelectedAvatar: (avatarId: string) => void;
    setFaceModelStatus: (status: FaceModelStatus) => void;
    setSketchConfig: (config: SketchConfig) => void;
    setCurrentSketch: (sketchId: string) => void;
    updateGenerationStatus: (status: SketchStatus, progress: number) => void;
    addSketch: (sketch: Sketch) => void;
    updateSketch: (sketchId: string, updates: Partial<Sketch>) => void;
    setSketches: (sketches: Sketch[]) => void;
    reset: () => void;
}

// ========================================
// CONSTANTS
// ========================================

export const SKETCH_TYPES: SketchTypeCard[] = [
    {
        type: 'fake_commercial',
        icon: '🎬',
        title: 'Fake Commercial',
        description: 'Absurd product ads nobody asked for',
        gradient: ['#FF00FF', '#FF6B6B'],
    },
    {
        type: 'weekend_update',
        icon: '📰',
        title: 'Weekend Update',
        description: 'Breaking news that breaks reality',
        gradient: ['#00FFFF', '#0088FF'],
    },
    {
        type: 'cult_rehearsal',
        icon: '🕯️',
        title: 'Cult Rehearsal',
        description: 'When the ritual goes horribly wrong',
        gradient: ['#8B00FF', '#FF00FF'],
    },
    {
        type: 'weird_role',
        icon: '🎭',
        title: 'Weird Role',
        description: 'Characters you never auditioned for',
        gradient: ['#FFD700', '#FF6B6B'],
    },
    {
        type: 'random_stupid',
        icon: '🎲',
        title: 'Random Stupid',
        description: 'Let chaos decide your fate',
        gradient: ['#00FF88', '#00FFFF'],
    },
];

export const ROLES: RoleChip[] = [
    { role: 'cult_leader', label: 'Cult Leader', emoji: '👑' },
    { role: 'victim', label: 'Confused Victim', emoji: '😰' },
    { role: 'spokesperson', label: 'Spokesperson', emoji: '🎤' },
    { role: 'news_anchor', label: 'News Anchor', emoji: '📺' },
    { role: 'infomercial_host', label: 'Infomercial Host', emoji: '🛒' },
    { role: 'motivational_speaker', label: 'Motivational Speaker', emoji: '🔥' },
    { role: 'random', label: 'Surprise Me', emoji: '🎲' },
];

export const LOADING_MESSAGES: LoadingMessage[] = [
    { text: 'Summoning demons...', emoji: '👹' },
    { text: 'Convincing AI you\'re worthy...', emoji: '🤖' },
    { text: 'Rendering your cult destiny...', emoji: '🕯️' },
    { text: 'Adding lens flares for no reason...', emoji: '✨' },
    { text: 'Consulting the void...', emoji: '🌀' },
    { text: 'Acquiring dramatic lighting...', emoji: '💡' },
    { text: 'Making it dumber...', emoji: '🧠' },
    { text: 'Injecting maximum absurdity...', emoji: '🎪' },
    { text: 'Calibrating chaos levels...', emoji: '⚡' },
    { text: 'Your face is being weaponized...', emoji: '🔫' },
    { text: 'Generating Netflix-tier cringe...', emoji: '🎬' },
    { text: 'Awakening dormant meme energy...', emoji: '🐸' },
];
