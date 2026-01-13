// ========================================
// ROOT LAYOUT - ABSURDITY AI SKETCH MACHINE
// ========================================
// Agent: Developer Amelia (EMDADF Phase 6)
// Story: STORY-001 - App Foundation

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as ScreenOrientation from 'expo-screen-orientation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import global CSS for NativeWind
import '../global.css';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    useEffect(() => {
        // Lock to portrait orientation
        async function lockOrientation() {
            await ScreenOrientation.lockAsync(
                ScreenOrientation.OrientationLock.PORTRAIT_UP
            );
        }
        lockOrientation();

        // Hide splash screen after layout is ready
        SplashScreen.hideAsync();
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <StatusBar style="light" />
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: '#0A0A0F' },
                        animation: 'slide_from_right',
                    }}
                >
                    {/* Splash/Onboarding */}
                    <Stack.Screen
                        name="index"
                        options={{
                            animation: 'fade',
                        }}
                    />

                    {/* Auth Flow */}
                    <Stack.Screen
                        name="(auth)"
                        options={{
                            animation: 'slide_from_bottom',
                        }}
                    />

                    {/* Main App Flow */}
                    <Stack.Screen
                        name="(main)"
                        options={{
                            animation: 'fade',
                        }}
                    />
                </Stack>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
