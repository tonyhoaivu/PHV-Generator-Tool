
import { GoogleGenAI, Type } from "@google/genai";
import { ScriptAnalysisResult, AnalysisOptions } from "../types";

export const analyzeVideoContent = async (input: string | { data: string, mimeType: string }, options: AnalysisOptions): Promise<ScriptAnalysisResult> => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'undefined' || apiKey === 'PLACEHOLDER_API_KEY' || apiKey.length < 10) {
    throw new Error(
      "CHƯA CẤU HÌNH API KEY: \n" +
      "Hệ thống không tìm thấy mã API. Vui lòng thiết lập GEMINI_API_KEY trong Vercel Settings và thực hiện REDEPLOY."
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  const isString = typeof input === 'string';
  
  // Xác định xem có phải là Video Input không
  const isVideoInput = !isString && input.mimeType.startsWith('video/');
  const isUrl = isString && (input.startsWith('http') || input.includes('youtube.com') || input.includes('tiktok.com') || input.includes('facebook.com'));
  
  const contentPart = isString 
    ? { text: `Đầu vào là ${isUrl ? 'đường dẫn video' : 'kịch bản văn bản'}: ${input}` }
    : { inlineData: { data: input.data, mimeType: input.mimeType } };

  try {
    const config: any = {
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "Tóm tắt ngắn gọn nội dung video/kịch bản" },
          rewritten_script: { type: Type.STRING, description: "Kịch bản đầy đủ đã được viết lại hấp dẫn hơn" },
          language: { type: Type.STRING, description: "Ngôn ngữ của video" },
          detected_characters: { type: Type.ARRAY, items: { type: Type.STRING } },
          detected_locations: { type: Type.ARRAY, items: { type: Type.STRING } },
          viral_titles: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 tiêu đề giật tít viral" },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.NUMBER },
                timestamp: { type: Type.STRING, description: "Dấu mốc thời gian (ví dụ: 00:00 - 00:06)" },
                visual: { type: Type.STRING, description: "Mô tả hình ảnh trong cảnh" },
                action: { type: Type.STRING, description: "Hành động chính diễn ra" },
                camera: { type: Type.STRING, description: "Góc quay (Close-up, Wide, v.v.)" },
                emotion: { type: Type.STRING, description: "Cảm xúc chủ đạo của cảnh" },
                background: { type: Type.STRING },
                lighting: { type: Type.STRING },
                sound_effect: { type: Type.STRING },
                grok_video_prompt: { type: Type.STRING, description: "Prompt tiếng Anh cực chi tiết cho AI Video (Grok/Sora)" },
                image_prompt: { type: Type.STRING },
                voiceover: { type: Type.STRING, description: "Lời bình/lời thoại cho cảnh này" },
                subtitle: { type: Type.STRING }
              }
            }
          }
        },
        required: ["summary", "rewritten_script", "language", "detected_characters", "detected_locations", "viral_titles", "scenes"]
      }
    };

    // Nếu là URL thì bật Google Search để lấy thông tin video
    if (isUrl) {
      config.tools = [{ googleSearch: {} }];
    }

    const systemInstruction = `
# NHIỆM VỤ:
Bạn là chuyên gia phân tích Video Viral và Prompt Engineer cho AI Video (Sora, Grok-3 Video, Kling).
${isVideoInput ? "Bạn đang được xem một FILE VIDEO THỰC TẾ. Hãy phân tích kỹ từng khung hình." : "Bạn đang phân tích một kịch bản/đường dẫn."}

# YÊU CẦU ĐẦU RA:
1. Tóm tắt nội dung và viết lại kịch bản hấp dẫn hơn bản gốc.
2. CHIA CẢNH: Chia nhỏ nội dung thành các block 6 giây (phù hợp với giới hạn của các model AI Video hiện nay).
3. PROMPT TIẾNG ANH: Viết prompt mô tả visual cực kỳ chi tiết cho Grok/Sora. Bao gồm: Camera movement, Lighting, Cinematic style, 4K resolution, Unreal Engine 5 style.
4. Ngôn ngữ phản hồi: Các trường mô tả tiếng Việt, riêng các trường 'prompt' dùng tiếng Anh.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          contentPart,
          { text: systemInstruction }
        ]
      },
      config
    });

    const text = response.text;
    if (!text) throw new Error("Gemini không trả về kết quả.");

    return JSON.parse(text.trim());
  } catch (error: any) {
    console.error("Gemini SDK Error:", error);
    
    if (error.message?.includes("429")) {
      throw new Error("QUOTA EXCEEDED: Bạn đã hết lượt dùng miễn phí trong phút này. Vui lòng đợi 30-60 giây.");
    }
    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error("API KEY KHÔNG HỢP LỆ: Vui lòng kiểm tra lại mã API Key.");
    }
    
    throw new Error(error.message || "Lỗi xử lý dữ liệu từ AI.");
  }
};
