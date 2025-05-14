import {createClient} from "next-sanity";

// Configure Sanity client with better error handling
const getSanityClient = () => {
  try {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

    if (!projectId || !dataset) {
      console.warn("Missing Sanity credentials in robots.js");
      return null;
    }

    return createClient({
      projectId,
      dataset,
      apiVersion: "2021-10-21",
      useCdn: false,
    });
  } catch (e) {
    console.error("Failed to create Sanity client in robots.js:", e);
    return null;
  }
};

export default async function robots() {
  // Ensure baseUrl ends without a trailing slash to prevent double slashes in URLs
  const baseUrl = (
    process.env.SITE_URL || "https://www.badger3000.com"
  ).replace(/\/$/, "");
  let count = 0;

  try {
    const client = getSanityClient();
    if (client) {
      // Check if we have any published content
      const query = `count(*[_type in ["articles", "codepen"] && defined(slug.current) && !(_id in path('drafts.**'))])`;
      count = await client.fetch(query).catch(() => 0);
    }
  } catch (error) {
    console.error("Error in robots.js when querying Sanity:", error);
  }

  // Only use one authoritative sitemap source to avoid conflicts
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: [`${baseUrl}/sitemap.xml`],
  };
}
