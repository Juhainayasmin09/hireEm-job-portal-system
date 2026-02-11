import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separate third-party dependencies into a vendor chunk
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('@google/genai')) {
              return 'genai'; // Isolate the heavy AI SDK
            }
            // Group other small dependencies
            return 'libs';
          }
        }
      }
    },
    // Slightly increase limit due to GenAI SDK size, but relied on splitting first
    chunkSizeWarningLimit: 600
  }
});