import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Global test configuration
    globals: true,

    // Environment for tests
    environment: 'jsdom',

    // Setup files to run before each test file
    setupFiles: ['./vitest.setup.js', './packages/core-js/vitest.setup.js'],

    // Include patterns for test files
    include: [
      'packages/**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'packages/**/tests/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'packages/**/*.{test,spec}.{js,jsx,ts,tsx}',
    ],

    // Exclude patterns
    exclude: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['packages/*/src/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        '**/*.d.ts',
        '**/__tests__/**',
        '**/tests/**',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}',
        '**/node_modules/**',
      ],
      thresholds: {
        // Minimum coverage thresholds
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60,
      },
    },

    // Test timeout
    testTimeout: 10000,

    // Hook timeout
    hookTimeout: 10000,

    // Reporter options
    reporters: ['default', 'html'],

    // Watch mode settings
    watch: false,

    // Pool settings for parallel execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },

    // Alias resolution for imports
    alias: {
      '@Engine': path.resolve(__dirname, 'packages/core-js/src/engine'),
      '@Editor': path.resolve(__dirname, 'packages/editor/src'),
      '@Script': path.resolve(__dirname, 'packages/script/src'),
      '@Math': path.resolve(__dirname, 'packages/math/src'),
      '@Components': path.resolve(__dirname, 'packages/core-js/src/components'),
      '@Spritz': path.resolve(__dirname, 'packages/core-js/src/spritz'),
    },
  },

  resolve: {
    alias: {
      '@Engine': path.resolve(__dirname, 'packages/core-js/src/engine'),
      '@Editor': path.resolve(__dirname, 'packages/editor/src'),
      '@Script': path.resolve(__dirname, 'packages/script/src'),
      '@Math': path.resolve(__dirname, 'packages/math/src'),
      '@Components': path.resolve(__dirname, 'packages/core-js/src/components'),
      '@Spritz': path.resolve(__dirname, 'packages/core-js/src/spritz'),
    },
  },
});
