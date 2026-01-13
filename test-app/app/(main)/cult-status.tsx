// ========================================
// CULT STATUS SCREEN
// ========================================
// Agent: Developer Amelia
// Purpose: Visualize the Asset Orchestration Pipeline

import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, Image, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { THEME } from '../../constants/theme';

// Type definitions for our data
type Shot = {
    id: string;
    sequence_index: number;
    visual_prompt: string;
    status: 'pending' | 't2i_processing' | 'i2v_pending' | 'i2v_processing' | 'done' | 'failed';
    assets: {
        t2i_url?: string;
        video_url?: string;
    };
};

type Script = {
    id: string;
    topic: string;
    script_text: string;
    status: string;
};

export default function CultStatusScreen() {
    const { scriptId } = useLocalSearchParams();
    const router = useRouter();
    const [script, setScript] = useState<Script | null>(null);
    const [shots, setShots] = useState<Shot[]>([]);
    const [loading, setLoading] = useState(true);

    // Polling Logic
    useEffect(() => {
        if (!scriptId) return;

        const fetchStatus = async () => {
            // Get Script
            const { data: s } = await supabase
                .from('scripts')
                .select('*')
                .eq('id', scriptId)
                .single();
            if (s) setScript(s);

            // Get Shots (Ordered)
            const { data: sh } = await supabase
                .from('shots')
                .select('*')
                .eq('script_id', scriptId)
                .order('sequence_index', { ascending: true });
            if (sh) setShots(sh as Shot[]);

            setLoading(false);
        };

        fetchStatus();

        // Poll every 3 seconds
        const interval = setInterval(fetchStatus, 3000);
        return () => clearInterval(interval);
    }, [scriptId]);

    // Computed Progress
    const total = shots.length;
    const completed = shots.filter(s => s.status === 'done').length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    const isFinished = progress === 100 && total > 0;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'done': return THEME.colors.success;
            case 'failed': return THEME.colors.error;
            case 'pending': return THEME.colors.textMuted;
            default: return '#f59e0b'; // amber
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'done': return '✅';
            case 'failed': return '❌';
            case 'pending': return '⏳';
            case 't2i_processing': return '🎨';
            case 'i2v_pending': return '🖼️'; // Image ready, waiting for video
            case 'i2v_processing': return '🎬';
            default: return '...';
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0f1117', '#000000']}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {/* Header Metadata */}
                <View style={styles.headerMeta}>
                    <Text style={styles.headerLabel}>ORCHESTRATION STATUS</Text>
                    <View style={styles.headerBar} />
                </View>

                {script ? (
                    <View style={styles.header}>
                        <Text style={styles.topic}>{script.topic}</Text>
                        <Text style={styles.scriptText} numberOfLines={3}>
                            {script.script_text}
                        </Text>
                    </View>
                ) : (
                    <ActivityIndicator color={THEME.colors.primary} style={styles.loader} />
                )}

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBg}>
                        <View
                            style={[styles.progressBarFill, { width: `${progress}%` }]}
                        />
                    </View>
                    <View style={styles.progressTextContainer}>
                        <Text style={styles.progressLabel}>
                            {completed} / {total} APPARITIONS MANIFESTED
                        </Text>
                        <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
                    </View>
                </View>

                {/* Shot List */}
                <View style={styles.shotList}>
                    {shots.map((shot) => (
                        <View key={shot.id} style={styles.shotCard}>
                            {/* Thumbnail or Placeholder */}
                            <View style={styles.thumbnailContainer}>
                                {shot.assets?.t2i_url ? (
                                    <Image
                                        source={{ uri: shot.assets.t2i_url }}
                                        style={styles.thumbnail}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <Text style={styles.thumbnailPlaceholder}>👁️</Text>
                                )}
                            </View>

                            {/* Details */}
                            <View style={styles.shotDetails}>
                                <View style={styles.shotHeader}>
                                    <Text style={styles.shotIndex}>
                                        SHOT {shot.sequence_index + 1}
                                    </Text>
                                    <Text style={[styles.shotStatus, { color: getStatusColor(shot.status) }]}>
                                        {shot.status.toUpperCase()}
                                    </Text>
                                </View>
                                <Text style={styles.shotPrompt} numberOfLines={2}>
                                    {shot.visual_prompt}
                                </Text>
                            </View>

                            {/* Icon Status */}
                            <View style={styles.shotIconContainer}>
                                <Text style={styles.shotIcon}>{getStatusIcon(shot.status)}</Text>
                            </View>
                        </View>
                    ))}

                    {shots.length === 0 && !loading && (
                        <Text style={styles.emptyText}>
                            Waiting for the oracle...
                        </Text>
                    )}
                </View>
            </ScrollView>

            {/* Bottom Action */}
            {isFinished && (
                <View style={styles.footer}>
                    <Pressable
                        onPress={() => router.push(`/(main)/result?scriptId=${scriptId}`)}
                        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                    >
                        <Text style={styles.buttonText}>
                            VIEW FINAL RITUAL
                        </Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 64,
        paddingBottom: 100,
    },
    headerMeta: {
        marginBottom: 16,
    },
    headerLabel: {
        color: THEME.colors.primary,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 4,
    },
    headerBar: {
        height: 1,
        backgroundColor: THEME.colors.primary,
        opacity: 0.3,
        marginTop: 4,
        width: 40,
    },
    header: {
        marginBottom: 32,
    },
    topic: {
        color: THEME.colors.bone,
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    scriptText: {
        color: 'rgba(229, 229, 229, 0.5)',
        fontSize: 14,
        lineHeight: 20,
    },
    loader: {
        marginBottom: 32,
    },
    progressBarContainer: {
        marginBottom: 40,
    },
    progressBarBg: {
        height: 4,
        backgroundColor: 'rgba(229, 229, 229, 0.05)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: THEME.colors.primary,
    },
    progressTextContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    progressLabel: {
        color: 'rgba(229, 229, 229, 0.3)',
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    progressPercent: {
        color: THEME.colors.primary,
        fontSize: 10,
        fontWeight: '900',
    },
    shotList: {
        gap: 12,
    },
    shotCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 4,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    thumbnailContainer: {
        width: 56,
        height: 56,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 2,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    thumbnailPlaceholder: {
        fontSize: 20,
        opacity: 0.2,
    },
    shotDetails: {
        flex: 1,
    },
    shotHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    shotIndex: {
        color: 'rgba(229, 229, 229, 0.4)',
        fontSize: 10,
        fontWeight: 'bold',
    },
    shotStatus: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1,
    },
    shotPrompt: {
        color: 'rgba(229, 229, 229, 0.6)',
        fontSize: 12,
        lineHeight: 16,
    },
    shotIconContainer: {
        marginLeft: 12,
    },
    shotIcon: {
        fontSize: 16,
    },
    emptyText: {
        color: 'rgba(229, 229, 229, 0.2)',
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: 40,
        fontSize: 12,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    button: {
        backgroundColor: THEME.colors.primary,
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 4,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonText: {
        color: THEME.colors.bone,
        fontWeight: '900',
        fontSize: 14,
        letterSpacing: 2,
    },
});
