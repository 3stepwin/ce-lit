// ========================================
// SYSTEM ASSEMBLY - CULT ENGINE REALITY
// ========================================
// Screen 5 of 6 - authoritative flow
// Aesthetic: Live Generation / Institutional Proof

import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    ActivityIndicator,
    StatusBar,
    ScrollView,
    Alert,
    Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../lib/constants';
import { useAppStore } from '../../store/useAppStore';
import { callGenerateSketch, getCurrentUser, createSketch, supabase, signInAsGuest } from '../../lib/supabase';
import { useSketchStatusRealtime } from '../../hooks/useRealtime';

const { width } = Dimensions.get('window');

const ASSEMBLY_LOGS = [
    "VECTORLOCK :: ACTIVE",
    "IMAGE_PACKET :: SOURCING",
    "VIDEO_PACKET :: SOURCING",
    "CONTENT_SHARES :: ACQUIRING",
    "SCENE_SPEC :: RESOLVED",
    "HIGGS_LANE :: OPENING",
    "ARTIFACT :: PREPARING"
];

const PROGRESS_STAGES = [
    "INDEXING",
    "ASSEMBLING",
    "RENDERING",
    "IMPRINTING"
];

export default function SystemAssemblyScreen() {
    const router = useRouter();
    const {
        currentSketchId,
        setCurrentSketch,
        realityVectors,
        selectedAvatarId,
        updateGenerationStatus,
        generationProgress,
        addSketch
    } = useAppStore();

    const [logs, setLogs] = useState<string[]>([]);
    const [isDelayed, setIsDelayed] = useState(false);
    const [stageIndex, setStageIndex] = useState(0);
    const pollIntervalRef = useRef<any>(null);
    const timeoutTimerRef = useRef<any>(null);
    const stageIndexChangeRef = useRef(0);
    const tapCountRef = useRef(0);
    const hasStartedRef = useRef(false);
    const missingRecordCountRef = useRef(0);

    // Animations
    const progressWidth = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const startGeneration = async () => {
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;
        setIsDelayed(false);
        missingRecordCountRef.current = 0;

        // Mobile-safe VALID UUID generation
        const newJobId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        console.log("SYSCALL :: INITIALIZING ACTIVE MODE", { newJobId, realityVectors });

        // UI Feedback
        updateGenerationStatus('generating' as any, 10);
        setCurrentSketch(newJobId);

        try {
            // 1. Get User or create Guest Session
            let { user } = await getCurrentUser();
            if (!user) {
                console.log("SYSCALL :: NO SESSION :: INITIATING GUEST AUTH");
                const { data: guestData } = await signInAsGuest();
                user = guestData?.user;
            }

            const userId = user?.id || `guest_${Date.now()}`;

            // 2. Start Polling IMMEDIATELY (Backend will create the row)
            console.log("SYSCALL :: STARTING POLLING");
            pollStatus(newJobId);

            // 3. Fire the Backend Command (Service Role will handle DB creation)
            console.log("SYSCALL :: FIRING BACKEND (CINEMA LANE)");
            callGenerateSketch(
                userId,
                selectedAvatarId || "generic",
                {
                    type: 'celit_viral' as any,
                    reality_vectors: realityVectors,
                    premise: "",
                    role: "MAIN_PERFORMER",
                    cinema_lane: true // FORCE ACTIVE
                },
                newJobId
            ).then(res => {
                console.log("SYSCALL :: BACKEND RESPONSE RECEIVED", res);
                if (res?.error) {
                    console.error("SYSCALL :: BACKEND ERROR", res.error);
                }
            }).catch(e => {
                console.error("SYSCALL :: UNEXPECTED CRASH", e);
            });

        } catch (e) {
            console.error("SYSCALL :: STARTUP FAILURE", e);
            Alert.alert("System Breach", "The generation sequence was interrupted.");
            hasStartedRef.current = false;
        }
    };

    const pollStatus = async (sketchId: string) => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

        pollIntervalRef.current = setInterval(async () => {
            // POLL CELIT_JOBS: Single Source of Truth for Demo
            const { data, error } = await supabase
                .from('celit_jobs')
                .select('*')
                .eq('id', sketchId)
                .single();

            if (error) {
                console.error("POLLING ERROR :: CONNECTION INTERRUPTED", error);
                return;
            }

            if (!data) {
                missingRecordCountRef.current += 1;
                console.warn(`POLLING :: RECORD NOT FOUND (${missingRecordCountRef.current})`);

                // Allow up to 10 seconds for the backend to create the row
                if (missingRecordCountRef.current > 5) {
                    console.error("POLLING ERROR :: RECORD NEVER CREATED");
                    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                    pollIntervalRef.current = null;
                    handleRetry();
                }
                return;
            }

            // Record found! Reset missing count
            missingRecordCountRef.current = 0;

            // Update UI progress (fake it if celit_jobs doesn't have progress, or use status to guess)
            if (data.status === 'succeed') {
                updateGenerationStatus('complete' as any, 100);
            } else if (data.status === 'failed') {
                updateGenerationStatus('failed' as any, 0);
            } else {
                // Fake progress for pending state since celit_jobs might not have granular progress
                updateGenerationStatus('generating' as any, 50);
            }

            // STOP CONDITION: success
            if (data.status === 'succeed' && data.result_video_url) {
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                // Navigate with jobId to force fetch from celit_jobs on result screen
                router.replace(`/(main)/viral-result?jobId=${sketchId}`);
            }
            // STOP CONDITION: failure
            else if (data.status === 'failed') {
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
                Alert.alert("Generation Failed", "Attempt Limit Reached.");
                router.replace('/');
            }

        }, 2000); // 2 seconds
    };

    // Retry Logic
    const handleRetry = () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
        pollIntervalRef.current = null;
        timeoutTimerRef.current = null;

        setIsDelayed(false);
        hasStartedRef.current = false; // Reset lock
        setStageIndex(0);
        setLogs([]);
        startGeneration();
    };

    const handleReset = () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
        router.replace('/');
    };

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();

        // 0. Stale Session Validation
        const validateSession = async () => {
            if (currentSketchId) {
                console.log("SESSION :: VALIDATING EXISTING JOB", currentSketchId);
                const { data, error } = await supabase.from('celit_jobs').select('id').eq('id', currentSketchId).single();
                if (error || !data) {
                    console.warn("SESSION :: STALE JOB DETECTED :: CLEARING");
                    setCurrentSketch(null);
                    startGeneration(); // Start fresh
                } else {
                    console.log("SESSION :: RESUMING EXISTING JOB");
                    pollStatus(currentSketchId); // Resume polling
                }
            } else {
                startGeneration();
            }
        };

        validateSession();

        // Theatrical Log Sequence
        let logIndex = 0;
        const logSequence = setInterval(() => {
            if (logIndex < ASSEMBLY_LOGS.length) {
                setLogs(prev => [...prev.slice(-6), ASSEMBLY_LOGS[logIndex]]);
                logIndex++;
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } else {
                clearInterval(logSequence);
            }
        }, 1500);

        // Fake Stage Progress
        const stageSequence = setInterval(() => {
            setStageIndex(prev => (prev < PROGRESS_STAGES.length - 1 ? prev + 1 : prev));
        }, 5000);

        // Demo Timeout - 90s
        timeoutTimerRef.current = setTimeout(() => {
            setIsDelayed(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }, 90000);

        return () => {
            clearInterval(logSequence);
            clearInterval(stageSequence);
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
        };
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* Visual Status */}
                <View style={styles.topSection}>
                    <Pressable onPress={() => {
                        // Hidden Reset: 3 taps within 2 seconds to force clear and restart
                        tapCountRef.current += 1;
                        if (tapCountRef.current >= 3) {
                            tapCountRef.current = 0;
                            handleRetry();
                        }
                        // Auto-reset tap count after a delay
                        setTimeout(() => { tapCountRef.current = 0; }, 2000);
                    }}>
                        <Text style={[styles.assemblyTitle, isDelayed && { color: COLORS.warning, fontSize: 20 }]}>
                            {isDelayed ? "PROCESSING EXTENDED" : "ASSEMBLY IN PROGRESS"}
                        </Text>
                    </Pressable>

                    {isDelayed ? (
                        <View style={styles.delayActions}>
                            <Text style={styles.delayText}>Output channel congested.</Text>
                            <Pressable style={styles.retryBtn} onPress={handleRetry}>
                                <Text style={styles.retryText}>RETRY PROCEDURE</Text>
                            </Pressable>
                            <Pressable style={styles.resetBtn} onPress={handleReset}>
                                <Text style={styles.resetText}>GENERATE ANOTHER</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View style={styles.pulseContainer}>
                            <ActivityIndicator color={COLORS.institutional} size="large" />
                        </View>
                    )}
                </View>

                {/* Directory Raw Proof Panel */}
                <View style={styles.proofPanel}>
                    <View style={styles.proofHeader}>
                        <Text style={styles.proofHeaderText}>DIRECTORY_RAW // SYSCALL_ACTIVE</Text>
                    </View>
                    <ScrollView contentContainerStyle={styles.logList} scrollEnabled={false}>
                        {logs.map((log, i) => (
                            <Text key={i} style={styles.logText}>
                                {`> [${new Date().toLocaleTimeString('en-GB')}] ${log}`}
                            </Text>
                        ))}
                    </ScrollView>

                    {/* Ghost Lines (Safe) */}
                    <Text style={[styles.logText, { opacity: 0.1 }]}>{`> STATUS: ${PROGRESS_STAGES[stageIndex]}`}</Text>
                    <Text style={[styles.logText, { opacity: 0.1 }]}>{`> CHANNEL: SECURE // OK`}</Text>
                </View>

                {/* Assembly Progress */}
                {!isDelayed && (
                    <View style={styles.progressSection}>
                        <View style={styles.progressMeta}>
                            <Text style={styles.progressLabel}>{PROGRESS_STAGES[stageIndex]}</Text>
                            <Text style={styles.progressValue}>{generationProgress}%</Text>
                        </View>
                        <View style={styles.barContainer}>
                            <Animated.View style={[styles.barFill, { width: progressWidth }]} />
                        </View>
                    </View>
                )}
            </Animated.View>

            {/* Subtle Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>DO NOT DISCONNECT FROM THE VOID.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.void,
        padding: 32,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        gap: 60,
    },
    topSection: {
        alignItems: 'center',
        gap: 24,
    },
    assemblyTitle: {
        color: COLORS.bone,
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 4,
        textAlign: 'center',
    },
    delayActions: {
        alignItems: 'center',
        gap: 16,
        marginTop: 10,
    },
    delayText: {
        color: COLORS.bone,
        fontSize: 14,
        opacity: 0.8,
        textAlign: 'center',
    },
    retryBtn: {
        backgroundColor: COLORS.institutional,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 4,
    },
    retryText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 1,
    },
    resetBtn: {
        padding: 10,
    },
    resetText: {
        color: COLORS.bone,
        fontSize: 12,
        opacity: 0.6,
        textDecorationLine: 'underline',
    },
    pulseContainer: {
        height: 40,
        justifyContent: 'center',
    },
    proofPanel: {
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        padding: 24,
        minHeight: 220,
        gap: 12,
    },
    proofHeader: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        paddingBottom: 8,
        marginBottom: 8,
    },
    proofHeaderText: {
        color: COLORS.bone,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
        opacity: 0.5,
    },
    logList: {
        gap: 6,
    },
    logText: {
        color: COLORS.institutional,
        fontSize: 11,
        fontFamily: 'Courier', // fallback to monospace system
        letterSpacing: 1,
    },
    progressSection: {
        gap: 16,
    },
    progressMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        opacity: 0.5,
    },
    progressLabel: {
        color: COLORS.bone,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    progressValue: {
        color: COLORS.bone,
        fontSize: 10,
        fontWeight: 'bold',
    },
    barContainer: {
        height: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        width: '100%',
    },
    barFill: {
        height: '100%',
        backgroundColor: COLORS.institutional,
    },
    footer: {
        marginBottom: 40,
        alignItems: 'center',
        opacity: 0.2,
    },
    footerText: {
        color: COLORS.bone,
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 2,
    }
});
