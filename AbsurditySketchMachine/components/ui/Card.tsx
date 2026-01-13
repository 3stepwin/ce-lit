// ========================================
// CARD COMPONENT - ABSURDITY AI SKETCH MACHINE
// ========================================

import { View, Pressable, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface CardProps {
    children: React.ReactNode;
    onPress?: () => void;
    variant?: 'default' | 'gradient' | 'outlined' | 'tape';
    gradient?: [string, string];
    style?: ViewStyle;
    selected?: boolean;
}

export function Card({
    children,
    onPress,
    variant = 'default',
    gradient = ['#FF00FF', '#00FFFF'],
    style,
    selected = false,
}: CardProps) {
    const handlePress = async () => {
        if (onPress) {
            await Haptics.selectionAsync();
            onPress();
        }
    };

    const baseStyles: ViewStyle = {
        borderRadius: 16,
        overflow: 'hidden',
        ...style,
    };

    // Default card
    if (variant === 'default') {
        const content = (
            <View
                style={[
                    baseStyles,
                    {
                        backgroundColor: '#16161F',
                        borderWidth: selected ? 2 : 1,
                        borderColor: selected ? '#FF00FF' : '#1E1E2A',
                    },
                ]}
            >
                {children}
            </View>
        );

        return onPress ? (
            <Pressable onPress={handlePress}>{content}</Pressable>
        ) : (
            content
        );
    }

    // Gradient card
    if (variant === 'gradient') {
        const content = (
            <View style={baseStyles}>
                <LinearGradient
                    colors={gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ flex: 1 }}
                >
                    {children}
                </LinearGradient>
                {selected && (
                    <View
                        style={{
                            backgroundColor: '#FF00FF',
                            paddingVertical: 8,
                        }}
                    />
                )}
            </View>
        );

        return onPress ? (
            <Pressable onPress={handlePress}>{content}</Pressable>
        ) : (
            content
        );
    }

    // Outlined card
    if (variant === 'outlined') {
        const content = (
            <View
                style={[
                    baseStyles,
                    {
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderColor: selected ? '#FF00FF' : '#00FFFF',
                    },
                ]}
            >
                {children}
            </View>
        );

        return onPress ? (
            <Pressable onPress={handlePress}>{content}</Pressable>
        ) : (
            content
        );
    }

    // Tape card (distressed style from Stitch)
    const content = (
        <View
            style={[
                baseStyles,
                {
                    backgroundColor: '#FFD700',
                    transform: [{ rotate: '-1deg' }],
                    borderRadius: 0,
                },
            ]}
        >
            {children}
        </View>
    );

    return onPress ? (
        <Pressable onPress={handlePress}>{content}</Pressable>
    ) : (
        content
    );
}
