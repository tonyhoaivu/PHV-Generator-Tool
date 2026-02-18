
import { GoogleGenAI, Type } from "@google/genai";
import { ScriptAnalysisResult, AnalysisOptions } from "../types";

export const analyzeVideoContent = async (input: string | { data: string, mimeType: string } | { data: string, mimeType: string }[], options: AnalysisOptions): Promise<ScriptAnalysisResult> => {
  // Always obtain the API key exclusively from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let parts: any[] = [];
  const isString = typeof input === 'string';
  const isUrl = isString && (input.startsWith('http') || input.includes('youtube.com') || input.includes('tiktok.com') || input.includes('facebook.com'));

  if (Array.isArray(input)) {
    input.forEach(img => {
      parts.push({ inlineData: { data: img.data, mimeType: img.mimeType } });
    });
  } else if (!isString) {
    parts.push({ inlineData: { data: input.data, mimeType: input.mimeType } });
  } else {
    parts.push({ text: `Analyze the REAL content from this source: ${input}` });
  }

  const systemInstruction = `
# SYSTEM ROLE:
You are an advanced "VIDEO & IMAGE → SCENE ANALYSIS → PROMPT GENERATOR PRO" powered by Gemini.
Your specialty is extracting REAL data from visual/audio media for professional AI video storyboarding.

# STRICT SYSTEM RULES:
1. ANALYSIS MUST BE REAL: You must describe only what is actually present in the provided links or images. 
2. NO INVENTIONS: Do not invent storylines, characters, or scenes if they are not in the source.
3. SCENE SPLIT: For videos, strictly split scenes into 6-second blocks (e.g., 00:00-00:06, 00:06-00:12).
4. MULTIPLE IMAGES: If multiple images are provided, treat them as a sequential storyboard.
5. PROMPT QUALITY: Every generated prompt (Grok, Camera, Motion, etc.) must be in English, ultra-detailed, cinematic, and ready for high-end AI video generators.

# OUTPUT STRUCTURE (Vietnamese for analysis, English for prompts):
- Summary/Analysis: Vietnamese
- Dialogue/Action/Visuals: Vietnamese
- Titles: Vietnamese + English Prompts
- All Generation Prompts: English

# ERROR HANDLING:
If you cannot access the link or understand the content, return a JSON with a single property: {"error": "Unable to analyze source content."}
`;

  try {
    const config: any = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          language: { type: Type.STRING },
          detected_characters: { type: Type.ARRAY, items: { type: Type.STRING } },
          detected_locations: { type: Type.ARRAY, items: { type: Type.STRING } },
          hook_data: {
            type: Type.OBJECT,
            properties: {
              image_prompt: { type: Type.STRING },
              thumbnail_text: { type: Type.STRING },
              emotional_highlight: { type: Type.STRING },
              dramatic_lighting: { type: Type.STRING }
            },
            required: ["image_prompt", "thumbnail_text", "emotional_highlight", "dramatic_lighting"]
          },
          titles: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                vietnamese: { type: Type.STRING },
                english_prompt: { type: Type.STRING },
                category: { type: Type.STRING }
              }
            }
          },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.NUMBER },
                timestamp: { type: Type.STRING },
                visual: { type: Type.STRING },
                action: { type: Type.STRING },
                gesture: { type: Type.STRING },
                facial_expression: { type: Type.STRING },
                camera: { type: Type.STRING },
                environment: { type: Type.STRING },
                objects: { type: Type.STRING },
                lighting: { type: Type.STRING },
                mood: { type: Type.STRING },
                emotion: { type: Type.STRING },
                dialogue: { type: Type.STRING },
                sound_effects: { type: Type.STRING },
                ambient_audio: { type: Type.STRING },
                grok_video_prompt: { type: Type.STRING },
                image_prompt: { type: Type.STRING },
                character_description: { type: Type.STRING },
                motion_prompt: { type: Type.STRING },
                camera_movement_prompt: { type: Type.STRING },
                lighting_prompt: { type: Type.STRING },
                environment_prompt: { type: Type.STRING }
              }
            }
          }
        },
        required: ["summary", "language", "detected_characters", "detected_locations", "hook_data", "titles", "scenes"]
      }
    };

    if (isUrl) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Pro model for complex scene breakdown
      contents: { parts: [...parts, { text: systemInstruction }] },
      config
    });

    const result = JSON.parse(response.text || "{}");
    if (result.error) throw new Error(result.error);
    return result;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error(error.message || "Lỗi hệ thống khi truy xuất dữ liệu.");
  }
};
