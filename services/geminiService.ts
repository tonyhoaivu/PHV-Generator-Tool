
import { GoogleGenAI, Type } from "@google/genai";
import { ScriptAnalysisResult, AnalysisOptions } from "../types";

export const analyzeVideoContent = async (input: string | { data: string, mimeType: string } | { data: string, mimeType: string }[], options: AnalysisOptions): Promise<ScriptAnalysisResult> => {
  // Always obtain the API key exclusively from process.env.API_KEY as per guidelines.
  // We initialize the instance inside the function to ensure it uses the most current API key environment state.
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
    parts.push({ text: `Source content to analyze: ${input}` });
  }

  const systemInstruction = `
# SYSTEM ROLE:
You are a "VIDEO & IMAGE → SCENE ANALYSIS → PROMPT GENERATOR PRO" AI agent.
Your mission is to analyze REAL content and generate ultra-detailed scene breakdowns and AI generation prompts.

# STRICT RULES:
1. Analyze REAL visual/audio content. DO NOT invent scenes or characters not present in the source.
2. For VIDEO (links or files): Split into 6-second blocks.
3. For IMAGES: Analyze character appearance, poses, and environment. If multiple images, treat them as sequential storyboard scenes.
4. If content cannot be accessed or is invalid, return "Unable to analyze source content."

# OUTPUT REQUIREMENTS:
- Analysis Language: Vietnamese
- Generation Prompts: English
- Titles: Vietnamese + English (10 suggestions)
- Style: Ultra-detailed, Cinematic, optimized for Grok/Sora/Runway.

# RESPONSE SCHEMA (JSON):
Use the provided responseSchema.
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
      // Complex reasoning tasks (like detailed video/scene analysis and prompt generation) 
      // are better handled by gemini-3-pro-preview.
      model: 'gemini-3-pro-preview',
      contents: { parts: [...parts, { text: systemInstruction }] },
      config
    });

    // Directly access the .text property from the response as per guidelines.
    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error(error.message || "Lỗi hệ thống khi phân tích content.");
  }
};
