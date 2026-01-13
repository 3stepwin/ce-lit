import React from 'react';
import { View, Text, StyleSheet, Pressable, StatusBar } from 'react-native';
import { Link } from 'expo-router';
import { THEME } from '../../constants/theme';

export default function EntrySystemIDScreen() {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Top Metadata */}
            <View style={styles.topMetadata}>
                <Text style={styles.metaText}>CE LIT // INTERNAL</Text>
                <Text style={styles.metaText}>VR.03.ENTRY</Text>
            </View>

            {/* Central Diagnostic Block */}
            <View style={styles.content}>
                <View style={styles.row}>
                    <Text style={styles.title}>SYSTEM ID: ACTIVE</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.subtitle}>LOCATION: REGISTERED</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.status}>STATUS: PENDING</Text>
                </View>
            </View>

            {/* Bottom Action Bar */}
            <View style={styles.footer}>
                <Link href="/(main)/directory" asChild>
                    <Pressable style={styles.button}>
                        <Text style={styles.buttonText}>Accept</Text>
                        <View style={styles.cursor} />
                    </Pressable>
                </Link>
                <View style={styles.safeAreaIndicator} />
            </View>

            {/* Decorative Accents */}
            <View style={styles.accentLeft}>
                <View style={[styles.accentLine, { height: 48 }]} />
                <View style={[styles.accentLine, { height: 16 }]} />
            </View>
            <View style={styles.accentRight}>
                <View style={[styles.accentLine, { height: 16 }]} />
                <View style={[styles.accentLine, { height: 48 }]} />
            </View>

            {/* Hidden coordinates */}
            <View style={styles.coordinates}>
                <Text style={styles.coordText}>40.7128° N, 74.0060° W</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
        padding: 32,
    },
    topMetadata: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        opacity: 0.2,
        marginTop: 32,
    },
    metaText: {
        color: THEME.colors.bone,
        fontSize: 10,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    row: {
        width: '100%',
        marginBottom: 8,
    },
    title: {
        color: THEME.colors.bone,
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: 4,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    subtitle: {
        color: 'rgba(229, 229, 229, 0.8)',
        fontSize: 20,
        fontWeight: '400',
        letterSpacing: 2,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    status: {
        color: 'rgba(229, 229, 229, 0.5)',
        fontSize: 14,
        fontWeight: '300',
        letterSpacing: 1,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    footer: {
        height: 128,
        justifyContent: 'flex-end',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 24,
        justifyContent: 'center',
    },
    buttonText: {
        color: THEME.colors.bone,
        fontSize: 12,
        fontWeight: '300',
        letterSpacing: 4,
        textTransform: 'uppercase',
    },
    cursor: {
        marginLeft: 8,
        width: 4,
        height: 12,
        backgroundColor: THEME.colors.primary,
        opacity: 0.4,
    },
    safeAreaIndicator: {
        width: '33%',
        height: 4,
        backgroundColor: 'rgba(229,229,229,0.05)',
        alignSelf: 'center',
        borderRadius: 2,
    },
    accentLeft: {
        position: 'absolute',
        left: 16,
        top: '45%',
        gap: 16,
        opacity: 0.1,
    },
    accentRight: {
        position: 'absolute',
        right: 16,
        top: '45%',
        gap: 16,
        alignItems: 'flex-end',
        opacity: 0.1,
    },
    accentLine: {
        width: 1,
        backgroundColor: THEME.colors.bone,
    },
    coordinates: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        opacity: 0.1,
    },
    coordText: {
        color: THEME.colors.bone,
        fontSize: 8,
    }
});
