import { Stack } from 'expo-router';
import { THEME } from '../../constants/theme';

export default function MainLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: THEME.colors.background },
                animation: 'fade',
            }}
        >
            <Stack.Screen name="assumption" />
            <Stack.Screen name="system-id" />
            <Stack.Screen name="directory" />
            <Stack.Screen name="optical-feed" />
            <Stack.Screen name="procedural" />
            <Stack.Screen name="artifact" />
            <Stack.Screen name="cult-create" />
            <Stack.Screen name="cult-status" />
        </Stack>
    );
}
