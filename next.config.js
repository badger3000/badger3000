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
  },
  env: {
    SITE_URL: process.env.SITE_URL || "https://www.badger3000.com/",
  },
};

module.exports = nextConfig;
