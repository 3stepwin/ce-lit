// ========================================
// FACE CAPTURE PROTOCOL - CULT ENGINE REALITY
// ========================================
// Screen 4 of 6 - authoritative flow
// Aesthetic: Biometric Ritual / Institutional Void

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,
    Dimensions,
    Image,
    ActivityIndicator,
    StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../lib/constants';
import { useAvatar } from '../../hooks/useAvatar';

const { width, height } = Dimensions.get('window');

export default function FaceCaptureProtocolScreen() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<any>(null);

    const {
        captureSelfie,
        uploadAvatarImage,
        isUploading
    } = useAvatar();

    const [capturedUri, setCapturedUri] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true })
            ])
        ).start();
    }, []);

    const handleCapture = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        const uri = await captureSelfie();
        if (uri) {
            setCapturedUri(uri);
        }
    };

    const handleUpload = async () => {
        if (!capturedUri) return;

        setIsProcessing(true);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
            await uploadAvatarImage(capturedUri);
            // Navigate to Screen 5
            router.push('/(main)/generating');
        } catch (e) {
            console.error("Upload failed", e);
            setIsProcessing(false);
        }
    };

    const handleRetake = () => {
        setCapturedUri(null);
        Haptics.selectionAsync();
    };

    if (!permission) return <View style={styles.container} />;

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <View style={styles.centerContent}>
                    <Text style={styles.title}>PERMISSION REQUIRED</Text>
                    <Pressable onPress={requestPermission} style={styles.button}>
                        <Text style={styles.buttonText}>GRANT ACCESS</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>PROTOCOL: FACE_CAPTURE</Text>
                <Text style={styles.headerText}>ID: CE_LIT_VOID_04</Text>
            </View>

            <View style={styles.main}>
                <View style={styles.cameraContainer}>
                    {capturedUri ? (
                        <Image source={{ uri: capturedUri }} style={styles.preview} />
                    ) : (
                        <CameraView ref={cameraRef} style={styles.camera} facing="front">
                            <View style={styles.overlay}>
                                <Animated.View style={[styles.oval, { transform: [{ scale: pulseAnim }] }]} />
                            </View>
                        </CameraView>
                    )}

                    {/* Corners */}
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                </View>

                <View style={styles.instructionBox}>
                    <Text style={styles.instructionText}>DO NOT LOOK AWAY.</Text>
                    <Text style={styles.instructionSubtext}>POSITION FACIAL STRUCTURE WITHIN THE VOID.</Text>
                </View>
            </View>

            {/* Action Footer */}
            <View style={styles.footer}>
                {!capturedUri ? (
                    <Pressable onPress={handleCapture} style={styles.captureBtn}>
                        <View style={styles.captureInner} />
                    </Pressable>
                ) : (
                    <View style={styles.actionRow}>
                        <Pressable onPress={handleRetake} style={styles.secondaryBtn}>
                            <Text style={styles.secondaryBtnText}>RETAKE</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleUpload}
                            disabled={isProcessing}
                            style={styles.primaryBtn}
                        >
                            {isProcessing ? (
                                <ActivityIndicator color="black" />
                            ) : (
                                <Text style={styles.primaryBtnText}>UPLOAD</Text>
                            )}
                        </Pressable>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.void,
        padding: 24,
    },
    header: {
        marginTop: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        opacity: 0.5,
    },
    headerText: {
        color: COLORS.bone,
        fontSize: 10,
        letterSpacing: 2,
        fontWeight: 'bold',
    },
    main: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
    },
    cameraContainer: {
        width: width * 0.8,
        height: width * 1.0,
        backgroundColor: '#000',
        overflow: 'hidden',
        position: 'relative',
    },
    camera: {
        flex: 1,
    },
    preview: {
        flex: 1,
        resizeMode: 'cover',
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    oval: {
        width: width * 0.5,
        height: width * 0.7,
        borderWidth: 1,
        borderColor: COLORS.institutional,
        borderRadius: 1000,
        opacity: 0.6,
    },
    corner: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderColor: COLORS.bone,
        opacity: 0.5,
    },
    topLeft: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 },
    topRight: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 },
    bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 },
    bottomRight: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 },
    instructionBox: {
        alignItems: 'center',
        gap: 8,
    },
    instructionText: {
        color: COLORS.bone,
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 4,
    },
    instructionSubtext: {
        color: COLORS.bone,
        fontSize: 10,
        letterSpacing: 1,
        opacity: 0.5,
        textAlign: 'center',
    },
    footer: {
        marginBottom: 60,
        alignItems: 'center',
    },
    captureBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.bone,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 16,
        width: '100%',
    },
    primaryBtn: {
        flex: 2,
        backgroundColor: COLORS.bone,
        paddingVertical: 18,
        alignItems: 'center',
        borderRadius: 2,
    },
    primaryBtnText: {
        color: 'black',
        fontWeight: '900',
        letterSpacing: 4,
    },
    secondaryBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'rgba(226, 218, 196, 0.3)',
        paddingVertical: 18,
        alignItems: 'center',
        borderRadius: 2,
    },
    secondaryBtnText: {
        color: COLORS.bone,
        fontWeight: '900',
        letterSpacing: 2,
        opacity: 0.6,
    },
    button: {
        backgroundColor: COLORS.bone,
        padding: 16,
        borderRadius: 4,
    },
    buttonText: {
        color: 'black',
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    }
});
