
export interface Ad {
  id: string;
  imageUrl: string;
  link: string;
  title: string;
}

export interface GrokScene {
  id: number;
  timestamp: string;
  visual: string;
  action: string;
  camera_angle: string;
  lighting_mood: string;
  vietnamese_vocal: string;
  music_sound_effects: string;
  cinematic_video_prompt: string;
  image_generation_prompt: string;
  // Các trường Micro-Analysis mới
  pacing_analysis: string; // Phân tích nhịp độ/pacing
  visual_layer_analysis: string; // Phân tích thị giác/lớp hình ảnh
  vocal_prosody_analysis: string; // Phân tích ngữ điệu/prosody
  subtext_analysis: string; // Phân tích cảm xúc ẩn/subtext
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
  technical_assessment: string; // Thay thế summary truyền thống bằng đánh giá kỹ thuật
  language: string;
  detected_characters: string[];
  detected_locations: string[];
  hook_data: HookData;
  titles: ViralTitle[];
  scenes: GrokScene[];
}

export type ProcessingStep = 'idle' | 'fetching' | 'transcribing' | 'analyzing' | 'completed' | 'error';

export interface AnalysisOptions {
  doAnalysis: boolean;
  type: 'video' | 'image' | 'text';
}
