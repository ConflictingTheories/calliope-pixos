import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// This configuration mirrors the upstream editor setup.  It
// specifies a relative base path for correct asset resolution and
// registers the service worker for offline support using the
// injectManifest strategy.  Monaco editor is bundled locally for
// full offline support - no CDN dependencies.
export default defineConfig(() => {
  return {
    base: './',
    build: {
      outDir: 'build',
      // Increase chunk size warning limit for Monaco (it's large but necessary)
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          // Separate Monaco into its own chunk for better caching
          manualChunks: {
            'monaco-editor': ['monaco-editor'],
          },
        },
      },
    },
    // Optimize Monaco dependencies
    optimizeDeps: {
      include: ['monaco-editor'],
    },
    resolve: {
      alias: {
        'pixospritz-core': path.resolve(__dirname, '../core-js/src'),
        'pixospritz-math': path.resolve(__dirname, '../math/src/index.js'),
        '@Components': path.resolve(__dirname, '../core-js/src/components'),
        '@Engine': path.resolve(__dirname, '../core-js/src/engine'),
        '@Sprites': path.resolve(__dirname, '../core-js/src/sprites'),
        '@Tilesets': path.resolve(__dirname, '../core-js/src/tilesets'),
        '@Spritz': path.resolve(__dirname, '../core-js/src/spritz'),
      },
      extensions: ['.js', '.jsx', '.json'],
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
          // Increase limit to 7MB for Monaco Editor (TypeScript worker is ~6MB)
          maximumFileSizeToCacheInBytes: 7 * 1024 * 1024,
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
