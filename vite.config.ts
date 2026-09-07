import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  base: mode === "pages" ? "/lifeaid/" : "/",
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8002',
      '/saml': 'http://127.0.0.1:8002',
    },
  },
}));

