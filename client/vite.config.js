import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/items': 'http://localhost:5000',
      '/shelf-life': 'http://localhost:5000',
      '/test-db': 'http://localhost:5000',
    },
  },
});
