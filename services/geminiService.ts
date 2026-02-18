
import { GoogleGenAI, Type } from "@google/genai";
import { ScriptAnalysisResult, AnalysisOptions } from "../types";

export const analyzeVideoContent = async (input: string | { data: string, mimeType: string }, options: AnalysisOptions): Promise<ScriptAnalysisResult> => {
  // Khởi tạo instance mới mỗi lần gọi để đảm bảo lấy đúng API Key mới nhất từ môi trường
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isUrlOrText = typeof input === 'string';
  
  const contentPart = isUrlOrText 
    ? { text: `Hãy xem và phân tích nội dung/video từ nguồn này: ${input}` }
    : { inlineData: { data: input.data, mimeType: input.mimeType } };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          contentPart,
          {
            text: `
# VAI TRÒ:
Bạn là "PHV Generator Tool - Turbo Edition". 
Nhiệm vụ: Phân tích link video hoặc kịch bản và chia thành các phân cảnh 6 giây.

# HƯỚNG DẪN CỤ THỂ:
1. Nếu đầu vào là LINK (YouTube/TikTok/FB), hãy sử dụng Google Search để tìm hiểu nội dung video đó.
2. Tóm tắt nội dung và viết lại kịch bản cực kỳ hấp dẫn (Viral).
3. Chia kịch bản thành các đoạn nhỏ 6 giây.
4. Tạo Prompt tiếng Anh chuyên sâu cho mỗi cảnh để dùng cho AI Video Generator.

# YÊU CẦU ĐẦU RA (JSON):
Trả về JSON chính xác theo cấu trúc:
{
  "summary": "...",
  "rewritten_script": "...",
  "language": "...",
  "detected_characters": ["..."],
  "detected_locations": ["..."],
  "viral_titles": ["...", "...", "..."],
  "scenes": [
    {
      "id": 1,
      "timestamp": "0-6s",
      "visual": "...",
      "action": "...",
      "camera": "...",
      "emotion": "...",
      "background": "...",
      "lighting": "...",
      "sound_effect": "...",
      "grok_video_prompt": "...",
      "image_prompt": "...",
      "voiceover": "...",
      "subtitle": "..."
    }
  ]
}
            `
          }
        ]
      },
      config: {
        tools: [{ googleSearch: {} }], // Cho phép AI truy cập internet để "xem" link
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            rewritten_script: { type: Type.STRING },
            language: { type: Type.STRING },
            detected_characters: { type: Type.ARRAY, items: { type: Type.STRING } },
            detected_locations: { type: Type.ARRAY, items: { type: Type.STRING } },
            viral_titles: { type: Type.ARRAY, items: { type: Type.STRING } },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  timestamp: { type: Type.STRING },
                  visual: { type: Type.STRING },
                  action: { type: Type.STRING },
                  camera: { type: Type.STRING },
                  emotion: { type: Type.STRING },
                  background: { type: Type.STRING },
                  lighting: { type: Type.STRING },
                  sound_effect: { type: Type.STRING },
                  grok_video_prompt: { type: Type.STRING },
                  image_prompt: { type: Type.STRING },
                  voiceover: { type: Type.STRING },
                  subtitle: { type: Type.STRING }
                }
              }
            }
          },
          required: ["summary", "rewritten_script", "language", "detected_characters", "detected_locations", "viral_titles", "scenes"]
        }
      }
    });

    if (!response.text) {
      throw new Error("AI không trả về kết quả. Có thể link video không truy cập được hoặc nội dung bị chặn.");
    }

    return JSON.parse(response.text.trim());
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Trả về lỗi chi tiết hơn để người dùng biết cách xử lý
    if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("API key not found")) {
      throw new Error("Lỗi: API Key không hợp lệ hoặc chưa được thiết lập trên Vercel.");
    }
    if (error.message?.includes("429")) {
      throw new Error("Lỗi: Bạn đã hết hạn mức sử dụng (Quota). Vui lòng thử lại sau.");
    }
    throw new Error(error.message || "Đã xảy ra lỗi không xác định khi kết nối với AI.");
  }
};
