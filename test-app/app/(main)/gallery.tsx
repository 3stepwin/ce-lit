// ========================================
// GALLERY SCREEN - ABSURDITY AI SKETCH MACHINE
// ========================================
// Agent: Developer Amelia (EMDADF Phase 6)
// Story: STORY-043-048 - Gallery & History

import { useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    Pressable,
    FlatList,
    RefreshControl,
    Image,
    Animated,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSketch } from '../../hooks/useSketch';
import { COLORS } from '../../lib/constants';
import type { Sketch } from '../../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 16) / 2; // 2 columns with padding and gap

export default function GalleryScreen() {
    const router = useRouter();
    const { sketches, loadSketches } = useSketch();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadSketches();

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleRefresh = useCallback(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await loadSketches();
    }, [loadSketches]);

    const handleSketchPress = async (sketch: Sketch) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push(`/(main)/result?sketchId=${sketch.id}`);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const getTypeEmoji = (type: string) => {
        const emojis: Record<string, string> = {
            fake_commercial: '🎬',
            weekend_update: '📰',
            cult_rehearsal: '🕯️',
            weird_role: '🎭',
            random_stupid: '🎲',
        };
        return emojis[type] || '🎬';
    };

    const renderSketchCard = ({ item, index }: { item: Sketch; index: number }) => {
        const isLeftColumn = index % 2 === 0;

        return (
            <Pressable
                onPress={() => handleSketchPress(item)}
                style={{
                    width: CARD_WIDTH,
                    marginBottom: 16,
                    marginLeft: isLeftColumn ? 0 : 8,
                    marginRight: isLeftColumn ? 8 : 0,
                }}
                className="rounded-xl overflow-hidden bg-surface"
            >
                {/* Thumbnail */}
                <View
                    className="bg-surfaceHover justify-center items-center"
                    style={{ height: CARD_WIDTH * 1.5 }}
                >
                    {item.thumbnailUrl ? (
                        <Image
                            source={{ uri: item.thumbnailUrl }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="flex-1 justify-center items-center">
                            <Text className="text-5xl">{getTypeEmoji(item.sketchType)}</Text>
                        </View>
                    )}

                    {/* Status Badge */}
                    {item.status !== 'complete' && (
                        <View className="absolute top-2 right-2 bg-warning px-2 py-1 rounded">
                            <Text className="text-black text-xs font-bold">
                                {item.status === 'failed' ? '❌ Failed' : '⏳ Processing'}
                            </Text>
                        </View>
                    )}

                    {/* Duration Badge */}
                    {item.videoDuration && (
                        <View className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded">
                            <Text className="text-white text-xs">
                                {Math.floor(item.videoDuration / 60)}:{String(item.videoDuration % 60).padStart(2, '0')}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Info */}
                <View className="p-3">
                    <View className="flex-row items-center mb-1">
                        <Text className="text-lg mr-1">{getTypeEmoji(item.sketchType)}</Text>
                        <Text className="text-white font-bold text-sm flex-1" numberOfLines={1}>
                            {item.sketchType.replace('_', ' ').toUpperCase()}
                        </Text>
                    </View>
                    <Text className="text-textMuted text-xs">
                        {formatDate(item.createdAt)}
                    </Text>

                    {/* Stats */}
                    {(item.shareCount > 0 || item.saveCount > 0) && (
                        <View className="flex-row mt-2 gap-3">
                            {item.shareCount > 0 && (
                                <Text className="text-textSubtle text-xs">
                                    📤 {item.shareCount}
                                </Text>
                            )}
                            {item.saveCount > 0 && (
                                <Text className="text-textSubtle text-xs">
                                    💾 {item.saveCount}
                                </Text>
                            )}
                        </View>
                    )}
                </View>
            </Pressable>
        );
    };

    const renderEmptyState = () => (
        <View className="flex-1 justify-center items-center px-8">
            <Text className="text-6xl mb-4">📼</Text>
            <Text className="text-white text-2xl font-bold text-center mb-2">
                No Sketches Yet
            </Text>
            <Text className="text-textMuted text-center mb-8">
                Your cult legacy awaits... Create your first absurd masterpiece!
            </Text>

            <Pressable
                onPress={() => router.push('/(main)/create')}
                className="rounded-xl overflow-hidden"
            >
                <LinearGradient
                    colors={['#FF00FF', '#00FFFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="px-8 py-4"
                >
                    <Text className="text-white text-lg font-bold">
                        🎬 Create Your First Sketch
                    </Text>
                </LinearGradient>
            </Pressable>
        </View>
    );

    return (
        <Animated.View
            style={{ flex: 1, opacity: fadeAnim }}
            className="bg-background"
        >
            {/* Header */}
            <View className="px-6 pt-16 pb-4">
                <Text className="text-4xl font-bold text-white">
                    MY SKETCHES
                </Text>
                <View className="bg-primary mt-3 px-4 py-2 self-start -rotate-1">
                    <Text className="text-black font-bold text-xs tracking-widest">
                        📼 {sketches.length} TOTAL CREATIONS
                    </Text>
                </View>
            </View>

            {/* Gallery Grid */}
            <FlatList
                data={sketches}
                renderItem={renderSketchCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingBottom: 100,
                    flexGrow: 1,
                }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={false}
                        onRefresh={handleRefresh}
                        tintColor={COLORS.primary}
                    />
                }
                ListEmptyComponent={renderEmptyState}
            />
        </Animated.View>
    );
}
