import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/serviceworker/index.ts",
  swDest: "public/sw.js",
});

export default withSerwist({
  reactStrictMode: true,
  staticPageGenerationTimeout: 120,
  output:
    global.process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
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
        hostname: new URL(global.process.env["NEXT_PUBLIC_CONFIG_HOST"])
          .hostname,
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
