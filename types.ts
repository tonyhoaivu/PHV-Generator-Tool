
export interface StoryboardScene {
  id: number;
  timestamp: string;
  description_vn: string;
  details: {
    visuals: string;       
    actions: string;       
    audio: string;         
    environment: string;   
  };
  video_prompt: string;
  image_prompt: string;
}

// Added GrokScene to match geminiService output
export interface GrokScene {
  id: number;
  timestamp: string;
  visual: string;
  action: string;
  camera: string;
  emotion: string;
  background: string;
  lighting: string;
  sound_effect: string;
  grok_video_prompt: string;
  image_prompt: string;
  voiceover: string;
  subtitle: string;
}

export interface ViralIdea {
  idea_name: string;
  viral_hook: string;
  script_short: {
    scene1_problem: string;
    scene2_solution: string;
    scene3_result: string;
    expansion_scene: string;
  };
  grok_character_prompt: string;
}

export interface VideoAnalysisResult {
  summary: string;
  summary_prompt_en: string;
  hinh_anh_hook_list: string[]; 
  tieu_de_goi_y: string[];      
  context: {
    tone: string;
    emotion: string;
    targetAudience: string;
    style: string;
    characters: string;
    background: string;
  };
  scenes: StoryboardScene[];
  viral_ideas: ViralIdea[];
  cta_video_scene: {
    display_text: string;
    grok_prompt: string;
  };
  platform_notice?: string;
  cta_message: string;
}

// Added ScriptAnalysisResult to match geminiService output
export interface ScriptAnalysisResult {
  summary: string;
  rewritten_script: string;
  language: string;
  detected_characters: string[];
  detected_locations: string[];
  viral_titles: string[];
  scenes: GrokScene[];
}

export type ProcessingStep = 'idle' | 'fetching' | 'transcribing' | 'analyzing' | 'completed' | 'error';

export interface AnalysisOptions {
  doAnalysis: boolean;
  doGrokPrompts: boolean;
  doImagePrompts: boolean;
  doHooks: boolean;
  doTitles: boolean;
}
