---
description: Development workflow for Absurdity AI Sketch Machine
---

# Absurdity AI Sketch Machine Development Workflow

// turbo-all

## Quick Start

1. Navigate to project directory:
```bash
cd AbsurditySketchMachine
```

2. Start Expo development server:
```bash
npx expo start
```

3. For iOS simulator (Mac only):
```bash
npx expo start --ios
```

4. For Android emulator:
```bash
npx expo start --android
```

## Install Dependencies

All dependencies at once:
```bash
npx expo install expo-router expo-av expo-camera expo-image-picker expo-image-manipulator expo-sharing expo-media-library expo-notifications expo-haptics expo-screen-orientation react-native-reanimated react-native-gesture-handler react-native-safe-area-context react-native-screens nativewind tailwindcss @supabase/supabase-js zustand @react-native-async-storage/async-storage expo-file-system expo-constants expo-splash-screen expo-status-bar expo-font
```

## NativeWind Setup

1. Install NativeWind:
```bash
npm install nativewind
npm install --save-dev tailwindcss@3.3.2
```

2. Initialize Tailwind:
```bash
npx tailwindcss init
```

## Build Commands

EAS Build (when ready):
```bash
npx eas build --platform ios
npx eas build --platform android
```

## Testing

Run tests:
```bash
npm test
```

## Common Issues

- If metro bundler fails, clear cache:
```bash
npx expo start --clear
```

- Reset all:
```bash
rm -rf node_modules
npm install
```
