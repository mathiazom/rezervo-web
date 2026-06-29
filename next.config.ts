import { withSerwist } from "@serwist/turbopack";

const configHost = new URL(global.process.env["NEXT_PUBLIC_CONFIG_HOST"] ?? "");

const isLocalConfigHost = ["localhost", "127.0.0.1", "0.0.0.0", "[::1]", "host.docker.internal"].includes(
    configHost.hostname,
);

export default withSerwist({
    typedRoutes: true,
    cacheComponents: true,
    reactCompiler: true,
    staticPageGenerationTimeout: 120,
    ...(global.process.env["BUILD_STANDALONE"] === "true" ? { output: "standalone" } : {}),
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
        dangerouslyAllowLocalIP: isLocalConfigHost,
        remotePatterns: [
            {
                protocol: configHost.protocol.replace(":", "") as "http" | "https",
                hostname: configHost.hostname,
                ...(configHost.port ? { port: configHost.port } : {}),
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
