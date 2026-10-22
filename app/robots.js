export default async function robots() {
  // Ensure baseUrl ends without a trailing slash to prevent double slashes in URLs
  const baseUrl = (
    process.env.SITE_URL || "https://www.badger3000.com"
  ).replace(/\/$/, "");

  // Only use one authoritative sitemap source to avoid conflicts
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/studio/"],
    },
    sitemap: [`${baseUrl}/sitemap.xml`],
  };
}
