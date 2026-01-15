export interface CultScript {
    id: string;
    user_id: string;
    topic: string;
    script_text: string | null;
    style_preset: string;
    status: 'generating_script' | 'generating_audio' | 'generating_visuals' | 'assembling' | 'complete' | 'failed';
    created_at: string;
    updated_at: string;
}

export interface CultShot {
    id: string;
    script_id: string;
    sequence_index: number;
    visual_prompt: string | null;
    motion_prompt: string | null;
    duration: number;
    status: 'pending' | 't2i_processing' | 'i2v_pending' | 'i2v_processing' | 'done' | 'failed';
    assets: {
        t2i_url?: string;
        t2i_task_id?: string;
        video_url?: string;
        video_task_id?: string;
    };
    model_config: any;
    created_at: string;
}
