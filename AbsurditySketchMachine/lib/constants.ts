// ========================================
// APP CONSTANTS
// ========================================

// Colors - Absurd Premium Dark Theme
export const COLORS = {
    background: '#0A0A0F',
    surface: '#16161F',
    surfaceHover: '#1E1E2A',

    primary: '#FF00FF',
    primaryGlow: 'rgba(255,0,255,0.3)',
    accent: '#00FFFF',
    accentGlow: 'rgba(0,255,255,0.3)',

    success: '#00FF88',
    warning: '#FFD700',
    error: '#FF3366',

    text: '#FFFFFF',
    textMuted: '#888899',
    textSubtle: '#555566',

    // Cult Engine Reality Specs
    bone: '#E2DAC4',
    boneDark: '#AFA895',
    void: '#09090B',
    graphite: '#1C1C1E',
    institutional: '#93C893',
    tape: '#FFD700',
} as const;

// Gradients
export const GRADIENTS = {
    rainbow: ['#FF00FF', '#00FFFF', '#FF00FF'],
    neonPink: ['#FF00FF', '#FF6B6B'],
    neonCyan: ['#00FFFF', '#0088FF'],
    neonPurple: ['#8B00FF', '#FF00FF'],
    gold: ['#FFD700', '#FF6B6B'],
    greenCyan: ['#00FF88', '#00FFFF'],
} as const;

// Share captions for virality
export const SHARE_CAPTIONS = [
    'WTF is this?! 😂 #AbsurdityAI',
    'I just made myself a cult leader lmao #AbsurdityAI',
    'This AI made me star in this mess 💀 #AbsurdityAI',
    'Why did I make this 😭 #AbsurdityAI',
    'The AI said it\'s my turn to go viral #AbsurdityAI',
    'POV: You let an AI ruin your reputation #AbsurdityAI',
    'Netflix should hire me after this #AbsurdityAI',
    'This is what happens when demons have wifi #AbsurdityAI',
];

// Hashtags for sharing
export const SHARE_HASHTAGS = [
    '#AbsurdityAI',
    '#AIComedy',
    '#VIralVideo',
    '#FYP',
    '#AIGenerated',
    '#ComedySketch',
    '#TikTokMadeMeDoIt',
];

// Error messages - absurd friendly
export const ERROR_MESSAGES = {
    generic: 'The ritual backfired... try again?',
    network: 'The void isn\'t responding. Check your connection.',
    camera: 'Camera demons are uncooperative right now.',
    upload: 'The cloud rejected your offering. Try again.',
    generation: 'The AI got confused. It happens to the best of us.',
    faceModel: 'Your face broke the algorithm. That\'s actually impressive.',
    auth: 'The cult didn\'t recognize you. Try logging in again.',
};

// Animation durations (ms)
export const ANIMATIONS = {
    fast: 150,
    normal: 300,
    slow: 500,
    pulse: 2000,
};

// Limits
export const LIMITS = {
    maxSelfies: 3,
    maxVideoSeconds: 10,
    maxSketchDuration: 90,
    minSketchDuration: 20,
    imageMaxSizeMB: 10,
    videoMaxSizeMB: 100,
};

// API endpoints (for edge functions)
export const ENDPOINTS = {
    generateSketch: 'generate-sketch',
    createFaceModel: 'create-face-model',
    fetchTemplates: 'fetch-templates',
};
