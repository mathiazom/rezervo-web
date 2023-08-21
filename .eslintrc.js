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
    rules: {
        "no-unused-vars": ["error", { args: "none" }],
    },
    extends: [
        "eslint:recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "next/core-web-vitals",
        "prettier",
    ],
};
