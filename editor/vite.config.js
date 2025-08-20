import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// This configuration mirrors the upstream editor setup.  It
// specifies a relative base path for correct asset resolution and
// registers the service worker for offline support using the
// injectManifest strategy.  Additional file handlers have been
// removed for brevity but can be reintroduced as needed.
export default defineConfig(() => {
  return {
    base: './',
    build: {
      outDir: 'build',
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.js',
        injectManifest: {
          rollupFormat: 'iife',
          globPatterns: ['./**/*.{js,css,png,ttf,wasm,zip}', './*.{html,ico,png,js,json}'],
        },
        includeManifestIcons: false,
        manifest: {
          short_name: 'Pixos Editor',
          name: 'PixoSpritz Editor',
          description: 'Read, edit and write pixos package files.',
          start_url: './index.html',
          display: 'fullscreen',
          theme_color: '#000000',
          background_color: '#ffffff',
          orientation: 'any',
          categories: ['utilities'],
          icons: [
            {
              src: '/assets/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/assets/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
          ],
        },
      }),
    ],
  };
});