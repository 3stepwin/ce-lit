// ========================================
// SYSTEM THRESHOLD - CULT ENGINE REALITY
// ========================================
// Screen 3 of 6 - authoritative flow
// Aesthetic: Data Interpretation / Vector Locks

import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,
    Dimensions,
    StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../lib/constants';
import { useAppStore } from '../store/useAppStore';
import { RealityVector } from '../types';

const { width, height } = Dimensions.get('window');

export default function SystemThresholdScreen() {
    const router = useRouter();
    const { faceCaptureEnabled, realityVectors, setRealityVectors } = useAppStore();

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scannerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
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
            setRealityVectors(['WORK']);
        }

        if (faceCaptureEnabled) {
            router.push('/(main)/avatar');
        } else {
            router.push('/(main)/generating');
        }
    };

    const handleSelectVector = async (vector: RealityVector) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // Single tap selection (mode choice style)
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
                <Text style={[styles.vectorBtnText, isActive && { color: color, opacity: 1 }]}>
                    {label}
                </Text>
                {isActive && (
                    <Text style={[styles.activeTag, { color }]}>SELECTED</Text>
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
                    <Text style={styles.subtitle}>SELECT REALITY VECTOR</Text>
                </View>

                {/* Vector Selection buttons */}
                <View style={styles.vectorGrid}>
                    <VectorButton
                        label="LIFE"
                        vector="LIFE"
                        color={COLORS.institutional}
                    />
                    <VectorButton
                        label="WORK"
                        vector="WORK"
                        color={COLORS.bone}
                    />
                    <VectorButton
                        label="FEED"
                        vector="FEED"
                        color="#4A90E2"
                    />
                </View>

                {/* Info Text */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>THE SYSTEM WILL RE-INTERPRET YOUR RECORD</Text>
                    <Text style={styles.infoText}>BASED ON THE CHOSEN VECTOR.</Text>
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
                    <Text style={styles.buttonText}>CONTINUE</Text>
                </Pressable>

                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>THRESHOLD_VERSION: 1.2.4</Text>
                    <Text style={styles.metaText}>AUTO_DEFAULT: WORK_VECTOR</Text>
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
        justifyContent: 'center',
        gap: 60,
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
        gap: 20,
    },
    vectorBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
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
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 6,
        opacity: 0.4,
    },
    activeTag: {
        position: 'absolute',
        right: 24,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    infoBox: {
        alignItems: 'center',
        gap: 4,
        opacity: 0.4,
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
        opacity: 0.3,
    },
    metaText: {
        color: COLORS.bone,
        fontSize: 8,
        fontWeight: 'bold',
        letterSpacing: 1,
    }
});
