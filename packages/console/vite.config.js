import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    outDir: 'build',
    sourcemap: false,
    minify: 'terser',
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
    },
  },

  server: {
    port: 3000,
    open: true,
    fs: {
      allow: ['..'],
    },
  },

  plugins: [
    react(),
    {
      name: 'serve-spritz-assets',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url.startsWith('/spritz/')) {
            const filePath = path.resolve(__dirname, '..', req.url.substring(1));
            if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
              res.setHeader('Content-Type', getContentType(filePath));
              res.end(fs.readFileSync(filePath));
              return;
            }
          }
          next();
        });
      },
    },
  ],
});

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.json': 'application/json',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.pxs': 'text/plain',
    '.pxc': 'text/plain',
    '.pxsl': 'text/plain',
  };
  return map[ext] || 'application/octet-stream';
}
