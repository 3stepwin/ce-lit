// ========================================
// CULT CREATE SCREEN - CE LIT
// ========================================
// Agent: UI Designer Sally
// Status: Institutional Brutalist Refinement

import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../../store/useAppStore';
import { THEME } from '../../constants/theme';

// Mock function until `useCultEngine` hook is built
const generateCultScene = async (topic: string, style: string, userId: string) => {
    const response = await fetch('https://ebostxmvyocypwqpgzct.supabase.co/functions/v1/generate-cult-scene', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ topic, style_preset: style, user_id: userId })
    });
    return response.json();
};

export default function CultCreateScreen() {
    const router = useRouter();
    const { user } = useAppStore();
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [style, setStyle] = useState('documentary_dark');

    const styleOptions = [
        { id: 'documentary_dark', label: '🕵️ Dark Documentary', desc: 'Mystery, True Crime, Deep Dive' },
        { id: 'explainer_bright', label: '💡 Bright Explainer', desc: 'Tech, Science, Educational' },
        { id: 'cinematic_epic', label: '🎬 Cinematic Epic', desc: 'History, Mythology, Grandeur' },
    ];

    const handleGenerate = async () => {
        if (!topic.trim()) {
            Alert.alert("Topic Required", "Please enter a topic for your video.");
            return;
        }
        if (!user?.id) {
            Alert.alert("Auth Required", "Please log in first.");
            return;
        }

        setIsGenerating(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        try {
            const result = await generateCultScene(topic, style, user.id);
            if (result.error) throw new Error(result.error);

            Alert.alert("Success", "Orchestrator started! Generating script and shots...");
            router.push(`/(main)/cult-status?scriptId=${result.script_id}`);

        } catch (err: any) {
            Alert.alert("Error", err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0f1117', '#000000']}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.kicker}>CULT ENGINE v1.0</Text>
                    <Text style={styles.title}>Video Architect</Text>
                    <View style={styles.titleBar} />
                </View>

                {/* Topic Input */}
                <View style={styles.section}>
                    <Text style={styles.label}>TOPIC / PREMISE</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. The secret history of the color blue..."
                        placeholderTextColor="rgba(229,229,229,0.2)"
                        multiline
                        textAlignVertical="top"
                        value={topic}
                        onChangeText={setTopic}
                    />
                </View>

                {/* Style Selection */}
                <View style={styles.section}>
                    <Text style={styles.label}>VISUAL STYLE</Text>
                    {styleOptions.map((s) => (
                        <Pressable
                            key={s.id}
                            onPress={() => setStyle(s.id)}
                            style={[
                                styles.styleCard,
                                style === s.id && styles.styleCardActive
                            ]}
                        >
                            <Text style={[
                                styles.styleLabel,
                                style === s.id && styles.styleLabelActive
                            ]}>
                                {s.label}
                            </Text>
                            <Text style={styles.styleDesc}>{s.desc}</Text>
                        </Pressable>
                    ))}
                </View>

                {/* Info Block */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        ℹ️ This will trigger the <Text style={styles.infoBold}>Multi-Agent Orchestrator</Text>.
                        It will generate a script, breakdown 10-20 shots, and generate video clips for each beat.
                        Process time: ~2-5 minutes.
                    </Text>
                </View>
            </ScrollView>

            {/* Generate Button */}
            <View style={styles.footer}>
                <Pressable
                    onPress={handleGenerate}
                    disabled={isGenerating}
                    style={({ pressed }) => [
                        styles.button,
                        isGenerating && styles.buttonDisabled,
                        pressed && styles.buttonPressed
                    ]}
                >
                    <Text style={styles.buttonText}>
                        {isGenerating ? 'ORCHESTRATING...' : 'INITIATE SEQUENCE'}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 64,
        paddingBottom: 120,
    },
    header: {
        marginBottom: 40,
    },
    kicker: {
        color: THEME.colors.primary,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 4,
        marginBottom: 8,
    },
    title: {
        color: THEME.colors.bone,
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: -1,
    },
    titleBar: {
        height: 2,
        backgroundColor: THEME.colors.primary,
        width: 60,
        marginTop: 12,
    },
    section: {
        marginBottom: 32,
    },
    label: {
        color: 'rgba(229, 229, 229, 0.4)',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 12,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 4,
        padding: 16,
        color: THEME.colors.bone,
        fontSize: 16,
        minHeight: 120,
    },
    styleCard: {
        padding: 16,
        marginBottom: 12,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },
    styleCardActive: {
        backgroundColor: 'rgba(23, 84, 207, 0.1)',
        borderColor: THEME.colors.primary,
    },
    styleLabel: {
        color: 'rgba(229, 229, 229, 0.6)',
        fontSize: 16,
        fontWeight: 'bold',
    },
    styleLabelActive: {
        color: THEME.colors.bone,
    },
    styleDesc: {
        color: 'rgba(229, 229, 229, 0.3)',
        fontSize: 12,
        marginTop: 4,
    },
    infoBox: {
        backgroundColor: 'rgba(23, 84, 207, 0.05)',
        padding: 16,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(23, 84, 207, 0.2)',
    },
    infoText: {
        color: 'rgba(229, 229, 229, 0.5)',
        fontSize: 12,
        lineHeight: 18,
    },
    infoBold: {
        color: THEME.colors.bone,
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: 40,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    button: {
        backgroundColor: THEME.colors.primary,
        paddingVertical: 18,
        alignItems: 'center',
        borderRadius: 4,
    },
    buttonDisabled: {
        backgroundColor: 'rgba(23, 84, 207, 0.3)',
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonText: {
        color: THEME.colors.bone,
        fontWeight: '900',
        fontSize: 14,
        letterSpacing: 2,
    },
});
