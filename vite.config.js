import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import inject from '@rollup/plugin-inject';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {}
  },
  optimizeDeps: {
    include: ['process'],
  },
  build: {
    rollupOptions: {
      plugins: [
        inject({
          process: 'process/browser',
        }),
      ],
    },
  },
})
