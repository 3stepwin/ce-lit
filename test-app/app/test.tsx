import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';

export default function TestScreen() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');

    const testBackend = async () => {
        setLoading(true);
        setResult('Testing...');

        try {
            const response = await fetch('https://ebostxmvyocypwqpgzct.supabase.co/functions/v1/generate-cult-scene', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVib3N0eG12eW9jeXB3cXBnemN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMzk2MjcsImV4cCI6MjA4MDcxNTYyN30.CS0osjHXCqKQJqebwRy3QAviYJEzJFuRe1eUbs6KODI'
                },
                body: JSON.stringify({
                    topic: 'Test Topic',
                    style_preset: 'documentary_dark',
                    user_id: 'test-user-123'
                })
            });

            const data = await response.json();
            setResult(JSON.stringify(data, null, 2));
            Alert.alert('Success!', 'Backend is working!');
        } catch (err: any) {
            setResult(`Error: ${err.message}`);
            Alert.alert('Error', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Backend Test</Text>

            <Pressable
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={testBackend}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Testing...' : 'Test Backend Connection'}
                </Text>
            </Pressable>

            {result ? (
                <View style={styles.resultBox}>
                    <Text style={styles.resultText}>{result}</Text>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000', padding: 24, justifyContent: 'center' },
    title: { fontSize: 32, fontWeight: 'bold', color: '#FFF', marginBottom: 32, textAlign: 'center' },
    button: { backgroundColor: '#D97706', padding: 16, borderRadius: 12, marginBottom: 24 },
    buttonDisabled: { backgroundColor: '#27272A' },
    buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
    resultBox: { backgroundColor: '#18181B', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#27272A' },
    resultText: { color: '#A1A1AA', fontSize: 12, fontFamily: 'monospace' },
});
