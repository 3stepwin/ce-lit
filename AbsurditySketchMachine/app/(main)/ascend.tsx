// ========================================
// ASCEND SCREEN - CELIT VIRAL SYSTEM
// ========================================
// The ONE-TAP creation flow
// User does ONLY: Select ROLE → Upload FACE → Tap BEGIN ASCENSION
// All complexity is invisible

import { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    Pressable,
    Dimensions,
    Animated,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '../../store/useAppStore';
import { CELIT_ROLES, type CelitRole } from '../../types/celit';
import { COLORS } from '../../lib/constants';

const { width, height } = Dimensions.get('window');

export default function AscendScreen() {
    const router = useRouter();
    const { selectedAvatarId } = useAppStore();

    // STATE: Only two things matter
    const [selectedRole, setSelectedRole] = useState<CelitRole | null>(null);
    const [faceUri, setFaceUri] = useState<string | null>(null);
    const [isAscending, setIsAscending] = useState(false);

    // ANIMATIONS
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const roleHighlight = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Pulse animation for the main button
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.02,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Glow effect
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0.3,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const handleRoleSelect = async (role: CelitRole) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelectedRole(role);

        // Animate highlight
        Animated.sequence([
            Animated.timing(roleHighlight, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(roleHighlight, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleFaceUpload = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setFaceUri(result.assets[0].uri);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    const handleTakeSelfie = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            cameraType: ImagePicker.CameraType.front,
        });

        if (!result.canceled && result.assets[0]) {
            setFaceUri(result.assets[0].uri);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    const handleBeginAscension = async () => {
        if (!selectedRole) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            return;
        }

        setIsAscending(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        // Navigate to generating screen with params
        router.push({
            pathname: '/(main)/generating',
            params: {
                role: selectedRole,
                faceUri: faceUri || '',
                dumbnessLevel: 7, // Default for v2.0
            },
        });
    };

    const canAscend = selectedRole !== null;
    const selectedRoleConfig = selectedRole
        ? CELIT_ROLES.find((r) => r.role === selectedRole)
        : null;

    return (
        <View className="flex-1 bg-background">
            {/* Background Glow Effect */}
            <Animated.View
                style={{
                    position: 'absolute',
                    top: -100,
                    left: -100,
                    right: -100,
                    height: 400,
                    opacity: glowAnim,
                }}
            >
                <LinearGradient
                    colors={['rgba(255,0,255,0.3)', 'transparent']}
                    style={{ flex: 1 }}
                />
            </Animated.View>

            {/* Header */}
            <View className="px-6 pt-16 pb-4">
                <Text className="text-5xl font-bold text-white tracking-tight">
                    SELECT YOUR
                </Text>
                <Text className="text-5xl font-bold text-primary tracking-tight">
                    POSITION
                </Text>

                <View className="bg-warning mt-4 px-4 py-2 self-start -rotate-1">
                    <Text className="text-black font-bold text-xs tracking-widest">
                        ⚠️ PSYCHOLOGICAL POWER ROLES ONLY
                    </Text>
                </View>
            </View>

            {/* Role Cards - Vertical Stack */}
            <View className="flex-1 px-6 py-4">
                {CELIT_ROLES.map((roleConfig, index) => (
                    <Pressable
                        key={roleConfig.role}
                        onPress={() => handleRoleSelect(roleConfig.role)}
                        className="mb-3"
                    >
                        <View
                            className={`rounded-xl overflow-hidden border-2 ${selectedRole === roleConfig.role
                                ? 'border-primary'
                                : 'border-surface'
                                }`}
                        >
                            <LinearGradient
                                colors={
                                    selectedRole === roleConfig.role
                                        ? ['#FF00FF20', '#00FFFF10']
                                        : ['#16161F', '#1E1E2A']
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="p-4 flex-row items-center"
                            >
                                {/* Role Icon */}
                                <View
                                    className={`w-14 h-14 rounded-xl justify-center items-center overflow-hidden ${selectedRole === roleConfig.role
                                        ? 'bg-primary'
                                        : 'bg-surface'
                                        }`}
                                >
                                    <Image
                                        source={roleConfig.image}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                </View>

                                {/* Role Info */}
                                <View className="flex-1 ml-4">
                                    <Text
                                        className={`font-bold text-lg ${selectedRole === roleConfig.role
                                            ? 'text-primary'
                                            : 'text-white'
                                            }`}
                                    >
                                        {roleConfig.label}
                                    </Text>
                                    <Text className="text-textMuted text-sm">
                                        {roleConfig.description}
                                    </Text>
                                </View>

                                {/* Selection Indicator */}
                                {selectedRole === roleConfig.role && (
                                    <View className="bg-primary px-3 py-1 rounded-full">
                                        <Text className="text-black font-bold text-xs">
                                            ✓
                                        </Text>
                                    </View>
                                )}
                            </LinearGradient>
                        </View>
                    </Pressable>
                ))}
            </View>

            {/* Face Upload Section (Optional but encouraged) */}
            <View className="px-6 pb-4">
                <View className="flex-row gap-3">
                    <Pressable
                        onPress={handleTakeSelfie}
                        className="flex-1 bg-surface border border-surfaceHover rounded-xl p-4 items-center"
                    >
                        {faceUri ? (
                            <Image
                                source={{ uri: faceUri }}
                                className="w-12 h-12 rounded-full"
                            />
                        ) : (
                            <Text className="text-3xl">📷</Text>
                        )}
                        <Text className="text-white text-sm mt-2 font-medium">
                            {faceUri ? 'Change Face' : 'Take Selfie'}
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={handleFaceUpload}
                        className="flex-1 bg-surface border border-surfaceHover rounded-xl p-4 items-center"
                    >
                        <Text className="text-3xl">🖼️</Text>
                        <Text className="text-white text-sm mt-2 font-medium">
                            Upload Photo
                        </Text>
                    </Pressable>
                </View>

                {!faceUri && (
                    <Text className="text-textMuted text-xs text-center mt-2">
                        Optional but encouraged — become the star
                    </Text>
                )}
            </View>

            {/* BEGIN ASCENSION Button */}
            <View className="px-6 pb-10">
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <Pressable
                        onPress={handleBeginAscension}
                        disabled={!canAscend || isAscending}
                        className="rounded-2xl overflow-hidden"
                    >
                        <LinearGradient
                            colors={
                                canAscend
                                    ? ['#FF00FF', '#00FFFF']
                                    : ['#333', '#222']
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="py-5 px-8"
                        >
                            <Text className="text-white text-center text-2xl font-bold tracking-widest">
                                {isAscending ? '⏳ ASCENDING...' : '🔮 BEGIN ASCENSION'}
                            </Text>
                            {selectedRoleConfig && (
                                <Text className="text-white/70 text-center text-sm mt-1">
                                    as {selectedRoleConfig.label}
                                </Text>
                            )}
                        </LinearGradient>
                    </Pressable>
                </Animated.View>

                {/* Viewer Implication - subtle */}
                <Text className="text-textMuted text-xs text-center mt-4 opacity-60">
                    By proceeding, you agree to the terms of your ascension.
                </Text>
            </View>
        </View>
    );
}
