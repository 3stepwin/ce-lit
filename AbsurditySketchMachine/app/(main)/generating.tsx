// ========================================
// GENERATION LOADING SCREEN - ABSURDITY AI SKETCH MACHINE
// ========================================
// Agent: Developer Amelia (EMDADF Phase 6)
// Story: STORY-027-031 - Generation Loading Flow

import { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../../store/useAppStore';
import { useSketchStatusRealtime } from '../../hooks/useRealtime';
import { COLORS } from '../../lib/constants';

const { width, height } = Dimensions.get('window');

const STATUS_LABELS: Record<string, string> = {
    pending: 'INITIATING HANDSHAKE...',
    generating: 'VERIFYING COMPLIANCE...',
    processing_video: 'ARCHIVING REALITY...',
    rendering: 'SEALING ARTIFACT...',
    complete: 'ACQUISITION COMPLETE.',
    failed: 'SYSTEM REJECTION.',
};

const SYSTEM_LOGS = [
    { text: "Scanning rhetorical bio-signature...", emoji: "🧬" },
    { text: "Injecting deadpan policies...", emoji: "📋" },
    { text: "Allocating share-or-die buffers...", emoji: "💾" },
    { text: "Violating expected patterns...", emoji: "⚠️" },
    { text: "Generating proof of consent...", emoji: "🖨️" },
    { text: "Locking viewer implication...", emoji: "🔒" },
];

export default function GeneratingScreen() {
    const router = useRouter();
    const { currentSketchId, generationStatus, generationProgress } = useAppStore();

    const [messageIndex, setMessageIndex] = useState(0);
    const [dots, setDots] = useState('');

    // Animations
    const spinAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glitchAnim = useRef(new Animated.Value(0)).current;
    const symbolScale = useRef(new Animated.Value(1)).current;

    // Realtime subscription for status updates
    useSketchStatusRealtime(
        currentSketchId,
        (status, progress) => {
            // Haptic on progress milestones
            if (progress % 25 === 0 && progress > 0) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
        },
        () => {
            // On complete - navigation handled by useSketch hook
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
        (error) => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    );

    useEffect(() => {
        // Continuous spin animation
        Animated.loop(
            Animated.timing(spinAnim, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
            })
        ).start();

        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
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

        // Symbol scale animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(symbolScale, {
                    toValue: 1.1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(symbolScale, {
                    toValue: 0.9,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Message rotation
        const messageTimer = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % SYSTEM_LOGS.length);
        }, 2500);

        // Dot animation
        const dotTimer = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
        }, 500);

        // Glitch effect
        const glitchTimer = setInterval(() => {
            Animated.sequence([
                Animated.timing(glitchAnim, {
                    toValue: 1,
                    duration: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(glitchAnim, {
                    toValue: 0,
                    duration: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(glitchAnim, {
                    toValue: -1,
                    duration: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(glitchAnim, {
                    toValue: 0,
                    duration: 50,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 4000);

        return () => {
            clearInterval(messageTimer);
            clearInterval(dotTimer);
            clearInterval(glitchTimer);
        };
    }, []);

    const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const currentMessage = SYSTEM_LOGS[messageIndex];

    return (
        <View className="flex-1 bg-background">
            {/* Dark gradient background */}
            <LinearGradient
                colors={['#0A0A0F', '#16161F', '#0A0A0F']}
                style={{ position: 'absolute', width, height }}
            />

            {/* Content */}
            <View className="flex-1 justify-center items-center px-8">
                {/* Spinning Symbol */}
                <Animated.View
                    style={{
                        transform: [
                            { rotate: spin },
                            { scale: symbolScale },
                        ],
                    }}
                    className="mb-8"
                >
                    <View className="w-32 h-32 items-center justify-center">
                        <Text className="text-7xl">
                            {currentMessage.emoji}
                        </Text>
                    </View>
                </Animated.View>

                {/* Status Label */}
                <View className="bg-primary px-6 py-2 rounded-full mb-4">
                    <Text className="text-black font-bold text-sm tracking-widest">
                        {STATUS_LABELS[generationStatus] || 'Processing...'}
                    </Text>
                </View>

                {/* Funny Message */}
                <Animated.View
                    style={{
                        transform: [
                            {
                                translateX: glitchAnim.interpolate({
                                    inputRange: [-1, 0, 1],
                                    outputRange: [-5, 0, 5],
                                }),
                            },
                        ],
                    }}
                    className="h-24 justify-center"
                >
                    <Text className="text-2xl text-white text-center font-bold">
                        {currentMessage.text}{dots}
                    </Text>
                </Animated.View>

                {/* Progress Bar */}
                <View className="w-full mt-8">
                    <View className="bg-surface h-4 rounded-full overflow-hidden">
                        <Animated.View
                            style={{
                                width: `${Math.max(generationProgress, 5)}%`,
                                transform: [{ scale: pulseAnim }],
                            }}
                            className="h-full rounded-full"
                        >
                            <LinearGradient
                                colors={['#FF00FF', '#00FFFF']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{ flex: 1 }}
                            />
                        </Animated.View>
                    </View>

                    <Text className="text-textMuted text-center mt-3 text-lg">
                        {generationProgress}%
                    </Text>
                </View>

                {/* Estimated Time */}
                <View className="mt-8 bg-surface/50 px-6 py-3 rounded-xl">
                    <Text className="text-textMuted text-center">
                        ⏱️ Usually takes 30-60 seconds
                    </Text>
                </View>
            </View>

            {/* Bottom Warning */}
            <View className="px-6 pb-12">
                <View className="bg-warning/20 border border-warning rounded-xl p-4">
                    <Text className="text-warning text-center text-sm">
                        ⚠️ Don't close the app! Your absurdity is being crafted.
                    </Text>
                </View>
            </View>
        </View>
    );
}
