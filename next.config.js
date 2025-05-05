/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["cdn.sanity.io"], // If you're using Sanity for images
  },
  env: {
    SITE_URL: process.env.SITE_URL || "https://www.badger3000.com/",
  },
};

module.exports = nextConfig;
