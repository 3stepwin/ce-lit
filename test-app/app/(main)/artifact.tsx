import React from 'react';
import { View, Text, StyleSheet, Pressable, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { THEME } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

export default function ArtifactRevealScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Top Bar */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <MaterialIcons name="folder-open" size={14} color={THEME.colors.bone} />
                    <Text style={styles.headerTitle}>Artifact: Final Reveal</Text>
                </View>
                <Text style={styles.confidential}>CONFIDENTIAL // 8291-CE</Text>
            </View>

            {/* Media Window */}
            <View style={styles.mediaContainer}>
                <View style={styles.mediaWindow}>
                    {/* Final Video Placeholder */}
                    <View style={styles.videoPlaceholder}>
                        <MaterialIcons name="motion-photos-on" size={48} color="rgba(255,255,255,0.2)" />
                    </View>
                    <View style={styles.videoOverlay} />
                </View>
            </View>

            {/* Digital Receipt / Thermal Document */}
            <ScrollView contentContainerStyle={styles.receiptScroll}>
                <View style={styles.thermalReceipt}>
                    <Text style={styles.receiptTitle}>Digital Receipt</Text>

                    {/* Procedural Barcode Simulation */}
                    <View style={styles.barcodeRow}>
                        {[1, 2, 3, 4, 3, 2, 1, 4, 3, 2, 1].map((h, i) => (
                            <View key={i} style={[styles.barcodeLine, { width: h, height: 40 }]} />
                        ))}
                    </View>

                    {/* Metadata */}
                    <View style={styles.metaSection}>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaKey}>Record ID</Text>
                            <Text style={styles.metaValue}>#8291-CE-ALPHA</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaKey}>Timestamp</Text>
                            <Text style={styles.metaValue}>2023.10.27_14:30:02</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaKey}>Origin</Text>
                            <Text style={styles.metaValue}>CE-LIT_ENGINE_V4</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaKey}>Status</Text>
                            <Text style={styles.metaValue}>VERIFIED_FINAL</Text>
                        </View>
                    </View>

                    <View style={styles.receiptFooter}>
                        <Text style={styles.receiptFooterText}>This record is permanent.</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <Pressable style={styles.primaryAction} onPress={() => router.push('/(main)/cult-create')}>
                        <Text style={styles.primaryActionText}>Join Collective</Text>
                    </Pressable>
                    <Pressable style={styles.secondaryAction} onPress={() => router.replace('/')}>
                        <Text style={styles.secondaryActionText}>Terminate Session</Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Subtle frame */}
            <View style={styles.outerFrame} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 24,
        opacity: 0.4,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        color: THEME.colors.bone,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    confidential: {
        color: THEME.colors.bone,
        fontSize: 10,
        fontFamily: THEME.typography.mono.fontFamily,
    },
    mediaContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    mediaWindow: {
        width: '100%',
        aspectRatio: 4 / 3,
        backgroundColor: '#000',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    videoPlaceholder: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    receiptScroll: {
        paddingHorizontal: 24,
        paddingBottom: 48,
    },
    thermalReceipt: {
        backgroundColor: '#FFF',
        padding: 24,
        paddingBottom: 40,
        borderRadius: 2,
        // Tear effect would use an SVG mask in a real app
    },
    receiptTitle: {
        color: 'rgba(0,0,0,0.4)',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 3,
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    barcodeRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 2,
        marginBottom: 24,
    },
    barcodeLine: {
        backgroundColor: '#000',
    },
    metaSection: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
        paddingTop: 16,
        gap: 8,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metaKey: {
        color: 'rgba(0,0,0,0.5)',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    metaValue: {
        color: '#000',
        fontSize: 10,
        fontFamily: THEME.typography.mono.fontFamily,
        fontWeight: 'bold',
    },
    receiptFooter: {
        marginTop: 32,
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#000',
        paddingVertical: 12,
    },
    receiptFooterText: {
        color: '#000',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    actions: {
        marginTop: 32,
        alignItems: 'center',
        gap: 24,
    },
    primaryAction: {
        padding: 8,
    },
    primaryActionText: {
        color: THEME.colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    secondaryAction: {
        padding: 8,
    },
    secondaryActionText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    outerFrame: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 12,
        borderColor: THEME.colors.background,
        opacity: 0.2,
        pointerEvents: 'none',
    }
});
