
import { GoogleGenAI, Type } from "@google/genai";
import { ScriptAnalysisResult, AnalysisOptions } from "../types";

export const analyzeVideoContent = async (input: string | { data: string, mimeType: string } | { data: string, mimeType: string }[], options: AnalysisOptions): Promise<ScriptAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let parts: any[] = [];
  const isString = typeof input === 'string';
  const isUrl = isString && (input.includes('youtube.com') || input.includes('youtu.be') || input.includes('tiktok.com') || input.includes('facebook.com') || input.includes('fb.watch'));

  if (Array.isArray(input)) {
    input.forEach(img => {
      parts.push({ inlineData: { data: img.data, mimeType: img.mimeType } });
    });
  } else if (!isString) {
    parts.push({ inlineData: { data: input.data, mimeType: input.mimeType } });
  } else {
    const promptPrefix = isUrl 
      ? `PHÂN TÍCH NỘI DUNG VIDEO TỪ LINK NÀY: ${input}. Hãy tìm hiểu nội dung video và biến nó thành series "Chiến binh Rau Củ".`
      : `Sáng tạo series "Chiến binh Rau Củ" dựa trên ý tưởng: ${input}`;
    parts.push({ text: promptPrefix });
  }

  const systemInstruction = `
# SYSTEM ROLE:
Bạn là một chuyên gia phân tích nội dung video và sáng tạo kịch bản AI cho series "Chiến binh Rau Củ".

# QUY TẮC THỜI GIAN CỰC KỲ QUAN TRỌNG:
- MỖI PHÂN CẢNH TRONG KỊCH BẢN PHẢI DÀI ĐÚNG 6 GIÂY (6S DURATION).
- Các hành động trong cinematic_video_prompt phải được thiết kế để diễn ra trọn vẹn trong 6 giây.

# NHIỆM VỤ:
1. Nếu người dùng cung cấp link video (YouTube/TikTok/FB), hãy sử dụng công cụ tìm kiếm để hiểu nội dung video đó.
2. Tóm tắt nội dung video gốc.
3. Chuyển đổi nội dung đó thành một kịch bản hành động phong cách 3D Pixar, nơi các loại rau củ là chiến binh.

# CẤU TRÚC BẮT BUỘC CHO MỖI PHÂN CẢNH:
- **Prompt hình ảnh**: Mô tả hình ảnh chi tiết bằng tiếng Anh (3D Pixar style, tactical gear, blue lightsaber).
- **Prompt cảnh**: Hành động video (English) + "[Lời thoại Vocal tiếng Việt gắt và ý nghĩa trong ngoặc kép]". 
- Đảm bảo mô tả chuyển động (motion) phù hợp với độ dài 6 giây.

# QUY TẮC NỘI DUNG RAU CỦ:
- Nhân vật: Onion warrior, Garlic fighter, Bitter melon assassin, Carrot commander, v.v.
- Trang bị: Đồ tactical gear hiện đại, kiếm ánh sáng blue lightsaber, giáp công nghệ.
- Bối cảnh: Microscopic battle (mạch máu, tế bào, vi khuẩn, hoặc bối cảnh bếp siêu thực).
- Lời thoại (Vocal): Tiếng Việt, thể hiện sức mạnh và lợi ích sức khỏe.
`;

  try {
    const config: any = {
      systemInstruction,
      responseMimeType: "application/json",
      tools: isUrl ? [{ googleSearch: {} }] : undefined,
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
                timestamp: { type: Type.STRING, description: "Luôn ghi là '00:06' cho mỗi cảnh" },
                visual: { type: Type.STRING },
                image_generation_prompt: { type: Type.STRING },
                cinematic_video_prompt: { type: Type.STRING },
                vietnamese_vocal: { type: Type.STRING },
                mood: { type: Type.STRING },
                camera_angle: { type: Type.STRING },
                lighting_mood: { type: Type.STRING },
                background_setting: { type: Type.STRING }
              },
              required: ["id", "timestamp", "visual", "image_generation_prompt", "cinematic_video_prompt", "vietnamese_vocal"]
            }
          }
        },
        required: ["summary", "language", "detected_characters", "detected_locations", "hook_data", "titles", "scenes"]
      }
    };

    const modelName = isUrl ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error(error.message || "Lỗi xử lý nội dung.");
  }
};
