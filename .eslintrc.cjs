/**
 * Root ESLint Configuration
 * 
 * This configuration provides sensible, non-intrusive linting rules
 * focused on catching logical errors rather than enforcing style.
 * All style issues are warnings and auto-fixed by default.
 */

module.exports = {
    root: true,
    env: {
        es2021: true,
        node: true,
        browser: true,
        jest: true,
    },
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    extends: ['eslint:recommended'],
    plugins: ['react'],
    rules: {
        // ============================================
        // LOGICAL ERRORS (errors - must be fixed)
        // ============================================

        // Require a description when creating errors
        'no-empty': ['error', { allowEmptyCatch: true }],
        // Prevent infinite loops
        'no-constant-condition': ['error', { checkLoops: 'allExcept' }],
        // Disallow unreachable code
        'no-unreachable': 'error',
        // Prevent accidental global assignments
        'no-global-assign': 'error',
        // Catch obvious logic errors
        'no-compare-neg-zero': 'error',
        'no-dupe-keys': 'error',
        'no-func-assign': 'error',
        'no-setter-return': 'error',
        'use-isnan': 'error',
        'valid-typeof': 'error',

        // ============================================
        // WARNINGS (warnings - should be fixed)
        // ============================================

        // Naming conventions (warnings, not errors)
        'no-unused-vars': ['warn', { args: 'none', ignoreRestSiblings: true }],
        'camelcase': ['warn', { properties: 'never', ignoreDestructuring: true }],

        // Console and debugging
        'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
        'no-debugger': 'warn',
        'no-alert': 'warn',

        // Best practices (warnings)
        'no-eval': 'warn',
        'no-implied-eval': 'warn',
        'no-new-func': 'warn',
        'no-with': 'warn',
        'eqeqeq': ['warn', 'smart'],
        'no-var': 'warn',
        'prefer-const': 'warn',

        // ============================================
        // STYLE RULES (warnings - auto-fixable)
        // ============================================

        'indent': ['warn', 2, { SwitchCase: 1, ignoreComments: true }],
        'quotes': ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
        'semi': ['warn', 'always'],
        'comma-dangle': ['warn', 'only-multiline'],
        'no-trailing-spaces': 'warn',
        'eol-last': ['warn', 'always'],
        'object-curly-spacing': ['warn', 'always'],
        'array-bracket-spacing': ['warn', 'never'],
        'computed-property-spacing': ['warn', 'never'],
        'key-spacing': ['warn', { beforeColon: false, afterColon: true }],
        'space-before-blocks': 'warn',
        'space-before-function-paren': ['warn', {
            anonymous: 'always',
            named: 'never',
            asyncArrow: 'always'
        }],
        'space-infix-ops': 'warn',
        'no-multiple-empty-lines': ['warn', { max: 2, maxEOF: 0 }],
        'linebreak-style': 'off', // Allow both CRLF and LF

        // ============================================
        // REACT SPECIFIC (warnings)
        // ============================================

        'react/jsx-uses-vars': 'warn',
        'react/jsx-uses-react': 'warn',
        'react/no-unknown-property': 'warn',
        'react/prop-types': 'warn',

        // ============================================
        // DISABLED RULES (style police we don't need)
        // ============================================

        // Don't enforce spaces around arrows
        'arrow-spacing': 'off',
        // Don't enforce operator linebreak
        'operator-linebreak': 'off',
        // Don't enforce specific brace style
        'brace-style': 'off',
        // Allow function hoisting
        'no-use-before-define': 'off',
        // Allow leading underscores for private methods (common JS convention)
        'no-underscore-dangle': 'off',
    },
    ignorePatterns: [
        'node_modules/',
        'dist/',
        'build/',
        'output/',
        'coverage/',
        '.next/',
        'packages/*/dist',
        'packages/*/build',
    ],
    overrides: [
        {
            files: ['**/*.jsx', '**/*.tsx'],
            rules: {
                'react/jsx-uses-vars': 'warn',
                'react/jsx-uses-react': 'warn',
            },
        },
        {
            files: ['**/*.test.js', '**/*.spec.js', '**/__tests__/**/*.js'],
            env: {
                jest: true,
            },
            rules: {
                'no-unused-vars': 'off',
            },
        },
    ],
};
