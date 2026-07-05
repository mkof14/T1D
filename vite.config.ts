import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
const siteUrl = String(process.env.VITE_SITE_URL || process.env.T1D_SITE_URL || 'http://localhost:3002').replace(/\/$/, '');

const siteUrlPlugin = () => ({
  name: 't1d-site-url',
  transformIndexHtml(html: string) {
    return html.replaceAll('__T1D_SITE_URL__', siteUrl);
  },
});

export default defineConfig({
  plugins: [react(), siteUrlPlugin()],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
  },
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${process.env.T1D_API_PORT || 8790}`,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('knowledge-copy')) {
            return 'knowledge';
          }
          if (id.includes('legal-copy')) {
            return 'legal';
          }
          if (id.includes('/src/content/')) {
            return 'content';
          }
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});
