// [UX_SALLY] Root Layout - CE LIT
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as ScreenOrientation from 'expo-screen-orientation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { THEME } from '../constants/theme';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    useEffect(() => {
        async function lockOrientation() {
            await ScreenOrientation.lockAsync(
                ScreenOrientation.OrientationLock.PORTRAIT_UP
            );
        }
        lockOrientation();
        SplashScreen.hideAsync();
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <StatusBar style="light" />
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: THEME.colors.background },
                        animation: 'fade',
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
