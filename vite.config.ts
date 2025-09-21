import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.AIzaSyDDoLoC4jy4dZEOcMKMAcdVnpDfVQ2mnew),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.AIzaSyDDoLoC4jy4dZEOcMKMAcdVnpDfVQ2mnew)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
