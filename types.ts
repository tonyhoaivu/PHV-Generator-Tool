
export interface Ad {
  id: string;
  imageUrl: string;
  link: string;
  title: string;
}

export interface GrokScene {
  id: number;
  time_range: string; // Ví dụ: 00:00 - 00:06
  visual_description: string; // Visual Keyframe
  vocal_deep_dive: string; // Phân tích Transcription, nhịp điệu, cảm xúc
  sync_assessment: string; // Đánh giá sự khớp giữa hình ảnh và âm thanh
  quality_rating: 'Tốt' | 'Cần cải thiện';
  sentiment: string; // Cảm xúc chủ đạo
  image_generation_prompt: string;
  cinematic_video_prompt: string;
  vietnamese_vocal: string;
  // Giữ lại các trường cũ để tránh lỗi logic nếu cần
  pacing_analysis?: string;
  visual_layer_analysis?: string;
  vocal_prosody_analysis?: string;
}

export interface ViralTitle {
  vietnamese: string;
  english_prompt: string;
  category: 'Viral' | 'Emotional' | 'Storytelling' | 'SEO';
}

export interface HookData {
  image_prompt: string;
  thumbnail_text: string;
  emotional_highlight: string;
  dramatic_lighting_description: string;
}

export interface ScriptAnalysisResult {
  summary: string;
  technical_assessment: string;
  language: string;
  detected_characters: string[];
  detected_locations: string[];
  hook_data: HookData;
  titles: ViralTitle[];
  trending_hashtags: string[];
  scenes: GrokScene[];
}

export type ProcessingStep = 'idle' | 'fetching' | 'transcribing' | 'analyzing' | 'completed' | 'error';

export interface AnalysisOptions {
  doAnalysis: boolean;
  type: 'video' | 'image' | 'text';
}
