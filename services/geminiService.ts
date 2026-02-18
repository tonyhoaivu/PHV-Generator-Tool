
import { GoogleGenAI, Type } from "@google/genai";
import { ScriptAnalysisResult, AnalysisOptions } from "../types";

export const analyzeVideoContent = async (input: string | { data: string, mimeType: string }, options: AnalysisOptions): Promise<ScriptAnalysisResult> => {
  const apiKey = process.env.API_KEY;

  // Kiểm tra tính hợp lệ của API Key trước khi gọi SDK
  if (!apiKey || apiKey === 'undefined' || apiKey.length < 10 || apiKey.includes('PLACEHOLDER')) {
    throw new Error("LỖI CẤU HÌNH API: Chưa nhận được API Key hợp lệ. \n\nCÁCH SỬA: \n1. Nếu ở Vercel: Vào Settings > Environment Variables > Thêm GEMINI_API_KEY. \n2. QUAN TRỌNG: Bạn phải nhấn 'Redeploy' để Vercel nạp Key mới vào mã nguồn.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const isString = typeof input === 'string';
  
  // Kiểm tra link video
  const isUrl = isString && (input.startsWith('http') || input.includes('youtube.com') || input.includes('tiktok.com') || input.includes('facebook.com'));
  
  const contentPart = isString 
    ? { text: `Nội dung: ${input}` }
    : { inlineData: { data: input.data, mimeType: input.mimeType } };

  try {
    const config: any = {
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
    };

    if (isUrl) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          contentPart,
          {
            text: `Phân tích nội dung và chia cảnh 6 giây. Tạo prompt tiếng Anh cho Grok/Sora.`
          }
        ]
      },
      config
    });

    const text = response.text;
    if (!text) {
      throw new Error("AI không trả về kết quả.");
    }

    return JSON.parse(text.trim());
  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    if (error.message?.includes("429")) {
      throw new Error("HẠN MỨC (QUOTA) HẾT: Bạn đang dùng API miễn phí, vui lòng đợi 60 giây và thử lại.");
    }
    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error("API KEY KHÔNG HỢP LỆ: Vui lòng kiểm tra lại mã API Key bạn đã dán.");
    }
    
    throw new Error(error.message || "Lỗi kết nối AI.");
  }
};
