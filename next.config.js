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
    ],
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp"],
  },
  // Improve overall performance with compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  env: {
    SITE_URL: process.env.SITE_URL || "https://www.badger3000.com/",
  },
};

module.exports = nextConfig;
