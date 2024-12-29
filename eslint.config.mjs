import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import { fixupPluginRules } from "@eslint/compat";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["**/node_modules/", "**/dist/", "**/build/"],
}, ...compat.extends(
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
), {
    files: ["pixos/jsx/**/*.{js,jsx,ts,tsx}"], // Ensure ESLint processes these file types
    plugins: {
        react,
        "react-hooks": fixupPluginRules(reactHooks),
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
        },

        parser: tsParser,
        parserOptions: {
            ecmaFeatures: {
                jsx: true, // Enable JSX parsing
            },
            project: './tsconfig.json', // Specify the path to your tsconfig.json
        },
    },

    settings: {
        react: {
            version: "detect",
        },
    },

    rules: {
        "react/prop-types": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
    },
}];