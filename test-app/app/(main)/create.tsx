// ========================================
// CREATE SKETCH SCREEN - ABSURDITY AI SKETCH MACHINE
// ========================================
// Agent: Developer Amelia (EMDADF Phase 6)
// Story: STORY-023-032 - Sketch Creation Flow
// Design: "Forbidden Archive / Glitch Punk" aesthetic from Stitch

import { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    Pressable,
    ScrollView,
    Animated,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSketch } from '../../hooks/useSketch';
import { useAppStore } from '../../store/useAppStore';
import { SKETCH_TYPES, ROLES, LOADING_MESSAGES } from '../../types';
import { COLORS, GRADIENTS } from '../../lib/constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

export default function CreateScreen() {
    const router = useRouter();
    const { generateSketch } = useSketch();
    const { selectedAvatarId, faceModelStatus } = useAppStore();

    const [selectedType, setSelectedType] = useState(SKETCH_TYPES[0].type);
    const [selectedRole, setSelectedRole] = useState(ROLES[0].role);
    const [dumbnessLevel, setDumbnessLevel] = useState(7);
    const [isGenerating, setIsGenerating] = useState(false);

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glitchAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Pulse animation for generate button
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.03,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Occasional glitch effect
        const glitchInterval = setInterval(() => {
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
            ]).start();
        }, 3000);

        return () => clearInterval(glitchInterval);
    }, []);

    const handleGenerate = async () => {
        if (!selectedAvatarId || faceModelStatus !== 'ready') {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            router.push('/(main)/avatar');
            return;
        }

        setIsGenerating(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        await generateSketch({
            type: selectedType,
            role: selectedRole,
            dumbnessLevel,
        });
    };

    const handleTypeSelect = async (type: string) => {
        await Haptics.selectionAsync();
        setSelectedType(type as any);
    };

    const handleRoleSelect = async (role: string) => {
        await Haptics.selectionAsync();
        setSelectedRole(role as any);
    };

    const toggleDumbness = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setDumbnessLevel((prev) => (prev >= 10 ? 5 : prev + 1));
    };

    return (
        <View className="flex-1 bg-background">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header - Stencil Style */}
                <View className="px-6 pt-16 pb-6">
                    <Animated.View
                        style={{
                            transform: [
                                {
                                    translateX: glitchAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 3],
                                    }),
                                },
                            ],
                        }}
                    >
                        <Text className="text-4xl font-bold text-white tracking-wider">
                            CREATE YOUR
                        </Text>
                        <Text className="text-4xl font-bold text-primary tracking-wider">
                            ABSURDITY
                        </Text>
                    </Animated.View>

                    {/* Tape Label */}
                    <View className="bg-warning mt-4 px-4 py-2 self-start -rotate-1">
                        <Text className="text-black font-bold text-sm tracking-widest">
                            📎 SELECT YOUR DOOM
                        </Text>
                    </View>
                </View>

                {/* Sketch Type Carousel */}
                <View className="mb-8">
                    <Text className="text-textMuted text-sm px-6 mb-4 tracking-widest">
            // SKETCH TYPE
                    </Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
                        decelerationRate="fast"
                        snapToInterval={CARD_WIDTH + 16}
                    >
                        {SKETCH_TYPES.map((type) => (
                            <Pressable
                                key={type.type}
                                onPress={() => handleTypeSelect(type.type)}
                                className={`w-[${CARD_WIDTH}px]`}
                                style={{ width: CARD_WIDTH }}
                            >
                                <View
                                    className={`rounded-xl overflow-hidden border-2 ${selectedType === type.type
                                            ? 'border-primary'
                                            : 'border-surface'
                                        }`}
                                >
                                    <LinearGradient
                                        colors={type.gradient as any}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        className="p-6"
                                    >
                                        {/* CENSORED bar style header */}
                                        <View className="bg-black px-3 py-1 self-start mb-3">
                                            <Text className="text-white font-bold text-xs tracking-widest">
                                                {type.icon} {type.type.replace('_', ' ').toUpperCase()}
                                            </Text>
                                        </View>

                                        <Text className="text-white text-2xl font-bold mb-2">
                                            {type.title}
                                        </Text>
                                        <Text className="text-white/80 text-base">
                                            {type.description}
                                        </Text>
                                    </LinearGradient>

                                    {/* Selection indicator */}
                                    {selectedType === type.type && (
                                        <View className="bg-primary py-2">
                                            <Text className="text-black text-center font-bold text-sm">
                                                ✓ SELECTED
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* Role Selection - Tape Button Style */}
                <View className="px-6 mb-8">
                    <Text className="text-textMuted text-sm mb-4 tracking-widest">
            // YOUR ROLE
                    </Text>

                    <View className="flex-row flex-wrap gap-3">
                        {ROLES.map((role) => (
                            <Pressable
                                key={role.role}
                                onPress={() => handleRoleSelect(role.role)}
                                className={`px-4 py-3 rounded-lg ${selectedRole === role.role
                                        ? 'bg-warning'
                                        : 'bg-surface border border-surfaceHover'
                                    }`}
                                style={{
                                    transform: [{ rotate: selectedRole === role.role ? '-1deg' : '0deg' }],
                                }}
                            >
                                <Text
                                    className={`font-bold ${selectedRole === role.role ? 'text-black' : 'text-white'
                                        }`}
                                >
                                    {role.emoji} {role.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Dumbness Level Toggle */}
                <View className="px-6 mb-8">
                    <Pressable
                        onPress={toggleDumbness}
                        className="bg-surface border border-accent rounded-xl p-6"
                    >
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-white font-bold text-lg">
                                    MAKE IT DUMBER
                                </Text>
                                <Text className="text-textMuted text-sm mt-1">
                                    Tap to increase absurdity
                                </Text>
                            </View>

                            <View className="bg-accent px-4 py-2 rounded-lg">
                                <Text className="text-black font-bold text-2xl">
                                    {dumbnessLevel}/10
                                </Text>
                            </View>
                        </View>

                        {/* Dumbness Bar */}
                        <View className="bg-surfaceHover h-3 rounded-full mt-4 overflow-hidden">
                            <View
                                className="bg-accent h-full rounded-full"
                                style={{ width: `${dumbnessLevel * 10}%` }}
                            />
                        </View>

                        {dumbnessLevel >= 9 && (
                            <View className="bg-error/20 border border-error rounded-lg p-3 mt-4">
                                <Text className="text-error text-center font-bold">
                                    ⚠️ MAXIMUM STUPID ACTIVATED ⚠️
                                </Text>
                            </View>
                        )}
                    </Pressable>
                </View>

                {/* Avatar Status Warning */}
                {(!selectedAvatarId || faceModelStatus !== 'ready') && (
                    <View className="px-6 mb-8">
                        <Pressable
                            onPress={() => router.push('/(main)/avatar')}
                            className="bg-error/20 border border-error rounded-xl p-4"
                        >
                            <Text className="text-error text-center font-bold">
                                ⚠️ Upload your face first! Tap here →
                            </Text>
                        </Pressable>
                    </View>
                )}
            </ScrollView>

            {/* Fixed Generate Button */}
            <View className="absolute bottom-0 left-0 right-0 p-6 pb-24">
                <LinearGradient
                    colors={['transparent', 'rgba(10,10,15,0.95)', '#0A0A0F']}
                    className="absolute inset-0"
                />

                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <Pressable
                        onPress={handleGenerate}
                        disabled={isGenerating}
                        className="rounded-2xl overflow-hidden shadow-glow"
                    >
                        <LinearGradient
                            colors={isGenerating ? ['#333', '#222'] : ['#FF00FF', '#00FFFF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="py-5 px-8"
                        >
                            <Text className="text-white text-center text-2xl font-bold tracking-widest">
                                {isGenerating ? '⏳ GENERATING...' : '🎬 GENERATE'}
                            </Text>
                            <Text className="text-white/70 text-center text-sm mt-1">
                                Start the experiment
                            </Text>
                        </LinearGradient>
                    </Pressable>
                </Animated.View>
            </View>
        </View>
    );
}
