import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,        
    strictPort: true,  
    host: 'localhost', 
  },

  
  preview: {
    port: 3000,
    strictPort: true,
    host: 'localhost',
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js', // ← you have .js in your repo
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
