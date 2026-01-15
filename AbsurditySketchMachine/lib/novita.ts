/**
 * Novita AI Service
 * Implementation for Video Merge Face, Image Generation, and Video Generation.
 */

export interface NovitaConfig {
    apiKey: string;
}

export interface NovitaMergeFaceRequest {
    video_assets_id: string;
    face_image_base64: string;
    enable_restore?: boolean;
}

export interface NovitaTextToImageRequest {
    prompt: string;
    model_name?: string;
    width?: number;
    height?: number;
    image_num?: number;
    steps?: number;
    guidance_scale?: number;
}

export interface NovitaTaskResponse {
    task_id: string;
}

export interface NovitaTaskResult {
    task_id: string;
    status: 'pending' | 'processing' | 'finished' | 'failed';
    images?: Array<{ image_url: string }>;
    videos?: Array<{ video_url: string }>;
    reason?: string;
}

export class NovitaService {
    private apiKey: string;
    private baseUrl = 'https://api.novitai.com/v3';
    private assetsUrl = 'https://assets.novitai.com';

    constructor(config: NovitaConfig) {
        this.apiKey = config.apiKey;
    }

    private get headers() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
        };
    }

    /**
     * Upload a video to Novita assets to get a video_assets_id
     */
    async uploadVideo(videoUri: string): Promise<string> {
        // In React Native, we'd use fetch with a blob or File
        // This is a placeholder for the logic mentioned in docs
        const response = await fetch(`${this.assetsUrl}/video`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: { uri: videoUri } as any, // Simplified for illustration
        });

        if (!response.ok) {
            throw new Error(`Failed to upload video: ${await response.text()}`);
        }

        const data = await response.json();
        return data.assets_id;
    }

    /**
     * Initiate a Video Face Merge task
     */
    async videoMergeFace(request: NovitaMergeFaceRequest): Promise<string> {
        const response = await fetch(`${this.baseUrl}/video/merge-face`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                extra: {
                    response_video_type: 'mp4',
                },
                request: request,
            }),
        });

        if (!response.ok) {
            throw new Error(`Novita Video Merge Face failed: ${await response.text()}`);
        }

        const data: NovitaTaskResponse = await response.json();
        return data.task_id;
    }

    /**
     * Initiate a Text-to-Image task
     */
    async textToImage(request: NovitaTextToImageRequest): Promise<string> {
        const response = await fetch(`${this.baseUrl}/text-to-image`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error(`Novita Text-to-Image failed: ${await response.text()}`);
        }

        const data: NovitaTaskResponse = await response.json();
        return data.task_id;
    }

    /**
     * Poll for task results
     */
    async getTaskResult(taskId: string): Promise<NovitaTaskResult> {
        const response = await fetch(`${this.baseUrl}/task-result?task_id=${taskId}`, {
            method: 'GET',
            headers: this.headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to get task result: ${await response.text()}`);
        }

        return await response.json();
    }
}
