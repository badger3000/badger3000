import {createClient} from "next-sanity";

// Configure Sanity client with better error handling
const getSanityClient = () => {
  try {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

    if (!projectId || !dataset) {
      console.warn("Missing Sanity credentials");
      return null;
    }

    return createClient({
      projectId,
      dataset,
      apiVersion: "2021-10-21",
      useCdn: false,
    });
  } catch (e) {
    console.error("Failed to create Sanity client:", e);
    return null;
  }
};

const client = getSanityClient();

export async function GET() {
  // Set a timeout for the entire operation
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Operation timed out")), 15000)
  );

  try {
    // Use Promise.race to implement a timeout
    return await Promise.race([generateSitemap(), timeoutPromise]);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Always return a valid sitemap even on error
    return generateFallbackSitemap();
  }
}

async function generateSitemap() {
  try {
    // Query for both article and codepen content types
    const query = `*[_type in ["articles", "codepen"] && defined(slug.current) && !(_id in path('drafts.**'))] | order(publishedAt desc, _createdAt desc) {
      _type,
      "slug": slug.current,
      _updatedAt
    }`;

    const items = await client.fetch(query);

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

    // Always add the articles and codepen section pages
    xml += `  <url>
    <loc>${baseUrl}/articles</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;

    xml += `  <url>
    <loc>${baseUrl}/codepen</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;

    // Add individual content pages
    if (items && items.length > 0) {
      items.forEach((item) => {
        const sectionPath = item._type === "articles" ? "articles" : "codepen";
        xml += `  <url>
    <loc>${baseUrl}/${sectionPath}/${item.slug}</loc>
    <lastmod>${new Date(item._updatedAt || new Date()).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
      });
    }

    // Close the XML
    xml += "</urlset>";

    // Return the XML with proper content type and caching headers
    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Error in sitemap generation function:", error);
    return generateFallbackSitemap();
  }
}

// Generate a minimal but valid sitemap for fallback
function generateFallbackSitemap() {
  const baseUrl = process.env.SITE_URL || "https://www.badger3000.com/";
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  xml += `  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>\n`;
  xml += `  <url>
    <loc>${baseUrl}/articles</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  xml += `  <url>
    <loc>${baseUrl}/codepen</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  xml += "</urlset>";

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
