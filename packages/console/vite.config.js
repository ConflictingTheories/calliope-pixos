import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  build: {
    outDir: 'build',
    sourcemap: false,
    minify: 'terser'
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@Components': path.resolve(__dirname, '../core-js/src/components'),
      '@Engine': path.resolve(__dirname, '../core-js/src/engine'),
      '@Sprites': path.resolve(__dirname, '../core-js/src/sprites'),
      '@Tilesets': path.resolve(__dirname, '../core-js/src/tilesets'),
      '@Spritz': path.resolve(__dirname, '../core-js/src/spritz'),
      'pixospritz-core': path.resolve(__dirname, '../core-js/src/index.jsx'),
    }
  },
  
  server: {
    port: 3000,
    open: true
  }
});

