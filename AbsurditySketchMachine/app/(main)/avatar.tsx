// ========================================
// AVATAR CAPTURE SCREEN - ABSURDITY AI SKETCH MACHINE
// ========================================
// Agent: Developer Amelia (EMDADF Phase 6)
// Story: STORY-015-022 - Avatar Capture Flow

import { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Image, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAvatar } from '../../hooks/useAvatar';
import { COLORS } from '../../lib/constants';

const { width, height } = Dimensions.get('window');

export default function AvatarScreen() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<any>(null);

    const {
        avatars,
        faceModelStatus,
        isUploading,
        uploadProgress,
        isAvatarReady,
        canCreateFaceModel,
        captureSelfie,
        pickFromGallery,
        uploadAvatarImage,
        createFaceModel,
    } = useAvatar();

    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [showCamera, setShowCamera] = useState(false);

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const overlayAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Pulse animation for capture button
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
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
    }, []);

    const handleCapture = async () => {
        const uri = await captureSelfie();
        if (uri) {
            setCapturedImages((prev) => [...prev, uri]);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    const handlePickFromGallery = async () => {
        const uri = await pickFromGallery();
        if (uri) {
            setCapturedImages((prev) => [...prev, uri]);
        }
    };

    const handleUploadAll = async () => {
        for (const uri of capturedImages) {
            await uploadAvatarImage(uri);
        }
        setCapturedImages([]);

        // Trigger face model creation
        if (canCreateFaceModel || avatars.length > 0) {
            await createFaceModel();
        }
    };

    const handleRemoveImage = (index: number) => {
        setCapturedImages((prev) => prev.filter((_, i) => i !== index));
    };

    // Permission not granted
    if (!permission) {
        return (
            <View className="flex-1 bg-background justify-center items-center px-6">
                <Text className="text-white text-xl text-center">
                    Loading camera...
                </Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View className="flex-1 bg-background justify-center items-center px-6">
                <Text className="text-6xl mb-4">📷</Text>
                <Text className="text-white text-2xl font-bold text-center mb-2">
                    Camera Access Required
                </Text>
                <Text className="text-textMuted text-center mb-8">
                    We need your camera to capture selfies for your AI avatar
                </Text>
                <Pressable
                    onPress={requestPermission}
                    className="bg-primary px-8 py-4 rounded-xl"
                >
                    <Text className="text-white font-bold text-lg">
                        Grant Camera Access
                    </Text>
                </Pressable>
            </View>
        );
    }

    // Already has avatar ready
    if (isAvatarReady && !showCamera) {
        return (
            <View className="flex-1 bg-background px-6 pt-16">
                <Text className="text-4xl font-bold text-white mb-2">
                    YOUR AVATAR
                </Text>
                <View className="bg-success/20 border border-success rounded-xl p-4 mb-8">
                    <Text className="text-success text-center font-bold">
                        ✅ Face model ready! You can create sketches.
                    </Text>
                </View>

                {/* Avatar Preview Grid */}
                <View className="flex-row flex-wrap gap-4 mb-8">
                    {avatars.map((avatar, index) => (
                        <View
                            key={avatar.id}
                            className="w-24 h-24 rounded-xl overflow-hidden border-2 border-primary"
                        >
                            <Image
                                source={{ uri: avatar.publicUrl }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        </View>
                    ))}
                </View>

                {/* Add More Button */}
                <Pressable
                    onPress={() => setShowCamera(true)}
                    className="bg-surface border border-accent rounded-xl p-4 mb-4"
                >
                    <Text className="text-accent text-center font-bold">
                        📸 Add More Photos
                    </Text>
                </Pressable>

                {/* Continue to Create */}
                <Pressable
                    onPress={() => router.push('/(main)/create')}
                    className="rounded-xl overflow-hidden"
                >
                    <LinearGradient
                        colors={['#FF00FF', '#00FFFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="py-5"
                    >
                        <Text className="text-white text-center text-xl font-bold">
                            🎬 START CREATING
                        </Text>
                    </LinearGradient>
                </Pressable>
            </View>
        );
    }

    // Face model processing
    if (faceModelStatus === 'processing') {
        return (
            <View className="flex-1 bg-background justify-center items-center px-6">
                <Animated.Text
                    style={{
                        transform: [{ scale: pulseAnim }],
                    }}
                    className="text-6xl mb-4"
                >
                    🧬
                </Animated.Text>
                <Text className="text-white text-2xl font-bold text-center mb-2">
                    Creating Your Face Model
                </Text>
                <Text className="text-textMuted text-center mb-8">
                    Our AI is learning your unique features...
                </Text>
                <View className="w-full bg-surface h-3 rounded-full overflow-hidden">
                    <Animated.View
                        className="bg-primary h-full"
                        style={{ width: '60%' }}
                    />
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View className="px-6 pt-16 pb-4 z-10">
                <Text className="text-3xl font-bold text-white mb-1">
                    CAPTURE YOUR FACE
                </Text>
                <Text className="text-textMuted">
                    Take 1-3 selfies to create your AI avatar
                </Text>

                {/* Tape Label */}
                <View className="bg-warning mt-4 px-4 py-2 self-start -rotate-1">
                    <Text className="text-black font-bold text-xs tracking-widest">
                        🎯 CENTER YOUR FACE
                    </Text>
                </View>
            </View>

            {/* Camera or Preview Area */}
            <View className="flex-1 mx-6 rounded-3xl overflow-hidden border-2 border-primary">
                {showCamera || capturedImages.length === 0 ? (
                    <CameraView
                        ref={cameraRef}
                        style={{ flex: 1 }}
                        facing="front"
                    >
                        {/* Face Alignment Overlay */}
                        <View className="flex-1 justify-center items-center">
                            <View
                                className="w-64 h-80 border-4 border-white/50 rounded-[100px]"
                                style={{
                                    borderStyle: 'dashed',
                                }}
                            />
                            <Text className="text-white/70 text-center mt-4 font-medium">
                                Position your face in the oval
                            </Text>
                        </View>

                        {/* Capture Button */}
                        <View className="absolute bottom-8 left-0 right-0 items-center">
                            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                                <Pressable
                                    onPress={handleCapture}
                                    disabled={isCapturing}
                                    className="w-20 h-20 rounded-full bg-white border-4 border-primary items-center justify-center"
                                >
                                    <View className="w-16 h-16 rounded-full bg-primary" />
                                </Pressable>
                            </Animated.View>
                        </View>
                    </CameraView>
                ) : (
                    // Preview captured images
                    <View className="flex-1 bg-surface">
                        <View className="flex-1 flex-row flex-wrap p-4 gap-4">
                            {capturedImages.map((uri, index) => (
                                <Pressable
                                    key={index}
                                    onPress={() => handleRemoveImage(index)}
                                    className="relative"
                                >
                                    <Image
                                        source={{ uri }}
                                        className="w-28 h-28 rounded-xl"
                                        resizeMode="cover"
                                    />
                                    <View className="absolute top-1 right-1 bg-error w-6 h-6 rounded-full items-center justify-center">
                                        <Text className="text-white text-xs">✕</Text>
                                    </View>
                                </Pressable>
                            ))}

                            {/* Add more button */}
                            {capturedImages.length < 3 && (
                                <Pressable
                                    onPress={() => setShowCamera(true)}
                                    className="w-28 h-28 rounded-xl bg-surfaceHover border-2 border-dashed border-textMuted items-center justify-center"
                                >
                                    <Text className="text-4xl">📷</Text>
                                    <Text className="text-textMuted text-xs mt-1">Add More</Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                )}
            </View>

            {/* Bottom Actions */}
            <View className="px-6 py-6">
                {/* Image count indicator */}
                <View className="flex-row justify-center gap-2 mb-4">
                    {[1, 2, 3].map((num) => (
                        <View
                            key={num}
                            className={`w-3 h-3 rounded-full ${capturedImages.length >= num ? 'bg-primary' : 'bg-surface'
                                }`}
                        />
                    ))}
                </View>

                {/* Pick from Gallery */}
                <Pressable
                    onPress={handlePickFromGallery}
                    className="bg-surface border border-surfaceHover py-4 rounded-xl mb-4"
                >
                    <Text className="text-white text-center font-bold">
                        🖼️ Pick from Gallery
                    </Text>
                </Pressable>

                {/* Upload & Create Avatar */}
                {capturedImages.length > 0 && (
                    <Pressable
                        onPress={handleUploadAll}
                        disabled={isUploading}
                        className="rounded-xl overflow-hidden"
                    >
                        <LinearGradient
                            colors={isUploading ? ['#333', '#222'] : ['#FF00FF', '#00FFFF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="py-5"
                        >
                            <Text className="text-white text-center text-xl font-bold">
                                {isUploading
                                    ? `⏳ Uploading... ${uploadProgress}%`
                                    : '🧬 CREATE MY AVATAR'}
                            </Text>
                        </LinearGradient>
                    </Pressable>
                )}
            </View>
        </View>
    );
}
