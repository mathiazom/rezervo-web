module.exports = {
    settings: {
        react: {
            version: "detect",
        },
        "import/resolver": {
            typescript: true,
            node: true,
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
        "eslint:recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "next/core-web-vitals",
        "prettier",
    ],
    plugins: ["simple-import-sort"],
    rules: {
        "no-unused-vars": ["error", { args: "none" }],
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",
    },
};
