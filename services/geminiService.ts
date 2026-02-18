
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
      ? `PHÂN TÍCH NỘI DUNG VIDEO TỪ LINK NÀY: ${input}. Hãy bóc tách kỹ thuật và biến nó thành series "Chiến binh Rau Củ".`
      : `Sáng tạo series "Chiến binh Rau Củ" dựa trên ý tưởng: ${input}`;
    parts.push({ text: promptPrefix });
  }

  const systemInstruction = `
# SYSTEM ROLE:
Bạn là một đạo diễn kỹ thuật và chuyên gia kịch bản AI xuất sắc, chuyên bóc tách video thành các phân cảnh 6 giây cực kỳ chi tiết cho series "Chiến binh Rau Củ" (phong cách 3D Pixar Tactical).

# QUY TẮC PHÂN TÍCH 6 GIÂY (CỰC KỲ CHI TIẾT):
Mọi phân cảnh phải được mô tả tỉ mỉ bao gồm:
1. **Chuyển động (Movement)**: Mô tả chính xác nhân vật di chuyển thế nào trong 6 giây (ví dụ: "Lăn nhanh về phía trước, xoay người 360 độ và rút kiếm").
2. **Góc máy (Camera)**: Sử dụng thuật ngữ điện ảnh (Close-up, Tracking shot, Dutch angle, Drone view).
3. **Âm thanh (Audio/SFX)**: Mô tả âm thanh môi trường và hiệu ứng (tiếng kim loại va chạm, tiếng xì xào của lá, nhạc kịch tính).
4. **Vocal Tiếng Việt (BẮT BUỘC)**: Câu nói tiếng Việt cực "gắt", mang tính cách nhân vật (ví dụ: "Bạn sợ tôi hằng? Cái hằng này là vũ khí diệt khuẩn và quét sạch mỡ máu cho bạn đấy!"). Lời thoại phải hài hước, truyền cảm hứng hoặc đe dọa kẻ thù một cách sáng tạo.

# NHIỆM VỤ:
1. Phân tích nội dung gốc từ input (link hoặc ảnh).
2. Chuyển đổi thành storyboard "Chiến binh Rau Củ". Nhân vật: Carrot Commander, Onion Ninja, Broccoli Tank, Mướp Warrior... trang bị Tactical Gear, Lightsaber, Súng nước áp lực cao.
3. Mỗi cảnh phải đảm bảo tính khả thi để tạo video AI (Sora/Runway/Luma) với độ dài 6s.

# CẤU TRÚC PHẢN HỒI:
- summary: Tóm tắt ý tưởng tổng thể.
- scenes: Danh sách các cảnh, mỗi cảnh mô tả sâu về hình ảnh, video prompt, chuyển động, âm thanh và lời thoại tiếng Việt.
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
                timestamp: { type: Type.STRING },
                visual: { type: Type.STRING },
                image_generation_prompt: { type: Type.STRING },
                cinematic_video_prompt: { type: Type.STRING },
                vietnamese_vocal: { type: Type.STRING },
                mood: { type: Type.STRING },
                camera_angle: { type: Type.STRING },
                lighting_mood: { type: Type.STRING },
                background_setting: { type: Type.STRING },
                action: { type: Type.STRING, description: "Chi tiết chuyển động trong 6s" },
                music_sound_effects: { type: Type.STRING, description: "Mô tả âm thanh SFX và nhạc nền" }
              },
              required: ["id", "timestamp", "visual", "image_generation_prompt", "cinematic_video_prompt", "vietnamese_vocal", "action", "music_sound_effects"]
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
