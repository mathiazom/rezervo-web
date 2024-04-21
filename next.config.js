const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } = require("next/constants");

/** @type {(phase: string, defaultConfig: import("next").NextConfig) => Promise<import("next").NextConfig>} */
module.exports = async (phase) => {
    /** @type {import("next").NextConfig} */
    const nextConfig = {};

    if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
        const withSerwist = (await import("@serwist/next")).default({
            swSrc: "src/serviceworker/index.ts",
            swDest: "public/sw.js",
        });
        return withSerwist({
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
                        hostname: new URL(process.env["NEXT_PUBLIC_CONFIG_HOST"]).hostname,
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
                    {
                        protocol: "https",
                        hostname: "images.ctfassets.net",
                    },
                ],
            },
        });
    }

    return nextConfig;
};
