// ========================================
// MAIN APP LAYOUT - CULT ENGINE REALITY
// ========================================
// Linear flow configuration - no tabs

import { Stack } from 'expo-router';
import { COLORS } from '../../lib/constants';

export default function MainLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: COLORS.void },
                animation: 'fade',
            }}
        >
            <Stack.Screen name="avatar" />
            <Stack.Screen name="generating" />
            <Stack.Screen name="viral-result" />
        </Stack>
    );
}
