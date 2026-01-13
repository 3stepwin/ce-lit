import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { THEME } from '../../constants/theme';

export default function ProceduralActionScreen() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push('/(main)/artifact');
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            {/* Red REC Indicator */}
            <View style={styles.recHeader}>
                <View style={styles.recDot} />
                <Text style={styles.recText}>REC</Text>
            </View>

            {/* Clapperboard Container */}
            <View style={styles.content}>
                <View style={styles.clapper}>
                    {/* Top Bar (Angled) */}
                    <View style={styles.clapperTop}>
                        <View style={styles.zebraContainer}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <View key={i} style={styles.zebra} />
                            ))}
                        </View>
                        <Text style={styles.clapperTopText}>CE LIT PROCEDURAL ACTION</Text>
                    </View>

                    {/* Body */}
                    <View style={styles.clapperBody}>
                        <View style={styles.productionState}>
                            <Text style={styles.metaLabel}>Production State</Text>
                            <Text style={styles.sceneTitle}>SCENE: 001</Text>
                        </View>

                        <View style={styles.metaGrid}>
                            <View style={styles.metaCol}>
                                <Text style={styles.metaLabel}>Date</Text>
                                <Text style={styles.metaValue}>[NULL]</Text>
                            </View>
                            <View style={[styles.metaCol, styles.borderLeft]}>
                                <Text style={styles.metaLabel}>Roll</Text>
                                <Text style={styles.metaValueBold}>FINAL</Text>
                            </View>
                        </View>

                        <View style={styles.footer}>
                            <View>
                                <Text style={styles.systemText}>SYSTEM: REALITY_ENGINE_V4</Text>
                                <Text style={styles.systemText}>AUTH: CLINICAL_INSTITUTIONAL</Text>
                            </View>
                            <View style={styles.barcodePlaceholder} />
                        </View>
                    </View>
                </View>
            </View>

            {/* Peripheral Overlay (Corner Marks) */}
            <View style={[styles.corner, { top: 16, left: 16, borderTopWidth: 1, borderLeftWidth: 1 }]} />
            <View style={[styles.corner, { top: 16, right: 16, borderTopWidth: 1, borderRightWidth: 1 }]} />
            <View style={[styles.corner, { bottom: 64, left: 16, borderBottomWidth: 1, borderLeftWidth: 1 }]} />
            <View style={[styles.corner, { bottom: 64, right: 16, borderBottomWidth: 1, borderRightWidth: 1 }]} />

            {/* Technical Data */}
            <View style={styles.technicalOverlay}>
                <Text style={styles.techText}>24 FPS</Text>
                <Text style={styles.techText}>4K RAW</Text>
                <Text style={styles.techText}>ISO 800</Text>
                <Text style={styles.techText}>TC 00:00:00:00</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    recHeader: {
        paddingTop: 48,
        paddingRight: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
    },
    recDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: THEME.colors.error,
    },
    recText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    clapper: {
        width: '100%',
        maxWidth: 320,
    },
    clapperTop: {
        height: 48,
        backgroundColor: THEME.colors.bone,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        borderBottomWidth: 4,
        borderBottomColor: '#000',
        transform: [{ rotate: '-6deg' }, { translateY: 4 }],
        zIndex: 10,
    },
    zebraContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    zebra: {
        width: 32,
        height: 64,
        backgroundColor: '#000',
        transform: [{ rotate: '-45deg' }, { translateY: -16 }],
    },
    clapperTopText: {
        color: '#000',
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 1.5,
    },
    clapperBody: {
        backgroundColor: THEME.colors.bone,
        padding: 24,
        borderTopWidth: 2,
        borderTopColor: '#999',
    },
    productionState: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        paddingBottom: 16,
        marginBottom: 16,
    },
    metaLabel: {
        color: 'rgba(0,0,0,0.4)',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    sceneTitle: {
        color: '#000',
        fontSize: 40,
        fontWeight: 'bold',
        letterSpacing: -2,
    },
    metaGrid: {
        flexDirection: 'row',
    },
    metaCol: {
        flex: 1,
    },
    metaValue: {
        color: '#000',
        fontSize: 20,
        fontWeight: '500',
    },
    metaValueBold: {
        color: '#000',
        fontSize: 20,
        fontWeight: 'bold',
    },
    borderLeft: {
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(0,0,0,0.1)',
        paddingLeft: 16,
    },
    footer: {
        marginTop: 32,
        paddingTop: 16,
        borderTopWidth: 2,
        borderTopColor: '#000',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    systemText: {
        color: '#000',
        fontSize: 9,
        fontWeight: 'bold',
        lineHeight: 12,
    },
    barcodePlaceholder: {
        width: 40,
        height: 40,
        backgroundColor: '#000',
        opacity: 0.1,
    },
    corner: {
        position: 'absolute',
        width: 32,
        height: 32,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    technicalOverlay: {
        position: 'absolute',
        bottom: 24,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        opacity: 0.4,
    },
    techText: {
        color: '#FFF',
        fontSize: 8,
        fontWeight: 'bold',
        letterSpacing: 2,
    }
});
