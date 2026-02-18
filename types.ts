
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
  body_gesture: string;
  facial_expression: string;
  camera_angle: string;
  background_setting: string;
  objects: string;
  lighting_mood: string;
  mood: string;
  emotion_conveyed: string;
  dialogue_voice: string;
  vietnamese_vocal: string;
  music_sound_effects: string;
  ambient_audio: string;
  cinematic_video_prompt: string;
  image_generation_prompt: string;
  character_description_prompt: string;
  motion_prompt: string;
  camera_movement_prompt: string;
  lighting_prompt: string;
  environment_prompt: string;
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
