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
    | 'onboarding'
    | 'compliance'
    | 'customer_support'
    | 'breaking_news'
    | 'apology'
    | 'system_update'
    | 'fake_commercial'
    | 'celit_viral';

export type SketchRole =
    | 'authority'
    | 'spokesperson'
    | 'recipient'
    | 'evidence'
    | 'compliance_officer'
    | 'news_anchor'
    | 'random'
    | string;

export type SketchStatus =
    | 'pending'
    | 'generating'
    | 'face_swap'
    | 'rendering'
    | 'complete'
    | 'failed'
    | 'generated';

export type RealityVector = 'WORK_VECTOR' | 'LIFE_VECTOR' | 'FEED_VECTOR';

export interface SketchConfig {
    type: SketchType;
    role: SketchRole;
    dumbnessLevel: number; // 1-10
    customPrompt?: string;
    scene?: any;
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

    // Flow State (CE LIT NEW FLOW)
    faceCaptureEnabled: boolean;
    realityVectors: RealityVector[];
    userPremise: string | null;

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

    // Flow Actions
    setFaceCaptureEnabled: (enabled: boolean) => void;
    toggleRealityVector: (vector: RealityVector) => void;
    setRealityVectors: (vectors: RealityVector[]) => void;
    setUserPremise: (premise: string | null) => void;

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
        type: 'onboarding',
        icon: '📋',
        title: 'Onboarding',
        description: 'Mandatory orientation into the unknown',
        gradient: ['#1A1A1A', '#333333'],
    },
    {
        type: 'compliance',
        icon: '⚖️',
        title: 'Compliance',
        description: 'Verifying your adherence to standard reality',
        gradient: ['#1A1A1A', '#333333'],
    },
    {
        type: 'customer_support',
        icon: '🎧',
        title: 'Support',
        description: 'A polite confirmation of your status',
        gradient: ['#1A1A1A', '#333333'],
    },
    {
        type: 'breaking_news',
        icon: '📺',
        title: 'Alert',
        description: 'Urgent updates from the administration',
        gradient: ['#1A1A1A', '#333333'],
    },
    {
        type: 'apology',
        icon: '✉️',
        title: 'Statement',
        description: 'Official regrets for upcoming incidents',
        gradient: ['#1A1A1A', '#333333'],
    },
];

export const ROLES: RoleChip[] = [
    { role: 'authority', label: 'Authority', emoji: '🏢' },
    { role: 'spokesperson', label: 'Spokesperson', emoji: '🎤' },
    { role: 'recipient', label: 'Recipient', emoji: '👤' },
    { role: 'evidence', label: 'Evidence', emoji: '📂' },
    { role: 'compliance_officer', label: 'Officer', emoji: '🛡️' },
    { role: 'news_anchor', label: 'Anchor', emoji: '📺' },
    { role: 'random', label: 'System Pick', emoji: '🎲' },
];

export const LOADING_MESSAGES: LoadingMessage[] = [
    { text: 'Establishing credibility...', emoji: '🏢' },
    { text: 'Verifying identity clearance...', emoji: '🔐' },
    { text: 'Processing institutional artifacts...', emoji: '📂' },
    { text: 'Calibrating procedural reality...', emoji: '⚖️' },
    { text: 'Generating evidence of participation...', emoji: '📹' },
    { text: 'Extracting verdict receipt...', emoji: '🧾' },
    { text: 'Reviewing compliance standards...', emoji: '📋' },
    { text: 'Scheduling necessary discomfort...', emoji: '🌩️' },
    { text: 'Finalizing the implication...', emoji: '📌' },
    { text: 'Hard cutting to resolution...', emoji: '✂️' },
];
