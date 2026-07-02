import { defineConfig } from "oxfmt";

export default defineConfig({
    ignorePatterns: ["src/routeTree.gen.ts", "src/types/api.d.ts", "public/sw.js"],
});
