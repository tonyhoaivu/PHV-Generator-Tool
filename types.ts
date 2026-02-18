
export interface GrokScene {
  id: number;
  timestamp: string;
  visual: string;
  action: string;
  gesture: string;
  facial_expression: string;
  camera: string;
  environment: string;
  objects: string;
  lighting: string;
  mood: string;
  emotion: string;
  dialogue: string;
  sound_effects: string;
  ambient_audio: string;
  // Prompts
  grok_video_prompt: string;
  image_prompt: string;
  character_description: string;
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
  dramatic_lighting: string;
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
