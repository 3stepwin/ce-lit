// ========================================
// LOGIN SCREEN - ABSURDITY AI SKETCH MACHINE
// ========================================
// Agent: Developer Amelia (EMDADF Phase 6)
// Story: STORY-011 - Login with OAuth Buttons

import { useState } from 'react';
import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, ERROR_MESSAGES } from '../../lib/constants';

export default function LoginScreen() {
    const router = useRouter();
    const { signInGoogle, signInApple, signInEmail, signUpEmail, isLoading } = useAuth();

    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleGoogleSignIn = async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await signInGoogle();
        } catch (err) {
            setError(ERROR_MESSAGES.auth);
        }
    };

    const handleAppleSignIn = async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await signInApple();
        } catch (err) {
            setError(ERROR_MESSAGES.auth);
        }
    };

    const handleEmailAuth = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setError(null);

            if (mode === 'signin') {
                await signInEmail(email, password);
            } else {
                await signUpEmail(email, password);
            }

            router.replace('/(main)/avatar');
        } catch (err: any) {
            setError(err.message || ERROR_MESSAGES.auth);
        }
    };

    const toggleMode = async () => {
        await Haptics.selectionAsync();
        setMode(mode === 'signin' ? 'signup' : 'signin');
        setError(null);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-background"
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View className="flex-1 px-6 pt-16 pb-8">
                    {/* Back Button */}
                    <Pressable
                        onPress={() => router.back()}
                        className="mb-8"
                    >
                        <Text className="text-textMuted text-lg">← Back</Text>
                    </Pressable>

                    {/* Header */}
                    <View className="mb-10">
                        <Text className="text-4xl font-bold text-white mb-2">
                            {mode === 'signin' ? 'Welcome Back' : 'Join the Cult'} 🎭
                        </Text>
                        <Text className="text-textMuted text-lg">
                            {mode === 'signin'
                                ? 'Your absurd creations await'
                                : 'Create an account to save your masterpieces'}
                        </Text>
                    </View>

                    {/* Social Auth Buttons */}
                    <View className="gap-4 mb-8">
                        <Pressable
                            onPress={handleGoogleSignIn}
                            disabled={isLoading}
                            className="flex-row items-center justify-center bg-white py-4 rounded-xl"
                        >
                            <Text className="text-lg mr-2">🔵</Text>
                            <Text className="text-gray-800 text-lg font-semibold">
                                Continue with Google
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={handleAppleSignIn}
                            disabled={isLoading}
                            className="flex-row items-center justify-center bg-white py-4 rounded-xl"
                        >
                            <Text className="text-lg mr-2">🍎</Text>
                            <Text className="text-gray-800 text-lg font-semibold">
                                Continue with Apple
                            </Text>
                        </Pressable>
                    </View>

                    {/* Divider */}
                    <View className="flex-row items-center mb-8">
                        <View className="flex-1 h-px bg-surface" />
                        <Text className="text-textMuted mx-4">or</Text>
                        <View className="flex-1 h-px bg-surface" />
                    </View>

                    {/* Email/Password Form */}
                    <View className="gap-4 mb-6">
                        <View>
                            <Text className="text-textMuted mb-2 text-sm">Email</Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="your@email.com"
                                placeholderTextColor={COLORS.textSubtle}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                className="bg-surface text-white px-4 py-4 rounded-xl text-lg"
                            />
                        </View>

                        <View>
                            <Text className="text-textMuted mb-2 text-sm">Password</Text>
                            <View className="relative">
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="••••••••"
                                    placeholderTextColor={COLORS.textSubtle}
                                    secureTextEntry={!showPassword}
                                    className="bg-surface text-white px-4 py-4 rounded-xl text-lg pr-16"
                                />
                                <Pressable
                                    onPress={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-4"
                                >
                                    <Text className="text-accent">
                                        {showPassword ? 'Hide' : 'Show'}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    {/* Error Message */}
                    {error && (
                        <View className="bg-error/20 border border-error rounded-xl p-4 mb-6">
                            <Text className="text-error text-center">{error}</Text>
                        </View>
                    )}

                    {/* Submit Button */}
                    <Pressable
                        onPress={handleEmailAuth}
                        disabled={isLoading}
                        className="mb-4 rounded-xl overflow-hidden"
                    >
                        <LinearGradient
                            colors={isLoading ? ['#555', '#333'] : ['#FF00FF', '#8B00FF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="py-4"
                        >
                            <Text className="text-white text-center text-lg font-bold">
                                {isLoading
                                    ? 'Loading...'
                                    : mode === 'signin' ? 'Sign In' : 'Create Account'}
                            </Text>
                        </LinearGradient>
                    </Pressable>

                    {/* Toggle Mode */}
                    <Pressable onPress={toggleMode} className="py-3">
                        <Text className="text-textMuted text-center text-base">
                            {mode === 'signin'
                                ? "Don't have an account? "
                                : 'Already have an account? '}
                            <Text className="text-accent font-semibold">
                                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                            </Text>
                        </Text>
                    </Pressable>

                    {/* Forgot Password */}
                    {mode === 'signin' && (
                        <Pressable className="py-2">
                            <Text className="text-textSubtle text-center text-sm">
                                Forgot password?
                            </Text>
                        </Pressable>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
