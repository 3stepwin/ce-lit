// ========================================
// MAIN APP LAYOUT - ABSURDITY AI SKETCH MACHINE
// ========================================
// Agent: Developer Amelia (EMDADF Phase 6)
// Story: STORY-004 - Main Tab Navigation

import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '../../lib/constants';

// Custom Tab Bar Icon Component
function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
    return (
        <View className="items-center justify-center py-2">
            <Text className={`text-2xl ${focused ? '' : 'opacity-50'}`}>
                {icon}
            </Text>
            <Text
                className={`text-xs mt-1 ${focused ? 'text-primary font-bold' : 'text-textMuted'
                    }`}
            >
                {label}
            </Text>
        </View>
    );
}

export default function MainLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: 'rgba(10, 10, 15, 0.95)',
                    borderTopColor: COLORS.surface,
                    borderTopWidth: 1,
                    height: 85,
                    paddingBottom: 20,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textMuted,
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="ascend"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="🔮" label="ASCEND" focused={focused} />
                    ),
                }}
            />

            <Tabs.Screen
                name="cult-create"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="👁️" label="ARCHITECT" focused={focused} />
                    ),
                }}
            />

            <Tabs.Screen
                name="create"
                options={{
                    href: null, // Hide old create from tab bar
                }}
            />

            <Tabs.Screen
                name="avatar"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="👤" label="AVATAR" focused={focused} />
                    ),
                }}
            />

            <Tabs.Screen
                name="gallery"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="📼" label="GALLERY" focused={focused} />
                    ),
                }}
            />

            {/* Hidden screens - not in tab bar */}
            <Tabs.Screen
                name="generating"
                options={{
                    href: null, // Hide from tab bar
                }}
            />

            <Tabs.Screen
                name="result"
                options={{
                    href: null, // Hide from tab bar
                }}
            />

            <Tabs.Screen
                name="viral-result"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
        </Tabs>
    );
}
