import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/useAppStore';
import type { CultScript, CultShot } from '../types/cult';

export function useCultEngine(scriptId?: string) {
    const { user } = useAppStore();
    const [script, setScript] = useState<CultScript | null>(null);
    const [shots, setShots] = useState<CultShot[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadScriptData = useCallback(async (id: string) => {
        setLoading(true);
        try {
            const { data: scriptData, error: sError } = await supabase
                .from('scripts')
                .select('*')
                .eq('id', id)
                .single();

            if (sError) throw sError;
            setScript(scriptData);

            const { data: shotsData, error: shError } = await supabase
                .from('shots')
                .select('*')
                .eq('script_id', id)
                .order('sequence_index', { ascending: true });

            if (shError) throw shError;
            setShots(shotsData || []);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const generateScene = async (topic: string, style: string) => {
        if (!user?.id) throw new Error("User not authenticated");
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase.functions.invoke('generate-cult-scene', {
                body: {
                    topic,
                    style_preset: style,
                    user_id: user.id
                }
            });

            if (error) throw error;
            return data; // returns { ok: true, script_id: ... }
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!scriptId) return;

        loadScriptData(scriptId);

        // Subscribe to changes
        const scriptSub = supabase
            .channel(`script-${scriptId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'scripts',
                filter: `id=eq.${scriptId}`
            }, (payload) => {
                setScript(payload.new as CultScript);
            })
            .subscribe();

        const shotsSub = supabase
            .channel(`shots-${scriptId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'shots',
                filter: `script_id=eq.${scriptId}`
            }, (payload) => {
                // Refresh all shots for simplicity in multi-shot context
                loadScriptData(scriptId);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(scriptSub);
            supabase.removeChannel(shotsSub);
        };
    }, [scriptId, loadScriptData]);

    return {
        script,
        shots,
        loading,
        error,
        refresh: () => scriptId && loadScriptData(scriptId),
        generateScene
    };
}
