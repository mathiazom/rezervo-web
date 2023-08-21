module.exports = {
    settings: {
        react: {
            version: "detect",
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
    extends: ["eslint:recommended", "next/core-web-vitals", "prettier"],
};
