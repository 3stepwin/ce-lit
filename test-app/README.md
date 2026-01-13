# 🎬 ABSURDITY AI SKETCH MACHINE

> Make Yourself the Viral Star ✨

An AI-powered mobile app that generates viral 20-90 second SNL-style comedy sketches where **YOU** star as the main character. Absurd "stupid but premium" premises executed with cinematic quality.

## 🚀 Features

- **Face-Swap Star Power** - Your face becomes the star of AI-generated sketches
- **5 Sketch Types** - Fake Commercials, Weekend Update, Cult Rehearsal, Weird Roles, Random Stupid
- **One-Tap Sharing** - Pre-filled absurd captions for TikTok/Reels/Shorts
- **Outtakes Carousel** - Multiple variations of each sketch
- **Vertical-First Cinema** - Netflix-quality in TikTok format

## 📱 Tech Stack

- **Expo SDK 52+** (managed workflow)
- **TypeScript** (strict mode)
- **NativeWind** (Tailwind for React Native)
- **expo-router** (file-based routing)
- **Zustand** (state management)
- **Supabase** (Auth, Database, Storage, Realtime, Edge Functions)
- **expo-av** (video playback)
- **expo-camera** (selfie capture)
- **react-native-reanimated** (animations)

## 🏃 Quick Start

```bash
# Install dependencies
npm install

# Start Expo development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android
```

## 📁 Project Structure

```
AbsurditySketchMachine/
├── app/                    # expo-router screens
│   ├── _layout.tsx         # Root layout
│   ├── index.tsx           # Splash/Onboarding
│   ├── (auth)/             # Auth flow
│   │   ├── login.tsx
│   │   └── guest.tsx
│   └── (main)/             # Main app
│       ├── create.tsx      # Create sketch
│       ├── avatar.tsx      # Avatar capture
│       ├── generating.tsx  # Loading screen
│       ├── result.tsx      # Video player
│       └── gallery.tsx     # My sketches
├── components/
│   └── ui/                 # Reusable components
├── hooks/                  # React hooks
├── lib/                    # Utilities
├── store/                  # Zustand store
├── types/                  # TypeScript types
└── supabase/              # Edge functions
```

## 🎨 Design System

**Theme:** Absurd Premium Dark

- **Background:** `#0A0A0F` (near-black)
- **Primary:** `#FF00FF` (neon magenta)
- **Accent:** `#00FFFF` (cyan)
- **Warning/Tape:** `#FFD700` (gold)

Inspired by Google Stitch's "Forbidden Archive / Glitch Punk" aesthetic with tape buttons, CENSORED bars, and stencil typography.

## 🔐 Environment Variables

Create a `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 📊 Supabase Schema

Tables:
- `profiles` - User profiles and face model status
- `user_avatars` - Uploaded selfies
- `sketches` - Generated sketch metadata

Storage Buckets:
- `user_avatars` - User selfie images
- `sketch_videos` - Generated videos
- `thumbnails` - Video thumbnails

## 🚢 Deployment

```bash
# EAS Build
npx eas build --platform ios
npx eas build --platform android

# Submit to stores
npx eas submit --platform ios
npx eas submit --platform android
```

## 📝 License

MIT

---

Built with 🎭 by the Absurdity AI Team
