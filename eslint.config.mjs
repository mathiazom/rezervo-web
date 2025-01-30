// @ts-check
import eslint from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import noRelativeImportPathsPlugin from "eslint-plugin-no-relative-import-paths";
import reactPlugin from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import hooksPlugin from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  jsxA11y.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": hooksPlugin,
      "no-relative-import-paths": noRelativeImportPathsPlugin,
      import: importPlugin,
      "react-compiler": reactCompiler,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...hooksPlugin.configs.recommended.rules,
      "no-relative-import-paths/no-relative-import-paths": "error",
      "react-compiler/react-compiler": "error",
      /** @see https://medium.com/weekly-webtips/how-to-sort-imports-like-a-pro-in-typescript-4ee8afd7258a */
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["sibling", "parent"],
            "index",
            "unknown",
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      /** */
    },
  },
  eslintConfigPrettier,
);
