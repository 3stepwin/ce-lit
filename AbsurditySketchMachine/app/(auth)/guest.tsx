// ========================================
// GUEST MODE SCREEN - ABSURDITY AI SKETCH MACHINE
// ========================================
// Agent: Developer Amelia (EMDADF Phase 6)
// Story: STORY-012 - Guest Mode

import { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../hooks/useAuth';

const CULT_MESSAGES = [
    "Initiating guest ritual... 🕯️",
    "No commitment required... yet 😏",
    "Your face is about to go viral... 🚀",
    "The AI gods approve your entry... 👹",
    "Preparing absurdity injection... 💉",
];

export default function GuestScreen() {
    const router = useRouter();
    const { signInGuest, isLoading } = useAuth();

    const [currentMessage, setCurrentMessage] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const spinAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Fade in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        if (isProcessing) {
            // Rotate animation
            Animated.loop(
                Animated.timing(spinAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                })
            ).start();

            // Message rotation
            const messageInterval = setInterval(() => {
                setCurrentMessage((prev) => (prev + 1) % CULT_MESSAGES.length);
            }, 1500);

            return () => clearInterval(messageInterval);
        }
    }, [isProcessing]);

    const handleGuestEntry = async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setIsProcessing(true);
            setError(null);

            await signInGuest();

            // Small delay for dramatic effect
            setTimeout(() => {
                router.replace('/(main)/avatar');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to enter as guest');
            setIsProcessing(false);
        }
    };

    const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    if (isProcessing) {
        return (
            <View className="flex-1 bg-background justify-center items-center px-6">
                {/* Spinning Symbol */}
                <Animated.View
                    style={{ transform: [{ rotate: spin }] }}
                    className="mb-8"
                >
                    <Text className="text-6xl">🕯️</Text>
                </Animated.View>

                {/* Loading Message */}
                <Animated.Text
                    style={{ opacity: fadeAnim }}
                    className="text-2xl text-white text-center font-bold mb-4"
                >
                    {CULT_MESSAGES[currentMessage]}
                </Animated.Text>

                {/* Progress Dots */}
                <View className="flex-row gap-2">
                    {[0, 1, 2].map((i) => (
                        <View
                            key={i}
                            className={`w-2 h-2 rounded-full ${i === currentMessage % 3 ? 'bg-primary' : 'bg-surface'
                                }`}
                        />
                    ))}
                </View>
            </View>
        );
    }

    return (
        <Animated.View
            style={{ opacity: fadeAnim }}
            className="flex-1 bg-background px-6 pt-16 pb-8"
        >
            {/* Back Button */}
            <Pressable
                onPress={() => router.back()}
                className="mb-8"
            >
                <Text className="text-textMuted text-lg">← Back</Text>
            </Pressable>

            {/* Content */}
            <View className="flex-1 justify-center">
                <View className="items-center mb-10">
                    <Text className="text-6xl mb-4">👻</Text>
                    <Text className="text-4xl font-bold text-white text-center mb-4">
                        Guest Mode
                    </Text>
                    <Text className="text-textMuted text-lg text-center">
                        No commitment, all the chaos
                    </Text>
                </View>

                {/* What You Get */}
                <View className="bg-surface rounded-2xl p-6 mb-8">
                    <Text className="text-white font-bold text-lg mb-4">
                        As a guest, you can:
                    </Text>

                    <View className="gap-3">
                        <View className="flex-row items-center">
                            <Text className="text-xl mr-3">✅</Text>
                            <Text className="text-textMuted">Create 3 free sketches</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-xl mr-3">✅</Text>
                            <Text className="text-textMuted">Share to TikTok/Reels</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-xl mr-3">✅</Text>
                            <Text className="text-textMuted">Save to your gallery</Text>
                        </View>
                    </View>

                    <View className="h-px bg-surfaceHover my-4" />

                    <View className="gap-3">
                        <View className="flex-row items-center">
                            <Text className="text-xl mr-3">⚠️</Text>
                            <Text className="text-warning">Sketches may be deleted</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-xl mr-3">🔒</Text>
                            <Text className="text-textMuted">Sign up to keep forever</Text>
                        </View>
                    </View>
                </View>

                {/* Error */}
                {error && (
                    <View className="bg-error/20 border border-error rounded-xl p-4 mb-6">
                        <Text className="text-error text-center">{error}</Text>
                    </View>
                )}

                {/* Enter Button */}
                <Pressable
                    onPress={handleGuestEntry}
                    disabled={isLoading}
                    className="rounded-xl overflow-hidden"
                >
                    <LinearGradient
                        colors={['#FF00FF', '#00FFFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="py-5"
                    >
                        <Text className="text-white text-center text-xl font-bold">
                            Enter the Chaos 🎲
                        </Text>
                    </LinearGradient>
                </Pressable>

                {/* Sign Up Prompt */}
                <Pressable
                    onPress={() => router.replace('/(auth)/login')}
                    className="mt-6 py-3"
                >
                    <Text className="text-textMuted text-center">
                        Actually, I want to{' '}
                        <Text className="text-accent font-semibold">create an account</Text>
                    </Text>
                </Pressable>
            </View>
        </Animated.View>
    );
}
