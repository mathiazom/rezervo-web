const withPWA = require("next-pwa")({
    dest: "public",
    customWorkerDir: "src/serviceworker",
});

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
    reactStrictMode: true,
    output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
    async redirects() {
        return [
            {
                source: "/",
                has: [
                    {
                        type: "cookie",
                        key: "rezervo.selectedIntegration",
                        value: "(?<integration>.*)",
                    },
                ],
                permanent: false,
                destination: "/:integration",
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "ibooking.no",
            },
            {
                protocol: "https",
                hostname: "ibooking-public-files.s3.*.amazonaws.com",
            },
            {
                protocol: "https",
                hostname: "s.gravatar.com",
            },
            {
                protocol: "https",
                hostname: "storage.googleapis.com",
            },
        ],
    },
});

module.exports = nextConfig;
