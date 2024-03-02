const withPWA = require("@ducanh2912/next-pwa").default({
    customWorkerSrc: "src/serviceworker",
});

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
    reactStrictMode: true,
    staticPageGenerationTimeout: 120,
    output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
    async redirects() {
        return [
            {
                source: "/",
                has: [
                    {
                        type: "cookie",
                        key: "rezervo.selectedChain",
                        value: "(?<chain>.*)",
                    },
                ],
                permanent: false,
                destination: "/:chain",
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "api.rezervo.no",
            },
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
