# Linting & Formatting Quick Reference

## Key Commands

```bash
# Check for issues
yarn lint

# Auto-fix issues
yarn lint:fix

# Format code only
yarn format

# Verify formatting
yarn format:check
```

## What Gets Fixed Automatically

When you run `yarn lint:fix`, these issues are automatically corrected:

- ✅ `var` → `const/let`
- ✅ Inconsistent spacing/indentation
- ✅ Trailing commas
- ✅ Quote style consistency
- ✅ Line endings
- ✅ Many other formatting issues

## What Requires Manual Fix

These errors need your attention:

- ❌ Undefined variables
- ❌ Unreachable code
- ❌ Syntax errors
- ❌ Logic errors
- ❌ Unused variables (warnings - may want to keep or remove)

## Important: No More Style Police

You no longer need to worry about:

- Tabs vs spaces (Prettier normalizes)
- Semicolon placement (auto-formatted)
- Quote styles (auto-converted)
- Indentation (auto-aligned)

These are handled by **Prettier**, not ESLint errors.

## Underscore Methods

Private methods like this are fully supported:

```js
class MyClass {
  _privateMethod() {
    // This is fine - standard JS convention
  }
}
```

No warnings. No errors. Just good code.

## IDE Integration

If your IDE supports ESLint and Prettier extensions:

1. Install `ESLint` extension
2. Install `Prettier` extension
3. Code will show warnings in-editor
4. Can auto-fix on save (configure in VS Code settings)

## Files Affected

Updated configuration for:

- Root project (`eslint.config.js`, `.prettierrc`)
- `pixospritz-editor`
- `pixospritz-console`
- All workspaces

All now use consistent yarn-based tooling.
