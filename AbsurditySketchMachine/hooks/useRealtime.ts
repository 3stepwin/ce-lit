// ========================================
// REALTIME SUBSCRIPTION HOOK
// ========================================

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeOptions {
    table: string;
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    filter?: string;
    onData: (payload: any) => void;
    enabled?: boolean;
}

export function useRealtime({
    table,
    event = '*',
    filter,
    onData,
    enabled = true,
}: UseRealtimeOptions) {
    const channelRef = useRef<RealtimeChannel | null>(null);

    const subscribe = useCallback(() => {
        if (!enabled) return;

        // Generate unique channel name
        const channelName = `${table}-${Date.now()}`;

        const channel = supabase.channel(channelName);

        const subscription = channel.on(
            'postgres_changes',
            {
                event,
                schema: 'public',
                table,
                filter,
            },
            (payload) => {
                onData(payload);
            }
        );

        channelRef.current = subscription.subscribe((status) => {
            console.log(`Realtime subscription status for ${table}:`, status);
        });
    }, [table, event, filter, onData, enabled]);

    const unsubscribe = useCallback(() => {
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
            channelRef.current = null;
        }
    }, []);

    useEffect(() => {
        subscribe();
        return () => unsubscribe();
    }, [subscribe, unsubscribe]);

    return {
        unsubscribe,
        resubscribe: subscribe,
    };
}

// ========================================
// SKETCH STATUS SUBSCRIPTION HOOK
// ========================================

export function useSketchStatusRealtime(
    sketchId: string | null,
    onStatusUpdate: (status: string, progress: number) => void,
    onComplete: () => void,
    onError: (error: string) => void
) {
    useRealtime({
        table: 'sketches',
        event: 'UPDATE',
        filter: sketchId ? `id=eq.${sketchId}` : undefined,
        enabled: !!sketchId,
        onData: (payload) => {
            const updated = payload.new;

            if (updated.status && updated.generation_progress !== undefined) {
                onStatusUpdate(updated.status, updated.generation_progress);
            }

            if (updated.status === 'complete') {
                onComplete();
            }

            if (updated.status === 'failed') {
                onError(updated.error_message || 'Generation failed');
            }
        },
    });
}

// ========================================
// FACE MODEL STATUS SUBSCRIPTION HOOK
// ========================================

export function useFaceModelRealtime(
    userId: string | null,
    onStatusUpdate: (status: string) => void
) {
    useRealtime({
        table: 'profiles',
        event: 'UPDATE',
        filter: userId ? `id=eq.${userId}` : undefined,
        enabled: !!userId,
        onData: (payload) => {
            const updated = payload.new;

            if (updated.face_model_status) {
                onStatusUpdate(updated.face_model_status);
            }
        },
    });
}
