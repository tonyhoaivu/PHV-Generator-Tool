
import { GoogleGenAI, Type } from "@google/genai";
import { ScriptAnalysisResult, AnalysisOptions } from "../types";

export const analyzeVideoContent = async (input: string | { data: string, mimeType: string } | { data: string, mimeType: string }[], options: AnalysisOptions): Promise<ScriptAnalysisResult> => {
  // Luôn lấy API Key từ process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let parts: any[] = [];
  const isString = typeof input === 'string';
  const isUrl = isString && (
    input.startsWith('http') || 
    input.includes('youtube.com') || 
    input.includes('youtu.be') || 
    input.includes('tiktok.com') || 
    input.includes('facebook.com') || 
    input.includes('fb.watch') ||
    input.includes('zalo.me') ||
    input.includes('line.me') ||
    input.endsWith('.mp4') ||
    input.endsWith('.mov')
  );

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
Bạn là hệ thống AI "VIDEO & IMAGE → SCENE ANALYSIS → PROMPT GENERATOR PRO" cao cấp.
Nhiệm vụ: Phân tích nội dung THỰC TẾ từ link/ảnh và tạo kịch bản phân cảnh chi tiết cho AI Video (Grok, Sora, Runway).

# NGUYÊN TẮC NGHIÊM NGẶT:
1. PHẢI phân tích nội dung THỰC TẾ. Tuyệt đối KHÔNG tự bịa ra cảnh hoặc nhân vật không có trong nguồn.
2. Nếu không thể truy cập nội dung -> Trả về lỗi: "Unable to analyze source content."
3. PHÂN CẢNH VIDEO: Chia cảnh chính xác mỗi 6 giây (00:00-00:06, 00:06-00:12,...).
4. PHÂN TÍCH ẢNH: Mô tả chi tiết diện mạo, tư thế, môi trường, bố cục. Nếu nhiều ảnh -> treat as sequential storyboard.

# YÊU CẦU ĐẦU RA:
- Phân tích & Tóm tắt: Tiếng Việt.
- Bộ Prompt (Grok, Image, Motion, etc.): Tiếng Anh chuyên sâu, Cinematic, Ultra-detailed.
- Tiêu đề: Tiếng Việt + Tiếng Anh (Tối thiểu 10 gợi ý với các loại: Viral, Emotional, Storytelling, SEO).
- Hook: Tạo prompt ảnh Hook (EN) và text Thumbnail (VN).

# CẤU TRÚC PHÂN CẢNH (Mỗi cảnh 6s):
- Scene number & Timestamp
- Character actions, Body gestures, Facial expressions
- Camera angle/movement, Background setting, Objects
- Lighting & mood, Emotion, Dialogue/Voice
- Sound effects, Ambient audio
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
              dramatic_lighting_description: { type: Type.STRING }
            },
            required: ["image_prompt", "thumbnail_text", "emotional_highlight", "dramatic_lighting_description"]
          },
          titles: {
            type: Type.ARRAY,
            minItems: 10,
            items: {
              type: Type.OBJECT,
              properties: {
                vietnamese: { type: Type.STRING },
                english_prompt: { type: Type.STRING },
                category: { type: Type.STRING }
              },
              required: ["vietnamese", "english_prompt", "category"]
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
                body_gesture: { type: Type.STRING },
                facial_expression: { type: Type.STRING },
                camera_angle: { type: Type.STRING },
                background_setting: { type: Type.STRING },
                objects: { type: Type.STRING },
                lighting_mood: { type: Type.STRING },
                emotion_conveyed: { type: Type.STRING },
                dialogue_voice: { type: Type.STRING },
                music_sound_effects: { type: Type.STRING },
                ambient_audio: { type: Type.STRING },
                cinematic_video_prompt: { type: Type.STRING },
                image_generation_prompt: { type: Type.STRING },
                character_description_prompt: { type: Type.STRING },
                motion_prompt: { type: Type.STRING },
                camera_movement_prompt: { type: Type.STRING },
                lighting_prompt: { type: Type.STRING },
                environment_prompt: { type: Type.STRING }
              },
              required: [
                "id", "timestamp", "visual", "action", "cinematic_video_prompt",
                "character_description_prompt", "motion_prompt", "camera_movement_prompt"
              ]
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
      // Chuyển sang Flash-preview để có hạn mức cao hơn và ổn định hơn cho bản miễn phí
      model: 'gemini-3-flash-preview',
      contents: { parts: [...parts, { text: systemInstruction }] },
      config
    });

    const result = JSON.parse(response.text || "{}");
    if (result.error) throw new Error(result.error);
    return result;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    // Xử lý lỗi Quota/429 một cách rõ ràng
    if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED") || error.status === "RESOURCE_EXHAUSTED") {
      throw new Error("BẠN ĐÃ HẾT LƯỢT DÙNG MIỄN PHÍ: Gemini đang quá tải hoặc bạn đã vượt quá giới hạn yêu cầu/phút. Vui lòng đợi 30-60 giây rồi nhấn thử lại.");
    }
    
    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error("API KEY KHÔNG HỢP LỆ: Vui lòng kiểm tra lại cấu hình mã API Key của bạn.");
    }

    throw new Error(error.message || "Lỗi hệ thống khi phân tích dữ liệu thực tế. Vui lòng thử lại sau.");
  }
};
