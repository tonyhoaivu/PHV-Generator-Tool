
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Fixed: Cast process to any to avoid "Property 'cwd' does not exist on type 'Process'" error in TypeScript
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env vars regardless of the `VITE_` prefix.
    const env = loadEnv(mode, (process as any).cwd(), '');
    
    // Ưu tiên biến GEMINI_API_KEY hoặc API_KEY từ môi trường hệ thống (Vercel) hoặc file .env
    const apiKey = env.GEMINI_API_KEY || (process.env as any).GEMINI_API_KEY || env.API_KEY || (process.env as any).API_KEY;

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve('.'),
        }
      }
    };
});
