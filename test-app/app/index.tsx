import React from 'react';
import { View, Text, StyleSheet, Pressable, StatusBar } from 'react-native';
import { Link } from 'expo-router';
import { THEME } from '../constants/theme';

export default function EntryPresenceScreen() {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background radial gradient simulation */}
            <View style={styles.void} />

            {/* Corner Accents */}
            <View style={[styles.corner, { top: 40, left: 24, borderTopWidth: 1, borderLeftWidth: 1, opacity: 0.1 }]} />
            <View style={[styles.corner, { bottom: 40, right: 24, borderBottomWidth: 1, borderRightWidth: 1, opacity: 0.1 }]} />

            {/* Institutional Marker */}
            <View style={styles.markerContainer}>
                <Text style={styles.markerText}>CE_LIT_REF:000.1</Text>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                <View style={styles.headlineBox}>
                    <Text style={styles.headline}>ESTABLISH PRESENCE</Text>
                    <View style={styles.divider} />
                </View>
            </View>

            {/* Footer / Action */}
            <View style={styles.footer}>
                <Link href="/(main)/assumption" asChild>
                    <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.4 }]}>
                        <Text style={styles.buttonText}>BEGIN</Text>
                        <View style={styles.buttonUnderline} />
                    </Pressable>
                </Link>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    void: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: THEME.colors.background, // Radius gradient would need an image or shadow layer
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 32,
    },
    headlineBox: {
        maxWidth: 250,
    },
    headline: {
        color: THEME.colors.bone,
        fontSize: 20,
        fontWeight: '300',
        letterSpacing: 6,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(229, 229, 229, 0.4)',
        shadowColor: 'rgba(229, 229, 229, 0.2)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
        width: '100%',
    },
    footer: {
        padding: 32,
        alignItems: 'flex-end',
        marginBottom: 40,
    },
    button: {
        paddingBottom: 4,
    },
    buttonText: {
        color: 'rgba(229, 229, 229, 0.8)',
        fontSize: 14,
        letterSpacing: 3,
        textTransform: 'uppercase',
    },
    buttonUnderline: {
        position: 'absolute',
        bottom: -4,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: THEME.colors.primary,
        opacity: 0, // Would be visible on hover in web
    },
    markerContainer: {
        position: 'absolute',
        top: 60,
        left: 24,
        opacity: 0.2,
        transform: [{ rotate: '90deg' }],
    },
    markerText: {
        color: THEME.colors.bone,
        fontSize: 10,
        letterSpacing: 2,
        fontFamily: THEME.typography.mono.fontFamily,
    },
    corner: {
        position: 'absolute',
        width: 32,
        height: 32,
        borderColor: THEME.colors.bone,
    }
});
