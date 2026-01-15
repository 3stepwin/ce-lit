// ========================================
// IDENTITY RECORD - CULT ENGINE REALITY
// ========================================
// Screen 2 of 6 - authoritative flow
// Aesthetic: Clinical Identity Verification

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,
    Dimensions,
    Switch,
    StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../lib/constants';
import { useAppStore } from '../store/useAppStore';

const { width } = Dimensions.get('window');

export default function IdentityRecordScreen() {
    const router = useRouter();
    const { faceCaptureEnabled, setFaceCaptureEnabled } = useAppStore();

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    const progressWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
            Animated.timing(progressWidth, { toValue: width * 0.8, duration: 2000, useNativeDriver: false })
        ]).start();
    }, []);

    const handleProceed = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/system-threshold');
    };

    const toggleFaceCapture = (value: boolean) => {
        Haptics.selectionAsync();
        setFaceCaptureEnabled(value);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header Meta */}
            <View style={styles.header}>
                <Text style={styles.headerText}>SYSTEM_ID // DEMO_MODE</Text>
                <Text style={styles.headerText}>STATUS: VERIFIED</Text>
            </View>

            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                {/* Title Section */}
                <View style={styles.titleSection}>
                    <Text style={styles.title}>IDENTITY RECORD</Text>
                    <View style={styles.titleDivider} />
                    <Text style={styles.subtitle}>SECURE RECOGNITION INTERFACE</Text>
                </View>

                {/* Match Result Card */}
                <View style={styles.matchCard}>
                    <View style={styles.matchHeader}>
                        <Text style={styles.matchLabel}>SYSTEM MATCH</Text>
                        <Text style={styles.matchValue}>100%</Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
                    </View>
                    <Text style={styles.matchStatus}>IDENTITY IS IRREVOCABLE</Text>
                </View>

                {/* Control Hub (Face Capture Toggle) */}
                <View style={styles.controlHub}>
                    <View style={styles.controlRow}>
                        <View>
                            <Text style={styles.controlLabel}>ENABLE FACE CAPTURE</Text>
                            <Text style={styles.controlSubtext}>OPTIONAL RITUAL PROTOCOL</Text>
                        </View>
                        <Switch
                            value={faceCaptureEnabled}
                            onValueChange={toggleFaceCapture}
                            trackColor={{ false: '#333', true: COLORS.institutional }}
                            thumbColor={faceCaptureEnabled ? '#fff' : '#888'}
                        />
                    </View>
                </View>
            </Animated.View>

            {/* Footer Action */}
            <View style={styles.footer}>
                <Pressable
                    onPress={handleProceed}
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed
                    ]}
                >
                    <Text style={styles.buttonText}>PROCEED</Text>
                </Pressable>

                <Text style={styles.footerMeta}>REALITY_VECTOR_BOUND: WORK</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.void,
        padding: 32,
        justifyContent: 'space-between',
    },
    header: {
        marginTop: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        opacity: 0.4,
    },
    headerText: {
        color: COLORS.bone,
        fontSize: 10,
        letterSpacing: 2,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        gap: 48,
    },
    titleSection: {
        alignItems: 'flex-start',
    },
    title: {
        color: COLORS.bone,
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -1,
    },
    titleDivider: {
        width: 100,
        height: 2,
        backgroundColor: COLORS.institutional,
        marginVertical: 12,
    },
    subtitle: {
        color: COLORS.bone,
        fontSize: 12,
        letterSpacing: 4,
        opacity: 0.6,
        textTransform: 'uppercase',
    },
    matchCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        padding: 24,
        gap: 16,
    },
    matchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    matchLabel: {
        color: COLORS.bone,
        fontSize: 10,
        letterSpacing: 2,
        opacity: 0.5,
    },
    matchValue: {
        color: COLORS.institutional,
        fontSize: 24,
        fontWeight: 'bold',
    },
    progressBarContainer: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        width: '100%',
    },
    progressBar: {
        height: '100%',
        backgroundColor: COLORS.institutional,
    },
    matchStatus: {
        color: COLORS.bone,
        fontSize: 10,
        letterSpacing: 3,
        textAlign: 'center',
        opacity: 0.4,
        marginTop: 8,
    },
    controlHub: {
        gap: 24,
    },
    controlRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        padding: 20,
        borderLeftWidth: 2,
        borderLeftColor: COLORS.bone,
    },
    controlLabel: {
        color: COLORS.bone,
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    controlSubtext: {
        color: COLORS.bone,
        fontSize: 10,
        letterSpacing: 1,
        opacity: 0.5,
        marginTop: 4,
    },
    footer: {
        marginBottom: 40,
        gap: 24,
    },
    button: {
        backgroundColor: COLORS.bone,
        paddingVertical: 18,
        alignItems: 'center',
        borderRadius: 2,
    },
    buttonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.99 }],
    },
    buttonText: {
        color: COLORS.void,
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 4,
    },
    footerMeta: {
        color: COLORS.bone,
        fontSize: 10,
        letterSpacing: 2,
        opacity: 0.3,
        textAlign: 'center',
    }
});
