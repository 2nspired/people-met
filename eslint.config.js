// @ts-nocheck
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

/**
 * Scope a set of flat config entries to only TypeScript files.
 */
const scopeToTypeScriptFiles = (configs) =>
  configs.map((config) => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"],
  }));

const config = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    ignores: [".next"],
  }, // Next.js legacy config via compat
  ...compat.extends("next/core-web-vitals"), // TypeScript ESLint flat configs (scoped to TS files only)
  ...scopeToTypeScriptFiles(tseslint.configs.recommended),
  ...scopeToTypeScriptFiles(tseslint.configs.recommendedTypeChecked),
  ...scopeToTypeScriptFiles(tseslint.configs.stylisticTypeChecked), // Project-specific overrides for TS files
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
];

export default config;
