import { defineConfig } from "oxlint";

export default defineConfig({
    options: {
        typeAware: true,
        typeCheck: true,
    },
    plugins: ["eslint", "typescript", "unicorn", "react", "react-perf", "oxc", "import", "jsx-a11y", "promise"],
    ignorePatterns: ["src/routeTree.gen.ts", "src/types/api.d.ts", "public/sw.js"],
});
