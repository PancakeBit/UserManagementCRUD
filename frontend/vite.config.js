import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Forward /api/* to Express so the browser sees one origin (no CORS setup needed).
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
