# 🎬 ABSURDITY AI SKETCH MACHINE - MASTER PLAN

## Project Status: 🚀 IN DEVELOPMENT

---

## 📋 EXECUTIVE SUMMARY

**Product Name:** Absurdity AI Sketch Machine
**Tagline:** "Make Yourself the Viral Star"
**Category:** AI-Powered Comedy Video Generator
**Target:** Maximum virality on TikTok/Reels/Shorts
**Platform:** iOS + Android (Expo React Native)

---

## 🎯 PURPLE COW VIRALITY FEATURES

### Instant Viral Mechanics
1. **Face-Swap Star Power** - User becomes the ACTUAL star of cinematic sketches
2. **One-Tap Share** - Pre-filled absurd captions + hashtags (#AbsurdityAI #WTFisThis)
3. **Outtakes Carousel** - 2-3 variations = multiple share opportunities
4. **Cult Messaging** - Absurd loading messages users screenshot and share
5. **Freeze-Frame Punchline** - Meme-worthy end cards that spread
6. **"Make it Dumber" Toggle** - Gamifies absurdity level
7. **Vertical-First Cinema** - Netflix-quality in TikTok format

### Shareability Multipliers
- Every video ends with a branded watermark/call-to-action
- Gallery save prompts = content lives on device
- Push notifications with absurd copy users share screenshots of
- Social proof: "10K people made cult sketches today"

---

## 🏗️ TECHNICAL ARCHITECTURE

### Tech Stack
```yaml
frontend:
  framework: "Expo SDK 52+ (managed)"
  language: "TypeScript (strict)"
  ui: "NativeWind + gluestack-ui"
  navigation: "expo-router (file-based)"
  state: "Zustand"
  animations: "react-native-reanimated"
  video: "expo-av"
  camera: "expo-camera + expo-image-picker"

backend:
  database: "Supabase PostgreSQL"
  auth: "Supabase Auth (Google/Apple/Email/Guest)"
  storage: "Supabase Storage"
  realtime: "Supabase Realtime"
  functions: "Supabase Edge Functions"

ai_services:
  llm: "Gemini/OpenAI/Grok (via Edge Functions)"
  video_gen: "Luma Dream Machine / Kling"
  face_swap: "Replicate consistent-face"
  templates: "Airtable API"
```

### Folder Structure
```
AbsurditySketchMachine/
├── app/                          # expo-router screens
│   ├── _layout.tsx               # Root layout
│   ├── index.tsx                 # Splash/Onboarding
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── guest.tsx
│   ├── (main)/
│   │   ├── _layout.tsx           # Tab navigation
│   │   ├── avatar.tsx            # Avatar capture
│   │   ├── create.tsx            # Create sketch
│   │   ├── generating.tsx        # Generation loader
│   │   ├── result.tsx            # Result player
│   │   └── gallery.tsx           # My sketches
│   └── +not-found.tsx
├── components/
│   ├── ui/                       # Core UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Carousel.tsx
│   │   └── AnimatedText.tsx
│   ├── video/
│   │   ├── VideoPlayer.tsx
│   │   ├── MemeSubtitles.tsx
│   │   └── FreezeFrame.tsx
│   ├── camera/
│   │   ├── FaceCamera.tsx
│   │   └── FaceOverlay.tsx
│   └── sketch/
│       ├── SketchTypeCard.tsx
│       ├── RoleChips.tsx
│       └── GenerateButton.tsx
├── lib/
│   ├── supabase.ts               # Supabase client
│   ├── storage.ts                # Local storage helpers
│   └── constants.ts              # App constants
├── hooks/
│   ├── useAuth.ts
│   ├── useSketch.ts
│   ├── useAvatar.ts
│   └── useRealtime.ts
├── store/
│   └── useAppStore.ts            # Zustand store
├── supabase/
│   └── functions/
│       ├── generate-sketch/
│       │   └── index.ts
│       ├── create-face-model/
│       │   └── index.ts
│       └── fetch-templates/
│           └── index.ts
├── types/
│   └── index.ts                  # TypeScript types
├── assets/
│   ├── images/
│   ├── videos/
│   │   └── splash-loop.mp4
│   └── fonts/
├── app.json
├── tailwind.config.js
├── nativewind-env.d.ts
└── package.json
```

---

## 🗄️ SUPABASE SCHEMA

### Tables

```sql
-- Users (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  face_model_id TEXT,         -- Reference to processed face model
  face_model_status TEXT DEFAULT 'pending', -- pending, processing, ready, failed
  is_guest BOOLEAN DEFAULT false,
  total_sketches INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User avatars/selfies
CREATE TABLE public.user_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  type TEXT DEFAULT 'image', -- image or video
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sketches
CREATE TABLE public.sketches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Sketch config
  sketch_type TEXT NOT NULL,   -- fake_commercial, weekend_update, cult_rehearsal, weird_role, random_stupid
  role TEXT NOT NULL,          -- cult_leader, victim, spokesperson, etc.
  premise TEXT,                -- Generated premise
  dialogue TEXT,               -- Generated dialogue/script
  dumbness_level INTEGER DEFAULT 5, -- 1-10 scale
  
  -- Generation
  status TEXT DEFAULT 'pending', -- pending, generating, face_swap, rendering, complete, failed
  generation_progress INTEGER DEFAULT 0,
  error_message TEXT,
  
  -- Output
  video_url TEXT,
  video_duration INTEGER,       -- seconds
  thumbnail_url TEXT,
  
  -- Outtakes
  outtakes JSONB DEFAULT '[]'::jsonb, -- Array of {video_url, thumbnail_url}
  
  -- Metadata
  share_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Local cache tracking
CREATE TABLE public.cached_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sketch_id UUID REFERENCES public.sketches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  local_path TEXT NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sketches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cached_videos ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Avatars: Users can manage their own
CREATE POLICY "Users can manage own avatars" ON public.user_avatars
  FOR ALL USING (auth.uid() = user_id);

-- Sketches: Users can manage their own
CREATE POLICY "Users can manage own sketches" ON public.sketches
  FOR ALL USING (auth.uid() = user_id);

-- Cached videos: Users can manage their own
CREATE POLICY "Users can manage own cache" ON public.cached_videos
  FOR ALL USING (auth.uid() = user_id);
```

### Storage Buckets

```yaml
buckets:
  user_avatars:
    public: true
    file_size_limit: 10MB
    allowed_types: ['image/jpeg', 'image/png', 'video/mp4']
  
  sketch_videos:
    public: true
    file_size_limit: 100MB
    allowed_types: ['video/mp4', 'video/webm']
  
  thumbnails:
    public: true
    file_size_limit: 2MB
    allowed_types: ['image/jpeg', 'image/png', 'image/webp']
```

---

## 📱 SCREEN FLOWS

### 1. Splash/Onboarding
- Full-screen looping absurd video background
- "Make Yourself the Viral Star" hero text with neon glow
- Auth buttons: Continue with Google, Apple, Email, or "Just Let Me In" (guest)
- "Start Creating" CTA with haptic feedback

### 2. Avatar Capture
- Full-screen camera with face alignment overlay
- "Take 1-3 selfies or record 10s video"
- Real-time preview with retake option
- Progress indicator during upload
- "Creating your face model..." loading state

### 3. Create Sketch
- Vertical scroll layout
- Horizontal card carousel for sketch types:
  - 🎬 Fake Commercial
  - 📰 Weekend Update News
  - 🕯️ Cult Rehearsal Fail
  - 🎭 Weird Role
  - 🎲 Random Stupid Idea
- Role chips: "You as cult leader" / "victim" / etc.
- "Make it Dumber" toggle/slider
- Big pulsing rainbow gradient "GENERATE" button

### 4. Generation Loading
- Full-screen dark background
- Animated rotating symbols
- Funny loading messages rotating:
  - "Summoning demons..."
  - "Convincing AI you're worthy..."
  - "Rendering your cult destiny..."
  - "Adding lens flares for no reason..."
- Real-time progress percentage
- Realtime subscription for status updates

### 5. Result Screen
- Full-screen vertical video player (autoplay muted)
- Animated meme subtitles (yellow/white Impact bold)
- End freeze-frame with punchline overlay
- Swipeable carousel: Main video + 2-3 outtakes
- Bottom action bar:
  - Share (native sheet with "WTF is this?! 😂 #AbsurdityAI")
  - Save to Gallery
  - "Make Another" (returns to create)

### 6. My Sketches Gallery
- Infinite scroll grid (2-column)
- Thumbnail preview with duration badge
- Tap to view full result screen
- Pull to refresh
- Empty state: "Your cult legacy awaits..."

---

## 🎨 DESIGN SYSTEM

### Theme: "Absurd Premium Dark"

```typescript
const theme = {
  colors: {
    background: '#0A0A0F',      // Near-black
    surface: '#16161F',          // Dark purple tint
    surfaceHover: '#1E1E2A',
    
    primary: '#FF00FF',          // Neon magenta
    primaryGlow: 'rgba(255,0,255,0.3)',
    
    accent: '#00FFFF',           // Cyan
    accentGlow: 'rgba(0,255,255,0.3)',
    
    success: '#00FF88',
    warning: '#FFD700',
    error: '#FF3366',
    
    text: '#FFFFFF',
    textMuted: '#888899',
    textSubtle: '#555566',
  },
  
  gradients: {
    rainbow: 'linear-gradient(135deg, #FF00FF, #00FFFF, #FF00FF)',
    neonGlow: 'radial-gradient(circle, rgba(255,0,255,0.4), transparent)',
    darkFade: 'linear-gradient(to bottom, transparent, #0A0A0F)',
  },
  
  shadows: {
    neon: '0 0 20px rgba(255,0,255,0.5)',
    subtle: '0 4px 20px rgba(0,0,0,0.5)',
  },
  
  fonts: {
    heading: 'Impact, sans-serif',
    body: 'Inter, system-ui, sans-serif',
    meme: 'Impact, system-ui, sans-serif',
  },
};
```

---

## 📊 EPIC BREAKDOWN

### Epic 1: Project Foundation (Stories 1-8)
- [ ] STORY-001: Initialize Expo project with TypeScript
- [ ] STORY-002: Configure NativeWind + gluestack-ui
- [ ] STORY-003: Set up expo-router navigation structure
- [ ] STORY-004: Create Zustand store skeleton
- [ ] STORY-005: Configure Supabase client
- [ ] STORY-006: Set up environment variables
- [ ] STORY-007: Create base UI components
- [ ] STORY-008: Configure portrait-lock + haptics

### Epic 2: Authentication (Stories 9-14)
- [ ] STORY-009: Implement Supabase Auth hook
- [ ] STORY-010: Create splash screen with video loop
- [ ] STORY-011: Build login screen with OAuth buttons
- [ ] STORY-012: Implement guest mode
- [ ] STORY-013: Create profile creation flow
- [ ] STORY-014: Add auth state persistence

### Epic 3: Avatar Capture (Stories 15-22)
- [ ] STORY-015: Build camera screen with expo-camera
- [ ] STORY-016: Create face alignment overlay
- [ ] STORY-017: Implement selfie capture (1-3 photos)
- [ ] STORY-018: Implement video capture (10s)
- [ ] STORY-019: Build preview/retake UI
- [ ] STORY-020: Add image compression with expo-image-manipulator
- [ ] STORY-021: Upload to Supabase Storage
- [ ] STORY-022: Trigger face model creation edge function

### Epic 4: Sketch Creation (Stories 23-32)
- [ ] STORY-023: Build sketch type carousel
- [ ] STORY-024: Create role chip selector
- [ ] STORY-025: Implement "Make it Dumber" toggle
- [ ] STORY-026: Build animated GENERATE button
- [ ] STORY-027: Create generation loading screen
- [ ] STORY-028: Implement funny message rotation
- [ ] STORY-029: Set up Realtime subscription for status
- [ ] STORY-030: Build progress indicator
- [ ] STORY-031: Handle generation errors gracefully
- [ ] STORY-032: Download completed video to device

### Epic 5: Video Playback (Stories 33-42)
- [ ] STORY-033: Build full-screen video player with expo-av
- [ ] STORY-034: Create custom video controls
- [ ] STORY-035: Implement meme subtitle system
- [ ] STORY-036: Animate subtitles with Reanimated
- [ ] STORY-037: Build freeze-frame punchline overlay
- [ ] STORY-038: Create outtakes carousel
- [ ] STORY-039: Implement share flow with expo-sharing
- [ ] STORY-040: Build save-to-gallery feature
- [ ] STORY-041: Add "Make Another" navigation
- [ ] STORY-042: Implement video caching

### Epic 6: Gallery & History (Stories 43-48)
- [ ] STORY-043: Build gallery grid view
- [ ] STORY-044: Implement infinite scroll
- [ ] STORY-045: Create thumbnail generation
- [ ] STORY-046: Add pull-to-refresh
- [ ] STORY-047: Build empty state UI
- [ ] STORY-048: Implement local cache with expo-file-system

### Epic 7: Edge Functions (Stories 49-56)
- [ ] STORY-049: Create generate-sketch edge function
- [ ] STORY-050: Integrate LLM for premise/dialogue
- [ ] STORY-051: Fetch templates from Airtable
- [ ] STORY-052: Call video generation API
- [ ] STORY-053: Create face-swap integration
- [ ] STORY-054: Implement webhook for completion
- [ ] STORY-055: Generate outtakes variations
- [ ] STORY-056: Handle error states + retries

### Epic 8: Polish & Virality (Stories 57-65)
- [ ] STORY-057: Add push notifications
- [ ] STORY-058: Create absurd notification copy
- [ ] STORY-059: Implement analytics events
- [ ] STORY-060: Add branded watermark to videos
- [ ] STORY-061: Create share preview cards
- [ ] STORY-062: Optimize cold start time
- [ ] STORY-063: Add offline mode support
- [ ] STORY-064: Final UI polish pass
- [ ] STORY-065: App icon and splash assets

---

## 🚀 SPRINT PLAN

### Sprint 1: Foundation (Stories 1-14)
- Project setup
- Navigation structure
- Authentication flow

### Sprint 2: Camera & Upload (Stories 15-22)
- Avatar capture system
- Storage integration

### Sprint 3: Create Flow (Stories 23-32)
- Sketch creation UI
- Generation flow

### Sprint 4: Playback & Share (Stories 33-42)
- Video player
- Sharing features

### Sprint 5: Backend & Polish (Stories 43-65)
- Edge functions
- Gallery
- Final polish

---

## ✅ CURRENT STATUS

**Phase:** EMDADF Phase 6 - Development Execution
**Sprint:** 1 - Foundation
**Current Story:** STORY-001 - Initialize Expo project

---

## 🎯 SUCCESS METRICS

- **Virality Rate:** 10%+ of videos shared
- **Completion Rate:** 70%+ of started generations completed
- **Retention:** DAU/MAU > 20%
- **Generation Time:** < 90 seconds average
- **App Store Rating:** 4.5+ stars
