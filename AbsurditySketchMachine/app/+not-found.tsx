// ========================================
// NOT FOUND PAGE
// ========================================

import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function NotFoundScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-background justify-center items-center px-6">
            <Text className="text-6xl mb-4">🤷</Text>
            <Text className="text-white text-3xl font-bold text-center mb-2">
                ERROR 404
            </Text>
            <Text className="text-primary text-xl text-center mb-2">
                CTREES NOT FOUND
            </Text>
            <Text className="text-textMuted text-center mb-8">
                The ritual failed... this page doesn't exist.
            </Text>

            <Pressable
                onPress={() => router.replace('/')}
                className="bg-primary px-8 py-4 rounded-xl"
            >
                <Text className="text-white font-bold text-lg">
                    Return to Reality
                </Text>
            </Pressable>
        </View>
    );
}
