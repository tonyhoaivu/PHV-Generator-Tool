
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
      ? `NHIỆM VỤ: Bạn là chuyên gia Biên tập Video và Phân tích Dữ liệu thị giác. Hãy thực hiện "Micro-Analysis" theo quy tắc 6 giây cho video này: ${input}.`
      : `NHIỆM VỤ: Dựa trên ý tưởng "${input}", hãy xây dựng kịch bản "Chiến binh Rau Củ" theo cấu trúc 6 giây/phân cảnh chuẩn điện ảnh.`;
    parts.push({ text: promptPrefix });
  }

  const systemInstruction = `
# VAI TRÒ:
Bạn là một chuyên gia Biên tập Video và Phân tích Dữ liệu thị giác cấp cao.

# QUY TẮC CHIA PHÂN CẢNH (TIMING RULES):
1. Tính tổng thời lượng video (hoặc giả định dựa trên nội dung).
2. BẮT BUỘC chia thành các phân cảnh dài ĐÚNG 6 GIÂY (0-6s, 6-12s, 12-18s...).
   - Video 60s = 10 phân cảnh.
   - Video 30s = 5 phân cảnh.
   - Nguyên tắc: Tổng thời lượng / 6 = Số lượng phân đoạn độc lập.

# NỘI DUNG PHÂN TÍCH MỖI 6 GIÂY:
- Visual Keyframe: Mô tả chi tiết hành động chính, bố cục, ánh sáng và màu sắc.
- Vocal & Audio Deep-Dive: 
    * Trích xuất lời thoại (Transcription).
    * Phân tích độ mượt, nhịp điệu (Rhythm) và cảm xúc giọng đọc.
- Sync Assessment: Đánh giá sự khớp giữa hình ảnh (ví dụ: "The Malabar Ninja") và âm thanh/vocal.
- Sentiment: Cảm xúc chủ đạo (Hào hứng, kịch tính, giải thích...).
- Quality Rating: "Tốt" hoặc "Cần cải thiện".

# YÊU CẦU ĐẶC BIỆT:
- KHÔNG tóm tắt hời hợt. Hãy giải mã "Tại sao đoạn này hiệu quả".
- Luôn bao gồm Vocal Tiếng Việt trong ngoặc vuông ["..."] ở cuối Video Prompt.
- Phong cách: 3D Pixar Tactical / Chiến binh Rau Củ.
`;

  try {
    const config: any = {
      systemInstruction,
      responseMimeType: "application/json",
      tools: isUrl ? [{ googleSearch: {} }] : undefined,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          technical_assessment: { type: Type.STRING },
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
                time_range: { type: Type.STRING, description: "Ví dụ: 00:00 - 00:06" },
                visual_description: { type: Type.STRING },
                vocal_deep_dive: { type: Type.STRING },
                sync_assessment: { type: Type.STRING },
                quality_rating: { type: Type.STRING, enum: ["Tốt", "Cần cải thiện"] },
                sentiment: { type: Type.STRING },
                image_generation_prompt: { type: Type.STRING },
                cinematic_video_prompt: { type: Type.STRING },
                vietnamese_vocal: { type: Type.STRING }
              },
              required: ["id", "time_range", "visual_description", "vocal_deep_dive", "sync_assessment", "quality_rating", "sentiment", "image_generation_prompt", "cinematic_video_prompt", "vietnamese_vocal"]
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
