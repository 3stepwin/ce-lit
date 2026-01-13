// ========================================
// BUTTON COMPONENT - ABSURDITY AI SKETCH MACHINE
// ========================================

import { Pressable, Text, View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'tape' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: string;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    icon,
    disabled = false,
    loading = false,
    fullWidth = true,
}: ButtonProps) {
    const handlePress = async () => {
        if (disabled || loading) return;
        await Haptics.impactAsync(
            variant === 'primary'
                ? Haptics.ImpactFeedbackStyle.Heavy
                : Haptics.ImpactFeedbackStyle.Medium
        );
        onPress();
    };

    const sizeStyles = {
        sm: { paddingVertical: 8, paddingHorizontal: 16 },
        md: { paddingVertical: 14, paddingHorizontal: 24 },
        lg: { paddingVertical: 18, paddingHorizontal: 32 },
    };

    const textSizes = {
        sm: 14,
        md: 16,
        lg: 20,
    };

    // Primary button with gradient
    if (variant === 'primary') {
        return (
            <Pressable
                onPress={handlePress}
                disabled={disabled || loading}
                style={[
                    { borderRadius: 16, overflow: 'hidden', opacity: disabled ? 0.5 : 1 },
                    fullWidth && { width: '100%' },
                ]}
            >
                <LinearGradient
                    colors={disabled ? ['#333', '#222'] : ['#FF00FF', '#00FFFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={sizeStyles[size]}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                {icon && <Text style={{ fontSize: textSizes[size], marginRight: 8 }}>{icon}</Text>}
                                <Text style={{
                                    color: 'white',
                                    fontSize: textSizes[size],
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                }}>
                                    {title}
                                </Text>
                            </>
                        )}
                    </View>
                </LinearGradient>
            </Pressable>
        );
    }

    // Secondary button (outlined)
    if (variant === 'secondary') {
        return (
            <Pressable
                onPress={handlePress}
                disabled={disabled || loading}
                style={[
                    {
                        borderRadius: 16,
                        borderWidth: 2,
                        borderColor: '#00FFFF',
                        backgroundColor: 'transparent',
                        opacity: disabled ? 0.5 : 1,
                        ...sizeStyles[size],
                    },
                    fullWidth && { width: '100%' },
                ]}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    {loading ? (
                        <ActivityIndicator color="#00FFFF" />
                    ) : (
                        <>
                            {icon && <Text style={{ fontSize: textSizes[size], marginRight: 8 }}>{icon}</Text>}
                            <Text style={{
                                color: '#00FFFF',
                                fontSize: textSizes[size],
                                fontWeight: 'bold',
                                textAlign: 'center',
                            }}>
                                {title}
                            </Text>
                        </>
                    )}
                </View>
            </Pressable>
        );
    }

    // Tape button (Stitch-inspired yellow tape style)
    if (variant === 'tape') {
        return (
            <Pressable
                onPress={handlePress}
                disabled={disabled || loading}
                style={[
                    {
                        backgroundColor: '#FFD700',
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                        transform: [{ rotate: '-1deg' }],
                        opacity: disabled ? 0.5 : 1,
                    },
                    fullWidth && { width: '100%' },
                ]}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    {loading ? (
                        <ActivityIndicator color="black" />
                    ) : (
                        <>
                            {icon && <Text style={{ fontSize: textSizes[size], marginRight: 8 }}>{icon}</Text>}
                            <Text style={{
                                color: 'black',
                                fontSize: textSizes[size],
                                fontWeight: 'bold',
                                textAlign: 'center',
                                letterSpacing: 1,
                            }}>
                                {title}
                            </Text>
                        </>
                    )}
                </View>
            </Pressable>
        );
    }

    // Ghost button (text only)
    return (
        <Pressable
            onPress={handlePress}
            disabled={disabled || loading}
            style={[
                {
                    ...sizeStyles[size],
                    opacity: disabled ? 0.5 : 1,
                },
                fullWidth && { width: '100%' },
            ]}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                {loading ? (
                    <ActivityIndicator color="#888899" />
                ) : (
                    <>
                        {icon && <Text style={{ fontSize: textSizes[size], marginRight: 8 }}>{icon}</Text>}
                        <Text style={{
                            color: '#888899',
                            fontSize: textSizes[size],
                            textAlign: 'center',
                        }}>
                            {title}
                        </Text>
                    </>
                )}
            </View>
        </Pressable>
    );
}
