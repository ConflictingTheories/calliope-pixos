import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname, recommendedConfig: 'eslint:recommended' });

export default [
  ...compat.config({
    env: {
      es2021: true,
      node: true,
      browser: true,
    },
    globals: {
      console: 'readonly',
    },
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    ignorePatterns: ['build/'],
    plugins: ['react'],
    rules: {
      // Logical errors
      'react/jsx-uses-vars': 'warn',
      'react/jsx-uses-react': 'warn',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-constant-condition': ['error', { checkLoops: 'allExcept' }],
      'no-unreachable': 'error',
      'no-global-assign': 'error',
      'no-compare-neg-zero': 'error',
      'no-dupe-keys': 'error',
      'no-func-assign': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error',
      
      // Warnings (fixable)
      'linebreak-style': 'off',
      'quotes': ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      'semi': ['warn', 'always'],
      'indent': ['warn', 2, { SwitchCase: 1 }],
      'no-console': ['warn'],
      'no-debugger': ['warn'],
      'no-unused-vars': ['warn', { args: 'none' }],
      'eqeqeq': ['warn', 'smart'],
      'no-var': 'warn',
      'prefer-const': 'warn',
      'comma-dangle': ['warn', 'only-multiline'],
      'no-trailing-spaces': 'warn',
      'eol-last': ['warn', 'always'],
      'space-before-blocks': 'warn',
      'space-before-function-paren': ['warn', { anonymous: 'always', named: 'never' }],
      
      // Allow leading underscores for private methods
      'no-underscore-dangle': 'off',
    },
  }),
