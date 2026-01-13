import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { THEME } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

export default function OpticalFeedScreen() {
    const router = useRouter();

    // Redirect to procedural action after a delay
    useEffect(() => {
        const timer = setTimeout(() => {
            router.push('/(main)/procedural');
        }, 4000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            {/* Universal Hit Area */}
            <Pressable style={styles.hitArea} onPress={() => router.push('/(main)/procedural')}>

                {/* Over-exposed layer */}
                <View style={styles.exposedBackground}>
                    {/* Massive Blurry C */}
                    <View style={styles.blurryCContainer}>
                        <Text style={styles.blurryC}>C</Text>
                    </View>

                    {/* Grain / Microfilm effect would be an overlay image */}
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#f8f9fc', opacity: 0.15 }]} />

                    {/* Interface Elements */}
                    <View style={[StyleSheet.absoluteFill, styles.interface]}>
                        {/* Header */}
                        <View style={styles.header}>
                            <MaterialIcons name="sensors" size={10} color="rgba(0,0,0,0.4)" />
                            <Text style={styles.headerText}>OPTICAL FEED 0.22</Text>
                            <MaterialIcons name="adjust" size={10} color="rgba(0,0,0,0.4)" />
                        </View>

                        {/* Center Instruction */}
                        <View style={styles.instructionBox}>
                            <Text style={styles.instructionText}>DO NOT LOOK AWAY.</Text>
                        </View>

                        {/* Subtext */}
                        <View style={styles.subtextContainer}>
                            <Text style={styles.subtext}>Your compliance has been noted by the engine.</Text>
                        </View>

                        {/* Bottom Status */}
                        <View style={styles.statusContainer}>
                            <View style={styles.statusLine} />
                            <Text style={styles.syncText}>SYNCING</Text>
                        </View>
                    </View>

                    {/* Vignette */}
                    <View style={styles.vignette} />
                </View>

                {/* Tab Bar Mockup */}
                <View style={styles.tabBar}>
                    <MaterialIcons name="filter-center-focus" size={20} color="rgba(0,0,0,0.2)" />
                    <MaterialIcons name="radio-button-checked" size={24} color="rgba(0,0,0,0.8)" />
                    <MaterialIcons name="grid-view" size={20} color="rgba(0,0,0,0.2)" />
                </View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F6F8',
    },
    hitArea: {
        flex: 1,
    },
    exposedBackground: {
        flex: 1,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    blurryCContainer: {
        transform: [{ translateY: -40 }],
    },
    blurryC: {
        fontSize: 300,
        fontWeight: 'bold',
        color: 'rgba(0, 0, 0, 0.9)',
        opacity: 0.5,
        // Note: Blur filter only available via library or complex workarounds in base RN
    },
    interface: {
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        position: 'absolute',
        top: 48,
        left: 24,
        right: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        opacity: 0.4,
    },
    headerText: {
        fontSize: 8,
        fontWeight: 'bold',
        letterSpacing: 2,
        color: '#000',
    },
    instructionBox: {
        backgroundColor: '#000',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: 'rgba(23, 84, 207, 0.3)',
    },
    instructionText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    subtextContainer: {
        marginTop: 16,
    },
    subtext: {
        fontSize: 6,
        letterSpacing: 0.5,
        fontWeight: '500',
        textTransform: 'uppercase',
        color: 'rgba(0,0,0,0.8)',
    },
    statusContainer: {
        position: 'absolute',
        bottom: 80,
        alignItems: 'center',
    },
    statusLine: {
        width: 1,
        height: 48,
        backgroundColor: 'rgba(0,0,0,0.2)',
        marginBottom: 8,
    },
    syncText: {
        fontSize: 6,
        letterSpacing: 4,
        color: 'rgba(0,0,0,0.4)',
    },
    vignette: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 100,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    tabBar: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 64,
        paddingBottom: 32,
        paddingTop: 16,
    }
});
