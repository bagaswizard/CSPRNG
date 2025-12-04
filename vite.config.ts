import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    // This is the crucial line for GitHub Pages
    base: '/CSPRNG/',
    plugins: [react()],
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
  };
});
