module.exports = {
    parser: "@typescript-eslint/parser",
    settings: {
        react: {
            version: "detect",
        },
        "import/resolver": {
            typescript: true,
            node: {
                moduleDirectory: ["."],
            },
        },
    },
    parserOptions: {
        ecmaVersion: 14,
        sourceType: "module",
        ecmaFeatures: {
            modules: true,
        },
    },
    env: {
        browser: true,
        es2022: true,
    },
    extends: [
        "next/core-web-vitals",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier",
    ],
    plugins: ["eslint-plugin-no-relative-import-paths"],
    rules: {
        "no-relative-import-paths/no-relative-import-paths": "error",
        /** @see https://medium.com/weekly-webtips/how-to-sort-imports-like-a-pro-in-typescript-4ee8afd7258a */
        "import/order": [
            "error",
            {
                groups: ["builtin", "external", "internal", ["sibling", "parent"], "index", "unknown"],
                "newlines-between": "always",
                alphabetize: {
                    order: "asc",
                    caseInsensitive: true,
                },
            },
        ],
        /** */
    },
};
