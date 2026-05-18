/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@solscribe/config", "@solscribe/db"],
  experimental: {
    serverComponentsExternalPackages: ["drizzle-orm", "@neondatabase/serverless"]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      },
      {
        protocol: 'https',
        hostname: 'arweave.net',
      }
    ]
  }
};

export default nextConfig;
