import {createClient} from "next-sanity";

// Configure Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2021-10-21",
  useCdn: false,
});

export async function GET() {
  try {
    // Use the same query structure as your getPosts function
    const query = `*[_type == "post" && defined(publishedAt) && !(_id in path('drafts.**'))] | order(publishedAt desc) {
      "slug": slug.current,
      _updatedAt
    }`;

    const posts = await client.fetch(query);

    // Create sitemap XML
    const baseUrl = process.env.SITE_URL || "https://www.badger3000.com/";

    // Build the XML manually
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add home page
    xml += `  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>\n`;

    // Only add the articles page if we have posts
    if (posts && posts.length > 0) {
      xml += `  <url>
    <loc>${baseUrl}/articles</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;

      // Add individual article pages
      posts.forEach((post) => {
        xml += `  <url>
    <loc>${baseUrl}/articles/${post.slug}</loc>
    <lastmod>${new Date(post._updatedAt).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
      });
    }

    // Close the XML
    xml += "</urlset>";

    // Return the XML with proper content type
    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return a basic sitemap with just the homepage in case of error
    const baseUrl = process.env.SITE_URL || "https://www.badger3000.com/";
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    xml += `  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>\n`;
    xml += "</urlset>";

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  }
}
