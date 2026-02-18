
import { GoogleGenAI, Type } from "@google/genai";
import { ScriptAnalysisResult, AnalysisOptions } from "../types";

export const analyzeVideoContent = async (input: string | { data: string, mimeType: string } | { data: string, mimeType: string }[], options: AnalysisOptions): Promise<ScriptAnalysisResult> => {
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
Bạn là một chuyên gia biên tập video AI. Nhiệm vụ của bạn là phân tích nội dung tôi cung cấp và chia thành các phân cảnh chi tiết (mỗi cảnh khoảng 6 giây). 

# CẤU TRÚC BẮT BUỘC CHO MỖI PHÂN CẢNH:
Với mỗi phân cảnh, bạn bắt buộc phải xuất ra đúng cấu trúc 3 phần như sau:

1. **Phân cảnh [Số thứ tự]**: Tóm tắt ngắn gọn nội dung cảnh đó bằng tiếng Việt.
2. **Prompt**: Viết một đoạn mô tả hình ảnh chi tiết bằng tiếng Anh (để các công cụ tạo video/ảnh như Grok, Sora hiểu tốt nhất). Tập trung vào nhân vật, bối cảnh, ánh sáng, góc máy và phong cách 3D/Cinematic.
3. **Vocal**: Viết lời bình/giọng đọc cho cảnh đó bằng tiếng Việt. Lời văn phải tự nhiên, lôi cuốn và phù hợp với nội dung cảnh.

# VÍ DỤ MẪU:
Phân cảnh 1: Nhân vật mướp xanh xuất hiện trước hang động.
Prompt: Cute green luffa character with a mining helmet standing in front of a mysterious dark cave entrance, cinematic lighting, 3D style, high detail.
Vocal: "Chào các bạn, hôm nay mướp xanh sẽ cùng chúng ta khám phá một hang động bí ẩn chứa đầy kho báu."

# NGUYÊN TẮC:
- PHẢI phân tích nội dung THỰC TẾ từ nguồn cung cấp.
- Không được bịa đặt nếu nguồn không có thông tin.
- Mọi Prompt hình ảnh phải bằng tiếng Anh.
- Mọi nội dung Tóm tắt và Vocal phải bằng tiếng Việt.
`;

  try {
    const config: any = {
      systemInstruction,
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
                visual: { type: Type.STRING, description: "Tóm tắt phân cảnh bằng Tiếng Việt" },
                cinematic_video_prompt: { type: Type.STRING, description: "Prompt mô tả hình ảnh bằng Tiếng Anh" },
                vietnamese_vocal: { type: Type.STRING, description: "Lời bình Vocal bằng Tiếng Việt" },
                action: { type: Type.STRING },
                body_gesture: { type: Type.STRING },
                facial_expression: { type: Type.STRING },
                camera_angle: { type: Type.STRING },
                background_setting: { type: Type.STRING },
                objects: { type: Type.STRING },
                lighting_mood: { type: Type.STRING },
                mood: { type: Type.STRING },
                emotion_conveyed: { type: Type.STRING },
                dialogue_voice: { type: Type.STRING },
                music_sound_effects: { type: Type.STRING },
                ambient_audio: { type: Type.STRING },
                image_generation_prompt: { type: Type.STRING },
                character_description_prompt: { type: Type.STRING },
                motion_prompt: { type: Type.STRING },
                camera_movement_prompt: { type: Type.STRING },
                lighting_prompt: { type: Type.STRING },
                environment_prompt: { type: Type.STRING }
              },
              required: ["id", "timestamp", "visual", "cinematic_video_prompt", "vietnamese_vocal"]
            }
          }
        },
        required: ["summary", "language", "detected_characters", "detected_locations", "hook_data", "titles", "scenes"]
      }
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config
    });

    const result = JSON.parse(response.text || "{}");
    if (result.error) throw new Error(result.error);
    return result;
  } catch (error: any) {
    if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED") || error.status === "RESOURCE_EXHAUSTED") {
      throw new Error("BẠN ĐÃ HẾT LƯỢT DÙNG MIỄN PHÍ: Gemini đang quá tải hoặc bạn đã vượt quá giới hạn. Vui lòng đợi 30-60 giây.");
    }
    throw new Error(error.message || "Lỗi hệ thống khi phân tích dữ liệu thực tế.");
  }
};
