// ========================================
// VIRAL RESULT SCREEN - CELIT VIRAL SYSTEM
// ========================================
import { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Dimensions, ScrollView, Animated, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useSketch } from '../../hooks/useSketch';
import { VIRAL_SHARE_COPY, SCREENSHOT_MOMENTS } from '../../types/celit';

const { height } = Dimensions.get('window');

export default function ViralResultScreen() {
    const router = useRouter();
    const { sketchId } = useLocalSearchParams<{ sketchId: string }>();
    const { getSketchById } = useSketch();
    const sketch = sketchId ? getSketchById(sketchId) : null;
    const content = sketch?.content as any;

    const [isPlaying, setIsPlaying] = useState(true);
    const [selectedShareCopy, setSelectedShareCopy] = useState(content?.caption_pack?.[0] || VIRAL_SHARE_COPY[0]);
    const [showDeletedLine, setShowDeletedLine] = useState(false);
    const [timeLeft, setTimeLeft] = useState(content?.runtime_target_sec ? content.runtime_target_sec * 10 : 3600); // Psychological countdown

    const videoRef = useRef<Video>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const implicationAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
        // Trigger implication banner slightly after load
        setTimeout(() => {
            Animated.spring(implicationAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }).start();
        }, 2000);

        // Psychological Retention Timer
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
            videoRef.current?.replayAsync();
        }
    };

    const handleShare = async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        try {
            if (sketch?.videoUrl && (await Sharing.isAvailableAsync())) {
                await Sharing.shareAsync(sketch.videoUrl, { dialogTitle: selectedShareCopy });
            } else {
                await Share.share({ message: `${selectedShareCopy}\n\n${sketch?.videoUrl}` });
            }
        } catch (error) { console.error('Share error:', error); }
    };

    const handleCopyDeletedLine = async () => {
        if (content?.deleted_line) {
            await Clipboard.setStringAsync(content.deleted_line);
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowDeletedLine(true);
            setTimeout(() => setShowDeletedLine(false), 3000);
        }
    };

    const aestheticLabels: Record<string, string> = {
        prestige_clean: 'PRESTIGE CLEAN // 4K',
        corporate_dystopia: 'CORPORATE DYSTOPIA // CCT',
        analog_rot: 'ANALOG ROT // VHS',
        liminal_dream: 'LIMINAL DREAM // VOID',
    };

    return (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }} className="bg-background">
            <ScrollView className="flex-1" stickyHeaderIndices={[0]}>
                {/* Header Artifact Tag */}
                <View className="bg-background/80 pt-12 pb-2 px-6 backdrop-blur-md border-b border-surface/30 flex-row justify-between items-center z-50">
                    <Text className="text-textMuted font-mono text-[10px] tracking-widest uppercase">
                        {aestheticLabels[content?.aesthetic_preset] || 'CELIT ARCHIVE // LOCKED'}
                    </Text>
                    <Pressable onPress={() => router.back()} className="w-8 h-8 rounded-full items-center justify-center bg-surface">
                        <Text className="text-white text-xs">✕</Text>
                    </Pressable>
                </View>

                {/* Main Video Port */}
                <Pressable onPress={() => { videoRef.current?.replayAsync(); setIsPlaying(true); }} style={{ height: height * 0.5 }} className="relative bg-black">
                    <Video
                        ref={videoRef}
                        source={{ uri: sketch?.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' }}
                        style={{ flex: 1 }}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay={isPlaying}
                        isLooping={true}
                        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                    />

                    {/* Proof Artifact Overlay (Screenshot Moment) */}
                    <View className="absolute bottom-6 left-4 right-4 items-center">
                        <View className="bg-black/90 p-4 border border-primary/50 shadow-glow">
                            <Text className="text-primary text-xl font-black uppercase tracking-tighter text-center" style={{ fontFamily: 'monospace' }}>
                                "{content?.screenshot_frame_text || 'YOU ALREADY AGREED.'}"
                            </Text>
                            <Text className="text-primary/40 text-[8px] text-center mt-1 tracking-widest font-mono">PROOF_ARTIFACT_ID: {sketchId?.slice(0, 8).toUpperCase()}</Text>
                        </View>
                    </View>

                    {/* Artifact Watermark (Purple Cow #1) */}
                    <View className="absolute top-4 right-4 opacity-50 pointer-events-none">
                        <Text className="text-white/20 text-[8px] font-mono tracking-widest rotate-90 origin-top-right">
                            OFFICIAL ARCHIVE // {sketchId?.slice(0, 6).toUpperCase()}
                        </Text>
                    </View>
                </Pressable>

                {/* Psychology Stack UI */}
                <View className="px-6 py-6 pb-20">
                    {/* Enrollment Banner */}
                    <Animated.View style={{
                        opacity: implicationAnim,
                        transform: [{ translateY: implicationAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
                    }}
                        className="bg-primary/10 border-l-4 border-primary p-4 mb-6">
                        <Text className="text-primary font-bold text-lg">ENROLLMENT CONFIRMED</Text>
                        <Text className="text-white/70 text-sm mt-1">Viewing constitutes acceptance of the new terms. Your participation has been documented for the 2026 record.</Text>

                        {/* Psychological Retention Countdown (Purple Cow #3) */}
                        <View className="mt-3 bg-black/40 p-2 rounded flex-row items-center justify-between">
                            <Text className="text-white/50 text-[10px] uppercase tracking-widest">Mandatory Renewal In:</Text>
                            <Text className="text-warning font-mono text-xs font-bold">{formatTime(timeLeft)}</Text>
                        </View>
                    </Animated.View>

                    {/* Viral Trinity Section: Outtakes */}
                    <Text className="text-textMuted text-[10px] font-mono mb-3 tracking-widest uppercase">// VIRAL TRINITY: OUTTAKES (ALGO-AMMO)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 overflow-visible">
                        {(content?.outtakes || [{ hook: 'Refund requested.' }, { hook: 'Exit blocked.' }]).map((ot: any, i: number) => (
                            <Pressable
                                key={i}
                                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                                className="w-40 mr-4 aspect-[9/16] bg-surface rounded-xl overflow-hidden border border-white/10 items-center justify-center p-4"
                            >
                                <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']} className="absolute inset-0 z-10" />
                                <Text className="text-white font-bold text-center text-xs z-20">"{ot.hook}"</Text>
                                <View className="absolute bottom-3 left-3 bg-primary px-2 py-0.5 rounded-full z-20">
                                    <Text className="text-black text-[8px] font-bold">OUTTAKE</Text>
                                </View>
                            </Pressable>
                        ))}
                    </ScrollView>

                    {/* Share Accelerants */}
                    <Text className="text-textMuted text-[10px] font-mono mb-3 tracking-widest uppercase">// CAPTION PACK</Text>
                    <View className="flex-row flex-wrap gap-2 mb-8">
                        {(content?.caption_pack || VIRAL_SHARE_COPY).map((copy: string, i: number) => (
                            <Pressable
                                key={i}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setSelectedShareCopy(copy);
                                }}
                                className={`px-4 py-2 rounded-full border ${selectedShareCopy === copy ? 'bg-primary border-primary' : 'bg-surface border-white/10'}`}
                            >
                                <Text className={`text-xs font-medium ${selectedShareCopy === copy ? 'text-black' : 'text-white'}`}>"{copy}"</Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Secret Weapon: Deleted Line */}
                    <Text className="text-textMuted text-[10px] font-mono mb-3 tracking-widest uppercase">// SECRET WEAPON (COMMENT FUEL)</Text>
                    <Pressable
                        onPress={handleCopyDeletedLine}
                        className="bg-surface border-2 border-dashed border-white/20 p-4 rounded-xl items-center"
                    >
                        <Text className="text-white/40 text-[10px] text-center mb-1 uppercase">Copy "Deleted Line" to fuel the comments section:</Text>
                        <Text className="text-white font-mono text-center italic text-sm" numberOfLines={1}>
                            {showDeletedLine ? "ARTIFACT COPIED TO CLIPBOARD" : `"${content?.deleted_line || 'Escalation is not recommended.'}"`}
                        </Text>
                    </Pressable>

                    {/* Global Execution Button */}
                    <Pressable onPress={handleShare} className="mt-10 rounded-2xl overflow-hidden shadow-glow">
                        <LinearGradient colors={['#FF00FF', '#00FFFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="py-5">
                            <Text className="text-white text-center text-xl font-black uppercase tracking-widest">PUBLISH TO TIMELINE</Text>
                        </LinearGradient>
                    </Pressable>

                    <Text className="text-textMuted text-[8px] text-center mt-8 font-mono opacity-30">
                        OFFICIAL RELEASE // NON-REFUNDABLE // YOU ARE NOT THE FIRST.
                    </Text>
                </View>
            </ScrollView>
        </Animated.View>
    );
}
