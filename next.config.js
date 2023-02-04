/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ibooking.no'
      },
      {
        protocol: 'https',
        hostname: 'ibooking-public-files.s3.*.amazonaws.com'
      }
    ]
  },
}

module.exports = nextConfig
