/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@solscribe/config", "@solscribe/db"],
  compress: true,
  experimental: {
    serverComponentsExternalPackages: ["drizzle-orm", "@neondatabase/serverless"],
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
      },
      {
        protocol: 'https',
        hostname: 'uploadthing.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.privy.io',
      },
      {
        protocol: 'https',
        hostname: 'auth.privy.io',
      }
    ]
  }
};

export default nextConfig;
