// ========================================
// FINAL STATE - CULT ENGINE REALITY
// ========================================
// Screen 6 of 6 - authoritative flow
// Aesthetic: Release Record / Evidence Artifact

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Dimensions,
    ScrollView,
    Animated,
    Share,
    StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../lib/constants';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabase';

const { width, height } = Dimensions.get('window');

export default function ViralResultScreen() {
    const router = useRouter();
    const { jobId } = useLocalSearchParams<{ jobId: string }>(); // Use jobId
    const { setRealityVectors, setCurrentSketch, updateGenerationStatus } = useAppStore();

    // Local state for direct fetching
    const [jobData, setJobData] = useState<any>(null); // Raw celit_jobs row
    const [loading, setLoading] = useState(true);

    const sketch = {
        videoUrl: jobData?.result_video_url,
        // Mimic other fields if needed, or use jobData directly
    };
    const content = jobData?.content;
    const verdict = jobData?.screenshot_frame_text || content?.screenshot_frame_text || "THE RECORD IS LOCKED.";

    // Fetch from celit_jobs on mount
    useEffect(() => {
        const fetchJob = async () => {
            if (!jobId) return;
            const { data, error } = await supabase
                .from('celit_jobs')
                .select('*')
                .eq('id', jobId)
                .single();

            if (data) {
                setJobData(data);
            }
            setLoading(false);
        };
        fetchJob();
    }, [jobId]);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const punchlineAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();

        // Delay punchline appearance for dramatic effect
        setTimeout(() => {
            Animated.spring(punchlineAnim, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true
            }).start();
        }, 2000);
    }, []);

    const handleShare = async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        try {
            if (sketch?.videoUrl) {
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(sketch.videoUrl, {
                        dialogTitle: content?.caption_pack?.[0] || "CE LIT // PROOF_ARTIFACT"
                    });
                } else {
                    await Share.share({
                        message: `${content?.caption_pack?.[0] || 'Verification required.'}\n\n${sketch.videoUrl}`
                    });
                }
            }
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const handleDownload = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // On mobile, the share sheet usually contains "Save Video" 
        handleShare();
    };

    const handleRunAgain = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setRealityVectors([]); // Clear selection to force user to choose again
        setCurrentSketch(null); // Clear current sketch context
        updateGenerationStatus('pending', 0); // Reset status
        router.replace('/system-threshold');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Animated.View style={[styles.main, { opacity: fadeAnim }]}>

                    {/* Header Protocol Tag */}
                    <View style={styles.header}>
                        <View style={styles.badge}>
                            <View style={styles.liveDot} />
                            <Text style={styles.badgeText}>ARTIFACT_LIVE</Text>
                        </View>
                        <Text style={styles.idStamp}>ID: {jobId?.slice(0, 8).toUpperCase()}</Text>
                    </View>

                    {/* Main Video Port */}
                    <View style={styles.videoPort}>
                        <Video
                            source={{ uri: sketch?.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' }}
                            style={styles.video}
                            resizeMode={ResizeMode.COVER}
                            shouldPlay
                            isLooping
                        />

                        {/* Punchline Overlay (The Verdict) */}
                        <Animated.View style={[
                            styles.punchlineOverlay,
                            {
                                opacity: punchlineAnim,
                                transform: [{ scale: punchlineAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }]
                            }
                        ]}>
                            <View style={styles.punchlineBox}>
                                <Text style={styles.punchlineText}>
                                    "{content?.screenshot_frame_text || 'THE RECORD IS LOCKED.'}"
                                </Text>
                            </View>
                        </Animated.View>

                        {/* Scan UI Lines */}
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>

                    {/* Outtakes / Caption Bank */}
                    <View style={styles.outtakesSection}>
                        <Text style={styles.sectionLabel}>// VIRAL_OUTTAKES</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.outtakesList}>
                            {(content?.outtakes || [{ hook: 'Exit blocked.' }, { hook: 'Refund denied.' }]).map((ot: any, i: number) => (
                                <View key={i} style={styles.outtakeCard}>
                                    <Text style={styles.outtakeText}>"{ot.hook}"</Text>
                                    <Text style={styles.outtakeLabel}>REJECTED_OUTCOME</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Action Hub */}
                    <View style={styles.actions}>
                        <Pressable onPress={handleShare} style={styles.primaryBtn}>
                            <Text style={styles.primaryBtnText}>SHARE PROOF</Text>
                        </Pressable>

                        <Pressable onPress={handleDownload} style={styles.secondaryBtn}>
                            <Text style={styles.secondaryBtnText}>DOWNLOAD ARTIFACT</Text>
                        </Pressable>

                        <Pressable onPress={handleRunAgain} style={styles.terminalBtn}>
                            <Text style={styles.terminalBtnText}>RUN AGAIN</Text>
                        </Pressable>
                    </View>

                </Animated.View>
            </ScrollView>

            {/* Evidence Disclaimer */}
            <View style={styles.disclaimer}>
                <Text style={styles.disclaimerText}>ARTIFACTS ARE PROPERTY OF THE INSTITUTION.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.void,
    },
    scrollContent: {
        padding: 24,
        paddingTop: 60,
        paddingBottom: 120,
    },
    main: {
        gap: 32,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(147, 200, 147, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: 'rgba(147, 200, 147, 0.3)',
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.institutional,
    },
    badgeText: {
        color: COLORS.institutional,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    idStamp: {
        color: COLORS.bone,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
        opacity: 0.4,
    },
    videoPort: {
        width: '100%',
        aspectRatio: 9 / 16,
        backgroundColor: '#000',
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    video: {
        flex: 1,
    },
    punchlineOverlay: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    punchlineBox: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        padding: 20,
        borderWidth: 1,
        borderColor: `${COLORS.institutional}60`,
        width: '100%',
    },
    punchlineText: {
        color: COLORS.institutional,
        fontSize: 18,
        fontWeight: '900',
        textAlign: 'center',
        fontFamily: 'monospace',
        letterSpacing: -1,
        textTransform: 'uppercase',
    },
    outtakesSection: {
        gap: 12,
    },
    sectionLabel: {
        color: COLORS.bone,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
        opacity: 0.5,
    },
    outtakesList: {
        paddingVertical: 8,
    },
    outtakeCard: {
        width: 160,
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginRight: 12,
        justifyContent: 'space-between',
        minHeight: 120,
    },
    outtakeText: {
        color: COLORS.bone,
        fontSize: 12,
        fontWeight: '500',
        fontStyle: 'italic',
        lineHeight: 18,
    },
    outtakeLabel: {
        color: COLORS.institutional,
        fontSize: 8,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginTop: 12,
    },
    actions: {
        gap: 16,
        marginTop: 8,
    },
    primaryBtn: {
        backgroundColor: COLORS.institutional, // Sharing the proof is the primary institutional action
        paddingVertical: 20,
        alignItems: 'center',
        borderRadius: 2,
    },
    primaryBtnText: {
        color: COLORS.void,
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 4,
    },
    secondaryBtn: {
        borderWidth: 1,
        borderColor: 'rgba(226, 218, 196, 0.3)',
        paddingVertical: 18,
        alignItems: 'center',
    },
    secondaryBtnText: {
        color: COLORS.bone,
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 2,
        opacity: 0.8,
    },
    terminalBtn: {
        paddingVertical: 12,
        alignItems: 'center',
        opacity: 0.4,
    },
    terminalBtnText: {
        color: COLORS.bone,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    disclaimer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
        opacity: 0.2,
    },
    disclaimerText: {
        color: COLORS.bone,
        fontSize: 8,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    corner: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderColor: COLORS.bone,
        opacity: 0.3,
    },
    topLeft: { top: 10, left: 10, borderTopWidth: 1, borderLeftWidth: 1 },
    topRight: { top: 10, right: 10, borderTopWidth: 1, borderRightWidth: 1 },
    bottomLeft: { bottom: 10, left: 10, borderBottomWidth: 1, borderLeftWidth: 1 },
    bottomRight: { bottom: 10, right: 10, borderBottomWidth: 1, borderRightWidth: 1 },
});
