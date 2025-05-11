import {createClient} from "next-sanity";

// Configure Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2021-10-21",
  useCdn: false,
});

export default async function robots() {
  const baseUrl = process.env.SITE_URL || "https://www.badger3000.com/";

  // Check if we have any published content
  const query = `count(*[_type in ["articles", "codepen"] && defined(slug.current) && !(_id in path('drafts.**'))])`;
  const count = await client.fetch(query).catch(() => 0);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: [`${baseUrl}sitemap.xml`, `${baseUrl}api/sitemap`],
  };
}
