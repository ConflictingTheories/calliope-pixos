# Linting and Code Style Guidelines

## Overview

This project uses a sensible, developer-friendly linting configuration that focuses on catching **logical errors** rather than enforcing strict style rules.

## Philosophy

- **Errors**: Only logical issues that could cause bugs or break functionality
- **Warnings**: Code quality and best practices (auto-fixable)
- **Style**: Handled by Prettier, not ESLint (no trailing-space wars!)
- **Private Methods**: Underscore prefixes are allowed (common JS convention for private methods)

## Configuration Files

### `.eslintrc.cjs` (Root)

Main ESLint configuration covering the entire monorepo. Distinguishes between:

- **Logical Errors**: `no-unreachable`, `no-dupe-keys`, `use-isnan`, `valid-typeof`, etc.
- **Warnings**: `no-unused-vars`, `no-console`, `eqeqeq`, style issues
- **Disabled**: Strict style enforcement (handled by Prettier)

### `.prettierrc.json`

Enforces consistent formatting:

- 2-space indentation
- Single quotes
- Trailing commas (ES5 style)
- Line length: 100 characters
- Unix line endings (LF)

### `.editorconfig`

Cross-editor consistency for indentation and line endings.

### `packages/editor/eslint.config.js`

Extends the root configuration with React-specific rules.

## Commands

### Lint Only (Check)

```bash
npm run lint
```

Checks for linting errors/warnings without modifying files.

### Lint & Auto-Fix

```bash
npm run lint:fix
```

Runs ESLint with `--fix` flag to automatically correct fixable issues, then runs Prettier.
**This is the recommended approach** - fixes most issues automatically!

### Format Code

```bash
npm run format
```

Runs Prettier on all supported files.

### Check Formatting

```bash
npm run format:check
```

Verifies files are properly formatted (CI-friendly).

## Key Rules

### ✅ Allowed

- Underscore-prefixed private methods: `_initPickerFBO()`, `_detectMobile()`
- Multiple lines between functions
- Various quote styles (single quotes preferred, backticks for templates)
- Console logging in non-production (warn/error only)
- Variable hoisting

### ❌ Errors (Must Fix)

- Unreachable code
- Duplicate keys in objects
- Invalid `typeof` comparisons
- Empty statements (some exceptions)
- Type mismatches in strict equality checks

### ⚠️ Warnings (Auto-fixable)

- Unused variables
- Inconsistent quotes
- Missing semicolons
- Indentation
- Trailing whitespace
- Var usage (prefer const/let)

## Running Linting

### Local Development

When you notice linting issues, run:

```bash
npm run lint:fix
```

This will automatically:

1. Fix all ESLint issues it can
2. Format code with Prettier
3. Sort imports
4. Remove trailing whitespace

### In CI/CD

Runs `npm run lint` to verify no errors exist.

## Naming Conventions

### Allowed Patterns

✅ `camelCase` for variables and functions  
✅ `PascalCase` for classes and components  
✅ `_privateMethod()` for private methods  
✅ `CONSTANT_NAME` for constants  
✅ `event_type` for enum-like strings (if used)

### What Changed

❌ No more enforcing Unix line endings as errors  
❌ No more "too many warnings" bypass  
❌ Spaces/tabs disputes moved to auto-formatting only

## Customization

To disable a rule for a specific file or line:

```javascript
// Disable for entire file
/* eslint-disable rule-name */

// Disable for specific line
// eslint-disable-next-line rule-name
const suspicious = eval('code');

// Re-enable after
/* eslint-enable rule-name */
```

For more information, see the comments in `.eslintrc.cjs`.
