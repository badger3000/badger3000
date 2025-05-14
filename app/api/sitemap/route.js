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
  try {
    // First try to generate the sitemap using Sanity data
    const sitemap = await Promise.resolve(generateSitemap()).catch((error) => {
      console.error("Failed to generate primary sitemap:", error);
      // Fall back to the basic sitemap
      return generateFallbackSitemap();
    });

    return sitemap;
  } catch (error) {
    console.error("Unhandled error in sitemap generation:", error);
    // Always return a valid sitemap even on complete failure
    return generateFallbackSitemap();
  }
}

async function generateSitemap() {
  try {
    // Use the same query pattern as getPosts function in sanity.ts
    const query = `*[_type in ["articles", "codepen"] && defined(slug.current) && !(_id in path('drafts.**'))] | order(publishedAt desc, _createdAt desc) {
      _id,
      _type,
      title,
      "slug": coalesce(slug.current, "no-slug"),
      "publishedAt": coalesce(publishedAt, _createdAt),
      _updatedAt
    }`;

    // Log for debugging purposes
    console.log("Executing Sanity query for dynamic sitemap API route...");

    let items = [];
    try {
      // Add token if available to ensure authenticated access
      const token = process.env.SANITY_API_TOKEN;
      const clientConfig = token ? {token} : {};

      items = await client.fetch(query, {}, clientConfig);
      console.log(`API sitemap: Found ${items.length} content items`);

      if (items.length > 0) {
        // Log the types of content found
        const contentTypes = Array.from(
          new Set(items.map((item) => item._type))
        );
        console.log("Content types found:", contentTypes);
        console.log(
          "First 3 items:",
          items.slice(0, 3).map((item) => `${item._type}/${item.slug}`)
        );
      } else {
        console.log(
          "No content items found in API route. Checking connection..."
        );

        // Try a simpler query for diagnostics
        const countQuery = `count(*[_type in ["articles", "codepen"] && !(_id in path('drafts.**'))])`;
        const totalCount = await client.fetch(countQuery, {}, clientConfig);
        console.log(`Total matching documents: ${totalCount}`);
      }
    } catch (err) {
      console.error("Error fetching content from Sanity in API route:", err);
      items = [];
    }

    // Create sitemap XML - ensure no trailing slash to prevent double slashes in URLs
    const baseUrl = (
      process.env.SITE_URL || "https://www.badger3000.com"
    ).replace(/\/$/, "");

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
        // Determine the correct section path based on item type
        let sectionPath = "articles";
        if (item._type === "codepen") {
          sectionPath = "codepen";
        } else if (
          item._type === "post" ||
          item._type === "article" ||
          item._type === "articles"
        ) {
          sectionPath = "articles";
        }
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
  // Ensure no trailing slash to prevent double slashes in URLs
  const baseUrl = (
    process.env.SITE_URL || "https://www.badger3000.com"
  ).replace(/\/$/, "");
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
