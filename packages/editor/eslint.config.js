import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname, recommendedConfig: 'eslint:recommended' });

export default [
  ...compat.config({
    env: {
      es6: true,
      node: false,
      browser: false
    },
    globals: {
      console: 'readonly'
    },
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true
      }
    },
    ignorePatterns: ['build/'],
    plugins: ['react'],
    rules: {
      'react/jsx-uses-vars': 'error',
      'react/jsx-uses-react': 'error',
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      semi: ['warn', 'always'],
      'no-console': ['warn'],
      'no-debugger': ['warn'],
      'no-unused-vars': 'warn'
    }
  })
];
