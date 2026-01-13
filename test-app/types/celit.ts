// ========================================
// CELIT VIRAL SYSTEM - TYPE DEFINITIONS
// ========================================
// LOCKED v1.0 - Non-negotiable constraints for viral generation
// The viewer must believe it's going one way before it violently goes another

// ========================================
// CELIT CORE ROLES (Psychological Positions)
// ========================================
// Roles are NOT characters - they are social power positions
// Each biases dialogue, camera language, and "who knows the truth"

export type CelitRole =
    | 'high_priest'      // Authority / Hypocrisy
    | 'innocent_victim'  // Consent / Exploitation
    | 'news_anchor'      // Normalization / Propaganda
    | 'hr_representative' // Bureaucracy / Compliance
    | 'customer_support'; // Corporate gaslighting

export interface CelitRoleConfig {
    role: CelitRole;
    label: string;
    emoji: string;
    image: any;
    description: string;
    powerDynamic: string;
    dialogueBias: string;
    cameraBias: string;
}

export const CELIT_ROLES: CelitRoleConfig[] = [
    {
        role: 'high_priest',
        label: 'THE HIGH PRIEST',
        emoji: '👑',
        image: require('../assets/images/mascots/mascot_seer.png'),
        description: 'You command the ritual',
        powerDynamic: 'Authority / Hypocrisy',
        dialogueBias: 'Proclamations, demands, sacred language',
        cameraBias: 'Low angle, reverent lighting, altar framing',
    },
    {
        role: 'innocent_victim',
        label: 'THE INNOCENT VICTIM',
        emoji: '😰',
        image: require('../assets/images/mascots/mascot_oracle.png'),
        description: 'You signed something',
        powerDynamic: 'Consent / Exploitation',
        dialogueBias: 'Confusion, questions they should have asked',
        cameraBias: 'Documentary close-ups, found footage feel',
    },
    {
        role: 'news_anchor',
        label: 'THE NEWS ANCHOR',
        emoji: '📺',
        image: require('../assets/images/mascots/mascot_drone.png'),
        description: 'You report the madness',
        powerDynamic: 'Normalization / Propaganda',
        dialogueBias: 'Calm delivery of insane facts',
        cameraBias: 'News desk framing, lower thirds, B-roll cuts',
    },
    {
        role: 'hr_representative',
        label: 'THE HR REP',
        emoji: '📋',
        image: require('../assets/images/mascots/mascot_enforcer.png'),
        description: 'You enforce the policy',
        powerDynamic: 'Bureaucracy / Compliance',
        dialogueBias: 'Corporate speak, policy citations',
        cameraBias: 'Fluorescent office lighting, meeting room',
    },
    {
        role: 'customer_support',
        label: 'THE SUPPORT AGENT',
        emoji: '🎧',
        image: require('../assets/images/mascots/mascot_chaos.png'),
        description: 'You gaslight professionally',
        powerDynamic: 'Corporate Gaslighting',
        dialogueBias: 'Apologetic but unhelpful, scripted kindness',
        cameraBias: 'Call center cubicle, headset, screens',
    },
];

// ========================================
// PATTERN INTERRUPT ENGINE
// ========================================
// Every sketch randomly selects ONE of these methods
// More than one interrupt = dilution = FAIL

export type PatternInterruptType =
    | 'dialogue_betrayal'  // Serious line → calm absurd truth
    | 'visual_betrayal'    // Epic imagery → reveals nonsense
    | 'genre_flip'         // Trailer changes genre, not tone
    | 'subtitle_betrayal'; // Audio says one thing, text says truth

export type AestheticPreset =
    | 'prestige_clean'      // A24 / Netflix
    | 'corporate_dystopia'  // Severance / Fluorescent
    | 'analog_rot'          // VHS / Found Footage
    | 'liminal_dream';      // Hallways / Soft Haze

export interface CelitAestheticConfig {
    preset: AestheticPreset;
    cameraGrammar: string;
    gradeTokens: string[];
    subtitleStyle: string;
}

export const AEST_PRESETS: Record<AestheticPreset, CelitAestheticConfig> = {
    prestige_clean: {
        preset: 'prestige_clean',
        cameraGrammar: 'Slow dollies, symmetry, shallow DOF',
        gradeTokens: ['Clean', 'High contrast', 'Natural', 'Premium'],
        subtitleStyle: 'Minimalist white sans-serif, lower center',
    },
    corporate_dystopia: {
        preset: 'corporate_dystopia',
        cameraGrammar: 'Static, wide angles, fluorescent hum',
        gradeTokens: ['Beige', 'Flat', 'Institutional', 'Depressing'],
        subtitleStyle: 'System font, blocky, yellowish',
    },
    analog_rot: {
        preset: 'analog_rot',
        cameraGrammar: 'Handheld, zooming, timestamp metadata',
        gradeTokens: ['VHS', 'Tracking errors', 'Warble', 'Dated'],
        subtitleStyle: 'Retro video text, glowing edges',
    },
    liminal_dream: {
        preset: 'liminal_dream',
        cameraGrammar: 'Floating, hallways, no people',
        gradeTokens: ['Soft haze', 'Overexposed', 'Ethereal', 'Uncanny'],
        subtitleStyle: 'Soft italics, low opacity',
    }
};

export interface PatternInterrupt {
    type: PatternInterruptType;
    label: string;
    description: string;
    example: string;
}

export const PATTERN_INTERRUPTS: PatternInterrupt[] = [
    {
        type: 'dialogue_betrayal',
        label: 'Dialogue Betrayal',
        description: 'Serious line → calm absurd truth',
        example: '"Participation is voluntary." *beat* "Attendance is mandatory."',
    },
    {
        type: 'visual_betrayal',
        label: 'Visual Betrayal',
        description: 'Epic imagery → reveals clipboard, contract, KPI',
        example: 'Prestige framing reveals mundane bureaucracy',
    },
    {
        type: 'genre_flip',
        label: 'Genre Flip',
        description: 'Trailer changes genre (not tone)',
        example: 'Horror → onboarding video, Documentary → ad read',
    },
    {
        type: 'subtitle_betrayal',
        label: 'Subtitle Betrayal',
        description: 'Audio says one thing, text shows truth',
        example: 'Screenshot fuel - the text reveals what\'s really happening',
    },
];

// ========================================
// TRAILER GRAMMAR (Exact Pacing)
// ========================================

export interface TrailerBeat {
    startSec: number;
    endSec: number;
    phase: 'trust' | 'tension' | 'interrupt' | 'normalization' | 'reframe';
    description: string;
    rules: string[];
}

export const TRAILER_GRAMMAR: TrailerBeat[] = [
    {
        startSec: 0,
        endSec: 3,
        phase: 'trust',
        description: 'Build Trust',
        rules: [
            'Cinematic shot',
            'Serious VO cadence',
            'Familiar genre cues',
            'Viewer must NOT know it\'s a joke',
        ],
    },
    {
        startSec: 4,
        endSec: 7,
        phase: 'tension',
        description: 'Build Tension',
        rules: [
            'Stakes implied',
            'Music builds',
            'Viewer prediction locks in',
        ],
    },
    {
        startSec: 8,
        endSec: 12,
        phase: 'interrupt',
        description: 'PATTERN INTERRUPT',
        rules: [
            'Silence (0.3-0.5s)',
            'Pattern violation',
            'Reality cracks',
            'ONE clean violation only',
        ],
    },
    {
        startSec: 13,
        endSec: 40,
        phase: 'normalization',
        description: 'Deadpan Normalization',
        rules: [
            'Absurdity treated as policy',
            'No one reacts',
            'No one laughs',
            'No one explains',
            'Systems > people',
            'Language is bureaucratic',
        ],
    },
    {
        startSec: 41,
        endSec: 45,
        phase: 'reframe',
        description: 'End Reframe',
        rules: [
            'Line or visual redefines opening',
            'Creates rewatch loop',
            'Viewer implication happens here',
        ],
    },
];

// ========================================
// SHARE COMPULSION MECHANICS (Mandatory)
// ========================================

export interface ScreenshotMoment {
    text: string;
    style: 'warning' | 'compliance' | 'legal' | 'notification';
}

export const SCREENSHOT_MOMENTS: ScreenshotMoment[] = [
    { text: 'YOU ALREADY AGREED.', style: 'warning' },
    { text: 'RETURNS NOT GUARANTEED.', style: 'legal' },
    { text: 'COMPLIANCE IS OPTIONAL.', style: 'compliance' },
    { text: 'THIS IS ALREADY PUBLIC.', style: 'notification' },
    { text: 'YOU\'RE NOT THE FIRST.', style: 'warning' },
    { text: 'PEOPLE HAVE SEEN THIS.', style: 'notification' },
    { text: 'TERMS HAVE CHANGED.', style: 'legal' },
    { text: 'CONSENT WAS IMPLIED.', style: 'compliance' },
    { text: 'PARTICIPATION IS DOCUMENTED.', style: 'warning' },
    { text: 'YOUR SILENCE IS CONSENT.', style: 'legal' },
];

// Social permission lines - removes fear of sharing
export const SOCIAL_PERMISSION_LINES = [
    'This is already public.',
    'You\'re not the first.',
    'People have seen this.',
    'It\'s been documented.',
    'The record reflects this.',
];

// Comment bait lines (soft - no questions, no CTAs)
export const COMMENT_BAIT_LINES = [
    'This feels too real.',
    'Why is this accurate?',
    'This is literally how systems work.',
    'I\'ve been to this meeting.',
    'Wait, this happened to me.',
];

// ========================================
// VIRAL SHARE COPY (Auto-filled suggestions)
// ========================================

export const VIRAL_SHARE_COPY = [
    'This feels illegal.',
    'Why is this accurate?',
    'Watch it twice.',
    'I need to talk about this.',
    'This shouldn\'t exist.',
    'Who approved this?',
];

// ========================================
// CELIT GENERATION CONFIG
// ========================================

export interface CelitGenerationRequest {
    role: CelitRole;
    faceImageUrl?: string;
    userId?: string;
}

export interface CelitGenerationResponse {
    success: boolean;
    sketchId: string;
    content: CelitContent;
    error?: string;
}

export interface CelitContent {
    // Core content
    title: string;
    runtime_target_sec: number;
    hook_line: string;
    topper_line: string;

    // Pattern Interrupt
    pattern_interrupt: {
        type: PatternInterruptType;
        timestamp_sec: number;
        execution: string;
    };

    // Retention Plan
    retention_plan: Array<{
        t: number;
        event: string;
    }>;

    // Scenes
    scenes: CelitScene[];

    // Viral Mechanics
    screenshot_frame_text: string;
    deleted_line: string;
    caption_pack: string[];
    outtakes: Array<{
        hook: string;
    }>;

    // Generation Prompting
    veo3_prompt: string;
    thumbnail_prompt: string;
    audio_design: {
        hits: string[];
        risers: string[];
        silence_sec: number;
    };

    // Meta auto-chosen by engine
    aesthetic_preset: AestheticPreset;
}

export interface CelitScene {
    scene_name: string;
    phase: 'trust' | 'tension' | 'interrupt' | 'normalization' | 'reframe';
    duration_sec: number;
    location: string;
    script: CelitScriptLine[];
    camera_direction: string;
}

export interface CelitScriptLine {
    type: 'VISUAL' | 'CAMERA' | 'DIALOGUE' | 'ONSCREEN_TEXT' | 'SFX' | 'MUSIC';
    text: string;
    character?: 'MAIN_PERFORMER' | 'OTHER' | 'VO';
    timestamp_sec?: number;
    subtitle_betrayal?: string; // If different from spoken
}

// ========================================
// UI STATE
// ========================================

export interface CelitAppState {
    selectedRole: CelitRole | null;
    faceImageUri: string | null;
    isGenerating: boolean;
    generationProgress: number;
    currentSketchId: string | null;
}

// ========================================
// RESULT SCREEN STATE
// ========================================

export interface CelitResultState {
    isLooping: boolean;
    hasWatchedOnce: boolean;
    shareCopySuggestion: string;
}

// ========================================
// NON-NEGOTIABLES (PRINT THESE)
// ========================================
// 1. Premium before funny
// 2. Familiar → violated
// 3. One interrupt only
// 4. Deadpan always
// 5. Viewer implicated
// 6. End with reframe
// 7. No CTA
// 8. Loop-friendly endings
