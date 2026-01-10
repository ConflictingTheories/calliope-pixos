import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.jsx'),
      name: 'pixospritz-core',
      fileName: (format) => `bundle.${format === 'umd' ? 'js' : 'js'}`,
      formats: ['umd']
    },
    outDir: 'dist',
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        // Ensure UMD build uses the correct format
        format: 'umd'
      }
    },
    sourcemap: true,
    minify: 'terser'
  },
  
  resolve: {
    alias: {
      '@Components': path.resolve(__dirname, 'src/components'),
      '@Engine': path.resolve(__dirname, 'src/engine'),
      '@Sprites': path.resolve(__dirname, 'src/sprites'),
      '@Tilesets': path.resolve(__dirname, 'src/tilesets'),
      '@Spritz': path.resolve(__dirname, 'src/spritz'),
    }
  },
  
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
});
