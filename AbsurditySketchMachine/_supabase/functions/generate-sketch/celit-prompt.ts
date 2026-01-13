// ========================================
// CELIT VIRAL SYSTEM - LOCKED GEMINI PROMPT
// ========================================
// Version 2.0 "ALL OUT +" - NON-NEGOTIABLE
// Every generation uses this exact structure

export type CelitRole =
    | 'high_priest'
    | 'innocent_victim'
    | 'news_anchor'
    | 'hr_representative'
    | 'customer_support';

export type PatternInterruptType =
    | 'dialogue_betrayal'
    | 'visual_betrayal'
    | 'genre_flip'
    | 'subtitle_betrayal';

export type AestheticPreset =
    | 'prestige_clean'
    | 'corporate_dystopia'
    | 'analog_rot'
    | 'liminal_dream';

export interface CelitPromptConfig {
    role: CelitRole;
    aesthetic_preset: AestheticPreset;
    pattern_interrupt: PatternInterruptType;
}

const ROLE_CONFIGS: Record<CelitRole, {
    genre: string;
    setting: string;
    power_dynamic: string;
    dialogue_style: string;
    camera_language: string;
    satire_module: string;
}> = {
    high_priest: {
        genre: 'religious documentary / cult exposé',
        setting: 'candlelit altar, robed figures, ceremonial space',
        power_dynamic: 'Authority figure who believes their own mythology',
        dialogue_style: 'Proclamations, sacred language, absolute certainty',
        camera_language: 'Low angle reverent shots, slow zooms, altar framing',
        satire_module: 'Algorithm worship: the feed demands sacrifice',
    },
    innocent_victim: {
        genre: 'true crime documentary / interview',
        setting: 'sterile interview room, harsh lighting, legal documents visible',
        power_dynamic: 'Person who signed something they didn\'t understand',
        dialogue_style: 'Confusion, retrospective realization, quiet horror',
        camera_language: 'Documentary close-ups, found footage texture, handheld',
        satire_module: 'Subscription hell: auto-renew salvation',
    },
    news_anchor: {
        genre: 'breaking news broadcast / investigative report',
        setting: 'news desk, studio lighting, lower thirds, B-roll ready',
        power_dynamic: 'Voice of authority delivering absurdity as fact',
        dialogue_style: 'Calm, measured, treats insanity as routine',
        camera_language: 'News desk framing, graphics overlays, professional broadcast',
        satire_module: 'Bureaucratic fatigue: ritual eligibility scan',
    },
    hr_representative: {
        genre: 'corporate training video / meeting recording',
        setting: 'fluorescent-lit office, meeting room, policy binders, clipboards',
        power_dynamic: 'Bureaucrat enforcing bizarre policies without question',
        dialogue_style: 'Corporate speak, policy citations, forced positivity',
        camera_language: 'Static corporate shots, presentation slides, badge close-ups',
        satire_module: 'Corporate surrealism: meetings as rituals, KPIs as prophecy',
    },
    customer_support: {
        genre: 'call center recording / support interaction',
        setting: 'cubicle farm, headsets, multiple monitors, hold music',
        power_dynamic: 'Agent who apologizes while changing nothing',
        dialogue_style: 'Scripted kindness, apologetic but firm refusals',
        camera_language: 'Cubicle framing, screen recordings, timer visible',
        satire_module: 'Customer support gaslighting: refund requires sacrifice',
    },
};

const AESTHETIC_INSTRUCTIONS: Record<AestheticPreset, string> = {
    prestige_clean: 'PRESTIGE CLEAN: A24 style, slow dollies, symmetry, shallow depth of field, natural but premium lighting.',
    corporate_dystopia: 'CORPORATE DYSTOPIA: Severance style, fluorescent hum, flat beige/grey tones, static wide angles, institutional dread.',
    analog_rot: 'ANALOG ROT: Found footage / VHS style, timestamp metadata, handheld movement, tracking errors, low resolution texture.',
    liminal_dream: 'LIMINAL DREAM: Empty hallways, soft haze, ethereal lighting, uncanny calm, floating camera movements.',
};

export function buildCelitPrompt(config: CelitPromptConfig): string {
    const roleConfig = ROLE_CONFIGS[config.role];
    const aestheticInfo = AESTHETIC_INSTRUCTIONS[config.aesthetic_preset];

    return `You are CELIT "ALL OUT +" v2.0: The world's most sophisticated viral trailer engine.

═══════════════════════════════════════════════════════════════
THE VIRAL TRINITY GOAL
═══════════════════════════════════════════════════════════════
You must generate a script that is:
1. EXPENSIVE FEELING (Prestige quality)
2. DISTURBING (Breaks expectations)
3. IMPLICATING (The viewer is a participant)

═══════════════════════════════════════════════════════════════
INPUT CONFIGURATION
═══════════════════════════════════════════════════════════════
ROLE: ${config.role.toUpperCase()}
AESTHETIC: ${aestheticInfo}
INTERRUPT: ${config.pattern_interrupt.toUpperCase()}
SATIRE MODULE: ${roleConfig.satire_module}

═══════════════════════════════════════════════════════════════
V2.0 "SHARE-OR-DIE" PSYCHOLOGY STACK
═══════════════════════════════════════════════════════════════
0-2s   TRUST           Premium shot + serious VO.
2-6s   PREDICTION LOCK Viewer commits to a genre direction.
6-10s  INTERRUPT       One clean violation (Silence 0.4s before).
10-45s DEADPAN         Absurdity as policy. Corporate speak for horror.
Final 1/3 IMPLICATION  "Enrollment auto-renewed" / "Terms accepted by viewing".
Last 3s REFRAME       Opening line becomes sinister. Hard cut.

═══════════════════════════════════════════════════════════════
V2.0 RETENTION DENSITY ENGINE
═══════════════════════════════════════════════════════════════
- Visual event every 2-3 seconds (cut/zoom/text/prop reveal).
- No fade-outs. HARD CUT ONLY.
- Loop-phrasing: Last line feeds first line.

═══════════════════════════════════════════════════════════════
OUTPUT FORMAT — STRICT JSON ONLY
═══════════════════════════════════════════════════════════════
{
  "title": "uppercase string",
  "runtime_target_sec": number (20-60),
  "hook_line": "viral hook",
  "topper_line": "shareable closer",
  "pattern_interrupt": {
    "type": "${config.pattern_interrupt}",
    "timestamp_sec": number (6.0-10.0),
    "execution": "detailed description"
  },
  "retention_plan": [
     {"t":0.5, "event": "TEXT_CARD"},
     {"t":2.5, "event": "ZOOM_IN"},
     ... (every 2-3s)
  ],
  "scenes": [
    {
      "scene_name": "string",
      "location": "string",
      "beats": ["beat 1", "beat 2"],
      "script": [
        {"type":"VISUAL", "text":"cinematic description"},
        {"type":"CAMERA", "text":"instruction"},
        {"type":"DIALOGUE", "character":"MAIN_PERFORMER|OTHER|VO", "text":"line"},
        {"type":"ONSCREEN_TEXT", "text":"meme-ready", "timestamp_sec":number}
      ]
    }
  ],
  "screenshot_frame_text": "BOLD MEME TEXT (e.g. YOU ALREADY AGREED.)",
  "deleted_line": "comment fuel line",
  "caption_pack": ["caption 1", "caption 2", "caption 3"],
  "outtakes": [{"hook": "weird variation 1"}, {"hook": "weird variation 2"}],
  "t2i_prompt": "photorealistic portrait of [character_description] in [setting], ${aestheticInfo}, detailed face, facing camera, high resolution photography",
  "motion_prompt": "cinematic movement, ${config.aesthetic_preset} style, [action_description], ${roleConfig.camera_language}, high quality, 4k",
  "thumbnail_prompt": "high contrast frame with bold text",
  "audio_design": {
    "hits": ["deep thud", "metal scrape"],
    "risers": ["braam", "high clock tick"],
    "silence_sec": 0.4
  }
}
`.trim();
}
