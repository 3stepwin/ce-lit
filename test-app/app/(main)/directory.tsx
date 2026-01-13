import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { THEME } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

export default function DirectoryRawScreen() {
    const router = useRouter();
    const files = [
        { name: 'ARTIFACT_09_DEBT.MOV', type: 'folder', locked: true },
        { name: 'RECORD_LOG_RECOGNITION.MP4', type: 'description', locked: true },
        { name: 'ENCRYPTED_SIGNAL_B.RAW', type: 'settings-input-component', locked: true },
        { name: 'VOID_PROTOCOL_INIT.SH', type: 'code', locked: true },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Top Bar */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.systemActiveRow}>
                        <MaterialIcons name="code" size={14} color={THEME.colors.success} />
                        <Text style={styles.systemActiveText}>System_Active</Text>
                    </View>
                    <Text style={styles.clockText}>04:22:15:<Text style={{ opacity: 0.7 }}>892</Text></Text>
                </View>
            </View>

            {/* Headline */}
            <View style={styles.headlineContainer}>
                <Text style={styles.headline}>DIRECTORY_RAW:/CE_LIT/</Text>
            </View>

            {/* File List */}
            <ScrollView style={styles.fileList}>
                {files.map((file, idx) => (
                    <View key={idx} style={styles.fileRow}>
                        <View style={styles.fileInfo}>
                            <MaterialIcons name="folder" size={16} color={THEME.colors.success} style={{ opacity: 0.5 }} />
                            <Text style={styles.fileName}>{file.name}</Text>
                        </View>
                        <View style={styles.lockBox}>
                            <Text style={styles.lockText}>LOCKED</Text>
                        </View>
                    </View>
                ))}

                {/* THE TRIGGER FILE */}
                <Pressable
                    style={({ pressed }) => [styles.triggerRow, pressed && { opacity: 0.8 }]}
                    onPress={() => router.push('/(main)/optical-feed')}
                >
                    <View style={styles.triggerIndicator} />
                    <View style={styles.triggerMain}>
                        <MaterialIcons name="bolt" size={20} color={THEME.colors.success} />
                        <Text style={styles.triggerText}>BEGIN_TRANSUBSTANTIATION</Text>
                    </View>
                    <View style={styles.executeBox}>
                        <Text style={styles.executeText}>EXECUTE</Text>
                        <MaterialIcons name="chevron-right" size={14} color={THEME.colors.success} />
                    </View>
                </Pressable>
            </ScrollView>

            {/* Terminal Cursor Area */}
            <View style={styles.terminalContainer}>
                <Text style={styles.prompt}>root@celit:~#</Text>
                <View style={styles.cursor} />
            </View>

            {/* Disclaimer */}
            <View style={styles.disclaimer}>
                <Text style={styles.disclaimerText}>
                    Warning: unauthorized access to this directory constitutes a reality violation.
                    Internal audit in progress. Log id: 882-X-00.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 8,
    },
    header: {
        paddingTop: 48,
        paddingHorizontal: 8,
    },
    headerLeft: {
        flexDirection: 'column',
    },
    systemActiveRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    systemActiveText: {
        color: THEME.colors.success,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    clockText: {
        color: THEME.colors.success,
        fontSize: 12,
        fontFamily: THEME.typography.mono.fontFamily,
        marginTop: 4,
    },
    headlineContainer: {
        marginTop: 32,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(13, 242, 13, 0.2)',
        paddingBottom: 8,
    },
    headline: {
        color: THEME.colors.success,
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: -1,
    },
    fileList: {
        marginTop: 16,
    },
    fileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        height: 48,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        opacity: 0.5,
    },
    fileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    fileName: {
        color: THEME.colors.success,
        fontSize: 14,
    },
    lockBox: {
        borderWidth: 1,
        borderColor: 'rgba(13, 242, 13, 0.3)',
        paddingHorizontal: 4,
    },
    lockText: {
        color: THEME.colors.success,
        fontSize: 10,
        fontWeight: 'bold',
    },
    triggerRow: {
        marginTop: 8,
        height: 64,
        backgroundColor: 'rgba(13, 242, 13, 0.1)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    triggerIndicator: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        backgroundColor: THEME.colors.success,
    },
    triggerMain: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingLeft: 4,
    },
    triggerText: {
        color: THEME.colors.success,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    executeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    executeText: {
        color: '#FFF',
        backgroundColor: THEME.colors.success,
        fontSize: 10,
        fontWeight: 'bold',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 2,
    },
    terminalContainer: {
        marginTop: 32,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    prompt: {
        color: THEME.colors.success,
        fontSize: 14,
        opacity: 0.6,
    },
    cursor: {
        width: 10,
        height: 20,
        backgroundColor: THEME.colors.success,
    },
    disclaimer: {
        marginTop: 'auto',
        padding: 16,
        opacity: 0.3,
    },
    disclaimerText: {
        color: THEME.colors.success,
        fontSize: 9,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    }
});
