const withPWA = require("next-pwa")({
    dest: "public",
    customWorkerDir: "src/serviceworker",
});

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
    reactStrictMode: true,
    output: "standalone",
    async redirects() {
        return [
            {
                // TODO: most recent integration or a first-time picker
                source: "/",
                destination: "/sit",
                permanent: false,
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
