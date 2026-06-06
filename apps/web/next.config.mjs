import { withSentryConfig } from '@sentry/nextjs';
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /\/api\/posts\/feed/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'feed-cache',
          networkTimeoutSeconds: 3,
          expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 },
        },
      },
      {
        urlPattern: /\/api\//,
        handler: 'NetworkOnly',
      },
      {
        urlPattern: /\/_next\/static\//,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-assets',
          expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'image-cache',
          expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
        },
      },
    ],
  },
  fallbacks: {
    document: '/offline',
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@solscribe/config", "@solscribe/db"],
  compress: true,
  experimental: {
    serverComponentsExternalPackages: ["drizzle-orm", "@neondatabase/serverless"],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ipfs.io' },
      { protocol: 'https', hostname: 'arweave.net' },
      { protocol: 'https', hostname: 'uploadthing.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'cdn.privy.io' },
      { protocol: 'https', hostname: 'auth.privy.io' }
    ]
  }
};

export default withSentryConfig(withPWA(nextConfig), {
  silent: true,
});
