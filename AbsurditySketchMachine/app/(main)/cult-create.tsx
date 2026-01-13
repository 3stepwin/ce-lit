// ========================================
// CULT CREATE SCREEN - ABSURDITY AI
// ========================================
// "Theoretically Media" Style Explainer Generator
// Agent: UI Designer Sally
// Status: Initial Implementation

import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../../store/useAppStore';

// Mock function until `useCultEngine` hook is built
const generateCultScene = async (topic: string, style: string, userId: string) => {
    // Call Edge Function
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

    const styles = [
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
            // Navigate to status page
            router.push(`/(main)/cult-status?scriptId=${result.script_id}`);

        } catch (err: any) {
            Alert.alert("Error", err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <View className="flex-1 bg-black">
            <LinearGradient
                colors={['#1a1005', '#000000']}
                className="absolute inset-0"
            />

            <ScrollView className="flex-1 px-6 pt-16">
                <Text className="text-amber-500 font-bold tracking-[4px] text-xs mb-2">
                    CULT ENGINE v1.0
                </Text>
                <Text className="text-white text-4xl font-bold mb-8">
                    Video Architect
                </Text>

                {/* Topic Input */}
                <View className="mb-8">
                    <Text className="text-white/60 text-sm mb-2 font-bold tracking-widest">TOPIC / PREMISE</Text>
                    <TextInput
                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white text-lg min-h-[120px]"
                        placeholder="e.g. The secret history of the color blue..."
                        placeholderTextColor="#666"
                        multiline
                        textAlignVertical="top"
                        value={topic}
                        onChangeText={setTopic}
                    />
                </View>

                {/* Style Selection */}
                <View className="mb-8">
                    <Text className="text-white/60 text-sm mb-4 font-bold tracking-widest">VISUAL STYLE</Text>
                    {styles.map((s) => (
                        <Pressable
                            key={s.id}
                            onPress={() => setStyle(s.id)}
                            className={`p-4 mb-3 rounded-xl border ${style === s.id ? 'bg-amber-900/20 border-amber-500' : 'bg-zinc-900 border-zinc-800'
                                }`}
                        >
                            <Text className={`font-bold text-lg ${style === s.id ? 'text-amber-500' : 'text-zinc-400'}`}>
                                {s.label}
                            </Text>
                            <Text className="text-zinc-500 text-sm mt-1">{s.desc}</Text>
                        </Pressable>
                    ))}
                </View>

                {/* Info Block */}
                <View className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 mb-12">
                    <Text className="text-zinc-400 text-xs leading-5">
                        ℹ️ This will trigger the <Text className="font-bold text-zinc-300">Multi-Agent Orchestrator</Text>.
                        It will generate a script, breakdown 10-20 shots, synthesize voiceover, and generate video clips for each beat.
                        Process time: ~2-5 minutes.
                    </Text>
                </View>

            </ScrollView>

            {/* Generate Button */}
            <View className="p-6 pb-12 bg-black/80">
                <Pressable
                    onPress={handleGenerate}
                    disabled={isGenerating}
                    className={`rounded-xl py-4 flex-row justify-center items-center ${isGenerating ? 'bg-zinc-800' : 'bg-amber-600'
                        }`}
                >
                    <Text className="text-white font-bold text-lg tracking-widest">
                        {isGenerating ? 'ORCHESTRATING...' : 'INITIATE SEQUENCE'}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}
