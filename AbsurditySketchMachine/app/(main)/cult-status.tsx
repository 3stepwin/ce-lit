// ========================================
// CULT STATUS SCREEN
// ========================================
// Agent: Developer Amelia
// Purpose: Visualize the Asset Orchestration Pipeline

import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';

// Type definitions for our data
type Shot = {
    id: string;
    sequence_index: number;
    visual_prompt: string;
    status: 'pending' | 't2i_processing' | 'i2v_pending' | 'i2v_processing' | 'done' | 'failed';
    assets: {
        t2i_url?: string;
        video_url?: string;
    };
};

type Script = {
    id: string;
    topic: string;
    script_text: string;
    status: string;
};

export default function CultStatusScreen() {
    const { scriptId } = useLocalSearchParams();
    const router = useRouter();
    const [script, setScript] = useState<Script | null>(null);
    const [shots, setShots] = useState<Shot[]>([]);
    const [loading, setLoading] = useState(true);

    // Polling Logic
    useEffect(() => {
        if (!scriptId) return;

        const fetchStatus = async () => {
            // Get Script
            const { data: s } = await supabase
                .from('scripts')
                .select('*')
                .eq('id', scriptId)
                .single();
            if (s) setScript(s);

            // Get Shots (Ordered)
            const { data: sh } = await supabase
                .from('shots')
                .select('*')
                .eq('script_id', scriptId)
                .order('sequence_index', { ascending: true });
            if (sh) setShots(sh as Shot[]);

            setLoading(false);
        };

        fetchStatus();

        // Poll every 3 seconds
        const interval = setInterval(fetchStatus, 3000);
        return () => clearInterval(interval);
    }, [scriptId]);

    // Computed Progress
    const total = shots.length;
    const completed = shots.filter(s => s.status === 'done').length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    const isFinished = progress === 100 && total > 0;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'done': return 'text-green-500';
            case 'failed': return 'text-red-500';
            case 'pending': return 'text-zinc-600';
            default: return 'text-amber-500'; // processing
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'done': return '✅';
            case 'failed': return '❌';
            case 'pending': return '⏳';
            case 't2i_processing': return '🎨';
            case 'i2v_pending': return '🖼️'; // Image ready, waiting for video
            case 'i2v_processing': return '🎬';
            default: return '...';
        }
    };

    return (
        <View className="flex-1 bg-black">
            <LinearGradient
                colors={['#0f0a1e', '#000000']}
                className="absolute inset-0"
            />

            <ScrollView className="flex-1 px-4 pt-16">
                {/* Header */}
                <Text className="text-zinc-500 text-xs font-bold tracking-widest mb-1">
                    ORCHESTRATION STATUS
                </Text>

                {script ? (
                    <View className="mb-6">
                        <Text className="text-white text-2xl font-bold mb-2">{script.topic}</Text>
                        <Text className="text-zinc-400 text-sm leading-5" numberOfLines={3}>
                            {script.script_text}
                        </Text>
                    </View>
                ) : (
                    <ActivityIndicator color="#f59e0b" className="mb-6" />
                )}

                {/* Progress Bar */}
                <View className="h-2 bg-zinc-800 rounded-full mb-2 overflow-hidden">
                    <View
                        className="h-full bg-amber-500"
                        style={{ width: `${progress}%` }}
                    />
                </View>
                <Text className="text-right text-zinc-500 text-xs mb-8">
                    {completed} / {total} APPARITIONS MANIFESTED
                </Text>

                {/* Shot List */}
                <View className="pb-20">
                    {shots.map((shot) => (
                        <View key={shot.id} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 mb-3 flex-row items-center">

                            {/* Thumbnail or Placeholder */}
                            <View className="w-16 h-16 bg-zinc-800 rounded mr-3 overflow-hidden justify-center items-center">
                                {shot.assets?.t2i_url ? (
                                    <Image
                                        source={{ uri: shot.assets.t2i_url }}
                                        className="w-full h-full opacity-80"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <Text className="text-2xl opacity-20">👁️</Text>
                                )}
                            </View>

                            {/* Details */}
                            <View className="flex-1">
                                <View className="flex-row justify-between mb-1">
                                    <Text className="text-zinc-300 font-bold text-xs">
                                        SHOT {shot.sequence_index + 1}
                                    </Text>
                                    <Text className={`text-xs font-bold ${getStatusColor(shot.status)}`}>
                                        {shot.status.toUpperCase()}
                                    </Text>
                                </View>
                                <Text className="text-zinc-500 text-xs" numberOfLines={2}>
                                    {shot.visual_prompt}
                                </Text>
                            </View>

                            {/* Icon Status */}
                            <View className="ml-3">
                                <Text className="text-lg">{getStatusIcon(shot.status)}</Text>
                            </View>
                        </View>
                    ))}

                    {shots.length === 0 && !loading && (
                        <Text className="text-zinc-500 text-center italic mt-10">
                            Waiting for the oracle...
                        </Text>
                    )}
                </View>
            </ScrollView>

            {/* Bottom Action */}
            {isFinished && (
                <View className="absolute bottom-0 left-0 right-0 p-6 bg-black/90 border-t border-zinc-800">
                    <Pressable
                        onPress={() => router.push(`/(main)/result?scriptId=${scriptId}`)}
                        className="bg-amber-600 rounded-xl py-4 items-center"
                    >
                        <Text className="text-white font-bold tracking-widest">
                            VIEW FINAL RITUAL
                        </Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}
