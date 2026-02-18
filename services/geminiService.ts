
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
      ? `NHIỆM VỤ: Hãy thực hiện "Micro-Analysis" video này: ${input}. Đừng tóm tắt, hãy giải mã kỹ thuật.`
      : `NHIỆM VỤ: Dựa trên ý tưởng "${input}", hãy xây dựng kịch bản "Chiến binh Rau Củ" với độ sâu của một đạo diễn điện ảnh.`;
    parts.push({ text: promptPrefix });
  }

  const systemInstruction = `
# NHIỆM VỤ CỐT LÕI:
Bạn là một Chuyên gia phê bình điện ảnh và Kỹ sư âm thanh cấp cao. Nhiệm vụ của bạn là phân tích video/ý tưởng theo phương pháp "Micro-Analysis", tập trung vào giải mã "Tại sao phân cảnh/vocal này lại hiệu quả" về mặt kỹ thuật và cảm giác điện ảnh.

# NGUYÊN TẮC PHÂN TÍCH VI MÔ (MICRO-ANALYSIS):

1. PHÂN TÍCH PHÂN CẢNH (VISUAL & SCENE ANALYSIS):
- Nhịp độ (Pacing): Tốc độ cắt cảnh, sự thay đổi khung hình (Close-up, Wide-shot) ảnh hưởng thế nào đến tâm lý.
- Thị giác (Visual Layer): Bóc tách màu sắc, ánh sáng, bố cục. Giải mã sự tương phản và thông điệp thị giác.
- Chuyển động (Motion): Động lực học của nhân vật (mượt mà hay mạnh bạo).

2. PHÂN TÍCH VOCAL & ÂM THANH (VOCAL & AUDIO DEEP-DIVE):
- Ngữ điệu (Prosody): Độ cao, trầm, biến thiên tông giọng và điểm nhấn (Emphasis).
- Nhịp thở & Ngắt nghỉ: Các khoảng lặng (silence) tạo tò mò hay uy lực.
- Cảm xúc ẩn (Subtext): Phân tích cách rung thanh quản mang lại sắc thái giễu nhại, hào hùng hay ân cần.

# QUY TẮC ĐẶC BIỆT:
- KHÔNG TÓM TẮT NỘI DUNG hời hợt. Tập trung vào GIẢI MÃ KỸ THUẬT.
- Sử dụng thuật ngữ chuyên môn: Cinematography, Sound Design, Dutch angle, Dynamic range, Prosody...
- Luôn bao gồm Vocal Tiếng Việt gắt trong ngoặc vuông ở cuối Video Prompt.

# ĐỊNH DẠNG ĐẦU RA:
- Trình bày kịch bản "Chiến binh Rau Củ" phong cách 3D Pixar Tactical cực kỳ chi tiết.
`;

  try {
    const config: any = {
      systemInstruction,
      responseMimeType: "application/json",
      tools: isUrl ? [{ googleSearch: {} }] : undefined,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          technical_assessment: { type: Type.STRING, description: "Giải mã kỹ thuật tổng quan của video" },
          summary: { type: Type.STRING, description: "Tóm tắt ngắn gọn ý tưởng (giữ để tương thích UI)" },
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
                action: { type: Type.STRING },
                music_sound_effects: { type: Type.STRING },
                pacing_analysis: { type: Type.STRING },
                visual_layer_analysis: { type: Type.STRING },
                vocal_prosody_analysis: { type: Type.STRING },
                subtext_analysis: { type: Type.STRING }
              },
              required: ["id", "timestamp", "visual", "image_generation_prompt", "cinematic_video_prompt", "vietnamese_vocal", "pacing_analysis", "visual_layer_analysis", "vocal_prosody_analysis"]
            }
          }
        },
        required: ["technical_assessment", "summary", "language", "detected_characters", "detected_locations", "hook_data", "titles", "scenes"]
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
