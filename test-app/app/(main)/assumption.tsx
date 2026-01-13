import React from 'react';
import { View, Text, StyleSheet, Pressable, StatusBar } from 'react-native';
import { Link } from 'expo-router';
import { THEME } from '../../constants/theme';

export default function EntryAssumptionScreen() {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header Metadata */}
            <View style={styles.header}>
                <Text style={styles.metadata}>RX-0092-C</Text>
                <View style={styles.metaLine} />
            </View>

            {/* Central Statement */}
            <View style={styles.content}>
                <Text style={styles.title}>PARTICIPATION IS ASSUMED.</Text>
                <View style={styles.verticalLine} />
            </View>

            {/* Action Footer */}
            <View style={styles.footer}>
                <Link href="/(main)/system-id" asChild>
                    <Pressable style={styles.button}>
                        <Text style={styles.buttonText}>PROCEED</Text>
                        <View style={styles.buttonUnderline} />
                    </Pressable>
                </Link>

                {/* Subtle artifact dots */}
                <View style={styles.dotsRow}>
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                </View>
            </View>

            {/* Decorative Side Elements */}
            <View style={[styles.sideLine, { left: 0 }]} />
            <View style={[styles.sideLine, { right: 0 }]} />

            {/* iOS Style Bottom Bar Indicator */}
            <View style={styles.bottomBar} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
        paddingHorizontal: 24,
    },
    header: {
        paddingTop: 64,
    },
    metadata: {
        fontSize: 10,
        color: 'rgba(229, 229, 229, 0.6)',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    metaLine: {
        marginTop: 4,
        height: 1,
        width: 24,
        backgroundColor: 'rgba(229, 229, 229, 0.2)',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    title: {
        color: THEME.colors.bone,
        fontSize: 36,
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: -1,
        lineHeight: 34,
        textTransform: 'uppercase',
    },
    verticalLine: {
        marginTop: 32,
        height: 48,
        width: 1,
        backgroundColor: 'rgba(229, 229, 229, 0.1)',
    },
    footer: {
        paddingBottom: 64,
        alignItems: 'center',
    },
    button: {
        marginBottom: 32,
    },
    buttonText: {
        color: 'rgba(229, 229, 229, 0.7)',
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    buttonUnderline: {
        marginTop: 4,
        height: 1,
        width: '100%',
        backgroundColor: 'rgba(229, 229, 229, 0.3)',
    },
    dotsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(229, 229, 229, 0.1)',
    },
    sideLine: {
        position: 'absolute',
        top: '40%',
        height: 160,
        width: 4,
        backgroundColor: 'rgba(229, 229, 229, 0.05)',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 8,
        left: '35%',
        right: '35%',
        height: 5,
        borderRadius: 2.5,
        backgroundColor: 'rgba(229, 229, 229, 0.1)',
    }
});
