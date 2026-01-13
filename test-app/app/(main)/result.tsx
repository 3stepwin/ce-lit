// ========================================
// RESULT SCREEN - ABSURDITY AI SKETCH MACHINE
// ========================================
// Agent: Developer Amelia (EMDADF Phase 6)
// Story: STORY-033-042 - Video Playback & Sharing

import { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    Pressable,
    Dimensions,
    ScrollView,
    Animated,
    Share,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';
import { useSketch } from '../../hooks/useSketch';
import { getCachedVideo } from '../../lib/storage';
import { SHARE_CAPTIONS, SHARE_HASHTAGS, COLORS } from '../../lib/constants';

const { width, height } = Dimensions.get('window');

export default function ResultScreen() {
    const router = useRouter();
    const { sketchId } = useLocalSearchParams<{ sketchId: string }>();
    const { getSketchById } = useSketch();

    const sketch = sketchId ? getSketchById(sketchId) : null;

    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [videoUri, setVideoUri] = useState<string | null>(null);

    const videoRef = useRef<Video>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const overlayAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Fade in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();

        // Load cached video or use URL
        loadVideo();
    }, []);

    const loadVideo = async () => {
        if (!sketch) return;

        // Try cached first, then fall back to URL
        const cached = await getCachedVideo(sketch.id);
        setVideoUri(cached || sketch.videoUrl || null);
    };

    const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            if (status.didJustFinish) {
                // Show punchline overlay at the end
                Animated.timing(overlayAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            }
        }
    };

    const togglePlay = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (isPlaying) {
            await videoRef.current?.pauseAsync();
        } else {
            await videoRef.current?.playAsync();
            // Hide overlay when resuming
            Animated.timing(overlayAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsMuted(!isMuted);
    };

    const handleShare = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        const randomCaption = SHARE_CAPTIONS[Math.floor(Math.random() * SHARE_CAPTIONS.length)];
        const hashtags = SHARE_HASHTAGS.join(' ');
        const message = `${randomCaption}\n\n${hashtags}`;

        try {
            if (videoUri && await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(videoUri, {
                    mimeType: 'video/mp4',
                    dialogTitle: 'Share your absurd creation',
                });
            } else {
                await Share.share({
                    message,
                    url: sketch?.videoUrl,
                });
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleSaveToGallery = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant gallery access to save videos');
                return;
            }

            if (videoUri) {
                await MediaLibrary.saveToLibraryAsync(videoUri);
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert('Saved! 📼', 'Video saved to your gallery');
            }
        } catch (error) {
            console.error('Error saving:', error);
            Alert.alert('Error', 'Failed to save video');
        }
    };

    const handleMakeAnother = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/(main)/create');
    };

    const handleOuttakeSelect = (index: number) => {
        setCurrentVideoIndex(index);
        // Reset video
        videoRef.current?.replayAsync();
        setIsPlaying(true);
        Animated.timing(overlayAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    if (!sketch) {
        return (
            <View className="flex-1 bg-background justify-center items-center">
                <Text className="text-white text-xl">Sketch not found</Text>
                <Pressable
                    onPress={() => router.push('/(main)/create')}
                    className="mt-4 bg-primary px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-bold">Create New</Text>
                </Pressable>
            </View>
        );
    }

    const allVideos = [
        { url: sketch.videoUrl, thumbnail: sketch.thumbnailUrl },
        ...sketch.outtakes,
    ];
    const currentVideo = allVideos[currentVideoIndex];

    return (
        <Animated.View
            style={{ flex: 1, opacity: fadeAnim }}
            className="bg-background"
        >
            {/* Full Screen Video */}
            <Pressable
                onPress={togglePlay}
                className="flex-1"
                style={{ height: height * 0.7 }}
            >
                <Video
                    ref={videoRef}
                    source={{ uri: currentVideo?.url || '' }}
                    style={{ flex: 1 }}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={isPlaying}
                    isLooping={false}
                    isMuted={isMuted}
                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                />

                {/* Meme Subtitles Overlay */}
                <View className="absolute bottom-20 left-4 right-4">
                    {sketch.dialogue && (
                        <Text
                            className="text-white text-2xl font-bold text-center"
                            style={{
                                textShadowColor: 'black',
                                textShadowOffset: { width: 2, height: 2 },
                                textShadowRadius: 4,
                            }}
                        >
                            {/* Would animate subtitles based on timing */}
                        </Text>
                    )}
                </View>

                {/* End Freeze-Frame Punchline Overlay */}
                <Animated.View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: overlayAnim,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <View className="bg-warning px-8 py-4 -rotate-3">
                        <Text className="text-black text-3xl font-bold text-center">
                            🎬 THE END
                        </Text>
                    </View>
                    <Text className="text-white text-lg mt-4 text-center px-8">
                        Tap to replay • Swipe for outtakes
                    </Text>
                </Animated.View>

                {/* Play/Pause Indicator */}
                {!isPlaying && (
                    <View className="absolute inset-0 justify-center items-center">
                        <View className="w-20 h-20 bg-white/30 rounded-full justify-center items-center">
                            <Text className="text-4xl">▶️</Text>
                        </View>
                    </View>
                )}

                {/* Top Controls */}
                <View className="absolute top-16 left-0 right-0 flex-row justify-between px-6">
                    <Pressable
                        onPress={() => router.back()}
                        className="bg-black/50 w-10 h-10 rounded-full justify-center items-center"
                    >
                        <Text className="text-white text-lg">✕</Text>
                    </Pressable>

                    <Pressable
                        onPress={toggleMute}
                        className="bg-black/50 w-10 h-10 rounded-full justify-center items-center"
                    >
                        <Text className="text-white text-lg">
                            {isMuted ? '🔇' : '🔊'}
                        </Text>
                    </Pressable>
                </View>
            </Pressable>

            {/* Bottom Section */}
            <View className="bg-surface rounded-t-3xl -mt-6 px-6 pt-6 pb-8">
                {/* Outtakes Carousel */}
                {allVideos.length > 1 && (
                    <View className="mb-6">
                        <Text className="text-textMuted text-sm mb-3 tracking-widest">
              // OUTTAKES
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 12 }}
                        >
                            {allVideos.map((video, index) => (
                                <Pressable
                                    key={index}
                                    onPress={() => handleOuttakeSelect(index)}
                                    className={`w-20 h-28 rounded-xl overflow-hidden border-2 ${currentVideoIndex === index
                                            ? 'border-primary'
                                            : 'border-surfaceHover'
                                        }`}
                                >
                                    <View className="flex-1 bg-surfaceHover justify-center items-center">
                                        <Text className="text-3xl">
                                            {index === 0 ? '🎬' : '🎭'}
                                        </Text>
                                        <Text className="text-textMuted text-xs mt-1">
                                            {index === 0 ? 'Main' : `Take ${index}`}
                                        </Text>
                                    </View>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Action Buttons */}
                <View className="flex-row gap-4">
                    {/* Share Button */}
                    <Pressable
                        onPress={handleShare}
                        className="flex-1 rounded-xl overflow-hidden"
                    >
                        <LinearGradient
                            colors={['#FF00FF', '#00FFFF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="py-4"
                        >
                            <Text className="text-white text-center text-lg font-bold">
                                📤 SHARE
                            </Text>
                        </LinearGradient>
                    </Pressable>

                    {/* Save Button */}
                    <Pressable
                        onPress={handleSaveToGallery}
                        className="flex-1 bg-surface border border-accent py-4 rounded-xl"
                    >
                        <Text className="text-accent text-center text-lg font-bold">
                            💾 SAVE
                        </Text>
                    </Pressable>
                </View>

                {/* Make Another */}
                <Pressable
                    onPress={handleMakeAnother}
                    className="mt-4 py-4"
                >
                    <Text className="text-textMuted text-center text-base">
                        🎲 Make Another Absurdity
                    </Text>
                </Pressable>
            </View>
        </Animated.View>
    );
}
