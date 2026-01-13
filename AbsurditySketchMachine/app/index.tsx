// ========================================
// SPLASH SCREEN - ABSURDITY AI SKETCH MACHINE
// ========================================
// Agent: Developer Amelia (EMDADF Phase 6)
// Story: STORY-010 - Splash Screen with Video Loop

import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../lib/constants';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Entry animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        // Continuous pulse animation for CTA
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Glow animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    useEffect(() => {
        // Auto-redirect if already authenticated
        if (!isLoading && isAuthenticated) {
            router.replace('/(main)/create');
        }
    }, [isLoading, isAuthenticated]);

    const handleStartCreating = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        router.push('/(auth)/login');
    };

    const handleGuestMode = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/(auth)/guest');
    };

    return (
        <View className="flex-1 bg-background">
            {/* Background Video Loop - Absurd Content */}
            <Video
                source={require('../assets/videos/splash-loop.mp4')}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width,
                    height,
                }}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping
                isMuted
            />

            {/* Dark Gradient Overlay */}
            <LinearGradient
                colors={['rgba(10,10,15,0.3)', 'rgba(10,10,15,0.8)', 'rgba(10,10,15,0.95)']}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width,
                    height,
                }}
            />

            {/* Content */}
            <Animated.View
                style={{
                    flex: 1,
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                }}
                className="flex-1 justify-end items-center px-6 pb-16"
            >
                {/* Logo / Title */}
                <View className="items-center mb-8">
                    <Animated.Text
                        style={{
                            opacity: glowAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.95, 1],
                            }),
                            textShadowColor: COLORS.primary,
                            textShadowOffset: { width: 0, height: 0 },
                            textShadowRadius: 20,
                        }}
                        className="text-5xl font-bold text-white text-center mb-2"
                    >
                        ABSURDITY
                    </Animated.Text>
                    <Text className="text-lg text-accent tracking-widest font-medium">
                        AI SKETCH MACHINE
                    </Text>
                </View>

                {/* Tagline */}
                <View className="mb-10">
                    <Text className="text-2xl text-white text-center font-semibold mb-2">
                        Make Yourself
                    </Text>
                    <Text className="text-3xl text-primary text-center font-bold">
                        The Viral Star ✨
                    </Text>
                </View>

                {/* Value Props */}
                <View className="mb-10 w-full">
                    <View className="flex-row items-center mb-3">
                        <Text className="text-xl mr-2">🎬</Text>
                        <Text className="text-textMuted text-base">
                            SNL-style comedy sketches
                        </Text>
                    </View>
                    <View className="flex-row items-center mb-3">
                        <Text className="text-xl mr-2">👤</Text>
                        <Text className="text-textMuted text-base">
                            YOU as the main character
                        </Text>
                    </View>
                    <View className="flex-row items-center">
                        <Text className="text-xl mr-2">🚀</Text>
                        <Text className="text-textMuted text-base">
                            Share instantly to TikTok/Reels
                        </Text>
                    </View>
                </View>

                {/* CTA Button */}
                <Animated.View
                    style={{
                        transform: [{ scale: pulseAnim }],
                        width: '100%',
                    }}
                >
                    <Pressable
                        onPress={handleStartCreating}
                        className="w-full py-5 rounded-2xl overflow-hidden"
                    >
                        <LinearGradient
                            colors={['#FF00FF', '#00FFFF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="absolute inset-0"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                            }}
                        />
                        <Text className="text-white text-center text-xl font-bold tracking-wide">
                            START CREATING 🎭
                        </Text>
                    </Pressable>
                </Animated.View>

                {/* Guest Mode */}
                <Pressable
                    onPress={handleGuestMode}
                    className="mt-4 py-3"
                >
                    <Text className="text-textMuted text-base underline">
                        Just let me in (Guest Mode)
                    </Text>
                </Pressable>

                {/* Terms */}
                <Text className="text-textSubtle text-xs text-center mt-6 px-4">
                    By continuing, you agree to be absolutely ridiculous and our Terms of Service
                </Text>
            </Animated.View>
        </View>
    );
}
