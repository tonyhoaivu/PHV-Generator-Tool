
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Tải tất cả biến môi trường từ .env và hệ thống (Vercel)
    const env = loadEnv(mode, (process as any).cwd(), '');
    
    // Tìm kiếm Key ở mọi nơi có thể (Vercel thường dùng GEMINI_API_KEY hoặc API_KEY)
    const apiKey = env.GEMINI_API_KEY || (process.env as any).GEMINI_API_KEY || env.API_KEY || (process.env as any).API_KEY || "";

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Cung cấp trực tiếp cho process.env trong code client
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
        'process.env.NODE_ENV': JSON.stringify(mode),
      },
      resolve: {
        alias: {
          '@': path.resolve('.'),
        }
      }
    };
});
