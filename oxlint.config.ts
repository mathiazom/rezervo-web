import { defineConfig } from "oxlint";

export default defineConfig({
    options: {
        typeAware: true,
        typeCheck: true,
    },
    plugins: ["eslint", "typescript", "unicorn", "react", "react-perf", "oxc", "import", "jsx-a11y", "promise"],
    ignorePatterns: ["src/routeTree.gen.ts", "src/types/api.d.ts", "public/sw.js"],
    overrides: [
        {
            files: ["src/lib/server/**", "src/routes/api/**"],
            rules: {
                "no-restricted-imports": [
                    "error",
                    {
                        paths: [
                            {
                                name: "@/lib/api/client",
                                importNames: ["apiClient"],
                                message:
                                    "apiClient is browser-only (see src/lib/api/client.ts). Use serverApiClient in server-only code.",
                            },
                        ],
                    },
                ],
            },
        },
    ],
});
