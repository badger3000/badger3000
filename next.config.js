/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.shields.io",
        pathname: "/**",
      },
    ],
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp"],
    minimumCacheTTL: 3600, // Cache images for 1 hour
  },
  // Improve overall performance with compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Performance optimizations
  experimental: {
    optimizePackageImports: ["@portabletext/react"],
  },
  // Use gzip compression
  compress: true,
  poweredByHeader: false,
  // Set proper environment variables
  env: {
    SITE_URL: process.env.SITE_URL || "https://www.badger3000.com/",
  },
};

module.exports = nextConfig;
