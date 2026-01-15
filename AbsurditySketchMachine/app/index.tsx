// ========================================
// SYSTEM THRESHOLD - CULT ENGINE REALITY
// ========================================
// Screen 1 of 3 (Simplified Demo Flow)
// Aesthetic: Data Interpretation / Vector Selection

import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,
    Dimensions,
    StatusBar,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../lib/constants';
import { useAppStore } from '../store/useAppStore';
import { RealityVector } from '../types';

const { width, height } = Dimensions.get('window');

const VECTOR_DESCRIPTIONS: Record<string, {
    title: string;
    subtitle: string;
    description: string;
    archetype: string;
    quote: string;
    verdict: string;
}> = {
    LIFE_VECTOR: {
        title: "PERSONAL REALITY",
        subtitle: "Reputational Collapse",
        description: "The apology. The confession. The gray-wall liquidation of the self.",
        archetype: "Public Apology",
        quote: "“I’ve been advised to take accountability…”",
        verdict: "MORAL JUDGMENT"
    },
    WORK_VECTOR: {
        title: "INSTITUTIONAL REALITY",
        subtitle: "Corporate Compliance",
        description: "The onboarding. The training. The sterile gaze of the organization.",
        archetype: "Compliance Module",
        quote: "“During the transition, please maintain eye contact…”",
        verdict: "POLICY ENFORCEMENT"
    },
    FEED_VECTOR: {
        title: "ALGORITHMIC REALITY",
        subtitle: "Signal Containment",
        description: "The breach. The viral incident. The platform taking control.",
        archetype: "Security Alert",
        quote: "“This content violated community standards…”",
        verdict: "SYSTEM PURGE"
    }
};

export default function SystemThresholdScreen() {
    const router = useRouter();
    const { realityVectors, setRealityVectors, faceCaptureEnabled } = useAppStore();

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scannerAnim = useRef(new Animated.Value(0)).current;

    const activeVector = (realityVectors[0] && VECTOR_DESCRIPTIONS[realityVectors[0]]) ? realityVectors[0] : 'WORK_VECTOR';
    const activeInfo = VECTOR_DESCRIPTIONS[activeVector];

    useEffect(() => {
        // Migration: Handle old vector values if they exist in persisted state
        const validVectors = ['WORK_VECTOR', 'LIFE_VECTOR', 'FEED_VECTOR'];
        const needsUpdate = realityVectors.some(v => !validVectors.includes(v as any)) || realityVectors.length === 0;

        if (needsUpdate) {
            console.log("MIGRATION :: SANITIZING REALITY VECTORS");
            setRealityVectors(['WORK_VECTOR']);
        }

        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scannerAnim, { toValue: height, duration: 4000, useNativeDriver: false }),
                    Animated.timing(scannerAnim, { toValue: 0, duration: 0, useNativeDriver: false })
                ])
            )
        ]).start();
    }, []);

    const handleContinue = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        // If no vector selected, default to WORK
        if (realityVectors.length === 0) {
            setRealityVectors(['WORK_VECTOR']);
        }

        // Direct to Generating for Zero Friction
        if (faceCaptureEnabled) {
            router.push('/(main)/avatar');
        } else {
            router.push('/(main)/generating');
        }
    };

    const handleSelectVector = async (vector: RealityVector) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setRealityVectors([vector]);
    };

    const VectorButton = ({ label, vector, color }: { label: string, vector: RealityVector, color: string }) => {
        const isActive = realityVectors.includes(vector);
        return (
            <Pressable
                onPress={() => handleSelectVector(vector)}
                style={[
                    styles.vectorBtn,
                    isActive && { borderColor: color, backgroundColor: `${color}10` }
                ]}
            >
                <View style={[styles.statusIndicator, { backgroundColor: isActive ? color : '#222' }]} />
                <View>
                    <Text style={[styles.vectorBtnText, isActive && { color: color, opacity: 1 }]}>
                        {label}
                    </Text>
                    <Text style={styles.vectorSubText}>
                        {VECTOR_DESCRIPTIONS[vector].subtitle}
                    </Text>
                </View>
                {isActive && (
                    <Text style={[styles.activeTag, { color }]}>LOCKED</Text>
                )}
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Scanline Effect */}
            <Animated.View style={[styles.scanline, { top: scannerAnim }]} />

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.title}>SYSTEM THRESHOLD</Text>
                    <Text style={styles.subtitle}>REALITY VECTOR ASSIGNMENT</Text>
                </View>

                {/* Vector Selection buttons */}
                <View style={styles.vectorGrid}>
                    <VectorButton
                        label="LIFE"
                        vector="LIFE_VECTOR"
                        color={COLORS.institutional}
                    />
                    <VectorButton
                        label="WORK"
                        vector="WORK_VECTOR"
                        color={COLORS.bone}
                    />
                    <VectorButton
                        label="FEED"
                        vector="FEED_VECTOR"
                        color="#4A90E2"
                    />
                </View>

                {/* Dynamic Info Panel */}
                <View style={styles.infoPanel}>
                    <View style={styles.infoHeaderFunc}>
                        <Text style={styles.archetypeLabel}>ARCHETYPE: <Text style={{ color: COLORS.bone }}>{activeInfo.archetype}</Text></Text>
                        <Text style={styles.verdictLabel}>VERDICT: <Text style={{ color: COLORS.primary }}>{activeInfo.verdict}</Text></Text>
                    </View>

                    <Text style={styles.quoteText}>{activeInfo.quote}</Text>
                    <Text style={styles.descText}>{activeInfo.description}</Text>
                </View>

                {/* Info Text */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>ASSIGNMENT IS IRREVOCABLE EX POST FACTO.</Text>
                </View>
            </Animated.View>

            {/* Action Footer */}
            <View style={styles.footer}>
                <Pressable
                    onPress={handleContinue}
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed
                    ]}
                >
                    <Text style={styles.buttonText}>INITIATE {activeVector}</Text>
                </Pressable>

                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>V.4.0.1 // STANDBY</Text>
                    <Text style={styles.metaText}>AUTO_VECTOR: {activeVector}</Text>
                </View>
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
    scanline: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(147, 200, 147, 0.2)',
        zIndex: 50,
    },
    content: {
        flex: 1,
        marginTop: 60,
        gap: 40,
    },
    header: {
        alignItems: 'center',
        gap: 12,
    },
    title: {
        color: COLORS.bone,
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: 4,
        textAlign: 'center',
    },
    subtitle: {
        color: COLORS.bone,
        fontSize: 10,
        letterSpacing: 4,
        opacity: 0.5,
        textTransform: 'uppercase',
    },
    vectorGrid: {
        gap: 16,
    },
    vectorBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 2,
        position: 'relative',
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 16,
    },
    vectorBtnText: {
        color: COLORS.bone,
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 4,
        opacity: 0.4,
    },
    vectorSubText: {
        color: COLORS.bone,
        fontSize: 10,
        opacity: 0.3,
        marginTop: 4,
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    activeTag: {
        position: 'absolute',
        right: 20,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    infoPanel: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 20,
        borderLeftWidth: 2,
        borderLeftColor: COLORS.tape,
        gap: 12,
    },
    infoHeaderFunc: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        paddingBottom: 8,
    },
    archetypeLabel: {
        color: COLORS.bone,
        fontSize: 10,
        fontWeight: 'bold',
        opacity: 0.7,
    },
    verdictLabel: {
        color: COLORS.bone,
        fontSize: 10,
        fontWeight: 'bold',
        opacity: 0.7,
    },
    quoteText: {
        color: COLORS.bone,
        fontStyle: 'italic',
        fontSize: 16,
        lineHeight: 22,
        opacity: 0.9,
    },
    descText: {
        color: COLORS.bone,
        fontSize: 12,
        opacity: 0.5,
    },
    infoBox: {
        alignItems: 'center',
        opacity: 0.3,
    },
    infoText: {
        color: COLORS.bone,
        fontSize: 10,
        letterSpacing: 2,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    footer: {
        marginTop: 'auto',
        marginBottom: 20,
        gap: 24,
    },
    button: {
        backgroundColor: COLORS.bone,
        paddingVertical: 18,
        alignItems: 'center',
        borderRadius: 2,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonText: {
        color: COLORS.void,
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 6,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        opacity: 0.2,
    },
    metaText: {
        color: COLORS.bone,
        fontSize: 8,
        fontWeight: 'bold',
        letterSpacing: 1,
    }
});
